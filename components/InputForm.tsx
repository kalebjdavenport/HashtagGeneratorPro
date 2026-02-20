"use client";

import { useRef, type FormEvent } from "react";

interface InputFormProps {
  title: string;
  text: string;
  onTitleChange: (value: string) => void;
  onTextChange: (value: string) => void;
  isGenerating: boolean;
  onSubmit: () => void;
}

const MIN_CHARS = 20;

export default function InputForm({
  title,
  text,
  onTitleChange,
  onTextChange,
  isGenerating,
  onSubmit,
}: InputFormProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const trimmedLen = text.trim().length;
  const textOk = trimmedLen >= MIN_CHARS;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (textOk && !isGenerating) {
      onSubmit();
    }
  }

  function handleFileChange() {
    const file = fileInputRef.current?.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === "string") {
        onTextChange(reader.result);
      }
    };
    reader.readAsText(file);
  }

  return (
    <form
      onSubmit={handleSubmit}
      aria-label="Hashtag generator input"
      aria-busy={isGenerating}
      className="space-y-5"
    >
      <div>
        <label
          htmlFor="title-input"
          className="block text-sm font-semibold text-buffer-dark mb-1.5"
        >
          Title or topic{" "}
          <span className="text-buffer-muted font-normal">(optional)</span>
        </label>
        <input
          id="title-input"
          type="text"
          value={title}
          onChange={(e) => onTitleChange(e.target.value)}
          className="w-full rounded-xl border border-buffer-border bg-white p-3.5 text-buffer-dark placeholder-buffer-muted/50 focus:border-buffer-blue transition-colors"
          placeholder="e.g. How to Build an AI-Powered Log Parser"
          aria-describedby="title-input-help"
          autoComplete="off"
        />
        <p id="title-input-help" className="text-xs text-buffer-muted mt-1.5">
          Helps the AI generate hashtags that match your content&apos;s theme.
        </p>
      </div>

      <div>
        <div className="flex items-baseline justify-between mb-1.5">
          <label
            htmlFor="text-input"
            className="block text-sm font-semibold text-buffer-dark"
          >
            Paste your text
          </label>
          <span
            className={`text-xs tabular-nums ${
              trimmedLen > 0 && !textOk
                ? "text-amber-700"
                : "text-buffer-muted"
            }`}
            aria-live="off"
          >
            {trimmedLen > 0 && (
              <>
                {trimmedLen.toLocaleString()} char
                {trimmedLen !== 1 ? "s" : ""}
                {!textOk && ` (${MIN_CHARS - trimmedLen} more needed)`}
              </>
            )}
          </span>
        </div>
        <textarea
          id="text-input"
          rows={6}
          value={text}
          onChange={(e) => onTextChange(e.target.value)}
          className={`w-full rounded-xl border bg-white p-4 text-buffer-dark placeholder-buffer-muted/50 focus:border-buffer-blue resize-y transition-colors ${
            trimmedLen > 0 && !textOk
              ? "border-amber-300"
              : "border-buffer-border"
          }`}
          placeholder="Paste an article, blog post, or any text here..."
          aria-describedby={trimmedLen > 0 && !textOk ? "text-input-error text-input-help" : "text-input-help"}
          aria-invalid={trimmedLen > 0 && !textOk}
          required
          minLength={MIN_CHARS}
        />
        {trimmedLen > 0 && !textOk && (
          <p id="text-input-error" className="text-xs text-amber-700 mt-1.5" role="alert">
            Text must be at least {MIN_CHARS} characters ({MIN_CHARS - trimmedLen} more needed).
          </p>
        )}
        <p id="text-input-help" className="text-xs text-buffer-muted mt-1.5">
          Paste your text or upload a .txt file below. Minimum {MIN_CHARS}{" "}
          characters — the more text you provide, the better the results.
        </p>
      </div>

      <div>
        <label
          htmlFor="file-input"
          className="block text-sm font-semibold text-buffer-dark mb-1.5"
        >
          Or upload a .txt file
        </label>
        <input
          id="file-input"
          ref={fileInputRef}
          type="file"
          accept=".txt,text/plain"
          onChange={handleFileChange}
          aria-describedby="file-input-help"
          className="block w-full text-sm text-buffer-muted file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border file:border-buffer-border file:text-sm file:font-semibold file:bg-buffer-light file:text-buffer-dark hover:file:bg-white file:cursor-pointer file:transition-colors"
        />
        <p id="file-input-help" className="text-xs text-buffer-muted mt-1.5">
          Plain text files only (.txt)
        </p>
      </div>

      <button
        type="submit"
        disabled={!textOk || isGenerating}
        aria-disabled={!textOk || isGenerating}
        className="w-full bg-buffer-blue text-white font-semibold py-3.5 px-6 rounded-xl hover:bg-buffer-blue-hover active:bg-buffer-blue-active disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        {isGenerating ? "Analyzing..." : "Generate Hashtags"}
      </button>
    </form>
  );
}
