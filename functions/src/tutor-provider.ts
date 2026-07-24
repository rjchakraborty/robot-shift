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

export interface TutorProvider {
  countTokens(input: TutorGenerationInput): Promise<number>;
  generate(input: TutorGenerationInput): Promise<TutorProviderResult>;
}

export class GeminiTutorProvider implements TutorProvider {
  private readonly client: GoogleGenAI;

  constructor(apiKey: string) {
    if (!apiKey.trim()) throw new Error("Gemini API key is missing.");
    this.client = new GoogleGenAI({ apiKey });
  }

  async countTokens(input: TutorGenerationInput): Promise<number> {
    const response = await this.client.models.countTokens({
      model: TUTOR_MODEL_POLICY.model,
      contents: input.contents,
      config: {
        systemInstruction: input.systemInstruction,
      },
    });
    if (
      typeof response.totalTokens !== "number"
      || !Number.isSafeInteger(response.totalTokens)
      || response.totalTokens < 0
    ) {
      throw new Error("Gemini did not return a valid prompt token count.");
    }
    return response.totalTokens;
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
