import { describe, it, expect } from "vitest";
import { SYSTEM_PROMPT, buildUserPrompt } from "@/lib/prompts";

describe("SYSTEM_PROMPT", () => {
  it("mentions 5-8 hashtags", () => {
    expect(SYSTEM_PROMPT).toMatch(/5-8 hashtags/);
  });

  it("instructs lowercase", () => {
    expect(SYSTEM_PROMPT).toMatch(/lowercase/);
  });

  it("instructs # prefix", () => {
    expect(SYSTEM_PROMPT).toMatch(/start with #/);
  });
});

describe("buildUserPrompt", () => {
  it("includes Title: prefix when title is provided", () => {
    const result = buildUserPrompt("My Title", "Some long text here");
    expect(result).toBe("Title: My Title\nSome long text here");
  });

  it("omits Title: prefix when title is empty", () => {
    const result = buildUserPrompt("", "Some long text here");
    expect(result).toBe("Some long text here");
  });
});
