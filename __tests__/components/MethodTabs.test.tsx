import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import MethodTabs from "@/components/MethodTabs";
import { METHODS } from "@/lib/types";
import type { MethodId } from "@/lib/types";

function renderTabs(active: MethodId = "claude", onChange = vi.fn()) {
  return {
    onChange,
    ...render(
      <MethodTabs
        methods={METHODS}
        activeMethod={active}
        onMethodChange={onChange}
      />,
    ),
  };
}

describe("MethodTabs", () => {
  it("renders all three provider tabs", () => {
    renderTabs();
    expect(screen.getByRole("tab", { name: /Claude Opus/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /GPT-5/i })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: /Gemini Flash/i })).toBeInTheDocument();
  });

  it("active tab has aria-selected true, others false", () => {
    renderTabs("gpt5");
    expect(screen.getByRole("tab", { name: /GPT-5/i })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: /Claude Opus/i })).toHaveAttribute("aria-selected", "false");
    expect(screen.getByRole("tab", { name: /Gemini Flash/i })).toHaveAttribute("aria-selected", "false");
  });

  it("clicking a tab calls onMethodChange with the correct id", async () => {
    const user = userEvent.setup();
    const { onChange } = renderTabs("claude");

    await user.click(screen.getByRole("tab", { name: /GPT-5/i }));
    expect(onChange).toHaveBeenCalledWith("gpt5");
  });

  it("ArrowRight moves selection forward", async () => {
    const user = userEvent.setup();
    const { onChange } = renderTabs("claude");

    const tab = screen.getByRole("tab", { name: /Claude Opus/i });
    tab.focus();
    await user.keyboard("{ArrowRight}");
    expect(onChange).toHaveBeenCalledWith("gpt5");
  });

  it("ArrowLeft wraps from first to last", async () => {
    const user = userEvent.setup();
    const { onChange } = renderTabs("claude");

    const tab = screen.getByRole("tab", { name: /Claude Opus/i });
    tab.focus();
    await user.keyboard("{ArrowLeft}");
    expect(onChange).toHaveBeenCalledWith("gemini");
  });

  it("Home jumps to first tab", async () => {
    const user = userEvent.setup();
    const { onChange } = renderTabs("gemini");

    const tab = screen.getByRole("tab", { name: /Gemini Flash/i });
    tab.focus();
    await user.keyboard("{Home}");
    expect(onChange).toHaveBeenCalledWith("claude");
  });

  it("End jumps to last tab", async () => {
    const user = userEvent.setup();
    const { onChange } = renderTabs("claude");

    const tab = screen.getByRole("tab", { name: /Claude Opus/i });
    tab.focus();
    await user.keyboard("{End}");
    expect(onChange).toHaveBeenCalledWith("gemini");
  });

  it("tab panels have correct aria-labelledby linking", () => {
    renderTabs("claude");
    for (const method of METHODS) {
      const panel = screen.getByRole("tabpanel", { hidden: true, name: method.label });
      expect(panel).toHaveAttribute("aria-labelledby", `tab-${method.id}`);
      expect(panel).toHaveAttribute("id", `panel-${method.id}`);
    }
  });
});
