import "server-only";
import OpenAI from "openai";
import { SYSTEM_PROMPT, buildUserPrompt } from "../prompts";
import { parseHashtags } from "../parse-hashtags";
import type { GenerationResult } from "../types";

const MAX_HASHTAGS = 8;

export async function generateWithGPT5(
  title: string,
  text: string,
): Promise<GenerationResult> {
  const client = new OpenAI();
  const start = Date.now();

  const completion = await client.chat.completions.create({
    model: "gpt-5",
    messages: [
      { role: "developer", content: SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(title, text) },
    ],
    max_completion_tokens: 1024,
    reasoning_effort: "low",
  } as OpenAI.ChatCompletionCreateParamsNonStreaming);

  const raw = completion.choices[0]?.message?.content ?? "";
  const hashtags = parseHashtags(raw, MAX_HASHTAGS);
  const durationMs = Date.now() - start;

  return { hashtags, durationMs, method: "gpt5" };
}
