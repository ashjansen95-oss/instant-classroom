import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { MORE_OPTIONS } from "@/lib/labels";
import { MoreSheet } from "./more-sheet";

describe("MoreSheet", () => {
  it("lists every well-backed category", () => {
    render(<MoreSheet open onClose={vi.fn()} onSelect={vi.fn()} />);

    for (const { label } of MORE_OPTIONS) {
      expect(screen.getByRole("button", { name: label })).toBeInTheDocument();
    }
  });

  it("passes the category straight through on tap — same immediate-action shape as an intent tile", async () => {
    const onSelect = vi.fn();
    render(<MoreSheet open onClose={vi.fn()} onSelect={onSelect} />);

    await userEvent.click(screen.getByRole("button", { name: "Movement" }));

    expect(onSelect).toHaveBeenCalledExactlyOnceWith("get-moving");
  });

  it("stays out of the accessibility tree when closed", () => {
    render(<MoreSheet open={false} onClose={vi.fn()} onSelect={vi.fn()} />);
    expect(screen.queryByRole("button", { name: "Movement" })).not.toBeInTheDocument();
  });
});
