import { describe, it, expect } from "vitest";
import { parseHashtags } from "@/lib/parse-hashtags";

describe("parseHashtags", () => {
  it("extracts #hashtag tokens from LLM output", () => {
    const result = parseHashtags("#react #nextjs #typescript");
    expect(result).toEqual(["#react", "#nextjs", "#typescript"]);
  });

  it("lowercases all tags", () => {
    const result = parseHashtags("#React #NextJS #TypeScript");
    expect(result).toEqual(["#react", "#nextjs", "#typescript"]);
  });

  it("deduplicates tags", () => {
    const result = parseHashtags("#react #React #REACT #nextjs");
    expect(result).toEqual(["#react", "#nextjs"]);
  });

  it("falls back to splitting on commas when no # found", () => {
    const result = parseHashtags("react, nextjs, typescript");
    expect(result).toEqual(["#react", "#nextjs", "#typescript"]);
  });

  it("falls back to splitting on newlines", () => {
    const result = parseHashtags("react\nnextjs\ntypescript");
    expect(result).toEqual(["#react", "#nextjs", "#typescript"]);
  });

  it("strips non-alpha from fallback chunks", () => {
    const result = parseHashtags("react.js, next js!, type-script");
    expect(result).toEqual(["#reactjs", "#nextjs", "#typescript"]);
  });

  it("ignores chunks > 40 chars in fallback mode", () => {
    const longChunk = "a".repeat(41);
    const result = parseHashtags(`react, ${longChunk}, nextjs`);
    expect(result).toEqual(["#react", "#nextjs"]);
  });

  it("respects max parameter", () => {
    const result = parseHashtags("#a #b #c #d #e", 3);
    expect(result).toEqual(["#a", "#b", "#c"]);
  });

  it("returns [] for empty string", () => {
    expect(parseHashtags("")).toEqual([]);
  });

  it("prefers hash-prefixed tokens over fallback", () => {
    // If there are #tags present, comma-separated words are ignored
    const result = parseHashtags("#react some other words, separated by commas");
    expect(result).toEqual(["#react"]);
  });
});
