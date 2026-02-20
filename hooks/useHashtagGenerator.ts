"use client";

import { useState, useCallback } from "react";
import type {
  MethodId,
  GenerationResult,
  GenerateResponse,
  GenerateErrorResponse,
} from "@/lib/types";
import {
  getCacheKey,
  getCachedResult,
  setCachedResult,
  clearCache,
} from "@/lib/cache";

interface GeneratorState {
  isGenerating: boolean;
  error: string | null;
  results: Partial<Record<MethodId, GenerationResult>>;
}

export function useHashtagGenerator() {
  const [state, setState] = useState<GeneratorState>({
    isGenerating: false,
    error: null,
    results: {},
  });

  const generate = useCallback(
    async (
      method: MethodId,
      title: string,
      text: string,
    ): Promise<GenerationResult | null> => {
      setState((prev) => ({ ...prev, isGenerating: true, error: null }));

      try {
        const cacheKey = await getCacheKey(method, title, text);
        const cached = getCachedResult(cacheKey);
        if (cached) {
          setState((prev) => ({
            ...prev,
            isGenerating: false,
            results: { ...prev.results, [method]: cached },
          }));
          return cached;
        }

        const response = await fetch("/api/generate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ method, title, text }),
        });

        const data = (await response.json()) as
          | GenerateResponse
          | GenerateErrorResponse;

        if (!data.success) {
          throw new Error(data.error);
        }

        setCachedResult(cacheKey, data.result);

        setState((prev) => ({
          ...prev,
          isGenerating: false,
          results: { ...prev.results, [method]: data.result },
        }));

        return data.result;
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "An error occurred.";
        setState((prev) => ({ ...prev, isGenerating: false, error: message }));
        return null;
      }
    },
    [],
  );

  const clearResults = useCallback((method?: MethodId) => {
    setState((prev) => {
      if (method) {
        const updated = { ...prev.results };
        delete updated[method];
        return { ...prev, results: updated, error: null };
      }
      return { ...prev, results: {}, error: null };
    });
  }, []);

  const resetAll = useCallback(() => {
    setState({ isGenerating: false, error: null, results: {} });
    clearCache();
  }, []);

  return {
    isGenerating: state.isGenerating,
    error: state.error,
    results: state.results,
    generate,
    clearResults,
    resetAll,
  };
}
