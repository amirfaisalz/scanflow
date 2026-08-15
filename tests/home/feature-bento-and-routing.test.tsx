import { describe, it, expect } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { FeatureBento } from "@/components/home/feature-bento";
import { RoutingVisualizer } from "@/components/home/routing-visualizer";

describe("FeatureBento Component", () => {
  it("renders section badge, headline, and subtitle", () => {
    render(<FeatureBento />);

    expect(screen.getByText("Core Capabilities")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /everything you need to maximize every single qr scan/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /A high-performance dynamic QR engine built for zero latency, bulletproof routing, and verified revenue attribution/i
      )
    ).toBeInTheDocument();
  });

  it("renders all 6 feature cards with badges and descriptions", () => {
    render(<FeatureBento />);

    expect(screen.getByText("Zero-Friction OS Routing")).toBeInTheDocument();
    expect(screen.getByText("Edge Native")).toBeInTheDocument();
    expect(
      screen.getByText(/Direct iOS users to the App Store, Android to Google Play/i)
    ).toBeInTheDocument();

    expect(screen.getByText("Full-Funnel Scan Attribution")).toBeInTheDocument();
    expect(screen.getByText("Lifecycle Tracking")).toBeInTheDocument();

    expect(screen.getByText("Automated A/B Split Testing")).toBeInTheDocument();
    expect(screen.getByText("Conversion Boost")).toBeInTheDocument();

    expect(screen.getByText("Custom Vector QR Studio")).toBeInTheDocument();
    expect(screen.getByText("Brand Ready")).toBeInTheDocument();

    expect(screen.getByText("Sub-12ms Instant Edge Redirects")).toBeInTheDocument();
    expect(screen.getByText("Zero Lag")).toBeInTheDocument();

    expect(screen.getByText("Enterprise Multi-Tenancy & Security")).toBeInTheDocument();
    expect(screen.getByText("PostgreSQL & Auth")).toBeInTheDocument();
  });
});

describe("RoutingVisualizer Component", () => {
  it("renders section badge, headline, and subtitle", () => {
    render(<RoutingVisualizer />);

    expect(screen.getByText("Instant Device Routing")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 2,
        name: /never send an iphone user to google play again/i,
      })
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /Eliminate download friction by automatically delivering visitors to their native app store/i
      )
    ).toBeInTheDocument();
  });

  it("allows switching between iOS, Android, and Desktop device presets", () => {
    render(<RoutingVisualizer />);

    // Default is iOS
    expect(screen.getByText(/Apple App Store \(iOS Native\)/i)).toBeInTheDocument();

    // Click Android
    const androidBtn = screen.getByRole("button", { name: /Android/i });
    fireEvent.click(androidBtn);
    expect(screen.getByText(/Google Play Store \(Android APK\)/i)).toBeInTheDocument();

    // Click Desktop
    const desktopBtn = screen.getByRole("button", { name: /Desktop/i });
    fireEvent.click(desktopBtn);
    expect(screen.getByText(/Web SaaS Application \(Desktop Portal\)/i)).toBeInTheDocument();
  });
});
