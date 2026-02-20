"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import type { MethodId, GenerationResult } from "@/lib/types";
import { copyToClipboard } from "@/lib/clipboard";

const METHOD_LABELS: Record<MethodId, string> = {
  claude: "Claude Opus",
  gpt5: "GPT-5",
  gemini: "Gemini Flash",
};

interface HashtagResultsProps {
  result: GenerationResult | undefined;
  onClear: () => void;
  onReset: () => void;
}

export default function HashtagResults({
  result,
  onClear,
  onReset,
}: HashtagResultsProps) {
  const [copiedTag, setCopiedTag] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const regionRef = useRef<HTMLDivElement>(null);
  const prevResultRef = useRef<GenerationResult | undefined>(undefined);

  const showFeedback = useCallback((msg: string) => {
    setFeedback(msg);
    setTimeout(() => setFeedback(null), 2000);
  }, []);

  // Focus the results region when new results arrive
  useEffect(() => {
    if (
      result &&
      result.hashtags.length > 0 &&
      result !== prevResultRef.current
    ) {
      regionRef.current?.focus();
    }
    prevResultRef.current = result;
  }, [result]);

  if (!result || result.hashtags.length === 0) return null;

  const seconds = (result.durationMs / 1000).toFixed(1);
  const count = result.hashtags.length;
  const label = METHOD_LABELS[result.method] ?? result.method;

  async function handleCopyTag(tag: string) {
    const success = await copyToClipboard(tag);
    if (success) {
      setCopiedTag(tag);
      showFeedback(`Copied ${tag}`);
      setTimeout(() => setCopiedTag(null), 1500);
    }
  }

  async function handleCopyAll() {
    const text = result!.hashtags.join(" ");
    const success = await copyToClipboard(text);
    showFeedback(success ? "Copied all hashtags!" : "Failed to copy.");
  }

  return (
    <section
      ref={regionRef}
      aria-labelledby="results-heading"
      aria-live="polite"
      tabIndex={-1}
      className="mt-8 rounded-xl border border-buffer-border bg-buffer-light/50 p-5 focus:outline-none focus:ring-2 focus:ring-buffer-blue/25"
    >
      <h2
        id="results-heading"
        className="text-lg font-bold text-buffer-dark mb-1"
      >
        Your Hashtags
      </h2>

      <p className="text-sm text-buffer-muted mb-4">
        Generated {count} hashtag{count !== 1 ? "s" : ""} in {seconds}s using{" "}
        {label}
      </p>

      <ul
        className="flex flex-wrap gap-2 mb-5"
        role="list"
        aria-label="Generated hashtags"
      >
        {result.hashtags.map((tag) => (
          <li key={tag}>
            <button
              type="button"
              onClick={() => handleCopyTag(tag)}
              className={`hashtag-chip inline-flex items-center gap-1.5 bg-white text-buffer-dark text-sm font-semibold px-3.5 py-2 rounded-xl border border-buffer-border cursor-pointer ${
                copiedTag === tag ? "copied" : ""
              }`}
              aria-label={`Copy hashtag ${tag}`}
            >
              {tag}{" "}
              <span className="text-xs opacity-60" aria-hidden="true">
                {copiedTag === tag ? "\u2713" : "\uD83D\uDCCB"}
              </span>
            </button>
          </li>
        ))}
      </ul>

      <div className="flex gap-3">
        <button
          type="button"
          onClick={handleCopyAll}
          className="flex-1 bg-buffer-dark text-white font-semibold py-2.5 px-5 rounded-xl hover:opacity-90 transition-opacity"
        >
          Copy All
        </button>
        <button
          type="button"
          onClick={onClear}
          className="px-5 py-2.5 text-buffer-muted font-semibold border border-buffer-border rounded-xl hover:bg-buffer-light transition-colors"
        >
          Clear
        </button>
        <button
          type="button"
          onClick={onReset}
          className="px-5 py-2.5 text-red-500 font-semibold border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
        >
          Reset
        </button>
      </div>

      {feedback && (
        <p
          className="text-sm text-buffer-green mt-3 font-medium"
          role="status"
          aria-live="assertive"
        >
          {feedback}
        </p>
      )}
    </section>
  );
}
