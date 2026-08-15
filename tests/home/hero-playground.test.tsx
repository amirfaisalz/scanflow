import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { HeroPlayground } from "@/components/home/hero-playground";

describe("HeroPlayground Component", () => {
  it("renders hero headline, subtitle, and primary call to action", () => {
    render(<HeroPlayground user={null} />);

    expect(
      screen.getByRole("heading", { level: 1, name: /programmable entry points/i })
    ).toBeInTheDocument();
    expect(screen.getByText(/Start Building Free/i)).toBeInTheDocument();
    expect(screen.getByText(/Live QR Engine/i)).toBeInTheDocument();
  });

  it("allows typing custom destination URL and updates the live configurator", () => {
    render(<HeroPlayground user={null} />);

    const input = screen.getByPlaceholderText(/Enter target URL/i);
    fireEvent.change(input, { target: { value: "https://mycoolapp.io" } });
    expect(input).toHaveValue("https://mycoolapp.io");
  });

  it("switches routing presets dynamically", () => {
    render(<HeroPlayground user={null} />);

    const abSplitBtn = screen.getByRole("button", { name: /A\/B Split/i });
    fireEvent.click(abSplitBtn);
    expect(screen.getByText(/50% \/ 50% Traffic Allocation/i)).toBeInTheDocument();
  });

  it("opens scan simulation dialog when clicking Simulate Scan", async () => {
    render(<HeroPlayground user={null} />);

    const simulateBtn = screen.getByRole("button", { name: /Simulate Scan/i });
    fireEvent.click(simulateBtn);

    expect(screen.getByText(/Real-time Scan Resolution/i)).toBeInTheDocument();
    expect(screen.getByText(/Edge Routing Decision/i)).toBeInTheDocument();
  });
});
