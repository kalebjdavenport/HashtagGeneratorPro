"use client";

import { METHOD_LABELS, type MethodId } from "@/lib/types";

interface StatusMessageProps {
  isGenerating: boolean;
  error: string | null;
  activeMethod?: MethodId;
}

export default function StatusMessage({
  isGenerating,
  error,
  activeMethod,
}: StatusMessageProps) {
  if (error) {
    return (
      <div
        role="alert"
        className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4"
      >
        <p className="text-sm font-semibold text-red-800 mb-1">
          Generation failed
        </p>
        <p className="text-sm text-red-700">{error}</p>
      </div>
    );
  }

  if (isGenerating && activeMethod) {
    const label = METHOD_LABELS[activeMethod] ?? activeMethod;
    return (
      <div role="status" aria-live="polite" className="mt-5">
        <div className="flex items-center gap-2.5 text-sm text-buffer-muted rounded-xl border border-buffer-border bg-buffer-light/50 p-4">
          <svg
            className="spinner w-4 h-4 shrink-0 text-buffer-blue"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            aria-hidden="true"
          >
            <circle
              cx="12"
              cy="12"
              r="10"
              strokeDasharray="60"
              strokeDashoffset="15"
            />
          </svg>
          <span>
            Generating with <strong className="text-buffer-dark">{label}</strong>
            ...
          </span>
        </div>
      </div>
    );
  }

  return null;
}
