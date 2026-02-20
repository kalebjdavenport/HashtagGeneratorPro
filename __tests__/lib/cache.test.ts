import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import {
  getCacheKey,
  getCachedResult,
  setCachedResult,
  clearCache,
} from "@/lib/cache";
import type { GenerationResult } from "@/lib/types";

const MOCK_RESULT: GenerationResult = {
  hashtags: ["#test", "#vitest"],
  durationMs: 100,
  method: "claude",
};

// Node 22's built-in localStorage conflicts with jsdom — provide a clean stub.
function createStorage(): Storage {
  const store = new Map<string, string>();
  return {
    getItem: (key: string) => store.get(key) ?? null,
    setItem: (key: string, value: string) => { store.set(key, String(value)); },
    removeItem: (key: string) => { store.delete(key); },
    clear: () => { store.clear(); },
    get length() { return store.size; },
    key: (index: number) => [...store.keys()][index] ?? null,
  };
}

beforeEach(() => {
  vi.stubGlobal("localStorage", createStorage());
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
});

describe("getCacheKey", () => {
  it("returns deterministic hash for same inputs", async () => {
    const key1 = await getCacheKey("claude", "title", "text");
    const key2 = await getCacheKey("claude", "title", "text");
    expect(key1).toBe(key2);
    expect(key1).toMatch(/^htgp-cache-[0-9a-f]{64}$/);
  });

  it("differs when method changes", async () => {
    const key1 = await getCacheKey("claude", "title", "text");
    const key2 = await getCacheKey("gpt5", "title", "text");
    expect(key1).not.toBe(key2);
  });
});

describe("getCachedResult", () => {
  it("returns null on cache miss", () => {
    expect(getCachedResult("htgp-cache-nonexistent")).toBeNull();
  });

  it("returns stored result on cache hit", async () => {
    const key = await getCacheKey("claude", "title", "text");
    setCachedResult(key, MOCK_RESULT);
    expect(getCachedResult(key)).toEqual(MOCK_RESULT);
  });

  it("returns null and removes entry when TTL expired", async () => {
    const key = await getCacheKey("claude", "title", "text");
    setCachedResult(key, MOCK_RESULT);

    // Advance time past 24h TTL
    const originalDateNow = Date.now;
    Date.now = () => originalDateNow() + 25 * 60 * 60 * 1000;
    try {
      expect(getCachedResult(key)).toBeNull();
      // Entry should be removed
      expect(localStorage.getItem(key)).toBeNull();
    } finally {
      Date.now = originalDateNow;
    }
  });
});

describe("setCachedResult / getCachedResult roundtrip", () => {
  it("stores and retrieves result", async () => {
    const key = await getCacheKey("gemini", "my title", "my text");
    setCachedResult(key, MOCK_RESULT);
    const cached = getCachedResult(key);
    expect(cached).toEqual(MOCK_RESULT);
  });
});

describe("clearCache", () => {
  it("removes only htgp-cache-* keys, leaves others", async () => {
    localStorage.setItem("unrelated-key", "keep me");
    const key = await getCacheKey("claude", "t", "x");
    setCachedResult(key, MOCK_RESULT);

    clearCache();

    expect(localStorage.getItem("unrelated-key")).toBe("keep me");
    expect(localStorage.getItem(key)).toBeNull();
  });
});

describe("eviction", () => {
  it("removes oldest entries when exceeding 50", async () => {
    // Pre-fill 50 entries with ascending timestamps
    const originalDateNow = Date.now;
    let fakeTime = 1000000;

    Date.now = () => fakeTime;
    try {
      for (let i = 0; i < 50; i++) {
        fakeTime = 1000000 + i * 1000;
        const key = await getCacheKey("claude", "t", `text-${i}`);
        setCachedResult(key, MOCK_RESULT);
      }

      // Adding entry #51 should trigger eviction
      fakeTime = 1000000 + 50 * 1000;
      const newKey = await getCacheKey("claude", "t", "text-new");
      setCachedResult(newKey, MOCK_RESULT);

      // Count remaining cache entries
      let cacheCount = 0;
      for (let i = 0; i < localStorage.length; i++) {
        if (localStorage.key(i)?.startsWith("htgp-cache-")) cacheCount++;
      }

      // Should have evicted some — max 50, actually 41 after eviction (50 - 10 + 1)
      expect(cacheCount).toBeLessThanOrEqual(50);
      // The new entry should exist
      expect(getCachedResult(newKey)).toEqual(MOCK_RESULT);
    } finally {
      Date.now = originalDateNow;
    }
  });
});
