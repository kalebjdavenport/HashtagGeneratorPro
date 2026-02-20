import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock @upstash/redis
const mockGet = vi.fn();
const mockSet = vi.fn();
vi.mock("@upstash/redis", () => ({
  Redis: vi.fn().mockImplementation(() => ({
    get: mockGet,
    set: mockSet,
  })),
}));

import {
  getServerCachedResult,
  setServerCachedResult,
  _resetForTesting,
} from "@/lib/server-cache";
import type { GenerationResult } from "@/lib/types";

const MOCK_RESULT: GenerationResult = {
  hashtags: ["#test", "#cache"],
  durationMs: 100,
  method: "claude",
};

beforeEach(() => {
  vi.clearAllMocks();
  _resetForTesting();
  delete process.env.UPSTASH_REDIS_REST_URL;
  delete process.env.UPSTASH_REDIS_REST_TOKEN;
});

describe("server-cache", () => {
  it("returns null when env vars are not set (fail-open)", async () => {
    const result = await getServerCachedResult("claude", "title", "text");
    expect(result).toBeNull();
    expect(mockGet).not.toHaveBeenCalled();
  });

  it("set is a no-op when env vars are not set", async () => {
    await setServerCachedResult("claude", "title", "text", MOCK_RESULT);
    expect(mockSet).not.toHaveBeenCalled();
  });

  it("returns null on cache miss", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://test.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
    mockGet.mockResolvedValue(null);

    const result = await getServerCachedResult("claude", "title", "text");
    expect(result).toBeNull();
  });

  it("returns cached result on cache hit", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://test.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
    mockGet.mockResolvedValue(MOCK_RESULT);

    const result = await getServerCachedResult("claude", "title", "text");
    expect(result).toEqual(MOCK_RESULT);
  });

  it("uses keys with htgp-srv- prefix", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://test.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
    mockGet.mockResolvedValue(null);

    await getServerCachedResult("claude", "title", "text");
    const key = mockGet.mock.calls[0][0] as string;
    expect(key).toMatch(/^htgp-srv-[a-f0-9]{64}$/);
  });

  it("stores result with 24h TTL", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://test.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";

    await setServerCachedResult("claude", "title", "text", MOCK_RESULT);
    expect(mockSet).toHaveBeenCalledWith(
      expect.stringMatching(/^htgp-srv-/),
      MOCK_RESULT,
      { ex: 86400 },
    );
  });

  it("same inputs produce same keys", async () => {
    process.env.UPSTASH_REDIS_REST_URL = "https://test.upstash.io";
    process.env.UPSTASH_REDIS_REST_TOKEN = "test-token";
    mockGet.mockResolvedValue(null);

    await getServerCachedResult("claude", "my title", "my text");
    await getServerCachedResult("claude", "my title", "my text");

    const key1 = mockGet.mock.calls[0][0] as string;
    const key2 = mockGet.mock.calls[1][0] as string;
    expect(key1).toBe(key2);
  });
});
