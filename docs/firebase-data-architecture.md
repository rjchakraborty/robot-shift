# Robot/Shift Firebase data architecture

This document is the production data contract for the Firebase migration. Firebase
Authentication owns credentials and identity-provider state. Cloud Firestore is
the source of truth for the application profile, course state, preferences,
Tutor history, Tutor entitlements, and AI-usage accounting.

Application data is not stored in cookies, `localStorage`, or IndexedDB. The web
client uses Firebase Authentication's tab-scoped session persistence only.
Legacy browser data is read once for migration and removed only after the
callable Function commits the matching Firestore receipt.

## Regional and trust boundaries

- Firebase project: `robotshift`
- Firestore database: `(default)` in `asia-south1`
- Cloud Functions region: `asia-south1`
- Browser: Firebase Auth plus owner-scoped Firestore reads and validated course
  writes
- Callable Functions: verified Firebase ID token, enforced and consumed App
  Check token, Admin SDK, replay-safe operation ID
- Gemini: server-only dedicated `GEMINI_API_KEY` from Secret Manager

The public Firebase Web API key identifies the Firebase project; it is not the
Gemini credential. Firestore rules and callable authorization are the security
boundary.

## Firestore schema

```text
accountAccess/{uid}                          private active/cutoff/lease gate

users/{uid}                                  server-owned account projection
  datasets/{datasetId}                       immutable-generation manifest
    course/state                             completions and bookmarks
    course/preferences                       schedule and selected lesson
    preferences/ui                           theme and Performance consent
    notes/{dayId}                            note and evidence
    projects/{projectId}                     portfolio checklist
    tutorThreads/{dayId}                     server-written Tutor transcript
    tutorThreadControls/{dayId}              server-only generation guard
  tutorUsageDaily/{yyyy-mm-dd}               owner-readable usage projection
  entitlements/current                       owner-readable access projection
  migrationReceipts/{sourceDigest}           server-written migration result
  migrationArchives/{archiveId}              server-written original payload
    chunks/{chunkId}
  dataControls/retention                      server-only throttle/inventory
  dataOperations/{operationId}               server-only reset/import replay log
  tutorRequests/{requestId}                  server-only Tutor replay record

tutorEntitlements/{uid}                      private authoritative entitlement
tutorUserDaily/{sha256(uid + day)}           private authoritative user ledger
tutorGlobalDaily/{yyyy-mm-dd}                private shared spend ledger
systemConfig/tutor                           private kill switch / lower limits
```

The `users/{uid}.currentDatasetId` pointer is server-owned. Reset and import
create a new dataset generation and atomically move the pointer; stale clients
therefore lose write permission to the archived generation. A client cannot
select, reactivate, or delete a generation.

## Ownership and authorization

- A user can read only their own `users/{uid}` tree.
- Every owner read or write also requires a server-owned
  `accountAccess/{uid}` record whose `active` flag is true, whose authentication
  cutoff is not newer than the token's `auth_time`, and whose 15-minute access
  lease has not expired. Clients cannot read or write that record.
- Course reads and writes require a verified email and the currently active
  dataset.
- Course writes accept only documented fields, bounded strings and arrays,
  valid day/project identifiers, and `request.time` timestamps.
- Performance Monitoring is denied by default. A verified owner can store only
  a boolean consent choice, fixed schema version, and server timestamp in the
  active dataset's UI preferences; import and reset create a fresh denied
  choice.
- Root account creation/deletion, dataset pointers, Tutor transcripts,
  entitlements, quotas, migration records, replay records, and global policy
  are denied to every client SDK.
- Every non-bootstrap callable re-fetches the Firebase Auth user and compares
  the token's `auth_time` with the live `tokensValidAfterTime` cutoff. A
  disabled, deleted, password-reset, or otherwise revoked account therefore
  cannot use privileged Tutor/data operations with an old ID token, even while
  its Firestore access lease is still active.
- Bootstrap creates the access record, moves its authentication cutoff only
  forward from Firebase Auth's `tokensValidAfterTime`, and renews the lease only
  for a token at or beyond that cutoff. An inactive or pre-cutoff token cannot
  reactivate itself.
- Verified foreground sessions renew the lease every ten minutes and on
  focus/online return. Password change reauthenticates, refreshes the ID token,
  and reconciles the cutoff before keeping the session; failure signs that
  browser out.
- Every sensitive callable requires App Check and consumes its token to reduce
  replay.

