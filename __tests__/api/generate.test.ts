import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock the providers module
vi.mock("@/lib/providers", () => ({
  generateHashtags: vi.fn(),
}));

import { POST } from "@/app/api/generate/route";
import { generateHashtags } from "@/lib/providers";
import type { GenerationResult } from "@/lib/types";

const mockedGenerate = vi.mocked(generateHashtags);

function makeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost:3000/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const VALID_TEXT = "This is a sufficiently long text that meets the minimum character requirement for testing.";

beforeEach(() => {
  vi.resetAllMocks();
  // Set all API keys by default
  process.env.ANTHROPIC_API_KEY = "test-key";
  process.env.OPENAI_API_KEY = "test-key";
  process.env.GOOGLE_AI_API_KEY = "test-key";
});

describe("POST /api/generate", () => {
  it("returns 400 INVALID_INPUT for invalid method", async () => {
    const res = await POST(makeRequest({ method: "invalid", text: VALID_TEXT }));
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.code).toBe("INVALID_INPUT");
  });

  it("returns 400 INVALID_INPUT for missing method", async () => {
    const res = await POST(makeRequest({ text: VALID_TEXT }));
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.code).toBe("INVALID_INPUT");
  });

  it("returns 400 INVALID_INPUT when text is too short", async () => {
    const res = await POST(makeRequest({ method: "claude", text: "short" }));
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.code).toBe("INVALID_INPUT");
  });

  it("returns 400 INVALID_INPUT when text is too long", async () => {
    const longText = "a".repeat(50_001);
    const res = await POST(makeRequest({ method: "claude", text: longText }));
    const json = await res.json();
    expect(res.status).toBe(400);
    expect(json.code).toBe("INVALID_INPUT");
  });

  it("returns 503 MISSING_KEY when API key is not set", async () => {
    delete process.env.ANTHROPIC_API_KEY;
    const res = await POST(makeRequest({ method: "claude", text: VALID_TEXT }));
    const json = await res.json();
    expect(res.status).toBe(503);
    expect(json.code).toBe("MISSING_KEY");
  });

  it("returns 200 with result on valid request", async () => {
    const mockResult: GenerationResult = {
      hashtags: ["#test", "#vitest"],
      durationMs: 150,
      method: "claude",
    };
    mockedGenerate.mockResolvedValue(mockResult);

    const res = await POST(
      makeRequest({ method: "claude", title: "Test", text: VALID_TEXT }),
    );
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.result).toEqual(mockResult);
  });

  it("returns 429 RATE_LIMITED when provider throws with status 429", async () => {
    const error = new Error("Rate limit exceeded");
    (error as unknown as { status: number }).status = 429;
    mockedGenerate.mockRejectedValue(error);

    const res = await POST(makeRequest({ method: "claude", text: VALID_TEXT }));
    const json = await res.json();
    expect(res.status).toBe(429);
    expect(json.code).toBe("RATE_LIMITED");
  });

  it("returns 500 PROVIDER_ERROR on generic provider error", async () => {
    mockedGenerate.mockRejectedValue(new Error("Something went wrong"));

    const res = await POST(makeRequest({ method: "claude", text: VALID_TEXT }));
    const json = await res.json();
    expect(res.status).toBe(500);
    expect(json.code).toBe("PROVIDER_ERROR");
  });
});
