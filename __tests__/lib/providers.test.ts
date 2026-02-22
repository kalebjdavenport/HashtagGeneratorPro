import { describe, it, expect, vi, beforeEach } from "vitest";

// --- OpenAI mock ---
const mockOpenAICreate = vi.fn();
vi.mock("openai", () => ({
  default: vi.fn().mockImplementation(() => ({
    chat: { completions: { create: mockOpenAICreate } },
  })),
}));

// --- Anthropic mock ---
const mockAnthropicCreate = vi.fn();
vi.mock("@anthropic-ai/sdk", () => ({
  default: vi.fn().mockImplementation(() => ({
    messages: { create: mockAnthropicCreate },
  })),
}));

// --- Gemini mock ---
const mockGeminiGenerate = vi.fn();
vi.mock("@google/generative-ai", () => ({
  GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
    getGenerativeModel: vi.fn().mockReturnValue({
      generateContent: mockGeminiGenerate,
    }),
  })),
}));

import { generateWithGPT5 } from "@/lib/providers/openai";
import { generateWithClaude } from "@/lib/providers/claude";
import { generateWithGemini } from "@/lib/providers/gemini";

beforeEach(() => {
  vi.clearAllMocks();
  process.env.GOOGLE_AI_API_KEY = "test-key";
});

// ---- OpenAI / GPT-5 ----
describe("generateWithGPT5", () => {
  it("calls OpenAI with correct parameters and no temperature", async () => {
    mockOpenAICreate.mockResolvedValue({
      choices: [{ message: { content: "#ai #testing" } }],
    });

    await generateWithGPT5("Title", "Some text content");

    const params = mockOpenAICreate.mock.calls[0][0];
    expect(params.model).toBe("gpt-5");
    expect(params).not.toHaveProperty("temperature");
    expect(params.max_completion_tokens).toBe(1024);
    expect(params.reasoning_effort).toBe("low");
    expect(params.messages).toHaveLength(2);
    expect(params.messages[0].role).toBe("developer");
    expect(params.messages[1].role).toBe("user");
  });

  it("returns parsed hashtags and method", async () => {
    mockOpenAICreate.mockResolvedValue({
      choices: [{ message: { content: "#javascript #react #webdev" } }],
    });

    const result = await generateWithGPT5("Title", "Some text");

    expect(result.method).toBe("gpt5");
    expect(result.hashtags).toEqual(["#javascript", "#react", "#webdev"]);
    expect(result.durationMs).toBeGreaterThanOrEqual(0);
  });

  it("returns empty hashtags when response is empty", async () => {
    mockOpenAICreate.mockResolvedValue({
      choices: [{ message: { content: "" } }],
    });

    const result = await generateWithGPT5("Title", "Some text");
    expect(result.hashtags).toEqual([]);
  });
});

// ---- Anthropic / Claude ----
describe("generateWithClaude", () => {
  it("calls Anthropic with correct parameters", async () => {
    mockAnthropicCreate.mockResolvedValue({
      content: [{ type: "text", text: "#ai #claude" }],
    });

    await generateWithClaude("Title", "Some text content");

    const params = mockAnthropicCreate.mock.calls[0][0];
    expect(params.model).toBe("claude-opus-4-6");
    expect(params.max_tokens).toBe(200);
    expect(params.messages).toHaveLength(1);
    expect(params.messages[0].role).toBe("user");
  });

  it("returns parsed hashtags and method", async () => {
    mockAnthropicCreate.mockResolvedValue({
      content: [{ type: "text", text: "#python #coding" }],
    });

    const result = await generateWithClaude("Title", "Some text");

    expect(result.method).toBe("claude");
    expect(result.hashtags).toEqual(["#python", "#coding"]);
  });
});

// ---- Google / Gemini ----
describe("generateWithGemini", () => {
  it("calls Gemini and returns parsed hashtags", async () => {
    mockGeminiGenerate.mockResolvedValue({
      response: { text: () => "#gemini #google #ai" },
    });

    const result = await generateWithGemini("Title", "Some text content");

    expect(result.method).toBe("gemini");
    expect(result.hashtags).toEqual(["#gemini", "#google", "#ai"]);
    expect(mockGeminiGenerate).toHaveBeenCalledTimes(1);
  });
});
