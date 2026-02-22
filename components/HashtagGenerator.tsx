"use client";

import { useCallback, useState, useEffect } from "react";
import { METHODS, type MethodId } from "@/lib/types";
import { useHashtagGenerator } from "@/hooks/useHashtagGenerator";
import { useLocalStorage } from "@/hooks/useLocalStorage";
import { clearCache, hasCacheEntries } from "@/lib/cache";
import MethodTabs from "./MethodTabs";
import InputForm from "./InputForm";
import StatusMessage from "./StatusMessage";
import HashtagResults from "./HashtagResults";

export default function HashtagGenerator() {
  const [title, setTitle, clearTitle] = useLocalStorage("htgp-title", "");
  const [text, setText, clearText] = useLocalStorage("htgp-text", "");
  const [selectedMethod, setSelectedMethod] = useLocalStorage<MethodId>(
    "htgp-method",
    "claude",
  );

  const { isGenerating, error, results, generate, clearResults, resetAll } =
    useHashtagGenerator();

  const [hasCache, setHasCache] = useState(false);
  useEffect(() => setHasCache(hasCacheEntries()), []);

  const handleSubmit = useCallback(() => {
    generate(selectedMethod, title, text).then(() => setHasCache(hasCacheEntries()));
  }, [generate, selectedMethod, title, text]);

  const handleClear = useCallback(() => {
    clearResults(selectedMethod);
  }, [clearResults, selectedMethod]);

  const handleReset = useCallback(() => {
    clearTitle();
    clearText();
    setSelectedMethod("claude");
    resetAll();
  }, [clearTitle, clearText, setSelectedMethod, resetAll]);

  const currentResult = results[selectedMethod];

  return (
    <div id="hashtag-generator" tabIndex={-1} className="focus:outline-none">
      <MethodTabs
        methods={METHODS}
        activeMethod={selectedMethod}
        onMethodChange={setSelectedMethod}
      />

      <InputForm
        title={title}
        text={text}
        onTitleChange={setTitle}
        onTextChange={setText}
        isGenerating={isGenerating}
        onSubmit={handleSubmit}
        onClearCache={() => { clearCache(); setHasCache(false); }}
        hasCachedResults={hasCache}
      />

      <StatusMessage isGenerating={isGenerating} error={error} activeMethod={selectedMethod} />

      <HashtagResults
        result={currentResult}
        onClear={handleClear}
        onReset={handleReset}
      />
    </div>
  );
}
