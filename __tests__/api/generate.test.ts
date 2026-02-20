import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";

// Mock the providers module
vi.mock("@/lib/providers", () => ({
  generateHashtags: vi.fn(),
}));

// Mock the rate-limit module
vi.mock("@/lib/rate-limit", () => ({
  checkRateLimit: vi.fn().mockResolvedValue(null),
  getClientIp: vi.fn().mockReturnValue("127.0.0.1"),
}));

// Mock the server-cache module
vi.mock("@/lib/server-cache", () => ({
  getServerCachedResult: vi.fn().mockResolvedValue(null),
  setServerCachedResult: vi.fn().mockResolvedValue(undefined),
}));

// Mock the logger module
vi.mock("@/lib/logger", () => ({
  createRequestLog: vi.fn().mockReturnValue({
    requestId: "test-uuid",
    timestamp: "2025-01-01T00:00:00.000Z",
    method: null,
    ip: "127.0.0.1",
    latencyMs: 0,
    statusCode: 200,
    cacheHit: false,
    error: null,
    code: null,
  }),
  emitLog: vi.fn(),
}));

import { POST } from "@/app/api/generate/route";
import { generateHashtags } from "@/lib/providers";
import { checkRateLimit } from "@/lib/rate-limit";
import {
  getServerCachedResult,
  setServerCachedResult,
} from "@/lib/server-cache";
import { createRequestLog, emitLog } from "@/lib/logger";
import type { GenerationResult } from "@/lib/types";

const mockedGenerate = vi.mocked(generateHashtags);
const mockedCheckRateLimit = vi.mocked(checkRateLimit);
const mockedGetCache = vi.mocked(getServerCachedResult);
const mockedSetCache = vi.mocked(setServerCachedResult);
const mockedCreateRequestLog = vi.mocked(createRequestLog);
const mockedEmitLog = vi.mocked(emitLog);

function makeRequest(body: Record<string, unknown>): NextRequest {
  return new NextRequest("http://localhost:3000/api/generate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

const VALID_TEXT =
  "This is a sufficiently long text that meets the minimum character requirement for testing.";

beforeEach(() => {
  vi.resetAllMocks();
  // Restore default mock implementations after reset
  mockedCheckRateLimit.mockResolvedValue(null);
  mockedGetCache.mockResolvedValue(null);
  mockedSetCache.mockResolvedValue(undefined);
  mockedCreateRequestLog.mockReturnValue({
    requestId: "test-uuid",
    timestamp: "2025-01-01T00:00:00.000Z",
    method: null,
    ip: "127.0.0.1",
    latencyMs: 0,
    statusCode: 200,
    cacheHit: false,
    error: null,
    code: null,
  });
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

  it("returns 429 when rate limit check blocks the request", async () => {
    const { NextResponse } = await import("next/server");
    mockedCheckRateLimit.mockResolvedValue(
      NextResponse.json(
        { success: false, error: "Too many requests.", code: "RATE_LIMITED" },
        { status: 429 },
      ),
    );

    const res = await POST(makeRequest({ method: "claude", text: VALID_TEXT }));
    const json = await res.json();
    expect(res.status).toBe(429);
    expect(json.code).toBe("RATE_LIMITED");
    expect(mockedGenerate).not.toHaveBeenCalled();
  });

  it("proceeds normally when rate limit check returns null", async () => {
    mockedCheckRateLimit.mockResolvedValue(null);
    const mockResult: GenerationResult = {
      hashtags: ["#ok"],
      durationMs: 50,
      method: "claude",
    };
    mockedGenerate.mockResolvedValue(mockResult);

    const res = await POST(makeRequest({ method: "claude", text: VALID_TEXT }));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
  });

  it("proceeds normally when rate limit check throws (fail-open)", async () => {
    mockedCheckRateLimit.mockRejectedValue(
      new Error("Redis connection failed"),
    );
    const mockResult: GenerationResult = {
      hashtags: ["#failopen"],
      durationMs: 75,
      method: "claude",
    };
    mockedGenerate.mockResolvedValue(mockResult);

    const res = await POST(makeRequest({ method: "claude", text: VALID_TEXT }));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
  });

  // --- Server cache tests ---

  it("returns cached result on server cache hit (provider NOT called)", async () => {
    const cachedResult: GenerationResult = {
      hashtags: ["#cached"],
      durationMs: 50,
      method: "claude",
    };
    mockedGetCache.mockResolvedValue(cachedResult);

    const res = await POST(
      makeRequest({ method: "claude", title: "Test", text: VALID_TEXT }),
    );
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(json.result).toEqual(cachedResult);
    expect(mockedGenerate).not.toHaveBeenCalled();
  });

  it("calls provider when server cache misses", async () => {
    mockedGetCache.mockResolvedValue(null);
    const mockResult: GenerationResult = {
      hashtags: ["#fresh"],
      durationMs: 200,
      method: "claude",
    };
    mockedGenerate.mockResolvedValue(mockResult);

    const res = await POST(makeRequest({ method: "claude", text: VALID_TEXT }));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.result).toEqual(mockResult);
    expect(mockedGenerate).toHaveBeenCalled();
  });

  it("stores result in server cache after provider call", async () => {
    mockedGetCache.mockResolvedValue(null);
    const mockResult: GenerationResult = {
      hashtags: ["#store"],
      durationMs: 100,
      method: "claude",
    };
    mockedGenerate.mockResolvedValue(mockResult);

    await POST(makeRequest({ method: "claude", text: VALID_TEXT }));

    expect(mockedSetCache).toHaveBeenCalledWith(
      "claude",
      "",
      VALID_TEXT.trim(),
      mockResult,
    );
  });

  it("proceeds when server cache throws (fail-open)", async () => {
    mockedGetCache.mockRejectedValue(new Error("Redis down"));
    const mockResult: GenerationResult = {
      hashtags: ["#resilient"],
      durationMs: 100,
      method: "claude",
    };
    mockedGenerate.mockResolvedValue(mockResult);

    const res = await POST(makeRequest({ method: "claude", text: VALID_TEXT }));
    const json = await res.json();
    expect(res.status).toBe(200);
    expect(json.success).toBe(true);
    expect(mockedGenerate).toHaveBeenCalled();
  });

  it("emitLog called on every request (success, error, cache hit)", async () => {
    // Success
    mockedGenerate.mockResolvedValue({
      hashtags: ["#log"],
      durationMs: 50,
      method: "claude",
    });
    await POST(makeRequest({ method: "claude", text: VALID_TEXT }));
    expect(mockedEmitLog).toHaveBeenCalledTimes(1);

    mockedEmitLog.mockClear();

    // Validation error
    await POST(makeRequest({ method: "invalid", text: VALID_TEXT }));
    expect(mockedEmitLog).toHaveBeenCalledTimes(1);

    mockedEmitLog.mockClear();

    // Cache hit
    mockedGetCache.mockResolvedValue({
      hashtags: ["#cached"],
      durationMs: 10,
      method: "claude",
    });
    await POST(makeRequest({ method: "claude", text: VALID_TEXT }));
    expect(mockedEmitLog).toHaveBeenCalledTimes(1);
  });
});
