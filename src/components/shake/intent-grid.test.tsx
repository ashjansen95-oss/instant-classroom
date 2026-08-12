import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { INTENT_OPTIONS } from "@/lib/labels";
import { IntentGrid } from "./intent-grid";

describe("IntentGrid", () => {
  it("renders every intent as a tappable action, not a radio group", () => {
    render(<IntentGrid onSelect={vi.fn()} busy={false} />);

    for (const { label } of INTENT_OPTIONS) {
      const button = screen.getByRole("button", { name: label });
      // Actions, not selectable state — nothing here should look like a
      // filter chip that stays "on" once tapped.
      expect(button).not.toHaveAttribute("aria-checked");
      expect(button).not.toHaveAttribute("role", "radio");
    }
  });

  it("calls onSelect with the tapped intent's need, immediately", async () => {
    const onSelect = vi.fn();
    render(<IntentGrid onSelect={onSelect} busy={false} />);

    await userEvent.click(screen.getByRole("button", { name: "Reset the room" }));

    expect(onSelect).toHaveBeenCalledExactlyOnceWith("reset");
  });

  it("has no tile for surprise — that belongs to the shake pad, not the grid", () => {
    render(<IntentGrid onSelect={vi.fn()} busy={false} />);
    expect(screen.queryByRole("button", { name: /surprise/i })).not.toBeInTheDocument();
  });

  it("disables every tile while a pick is already in flight", () => {
    render(<IntentGrid onSelect={vi.fn()} busy />);

    for (const { label } of INTENT_OPTIONS) {
      expect(screen.getByRole("button", { name: label })).toBeDisabled();
    }
  });
});
