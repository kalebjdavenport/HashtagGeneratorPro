import "server-only";
import type { MethodId, GenerationResult } from "../types";
import { generateWithClaude } from "./claude";
import { generateWithGPT5 } from "./openai";
import { generateWithGemini } from "./gemini";

const providers: Record<
  MethodId,
  (title: string, text: string) => Promise<GenerationResult>
> = {
  claude: generateWithClaude,
  gpt5: generateWithGPT5,
  gemini: generateWithGemini,
};

export async function generateHashtags(
  method: MethodId,
  title: string,
  text: string,
): Promise<GenerationResult> {
  const provider = providers[method];
  if (!provider) {
    throw new Error(`Unknown method: ${method}`);
  }
  return provider(title, text);
}
