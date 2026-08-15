import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { JourneyVisualizer } from "@/components/home/journey-visualizer";
import { ABTestingShowcase } from "@/components/home/ab-testing-showcase";
import { FAQSection } from "@/components/home/faq-section";

describe("JourneyVisualizer Component", () => {
  it("renders section badge, headline, and subtitle", () => {
    render(<JourneyVisualizer />);

    expect(screen.getByText("Visitor Journey Analytics")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /turn physical scans into verified revenue/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /connect offline billboards, packaging, and tabletop displays directly to digital conversions with transparent attribution/i
      )
    ).toBeInTheDocument();
  });

  it("renders all 4 journey steps and allows clicking between steps", () => {
    render(<JourneyVisualizer />);

    expect(screen.getByText("1. Physical Scan Event")).toBeInTheDocument();
    expect(screen.getByText("2. Contextual Routing & Landing")).toBeInTheDocument();
    expect(screen.getByText("3. Session & User Binding")).toBeInTheDocument();
    expect(screen.getByText("4. Conversion Attribution")).toBeInTheDocument();

    expect(screen.getByText(/Visitor scans physical QR code on retail poster/i)).toBeInTheDocument();
    expect(screen.getByText(/Deterministic rule matches iOS user agent/i)).toBeInTheDocument();

    const step3Card = screen.getByText("3. Session & User Binding").closest("div[class*='cursor-pointer']");
    expect(step3Card).toBeInTheDocument();
    if (step3Card) {
      fireEvent.click(step3Card);
    }
  });
});

describe("ABTestingShowcase Component", () => {
  it("renders section badge, headline, and subtitle", () => {
    render(<ABTestingShowcase />);

    expect(screen.getByText("A/B Traffic Splitting")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /a\/b split test your qr campaigns in real time/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /eliminate guesswork by splitting scan traffic across multiple landing page variants to double your conversion rate/i
      )
    ).toBeInTheDocument();
  });

  it("renders variant cards and updates traffic split via slider", () => {
    render(<ABTestingShowcase />);

    expect(screen.getByText("Original Landing Page")).toBeInTheDocument();
    expect(screen.getByText("3.2%")).toBeInTheDocument();

    expect(screen.getByText("Interactive Video Hero Page")).toBeInTheDocument();
    expect(screen.getByText(/7.8% \(\+143% Lift\)/i)).toBeInTheDocument();
    expect(screen.getByText("VARIANT B (WINNER)")).toBeInTheDocument();

    const slider = screen.getByRole("slider");
    expect(slider).toBeInTheDocument();
    expect(slider).toHaveValue("50");

    fireEvent.change(slider, { target: { value: "70" } });
    expect(slider).toHaveValue("70");
    expect(screen.getByText(/Variant A: 70% \| Variant B: 30%/i)).toBeInTheDocument();
  });
});

describe("FAQSection Component", () => {
  it("renders section badge, headline, and subtitle", () => {
    render(<FAQSection />);

    expect(screen.getByText("Frequently Asked Questions")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /everything you need to know/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /everything you need to know about dynamic qr routing, edge redirects, custom domains, and print safety/i
      )
    ).toBeInTheDocument();
  });

  it("renders faq questions and toggles accordion items", () => {
    render(<FAQSection />);

    const firstQuestion = screen.getByText("What is a Dynamic QR Code and how does it work?");
    expect(firstQuestion).toBeInTheDocument();

    // First question is open by default
    expect(
      screen.getByText(/Unlike static QR codes that hardcode a permanent destination URL/i)
    ).toBeInTheDocument();

    const secondQuestionBtn = screen.getByRole("button", {
      name: /can i update the destination url after the qr code is printed on physical billboards\?/i,
    });
    expect(secondQuestionBtn).toBeInTheDocument();

    // Click to open second question
    fireEvent.click(secondQuestionBtn);
    expect(
      screen.getByText(/Because the printed QR code points to your permanent ScanFlow edge shortlink/i)
    ).toBeInTheDocument();

    // Click again to close
    fireEvent.click(secondQuestionBtn);
    expect(
      screen.queryByText(/Because the printed QR code points to your permanent ScanFlow edge shortlink/i)
    ).not.toBeInTheDocument();
  });
});
