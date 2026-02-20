export type MethodId = "claude" | "gpt5" | "gemini";

export interface GenerationInput {
  title: string;
  text: string;
}

export interface GenerationResult {
  hashtags: string[];
  durationMs: number;
  method: MethodId;
}

export interface GenerateRequest {
  method: MethodId;
  title: string;
  text: string;
}

export interface GenerateResponse {
  success: true;
  result: GenerationResult;
}

export interface GenerateErrorResponse {
  success: false;
  error: string;
  code: "INVALID_INPUT" | "PROVIDER_ERROR" | "RATE_LIMITED" | "MISSING_KEY" | "UNKNOWN";
}

export interface MethodInfo {
  id: MethodId;
  label: string;
  description: string;
}

export const METHOD_LABELS: Record<MethodId, string> = {
  claude: "Claude Opus",
  gpt5: "GPT-5",
  gemini: "Gemini Flash",
};

export const METHODS: MethodInfo[] = [
  {
    id: "claude",
    label: "Claude Opus",
    description:
      "Anthropic's most capable model. Excels at nuanced topic extraction and creative hashtag generation.",
  },
  {
    id: "gpt5",
    label: "GPT-5",
    description:
      "OpenAI's latest frontier model. Strong at understanding context and generating relevant hashtags.",
  },
  {
    id: "gemini",
    label: "Gemini Flash",
    description:
      "Google's fast multimodal model. Quick and accurate hashtag extraction.",
  },
];