The short lease bounds an out-of-band Firebase Console disable/delete, password
reset, refresh-token revocation, or other major Auth-account-change gap to 15
minutes for direct Firestore access. Firestore rules cannot query Firebase
Authentication live, so instant direct-Firestore revocation would require an
external Auth-to-Firestore control-plane update or moving every data operation
behind callable Functions. Privileged callables already re-fetch Auth and reject
disabled, deleted, or pre-cutoff sessions immediately.

## Tutor quota and cost ledger

The Tutor request flow is an atomic reserve-call-settle protocol:

1. Validate the verified account, App Check identity, active dataset,
   entitlement, lesson, input shape, and request hash.
2. In one Firestore transaction, reject a replay mismatch, expired policy,
   second in-flight request, tenth prior daily attempt, or exhausted shared
   authorization budget.
3. Reserve the maximum bounded request cost in the private authoritative
   `tutorUserDaily/{hash}` and `tutorGlobalDaily/{day}` ledgers, then write the
   bounded owner-readable `users/{uid}/tutorUsageDaily/{day}` projection.
4. Call Gemini with the server-owned context and bounded output.
5. Settle provider token metadata against the reservation. Missing or invalid
   metadata settles at the reservation upper bound.
6. Write the answer and transcript only if the same dataset and Tutor-thread
   generation are still current.

The default policy is 10 attempts per verified account per UTC day, one
in-flight request, a shared `$0.80` admission ceiling, and a `$1.00` absolute
circuit breaker. Values are stored as integer nano-USD to avoid floating-point
rounding. Browser code cannot increase the limits. A lower emergency limit or
kill switch may be applied through `systemConfig/tutor`; client access to that
document is denied.

An absent optional runtime document or new daily ledger starts from the hard
defaults. An existing malformed runtime, entitlement, per-user ledger, or global
ledger blocks admission before any provider call or mutation; it never falls
back to zero counters or higher defaults.

Tutor request, private daily quota, owner-readable quota projection, and global
daily budget documents carry a server-written `expiresAt` and use Firestore TTL
after 400 days. This retains more than one annual cycle for audits while
preventing indefinite ledger growth. TTL does not affect the active daily
counter because its expiry is calculated from the UTC quota day.

This circuit breaker covers Tutor traffic authorized by this application. A
dedicated Gemini key and project are required because a Firebase/Cloud Billing
budget is an alert, not a hard cap, and cannot prevent unrelated API use.

## Migration, backup, and recovery

- Current-origin legacy payloads are parsed and schema-validated in the browser,
  then revalidated by the callable Function.
- The server recomputes the source digest; a digest cannot be reused with a
  different payload.
- The first original legacy payload is chunked into server-owned migration
  archives before activation.
- Import/reset operations use unique operation IDs. Retrying the same operation
  returns the same generation; a new user action creates a new generation.
- New migration, restore, and non-pristine reset operations are admitted by one
  server-owned transaction: at most three per UTC day, at least five minutes
  apart, at most 24 retained dataset generations, at most 12 migration archive
  manifests, and at most 20 MB of raw legacy archive text per account. Missing
  legacy byte metadata is conservatively counted as 5 MB.
- A pristine reset is a true no-op: it creates neither a dataset generation,
  operation record, nor throttle event.
- Reset/restore operation records retain idempotent retry results for 400 days,
  then Firestore TTL removes the records. Dataset IDs are deterministic from
  the operation ID, so a late retry after TTL fails closed against the retained
  generation instead of creating duplicate data. An administrator must prune
  a linked archived generation before its operation ID can be reused.
- `users/{uid}/dataControls/retention` stores the observed inventory, daily
  count, last-operation time, and hard limits. Clients cannot read or alter it;
  malformed control state blocks operations until administrator repair.
- The old dataset is archived only in the same transaction that creates the new
  dataset and moves the active pointer.
- Data on a different origin, including the prior ChatGPT Sites domain, must be
  exported there and imported on `robotshift.web.app`; browser same-origin
  protections make automatic cross-origin reads impossible.

## Operations required before production

1. Rotate the exposed development Gemini key and store only the replacement in
   Firebase Secret Manager.
2. Upgrade the Firebase project to Blaze so callable Functions can deploy.
3. Deploy Authentication provider configuration, Firestore rules/indexes,
   Functions, and Hosting together.
4. Enable password policy, email-enumeration protection, authorized domains,
   and the custom email-action URL.
5. Enforce App Check for Authentication and Firestore after a verified
   production canary.
6. Create billing alerts below the application circuit breaker and monitor the
   private daily ledger against provider billing.
7. Run a real signup, email verification, login, profile, password reset,
   course write, Tutor request, quota rejection, logout, and cross-account
   denial canary on `robotshift.web.app`.
