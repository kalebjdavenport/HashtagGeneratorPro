"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { METHOD_LABELS, type GenerationResult } from "@/lib/types";
import { copyToClipboard } from "@/lib/clipboard";

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
              {tag}
              <span className="w-3.5 h-3.5 opacity-50" aria-hidden="true">
                {copiedTag === tag ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5 text-emerald-600">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-3.5 h-3.5">
                    <rect x="9" y="9" width="13" height="13" rx="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                )}
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
          className="px-5 py-2.5 text-red-700 font-semibold border border-red-200 rounded-xl hover:bg-red-50 transition-colors"
        >
          Reset
        </button>
      </div>

      {feedback && (
        <p
          className="text-sm text-emerald-700 mt-3 font-medium"
          role="status"
        >
          {feedback}
        </p>
      )}
    </section>
  );
}
