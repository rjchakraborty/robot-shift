import { createHash } from "node:crypto";

export function sha256Hex(value: string | Uint8Array): string {
  return createHash("sha256").update(value).digest("hex");
}

export function canonicalJson(value: unknown): string {
  if (Array.isArray(value)) {
    return `[${value.map((item) => canonicalJson(item)).join(",")}]`;
  }
  if (value !== null && typeof value === "object") {
    const entries = Object.entries(value as Record<string, unknown>)
      .sort(([left], [right]) =>
        left < right ? -1 : left > right ? 1 : 0
      )
      .map(([key, item]) => `${JSON.stringify(key)}:${canonicalJson(item)}`);
    return `{${entries.join(",")}}`;
  }
  const encoded = JSON.stringify(value);
  if (encoded === undefined) {
    throw new TypeError("Value is not canonical JSON.");
  }
  return encoded;
}

export function computeLegacySourceDigest(input: {
  tracker: unknown;
  tutor: unknown;
  theme: unknown;
  trackerLegacyArchive: unknown;
  tutorLegacyArchive: unknown;
}): string {
  return sha256Hex(canonicalJson({
    tracker: input.tracker,
    tutor: input.tutor,
    theme: input.theme,
    trackerLegacyArchive: input.trackerLegacyArchive,
    tutorLegacyArchive: input.tutorLegacyArchive,
  }));
}

export function deterministicId(prefix: string, value: string): string {
  return `${prefix}_${sha256Hex(value).slice(0, 40)}`;
}
