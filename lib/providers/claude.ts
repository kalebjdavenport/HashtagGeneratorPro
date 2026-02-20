import "server-only";
import Anthropic from "@anthropic-ai/sdk";
import { SYSTEM_PROMPT, buildUserPrompt } from "../prompts";
import { parseHashtags } from "../parse-hashtags";
import type { GenerationResult } from "../types";

const MAX_HASHTAGS = 8;

export async function generateWithClaude(
  title: string,
  text: string,
): Promise<GenerationResult> {
  const client = new Anthropic();
  const start = Date.now();

  const message = await client.messages.create({
    model: "claude-opus-4-6",
    max_tokens: 200,
    system: SYSTEM_PROMPT,
    messages: [{ role: "user", content: buildUserPrompt(title, text) }],
  });

  const raw =
    message.content[0].type === "text" ? message.content[0].text : "";
  const hashtags = parseHashtags(raw, MAX_HASHTAGS);
  const durationMs = Date.now() - start;

  return { hashtags, durationMs, method: "claude" };
}
