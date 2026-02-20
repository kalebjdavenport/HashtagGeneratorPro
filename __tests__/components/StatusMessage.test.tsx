import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import StatusMessage from "@/components/StatusMessage";

describe("StatusMessage", () => {
  it("returns null when idle (not generating, no error)", () => {
    const { container } = render(
      <StatusMessage isGenerating={false} error={null} />,
    );
    expect(container.innerHTML).toBe("");
  });

  it('shows spinner with role="status" and provider name when generating', () => {
    render(
      <StatusMessage isGenerating={true} error={null} activeMethod="claude" />,
    );
    const status = screen.getByRole("status");
    expect(status).toBeInTheDocument();
    expect(status).toHaveTextContent(/Claude Opus/);
  });

  it('shows error with role="alert" when error prop is set', () => {
    render(
      <StatusMessage isGenerating={false} error="Something went wrong" />,
    );
    const alert = screen.getByRole("alert");
    expect(alert).toBeInTheDocument();
    expect(alert).toHaveTextContent("Something went wrong");
  });

  it("error state takes priority over generating state", () => {
    render(
      <StatusMessage
        isGenerating={true}
        error="Error!"
        activeMethod="claude"
      />,
    );
    expect(screen.getByRole("alert")).toBeInTheDocument();
    expect(screen.queryByRole("status")).not.toBeInTheDocument();
  });
});
