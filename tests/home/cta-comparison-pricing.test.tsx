import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { CtaBanner } from "@/components/home/cta-banner";
import { ComparisonMatrix } from "@/components/home/comparison-matrix";
import { PricingSection } from "@/components/home/pricing-section";

describe("CtaBanner Component", () => {
  it("renders top pill, headline, and subtitle", () => {
    render(<CtaBanner />);

    expect(screen.getByText("Start Scaling Your Conversions")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /ready to turn every qr code into a high-converting engine\?/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /launch your first dynamic campaign in 60 seconds\. route intelligently, a\/b test with ease, and track full-funnel roi\./i
      )
    ).toBeInTheDocument();
  });

  it("renders primary and secondary CTA buttons with correct links", () => {
    render(<CtaBanner />);

    const primaryBtn = screen.getByRole("button", {
      name: /create your first dynamic qr/i,
    });
    expect(primaryBtn).toBeInTheDocument();
    expect(primaryBtn.closest("a")).toHaveAttribute("href", "/register");

    const secondaryBtn = screen.getByRole("button", {
      name: /try the live sandbox/i,
    });
    expect(secondaryBtn).toBeInTheDocument();
    expect(secondaryBtn.closest("a")).toHaveAttribute("href", "#playground");
  });

  it("renders trust badges", () => {
    render(<CtaBanner />);

    expect(screen.getByText("Free forever tier")).toBeInTheDocument();
    expect(screen.getByText("No credit card required")).toBeInTheDocument();
    expect(screen.getByText("Sub-12ms global edge redirects")).toBeInTheDocument();
  });
});

describe("ComparisonMatrix Component", () => {
  it("renders header badge, headline, and table features", () => {
    render(<ComparisonMatrix />);

    expect(screen.getByText("Why Developers Choose ScanFlow")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /engineered for high-performance growth/i,
      })
    ).toBeInTheDocument();

    expect(screen.getByText("Capability / Feature")).toBeInTheDocument();
    expect(screen.getByText("Static QR Codes")).toBeInTheDocument();
    expect(screen.getByText("Legacy Shortlinks")).toBeInTheDocument();
    expect(screen.getByText("ScanFlow")).toBeInTheDocument();

    expect(screen.getByText("Update Destination After Physical Print")).toBeInTheDocument();
    expect(screen.getByText("Sub-12ms Global Edge Redirect Engine")).toBeInTheDocument();
  });
});

describe("PricingSection Component", () => {
  it("renders header badge, headline, and billing toggle", () => {
    render(<PricingSection />);

    expect(screen.getByText("Transparent Pricing")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /simple plans that scale with your traffic/i,
      })
    ).toBeInTheDocument();

    expect(screen.getByText("Monthly Billing")).toBeInTheDocument();
    expect(screen.getByText("Annual Billing")).toBeInTheDocument();
    expect(screen.getByText("Save 20%")).toBeInTheDocument();
  });

  it("renders pricing tiers and toggles billing cycle prices", () => {
    render(<PricingSection />);

    expect(screen.getByText("Starter Free")).toBeInTheDocument();
    expect(screen.getByText("Growth Pro")).toBeInTheDocument();
    expect(screen.getByText("Enterprise")).toBeInTheDocument();

    expect(screen.getByText("Most Popular")).toBeInTheDocument();

    // Default is annual ($23/month)
    expect(screen.getByText("$23")).toBeInTheDocument();

    // Click toggle to monthly
    const toggleBtn = screen.getByRole("button", { name: /toggle annual billing/i });
    fireEvent.click(toggleBtn);

    // Monthly price is $29/month
    expect(screen.getByText("$29")).toBeInTheDocument();
  });
});
