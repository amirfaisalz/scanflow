import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SectionCards } from "@/components/section-cards";
import { DashboardOverviewTable } from "@/components/dashboard-overview-table";
import { CampaignCard } from "@/components/campaigns/campaign-card";
import { ConversionCard } from "@/components/conversions/conversion-card";
import { AnalyticsKpiCards } from "@/components/analytics/analytics-kpi-cards";
import type { QRCode as QRCodeModel } from "@/lib/db/schema";

describe("Dashboard Components & Unified Subpages", () => {
  it("renders SectionCards with dynamic KPI metrics and trend comparison", () => {
    render(
      <SectionCards
        kpis={{
          totalScans: 1250,
          uniqueSessions: 890,
          activeQRCodes: 8,
          conversionRate: 4.5,
        }}
      />
    );

    expect(screen.getByText("Total Scans")).toBeInTheDocument();
    expect(screen.getByText("1,250")).toBeInTheDocument();
    expect(screen.getByText("Unique Visitors")).toBeInTheDocument();
    expect(screen.getByText("890")).toBeInTheDocument();
    expect(screen.getByText("Active QR Codes")).toBeInTheDocument();
    expect(screen.getByText("8")).toBeInTheDocument();
    expect(screen.getByText("Conversion Rate")).toBeInTheDocument();
    expect(screen.getByText("4.5%")).toBeInTheDocument();
    expect(screen.getAllByText(/VS PREV\. 28 DAYS/i).length).toBeGreaterThan(0);
  });

  it("renders DashboardOverviewTable empty state when no QR codes exist", () => {
    render(<DashboardOverviewTable qrCodes={[]} />);

    expect(screen.getByText(/No QR codes created yet/i)).toBeInTheDocument();
    expect(screen.getByText(/Create Your First QR Code/i)).toBeInTheDocument();
  });

  it("renders DashboardOverviewTable with list of QR codes", () => {
    const mockQrCodes: QRCodeModel[] = [
      {
        id: "qr_1",
        userId: "user_1",
        name: "Summer Campaign 2026",
        slug: "summer-26",
        destinationUrl: "https://example.com/summer",
        status: "active",
        scanCount: 340,
        createdAt: new Date("2026-06-01"),
        updatedAt: new Date("2026-06-01"),
        campaignId: null,
        foregroundColor: "#000000",
        backgroundColor: "#ffffff",
        metadata: null,
      },
    ];

    render(<DashboardOverviewTable qrCodes={mockQrCodes} />);

    expect(screen.getByText("Summer Campaign 2026")).toBeInTheDocument();
    expect(screen.getByText("/r/summer-26")).toBeInTheDocument();
    expect(screen.getByText("340")).toBeInTheDocument();
  });

  it("renders CampaignCard with unified badges and metrics", () => {
    render(
      <CampaignCard
        campaign={{
          id: "camp_1",
          name: "Black Friday 2026",
          description: "Major promotional push",
          status: "active",
          qrCodesCount: 4,
          totalScans: 2300,
          totalSessions: 1800,
          conversions: 95,
          conversionRate: 5.3,
          createdAt: new Date("2026-11-01"),
          updatedAt: new Date("2026-11-01"),
        }}
        onEdit={() => {}}
        onDelete={() => {}}
        onStatusToggle={() => {}}
      />
    );

    expect(screen.getByText("Black Friday 2026")).toBeInTheDocument();
    expect(screen.getByText("Active")).toBeInTheDocument();
    expect(screen.getByText("2,300")).toBeInTheDocument();
    expect(screen.getByText("5.3%")).toBeInTheDocument();
  });

  it("renders ConversionCard with monetary values and event badges", () => {
    render(
      <ConversionCard
        goal={{
          id: "goal_1",
          name: "Checkout Purchase",
          eventType: "CONVERSION",
          monetaryValue: 2500,
          isActive: true,
          totalConversions: 42,
          totalRevenue: 1050,
          conversionRate: 6.8,
          createdAt: new Date("2026-05-01"),
          updatedAt: new Date("2026-05-01"),
        }}
        onEdit={() => {}}
        onDelete={() => {}}
        onStatusToggle={() => {}}
      />
    );

    expect(screen.getByText("Checkout Purchase")).toBeInTheDocument();
    expect(screen.getByText("CONVERSION")).toBeInTheDocument();
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("6.8%")).toBeInTheDocument();
    expect(screen.getByText("$1,050.00")).toBeInTheDocument();
  });

  it("renders AnalyticsKpiCards with unified 4-card metric layout and trend comparison", () => {
    render(
      <AnalyticsKpiCards
        kpis={{
          totalScans: 8500,
          uniqueVisitors: 4200,
          totalSessions: 6100,
          conversions: 320,
          conversionRate: 5.2,
          avgDurationSeconds: 45,
          bouncedSessions: 1200,
          bounceRate: 19.7,
        }}
      />
    );

    expect(screen.getByText("Total Scans")).toBeInTheDocument();
    expect(screen.getByText("8,500")).toBeInTheDocument();
    expect(screen.getByText("Total Sessions")).toBeInTheDocument();
    expect(screen.getByText("6,100")).toBeInTheDocument();
    expect(screen.getByText("Conversions")).toBeInTheDocument();
    expect(screen.getByText("320")).toBeInTheDocument();
    expect(screen.getByText("Avg. Duration")).toBeInTheDocument();
    expect(screen.getByText("45s")).toBeInTheDocument();
    expect(screen.getAllByText(/VS PREV\. PERIOD/i).length).toBe(4);
  });
});
