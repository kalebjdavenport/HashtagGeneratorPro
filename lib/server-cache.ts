import { Redis } from "@upstash/redis";
import type { GenerationResult } from "./types";

const CACHE_PREFIX = "htgp-srv-";
const TTL_SECONDS = 24 * 60 * 60; // 24 hours

let redis: Redis | null = null;
let initialized = false;

function getRedis(): Redis | null {
  if (initialized) return redis;
  initialized = true;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  redis = new Redis({ url, token });
  return redis;
}

async function sha256(input: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(input);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function buildKey(
  method: string,
  title: string,
  text: string,
): Promise<string> {
  const raw = `${method}:${title}:${text}`;
  const hash = await sha256(raw);
  return `${CACHE_PREFIX}${hash}`;
}

export async function getServerCachedResult(
  method: string,
  title: string,
  text: string,
): Promise<GenerationResult | null> {
  const client = getRedis();
  if (!client) return null;

  const key = await buildKey(method, title, text);
  const cached = await client.get<GenerationResult>(key);
  return cached ?? null;
}

export async function setServerCachedResult(
  method: string,
  title: string,
  text: string,
  result: GenerationResult,
): Promise<void> {
  const client = getRedis();
  if (!client) return;

  const key = await buildKey(method, title, text);
  await client.set(key, result, { ex: TTL_SECONDS });
}

/** Reset the singleton for testing. */
export function _resetForTesting(): void {
  redis = null;
  initialized = false;
}
