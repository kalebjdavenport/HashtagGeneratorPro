"use client";

import { useState, useEffect, useRef, useCallback } from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
  debounceMs = 500,
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const [value, setValue] = useState<T>(initialValue);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const isInitialized = useRef(false);

  useEffect(() => {
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        setValue(JSON.parse(stored) as T);
      }
    } catch {
      // ignore
    }
    isInitialized.current = true;
  }, [key]);

  useEffect(() => {
    if (!isInitialized.current) return;
    clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      try {
        localStorage.setItem(key, JSON.stringify(value));
      } catch {
        // quota exceeded
      }
    }, debounceMs);
    return () => clearTimeout(timerRef.current);
  }, [key, value, debounceMs]);

  const clear = useCallback(() => {
    setValue(initialValue);
    try {
      localStorage.removeItem(key);
    } catch {
      // ignore
    }
  }, [key, initialValue]);

  return [value, setValue, clear];
}
