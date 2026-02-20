"use client";

import { useRef, type KeyboardEvent } from "react";
import type { MethodId, MethodInfo } from "@/lib/types";

interface MethodTabsProps {
  methods: MethodInfo[];
  activeMethod: MethodId;
  onMethodChange: (id: MethodId) => void;
}

const PROVIDER_STYLES: Record<
  MethodId,
  { dot: string; activeBg: string; activeText: string; activeBorder: string }
> = {
  claude: {
    dot: "bg-amber-500",
    activeBg: "bg-amber-50",
    activeText: "text-amber-700",
    activeBorder: "border-b-amber-500",
  },
  gpt5: {
    dot: "bg-emerald-500",
    activeBg: "bg-emerald-50",
    activeText: "text-emerald-700",
    activeBorder: "border-b-emerald-500",
  },
  gemini: {
    dot: "bg-blue-500",
    activeBg: "bg-blue-50",
    activeText: "text-blue-700",
    activeBorder: "border-b-blue-500",
  },
};

export default function MethodTabs({
  methods,
  activeMethod,
  onMethodChange,
}: MethodTabsProps) {
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  function handleKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    const currentIdx = methods.findIndex((m) => m.id === activeMethod);
    let nextIdx = currentIdx;

    switch (e.key) {
      case "ArrowRight":
        nextIdx = (currentIdx + 1) % methods.length;
        break;
      case "ArrowLeft":
        nextIdx = (currentIdx - 1 + methods.length) % methods.length;
        break;
      case "Home":
        nextIdx = 0;
        break;
      case "End":
        nextIdx = methods.length - 1;
        break;
      default:
        return;
    }

    e.preventDefault();
    onMethodChange(methods[nextIdx].id);
    tabRefs.current[nextIdx]?.focus();
  }

  return (
    <div className="tabs-component mb-5">
      <div
        role="tablist"
        aria-label="AI model selection"
        className="flex gap-1 border-b border-buffer-border"
        onKeyDown={handleKeyDown}
      >
        {methods.map((method, i) => {
          const isActive = method.id === activeMethod;
          const styles = PROVIDER_STYLES[method.id];
          return (
            <button
              key={method.id}
              ref={(el) => {
                tabRefs.current[i] = el;
              }}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${method.id}`}
              tabIndex={isActive ? 0 : -1}
              id={`tab-${method.id}`}
              onClick={() => onMethodChange(method.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 -mb-px rounded-t-lg transition-colors ${
                isActive
                  ? `${styles.activeBg} ${styles.activeText} ${styles.activeBorder}`
                  : "text-buffer-muted border-transparent hover:text-buffer-dark hover:bg-buffer-light"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${styles.dot}`}
                aria-hidden="true"
              />
              {method.label}
            </button>
          );
        })}
      </div>

      {methods.map((method) => {
        const isActive = method.id === activeMethod;
        return (
          <div
            key={method.id}
            role="tabpanel"
            aria-labelledby={`tab-${method.id}`}
            id={`panel-${method.id}`}
            className={`tab-panel ${isActive ? "" : "hidden"}`}
            tabIndex={0}
          >
            <p className="text-sm text-buffer-muted py-3">{method.description}</p>
          </div>
        );
      })}
    </div>
  );
}
