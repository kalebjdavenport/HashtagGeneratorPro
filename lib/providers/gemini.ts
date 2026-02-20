import "server-only";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { SYSTEM_PROMPT, buildUserPrompt } from "../prompts";
import { parseHashtags } from "../parse-hashtags";
import type { GenerationResult } from "../types";

const MAX_HASHTAGS = 8;

export async function generateWithGemini(
  title: string,
  text: string,
): Promise<GenerationResult> {
  const genAI = new GoogleGenerativeAI(process.env.GOOGLE_AI_API_KEY!);
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: SYSTEM_PROMPT,
  });

  const start = Date.now();

  const result = await model.generateContent(buildUserPrompt(title, text));
  const raw = result.response.text();
  const hashtags = parseHashtags(raw, MAX_HASHTAGS);
  const durationMs = Date.now() - start;

  return { hashtags, durationMs, method: "gemini" };
}
