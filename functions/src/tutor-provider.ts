import {
  FinishReason,
  GoogleGenAI,
  type Content,
} from "@google/genai";

import { TUTOR_MODEL_POLICY } from "./config.js";

export type TutorGenerationInput = {
  systemInstruction: string;
  contents: Content[];
};

export type TutorProviderResult = {
  answer: string;
  finishReason: string | undefined;
  model: string;
  promptTokens: number | undefined;
  candidateTokens: number | undefined;
  thoughtTokens: number | undefined;
  totalTokens: number | undefined;
};

export type SafeProviderErrorMetadata = {
  name: string;
  status: number | null;
  code: string | null;
  providerReason: string | null;
  quotaMetric: string | null;
  quotaId: string | null;
};

export interface TutorProvider {
  countTokens(input: TutorGenerationInput): Promise<number>;
  generate(input: TutorGenerationInput): Promise<TutorProviderResult>;
}

export class GeminiTutorProvider implements TutorProvider {
  private readonly client: GoogleGenAI;
  private readonly apiKey: string;
  private readonly fetchImpl: typeof fetch;

  constructor(apiKey: string, fetchImpl: typeof fetch = fetch) {
    if (!apiKey.trim()) throw new Error("Gemini API key is missing.");
    this.apiKey = apiKey;
    this.fetchImpl = fetchImpl;
    this.client = new GoogleGenAI({ apiKey });
  }

  async countTokens(input: TutorGenerationInput): Promise<number> {
    const model = TUTOR_MODEL_POLICY.model.replace(/^models\//, "");
    const response = await this.fetchImpl(
      `https://generativelanguage.googleapis.com/v1beta/models/${
        encodeURIComponent(model)
      }:countTokens`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": this.apiKey,
        },
        body: JSON.stringify({
          generateContentRequest: {
            model: `models/${model}`,
            contents: input.contents,
            systemInstruction: {
              role: "user",
              parts: [{ text: input.systemInstruction }],
            },
          },
        }),
        signal: AbortSignal.timeout(15_000),
      },
    );
    if (!response.ok) {
      throw new Error(
        `Gemini countTokens failed with HTTP ${response.status}.`,
      );
    }
    const payload: unknown = await response.json();
    const totalTokens = (
      typeof payload === "object"
      && payload !== null
      && "totalTokens" in payload
    )
      ? payload.totalTokens
      : undefined;
    if (
      typeof totalTokens !== "number"
      || !Number.isSafeInteger(totalTokens)
      || totalTokens < 0
    ) {
      throw new Error("Gemini did not return a valid prompt token count.");
    }
    return totalTokens;
  }

  async generate(input: TutorGenerationInput): Promise<TutorProviderResult> {
    const response = await this.client.models.generateContent({
      model: TUTOR_MODEL_POLICY.model,
      contents: input.contents,
      config: {
        systemInstruction: input.systemInstruction,
        maxOutputTokens: TUTOR_MODEL_POLICY.maxOutputTokens,
        thinkingConfig: {
          thinkingBudget: TUTOR_MODEL_POLICY.thinkingBudget,
        },
        abortSignal: AbortSignal.timeout(38_000),
      },
    });
    const usage = response.usageMetadata;
    return {
      answer: (response.text ?? "").trim(),
      finishReason: response.candidates?.[0]?.finishReason,
      model: response.modelVersion?.slice(0, 100)
        || TUTOR_MODEL_POLICY.model,
      promptTokens: usage?.promptTokenCount,
      candidateTokens: usage?.candidatesTokenCount,
      thoughtTokens: usage?.thoughtsTokenCount,
      totalTokens: usage?.totalTokenCount,
    };
  }
}

export function providerResponseIsUsable(
  result: TutorProviderResult,
): boolean {
  if (!result.answer) return false;
  return (
    result.finishReason === undefined
    || result.finishReason === FinishReason.STOP
  );
}

export function safeProviderErrorMetadata(
  error: unknown,
): SafeProviderErrorMetadata {
  if (typeof error !== "object" || error === null) {
    return {
      name: "UnknownError",
      status: null,
      code: null,
      providerReason: null,
      quotaMetric: null,
      quotaId: null,
    };
  }
  const value = error as Record<string, unknown>;
  const name = typeof value.name === "string"
    && /^[A-Za-z][A-Za-z0-9_.-]{0,79}$/.test(value.name)
    ? value.name
    : "UnknownError";
  const rawStatus = typeof value.status === "number"
    ? value.status
    : typeof value.status === "string"
      ? Number(value.status)
      : NaN;
  const status = Number.isInteger(rawStatus)
    && rawStatus >= 100
    && rawStatus <= 599
    ? rawStatus
    : null;
  const code = typeof value.code === "string"
    && /^[A-Za-z0-9_.-]{1,80}$/.test(value.code)
    ? value.code
    : null;
  const message = typeof value.message === "string"
    ? value.message.slice(0, 20_000)
    : "";
  const providerReason = safeMessageField(
    message,
    /"status"\s*:\s*"([A-Z][A-Z0-9_]{0,79})"/,
    /^[A-Z][A-Z0-9_]{0,79}$/,
  );
  const quotaMetric = safeMessageField(
    message,
    /"quotaMetric"\s*:\s*"([A-Za-z0-9._/-]{1,160})"/,
    /^[A-Za-z0-9._/-]{1,160}$/,
  ) ?? safeMessageField(
    message,
    /Quota exceeded for metric:\s*([A-Za-z0-9._/-]{1,160})/,
    /^[A-Za-z0-9._/-]{1,160}$/,
  );
  const quotaId = safeMessageField(
    message,
    /"quotaId"\s*:\s*"([A-Za-z0-9._/-]{1,160})"/,
    /^[A-Za-z0-9._/-]{1,160}$/,
  );
  return {
    name,
    status,
    code,
    providerReason,
    quotaMetric,
    quotaId,
  };
}

function safeMessageField(
  message: string,
  pattern: RegExp,
  allowlist: RegExp,
): string | null {
  const value = message.match(pattern)?.[1];
  return value !== undefined && allowlist.test(value) ? value : null;
}
