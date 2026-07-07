import { render, screen, fireEvent } from "@testing-library/react";
import { AccessibilityToggle } from "@/components/AccessibilityToggle";

describe("AccessibilityToggle", () => {
  it("renders with correct aria-checked state", () => {
    render(<AccessibilityToggle enabled={false} onToggle={() => {}} />);
    const button = screen.getByRole("switch");
    expect(button).toHaveAttribute("aria-checked", "false");
  });

  it("calls onToggle with the inverted value when clicked", () => {
    const onToggle = jest.fn();
    render(<AccessibilityToggle enabled={false} onToggle={onToggle} />);
    fireEvent.click(screen.getByRole("switch"));
    expect(onToggle).toHaveBeenCalledWith(true);
  });

  it("is keyboard accessible via its accessible name", () => {
    render(<AccessibilityToggle enabled={true} onToggle={() => {}} />);
    expect(
      screen.getByRole("switch", { name: /toggle accessibility mode/i })
    ).toBeInTheDocument();
  });
});
