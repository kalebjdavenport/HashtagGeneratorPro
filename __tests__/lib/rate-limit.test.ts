import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";

const { mockLimit, MockRatelimit } = vi.hoisted(() => {
  const mockLimit = vi.fn();
  const MockRatelimit = Object.assign(
    vi.fn().mockImplementation(() => ({ limit: mockLimit })),
    { slidingWindow: vi.fn().mockReturnValue("sliding-window-config") },
  );
  return { mockLimit, MockRatelimit };
});

vi.mock("@upstash/ratelimit", () => ({
  Ratelimit: MockRatelimit,
}));

vi.mock("@upstash/redis", () => ({
  Redis: vi.fn().mockImplementation(() => ({})),
}));

import { checkRateLimit, _resetForTesting } from "@/lib/rate-limit";

function makeRequest(headers: Record<string, string> = {}): NextRequest {
  return new NextRequest("http://localhost:3000/api/generate", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...headers,
    },
    body: JSON.stringify({ method: "claude", text: "test" }),
  });
}

beforeEach(() => {
  _resetForTesting();
  mockLimit.mockReset();
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
});

afterEach(() => {
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
});

describe("checkRateLimit", () => {
  it("returns null when Upstash env vars are not set", async () => {
    const result = await checkRateLimit(makeRequest());
    expect(result).toBeNull();
    expect(mockLimit).not.toHaveBeenCalled();
  });

  it("returns null when rate limit is not exceeded", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://test.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
    mockLimit.mockResolvedValue({ success: true });

    const result = await checkRateLimit(makeRequest());
    expect(result).toBeNull();
  });

  it("returns 429 with RATE_LIMITED when limit is exceeded", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://test.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
    mockLimit.mockResolvedValue({ success: false });

    const result = await checkRateLimit(makeRequest());
    expect(result).not.toBeNull();
    expect(result!.status).toBe(429);
    const json = await result!.json();
    expect(json.code).toBe("RATE_LIMITED");
    expect(json.success).toBe(false);
  });

  it("extracts IP from x-forwarded-for header", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://test.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
    mockLimit.mockResolvedValue({ success: true });

    await checkRateLimit(makeRequest({ "x-forwarded-for": "1.2.3.4, 5.6.7.8" }));
    expect(mockLimit).toHaveBeenCalledWith("1.2.3.4");
  });

  it("falls back to 127.0.0.1 when no IP headers are present", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://test.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
    mockLimit.mockResolvedValue({ success: true });

    await checkRateLimit(makeRequest());
    expect(mockLimit).toHaveBeenCalledWith("127.0.0.1");
  });
});
