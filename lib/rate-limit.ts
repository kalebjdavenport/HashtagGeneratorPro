import { NextResponse } from "next/server";
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";
import type { NextRequest } from "next/server";
import type { GenerateErrorResponse } from "@/lib/types";

let ratelimit: Ratelimit | null = null;
let initialized = false;

function getRateLimiter(): Ratelimit | null {
  if (initialized) return ratelimit;
  initialized = true;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) return null;

  ratelimit = new Ratelimit({
    redis: new Redis({ url, token }),
    limiter: Ratelimit.slidingWindow(5, "60 s"),
  });

  return ratelimit;
}

function getClientIp(request: NextRequest): string {
  return request.headers.get("x-forwarded-for")?.split(",")[0].trim() || "127.0.0.1";
}

export async function checkRateLimit(
  request: NextRequest,
): Promise<NextResponse<GenerateErrorResponse> | null> {
  const limiter = getRateLimiter();
  if (!limiter) return null;

  const ip = getClientIp(request);
  const { success } = await limiter.limit(ip);

  if (!success) {
    return NextResponse.json(
      {
        success: false as const,
        error: "Too many requests. Please wait a moment and try again.",
        code: "RATE_LIMITED" as const,
      },
      { status: 429 },
    );
  }

  return null;
}

/** Reset the singleton for testing. */
export function _resetForTesting(): void {
  ratelimit = null;
  initialized = false;
}
