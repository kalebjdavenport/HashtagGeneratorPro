import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import InputForm from "@/components/InputForm";

const VALID_TEXT = "This is a valid text that is at least twenty characters long for testing.";

function renderForm(overrides: Partial<Parameters<typeof InputForm>[0]> = {}) {
  const props = {
    title: "",
    text: "",
    onTitleChange: vi.fn(),
    onTextChange: vi.fn(),
    isGenerating: false,
    onSubmit: vi.fn(),
    ...overrides,
  };
  return { props, ...render(<InputForm {...props} />) };
}

describe("InputForm", () => {
  it("renders title input, textarea, file input, and submit button with labels", () => {
    renderForm();
    expect(screen.getByLabelText(/title or topic/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/paste your text/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/upload a .txt file/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /generate hashtags/i })).toBeInTheDocument();
  });

  it("submit button is disabled when text < 20 chars", () => {
    renderForm({ text: "short" });
    expect(screen.getByRole("button", { name: /generate hashtags/i })).toBeDisabled();
  });

  it("submit button is enabled when text >= 20 chars", () => {
    renderForm({ text: VALID_TEXT });
    expect(screen.getByRole("button", { name: /generate hashtags/i })).toBeEnabled();
  });

  it('shows "more needed" warning with role="alert" when text too short', () => {
    renderForm({ text: "short text" });
    const alert = screen.getByRole("alert");
    expect(alert).toHaveTextContent(/more needed/i);
  });

  it("sets aria-invalid on textarea when text is present but < 20 chars", () => {
    renderForm({ text: "short" });
    expect(screen.getByLabelText(/paste your text/i)).toHaveAttribute("aria-invalid", "true");
  });

  it("typing calls onTitleChange callback", async () => {
    const user = userEvent.setup();
    const { props } = renderForm();

    await user.type(screen.getByLabelText(/title or topic/i), "a");
    expect(props.onTitleChange).toHaveBeenCalledWith("a");
  });

  it("typing calls onTextChange callback", async () => {
    const user = userEvent.setup();
    const { props } = renderForm();

    await user.type(screen.getByLabelText(/paste your text/i), "a");
    expect(props.onTextChange).toHaveBeenCalledWith("a");
  });

  it("submit calls onSubmit when text is valid", async () => {
    const user = userEvent.setup();
    const { props } = renderForm({ text: VALID_TEXT });

    await user.click(screen.getByRole("button", { name: /generate hashtags/i }));
    expect(props.onSubmit).toHaveBeenCalledOnce();
  });

  it("submit does NOT call onSubmit when text is invalid", async () => {
    const user = userEvent.setup();
    const { props } = renderForm({ text: "short" });

    await user.click(screen.getByRole("button", { name: /generate hashtags/i }));
    expect(props.onSubmit).not.toHaveBeenCalled();
  });
});
