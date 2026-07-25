export const FIREBASE_REGION = "asia-south1";
export const ROBOTSHIFT_WEB_APP_ID =
  "1:847716289197:web:ff9452513c9eb2e0a35424";

export const DATA_RETENTION_POLICY = Object.freeze({
  destructiveOperationsPerUtcDay: 3,
  minimumDestructiveIntervalMilliseconds: 5 * 60 * 1_000,
  maxDatasetGenerations: 24,
  maxMigrationArchives: 12,
  maxMigrationArchiveBytes: 20_000_000,
  operationLedgerRetentionDays: 400,
  tutorLedgerRetentionDays: 400,
});

export const TUTOR_MODEL_POLICY = Object.freeze({
  model: "gemini-3.1-flash-lite",
  pricingVersion: "gemini-3.1-flash-lite-standard-2026-07-25",
  lifecycleShutdownAt: "2027-07-25T00:00:00.000Z",
  migrationDeadline: "2027-06-30",
  inputNanoUsdPerToken: 250,
  outputNanoUsdPerToken: 1_500,
  maxInputTokens: 12_000,
  maxOutputTokens: 1_200,
  thinkingBudget: 0,
  perUserDailyLimit: 10,
  authorizationLimitNanoUsd: 800_000_000,
  absoluteLimitNanoUsd: 1_000_000_000,
  maxQuestionCharacters: 2_000,
  maxStoredAnswerCharacters: 7_000,
  maxThreadMessages: 12,
  maxHistoryMessages: 10,
  leaseMilliseconds: 90_000,
});

export type TutorPolicy = Omit<
  typeof TUTOR_MODEL_POLICY,
  "perUserDailyLimit" | "authorizationLimitNanoUsd"
> & {
  enabled: boolean;
  perUserDailyLimit: number;
  authorizationLimitNanoUsd: number;
};

export class TutorPolicyConfigurationError extends Error {
  constructor(message = "Tutor runtime policy requires administrator repair.") {
    super(message);
    this.name = "TutorPolicyConfigurationError";
  }
}

export function effectiveTutorPolicy(
  runtime: Record<string, unknown> | undefined,
): TutorPolicy {
  const configured = runtime === undefined
    ? undefined
    : validateRuntimePolicy(runtime);

  return {
    ...TUTOR_MODEL_POLICY,
    enabled: configured?.enabled ?? true,
    perUserDailyLimit:
      configured?.perUserDailyLimit ?? TUTOR_MODEL_POLICY.perUserDailyLimit,
    authorizationLimitNanoUsd:
      configured?.authorizationLimitNanoUsd
        ?? TUTOR_MODEL_POLICY.authorizationLimitNanoUsd,
  };
}

export function assertModelLifecycle(now: Date): void {
  const shutdown = Date.parse(TUTOR_MODEL_POLICY.lifecycleShutdownAt);
  if (!Number.isFinite(shutdown) || now.getTime() >= shutdown) {
    throw new Error(
      `Tutor model ${TUTOR_MODEL_POLICY.model} reached its configured lifecycle deadline.`,
    );
  }
}

function validateRuntimePolicy(runtime: Record<string, unknown>): {
  enabled?: boolean;
  perUserDailyLimit?: number;
  authorizationLimitNanoUsd?: number;
} {
  const keys = Object.keys(runtime);
  if (
    keys.length === 0
    || keys.some((key) => ![
      "enabled",
      "perUserDailyLimit",
      "authorizationLimitNanoUsd",
    ].includes(key))
    || (
      runtime.enabled !== undefined
      && typeof runtime.enabled !== "boolean"
    )
    || !optionalBoundedInteger(
      runtime.perUserDailyLimit,
      TUTOR_MODEL_POLICY.perUserDailyLimit,
    )
    || !optionalBoundedInteger(
      runtime.authorizationLimitNanoUsd,
      TUTOR_MODEL_POLICY.authorizationLimitNanoUsd,
    )
  ) {
    throw new TutorPolicyConfigurationError();
  }
  return {
    ...(runtime.enabled === undefined
      ? {}
      : { enabled: runtime.enabled as boolean }),
    ...(runtime.perUserDailyLimit === undefined
      ? {}
      : { perUserDailyLimit: runtime.perUserDailyLimit as number }),
    ...(runtime.authorizationLimitNanoUsd === undefined
      ? {}
      : {
          authorizationLimitNanoUsd:
            runtime.authorizationLimitNanoUsd as number,
        }),
  };
}

function optionalBoundedInteger(
  value: unknown,
  maximum: number,
): boolean {
  if (value === undefined) return true;
  if (
    typeof value !== "number"
    || !Number.isSafeInteger(value)
    || value < 1
    || value > maximum
  ) {
    return false;
  }
  return true;
}
