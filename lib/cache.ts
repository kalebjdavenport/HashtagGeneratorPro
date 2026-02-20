import type { GenerationResult } from "./types";

const CACHE_PREFIX = "htgp-cache-";
const MAX_CACHE_ENTRIES = 50;
const TTL_MS = 24 * 60 * 60 * 1000; // 24 hours

async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export async function getCacheKey(
  method: string,
  title: string,
  text: string,
): Promise<string> {
  const raw = `${method}:${title}:${text}`;
  const hash = await sha256(raw);
  return `${CACHE_PREFIX}${hash}`;
}

export function getCachedResult(key: string): GenerationResult | null {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as {
      result: GenerationResult;
      timestamp: number;
    };
    if (Date.now() - parsed.timestamp > TTL_MS) {
      localStorage.removeItem(key);
      return null;
    }
    return parsed.result;
  } catch {
    return null;
  }
}

export function setCachedResult(key: string, result: GenerationResult): void {
  try {
    evictOldEntries();
    localStorage.setItem(
      key,
      JSON.stringify({ result, timestamp: Date.now() }),
    );
  } catch {
    // localStorage quota exceeded
  }
}

function evictOldEntries(): void {
  const entries: { key: string; timestamp: number }[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CACHE_PREFIX)) {
      try {
        const parsed = JSON.parse(localStorage.getItem(key)!) as {
          timestamp: number;
        };
        entries.push({ key, timestamp: parsed.timestamp });
      } catch {
        if (key) localStorage.removeItem(key);
      }
    }
  }

  if (entries.length >= MAX_CACHE_ENTRIES) {
    entries.sort((a, b) => a.timestamp - b.timestamp);
    const toRemove = entries.slice(0, entries.length - MAX_CACHE_ENTRIES + 10);
    for (const entry of toRemove) {
      localStorage.removeItem(entry.key);
    }
  }
}

export function clearCache(): void {
  const keys: string[] = [];
  for (let i = 0; i < localStorage.length; i++) {
    const key = localStorage.key(i);
    if (key?.startsWith(CACHE_PREFIX)) keys.push(key);
  }
  for (const key of keys) {
    localStorage.removeItem(key);
  }
}
