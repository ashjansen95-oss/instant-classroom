import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { IosInstallSteps } from "./ios-install-steps";

describe("IosInstallSteps", () => {
  it("sends Safari through the extra ••• tap Chrome doesn't need", () => {
    const { container } = render(<IosInstallSteps browser="safari" />);
    expect(container.textContent).toContain("View More");
    expect(container.textContent).toContain("Add to Home Screen");
    // Confirmed against a real device: Safari's toolbar tucks Share behind a
    // "•••" button first — two icons before the text, not one.
    expect(container.querySelectorAll("svg")).toHaveLength(2);
  });

  it("skips the ••• tap for Chrome — one icon, not two", () => {
    const { container } = render(<IosInstallSteps browser="chrome" />);
    expect(container.textContent).toContain("View More");
    expect(container.textContent).toContain("Add to Home Screen");
    expect(container.querySelectorAll("svg")).toHaveLength(1);
  });

  it("hedges rather than guessing for an unrecognised iOS browser", () => {
    render(<IosInstallSteps browser="other" />);
    expect(screen.getByText(/share or menu options/i)).toBeInTheDocument();
  });
});
