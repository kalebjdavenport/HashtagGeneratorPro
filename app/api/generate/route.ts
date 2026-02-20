import { NextRequest, NextResponse } from "next/server";
import type {
  MethodId,
  GenerateRequest,
  GenerateResponse,
  GenerateErrorResponse,
} from "@/lib/types";
import { generateHashtags } from "@/lib/providers";
import { checkRateLimit, getClientIp } from "@/lib/rate-limit";
import {
  getServerCachedResult,
  setServerCachedResult,
} from "@/lib/server-cache";
import { createRequestLog, emitLog } from "@/lib/logger";

const VALID_METHODS: MethodId[] = ["claude", "gpt5", "gemini"];
const MIN_TEXT_LENGTH = 20;
const MAX_TEXT_LENGTH = 50_000;

export async function POST(
  request: NextRequest,
): Promise<NextResponse<GenerateResponse | GenerateErrorResponse>> {
  const startTime = Date.now();
  const ip = getClientIp(request);
  const log = createRequestLog(ip);

  try {
    // Rate limit check (fail-open)
    try {
      const rateLimitResponse = await checkRateLimit(request);
      if (rateLimitResponse) {
        log.statusCode = 429;
        log.code = "RATE_LIMITED";
        return rateLimitResponse;
      }
    } catch {
      // fail-open: allow request if rate limit check fails
    }

    const body = (await request.json()) as Partial<GenerateRequest>;
    const { method, title = "", text = "" } = body;

    log.method = (method as string) ?? null;

    if (!method || !VALID_METHODS.includes(method as MethodId)) {
      log.statusCode = 400;
      log.code = "INVALID_INPUT";
      return NextResponse.json(
        {
          success: false as const,
          error: `Invalid method. Must be one of: ${VALID_METHODS.join(", ")}`,
          code: "INVALID_INPUT" as const,
        },
        { status: 400 },
      );
    }

    if (typeof text !== "string" || text.trim().length < MIN_TEXT_LENGTH) {
      log.statusCode = 400;
      log.code = "INVALID_INPUT";
      return NextResponse.json(
        {
          success: false as const,
          error: `Text must be at least ${MIN_TEXT_LENGTH} characters.`,
          code: "INVALID_INPUT" as const,
        },
        { status: 400 },
      );
    }

    if (text.length > MAX_TEXT_LENGTH) {
      log.statusCode = 400;
      log.code = "INVALID_INPUT";
      return NextResponse.json(
        {
          success: false as const,
          error: `Text exceeds maximum length of ${MAX_TEXT_LENGTH} characters.`,
          code: "INVALID_INPUT" as const,
        },
        { status: 400 },
      );
    }

    const keyMap: Record<MethodId, string> = {
      claude: "ANTHROPIC_API_KEY",
      gpt5: "OPENAI_API_KEY",
      gemini: "GOOGLE_AI_API_KEY",
    };
    const envKey = keyMap[method as MethodId];
    if (!process.env[envKey]) {
      log.statusCode = 503;
      log.code = "MISSING_KEY";
      return NextResponse.json(
        {
          success: false as const,
          error: `${method} provider is not configured. Set ${envKey} in your environment.`,
          code: "MISSING_KEY" as const,
        },
        { status: 503 },
      );
    }

    const trimmedTitle = title.trim();
    const trimmedText = text.trim();

    // Server cache check (fail-open)
    try {
      const cached = await getServerCachedResult(
        method as string,
        trimmedTitle,
        trimmedText,
      );
      if (cached) {
        log.cacheHit = true;
        return NextResponse.json({ success: true as const, result: cached });
      }
    } catch {
      // fail-open: proceed to provider if cache check fails
    }

    const result = await generateHashtags(
      method as MethodId,
      trimmedTitle,
      trimmedText,
    );

    // Fire-and-forget cache write
    setServerCachedResult(method as string, trimmedTitle, trimmedText, result).catch(
      () => {},
    );

    return NextResponse.json({ success: true as const, result });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "An unknown error occurred.";

    // Extract HTTP status from SDK errors (Anthropic, OpenAI both expose .status)
    const status = (err as { status?: number }).status;

    // Only treat actual 429 HTTP status as rate limiting
    if (status === 429) {
      log.statusCode = 429;
      log.code = "RATE_LIMITED";
      log.error = message;
      return NextResponse.json(
        {
          success: false as const,
          error: `Rate limit exceeded: ${message}`,
          code: "RATE_LIMITED" as const,
        },
        { status: 429 },
      );
    }

    const responseStatus = status && status >= 400 ? status : 500;
    log.statusCode = responseStatus;
    log.code = "PROVIDER_ERROR";
    log.error = message;

    return NextResponse.json(
      {
        success: false as const,
        error: message,
        code: "PROVIDER_ERROR" as const,
      },
      { status: responseStatus },
    );
  } finally {
    log.latencyMs = Date.now() - startTime;
    emitLog(log);
  }
}
