import type { Metadata } from "next";
import Link from "next/link";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Privacy and telemetry",
  description:
    "How Robot/Shift stores account, course, Tutor, usage, and diagnostic data.",
  alternates: {
    canonical: "/privacy/",
  },
};

export default function PrivacyPage() {
  return (
    <main className={styles.page}>
      <article>
        <Link href="/" className={styles.brand}>Robot/Shift</Link>
        <p className={styles.eyebrow}>PRIVACY & TELEMETRY</p>
        <h1>What the application stores and measures</h1>
        <p className={styles.lead}>
          Robot/Shift uses Firebase Authentication and Cloud Firestore for
          account, course, Tutor, and daily AI-usage records.
        </p>

        <h2>Account and learning data</h2>
        <p>
          Firebase stores your sign-in identity and profile. Firestore stores
          your active course dataset, notes, evidence, bookmarks, project
          checks, Tutor threads, and server-owned quota and cost records.
          Security rules restrict learner data to its verified owner; Tutor and
          quota writes are handled by callable server functions.
        </p>

        <h2>Analytics</h2>
        <p>
          On the production site, bounded Analytics events may record a lesson
          number, phase, Tutor mode and outcome, latency bucket, sign-in method,
          or sanitized error category. Analytics storage and advertising
          consent are denied. Email, UID, display name, notes, evidence,
          questions, Tutor answers, query strings, URL hashes, raw stacks, and
          Firestore paths are excluded.
        </p>

        <h2>Performance diagnostics</h2>
        <p>
          Firebase Performance Monitoring is off by default. A verified learner
          can enable it in Settings; that explicit choice is stored only in the
          active Firestore dataset. Turning it off disables further automatic
          performance and network collection in the current session, but does
          not erase aggregate records already sent.
        </p>

        <h2>Browser storage and account control</h2>
        <p>
          The performance choice is not stored in a cookie or local storage.
          Firebase may use session-scoped browser storage to maintain the active
          sign-in. New course and Tutor state uses Firestore; legacy browser
          data is read only for an explicit one-time migration.
        </p>

        <p className={styles.note}>
          Effective 24 July 2026. Authentication action links receive no-store
          and no-referrer handling, and their one-time codes are removed from
          the visible URL immediately after parsing.
        </p>
      </article>
    </main>
  );
}
