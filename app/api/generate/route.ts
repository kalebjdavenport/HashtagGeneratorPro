import { NextRequest, NextResponse } from "next/server";
import type {
  MethodId,
  GenerateRequest,
  GenerateResponse,
  GenerateErrorResponse,
} from "@/lib/types";
import { generateHashtags } from "@/lib/providers";
import { checkRateLimit } from "@/lib/rate-limit";

const VALID_METHODS: MethodId[] = ["claude", "gpt5", "gemini"];
const MIN_TEXT_LENGTH = 20;
const MAX_TEXT_LENGTH = 50_000;

export async function POST(
  request: NextRequest,
): Promise<NextResponse<GenerateResponse | GenerateErrorResponse>> {
  // Rate limit check (fail-open)
  try {
    const rateLimitResponse = await checkRateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;
  } catch (err) {
    console.error("[API /generate] Rate limit check failed, allowing request:", err);
  }

  try {
    const body = (await request.json()) as Partial<GenerateRequest>;
    const { method, title = "", text = "" } = body;

    if (!method || !VALID_METHODS.includes(method as MethodId)) {
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
      return NextResponse.json(
        {
          success: false as const,
          error: `${method} provider is not configured. Set ${envKey} in your environment.`,
          code: "MISSING_KEY" as const,
        },
        { status: 503 },
      );
    }

    const result = await generateHashtags(
      method as MethodId,
      title.trim(),
      text.trim(),
    );

    return NextResponse.json({ success: true as const, result });
  } catch (err: unknown) {
    const message =
      err instanceof Error ? err.message : "An unknown error occurred.";

    // Extract HTTP status from SDK errors (Anthropic, OpenAI both expose .status)
    const status = (err as { status?: number }).status;

    console.error("[API /generate] Error:", { message, status, err });

    // Only treat actual 429 HTTP status as rate limiting
    if (status === 429) {
      return NextResponse.json(
        {
          success: false as const,
          error: `Rate limit exceeded: ${message}`,
          code: "RATE_LIMITED" as const,
        },
        { status: 429 },
      );
    }

    return NextResponse.json(
      {
        success: false as const,
        error: message,
        code: "PROVIDER_ERROR" as const,
      },
      { status: status && status >= 400 ? status : 500 },
    );
  }
}
