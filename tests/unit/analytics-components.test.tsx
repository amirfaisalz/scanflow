import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";

import { AnalyticsFilters } from "@/components/analytics/analytics-filters";
import { AnalyticsKpiCards } from "@/components/analytics/analytics-kpi-cards";
import { AnalyticsTrendChart } from "@/components/analytics/analytics-trend-chart";
import { AnalyticsBreakdowns } from "@/components/analytics/analytics-breakdowns";
import { AnalyticsTopPerformers } from "@/components/analytics/analytics-top-performers";

describe("Analytics UI Components", () => {
  describe("AnalyticsFilters", () => {
    const mockQrOptions = [
      { id: "qr-1", name: "Menu QR" },
      { id: "qr-2", name: "Promo QR" },
    ];
    const mockCampaignOptions = [
      { id: "camp-1", name: "Summer Campaign" },
      { id: "camp-2", name: "Winter Sale" },
    ];

    it("renders period selector, QR select, Campaign select, Device select, export, and refresh", () => {
      const onPeriodChange = vi.fn();
      const onQrCodeChange = vi.fn();
      const onCampaignChange = vi.fn();
      const onDeviceChange = vi.fn();
      const onExport = vi.fn();
      const onRefresh = vi.fn();

      render(
        <AnalyticsFilters
          period="7d"
          onPeriodChange={onPeriodChange}
          qrCodeId="all"
          onQrCodeChange={onQrCodeChange}
          campaignId="all"
          onCampaignChange={onCampaignChange}
          device="all"
          onDeviceChange={onDeviceChange}
          qrOptions={mockQrOptions}
          campaignOptions={mockCampaignOptions}
          onExport={onExport}
          onRefresh={onRefresh}
          isLoading={false}
        />
      );

      // Period buttons
      expect(screen.getByRole("button", { name: /7d|7 Days/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /24h|24 Hours/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /30d|30 Days/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /90d|90 Days/i })).toBeInTheDocument();
      expect(screen.getByRole("button", { name: /all|All Time/i })).toBeInTheDocument();

      // Test period change
      const period30dBtn = screen.getByRole("button", { name: /30d|30 Days/i });
      fireEvent.click(period30dBtn);
      expect(onPeriodChange).toHaveBeenCalledWith("30d");

      // QR Code dropdown / select
      const qrSelect = screen.getByLabelText(/QR Code/i);
      expect(qrSelect).toBeInTheDocument();
      fireEvent.change(qrSelect, { target: { value: "qr-1" } });
      expect(onQrCodeChange).toHaveBeenCalledWith("qr-1");

      // Campaign dropdown / select
      const campaignSelect = screen.getByLabelText(/Campaign/i);
      expect(campaignSelect).toBeInTheDocument();
      fireEvent.change(campaignSelect, { target: { value: "camp-1" } });
      expect(onCampaignChange).toHaveBeenCalledWith("camp-1");

      // Device dropdown / select
      const deviceSelect = screen.getByLabelText(/Device/i);
      expect(deviceSelect).toBeInTheDocument();
      fireEvent.change(deviceSelect, { target: { value: "mobile" } });
      expect(onDeviceChange).toHaveBeenCalledWith("mobile");

      // Export triggers
      const exportCsvBtn = screen.getByRole("button", { name: /CSV/i });
      fireEvent.click(exportCsvBtn);
      expect(onExport).toHaveBeenCalledWith("csv");

      const exportJsonBtn = screen.getByRole("button", { name: /JSON/i });
      fireEvent.click(exportJsonBtn);
      expect(onExport).toHaveBeenCalledWith("json");

      // Refresh trigger
      const refreshBtn = screen.getByRole("button", { name: /Refresh/i });
      fireEvent.click(refreshBtn);
      expect(onRefresh).toHaveBeenCalled();
    });

    it("displays loading state on refresh button when isLoading is true", () => {
      render(
        <AnalyticsFilters
          period="24h"
          onPeriodChange={vi.fn()}
          onQrCodeChange={vi.fn()}
          onCampaignChange={vi.fn()}
          onDeviceChange={vi.fn()}
          qrOptions={[]}
          campaignOptions={[]}
          onExport={vi.fn()}
          onRefresh={vi.fn()}
          isLoading={true}
        />
      );

      const refreshBtn = screen.getByRole("button", { name: /Refresh/i });
      expect(refreshBtn).toBeDisabled();
    });
  });

  describe("AnalyticsKpiCards", () => {
    it("renders all 4 metric cards with formatted numbers and labels", () => {
      const mockKpis = {
        totalScans: 15420,
        uniqueVisitors: 8930,
        totalSessions: 12400,
        conversions: 1860,
        conversionRate: 15.0,
        avgDurationSeconds: 75,
        bouncedSessions: 3100,
        bounceRate: 25.0,
      };

      render(<AnalyticsKpiCards kpis={mockKpis} />);

      // Total Scans Card
      expect(screen.getByText(/Total Scans/i)).toBeInTheDocument();
      expect(screen.getByText("15,420")).toBeInTheDocument();
      expect(screen.getByText(/8,930 unique visitors/i)).toBeInTheDocument();

      // Total Sessions Card
      expect(screen.getByText(/Total Sessions/i)).toBeInTheDocument();
      expect(screen.getByText("12,400")).toBeInTheDocument();
      expect(screen.getByText(/25% bounce rate/i)).toBeInTheDocument();

      // Conversions Card
      expect(screen.getByText(/Conversions/i)).toBeInTheDocument();
      expect(screen.getByText("1,860")).toBeInTheDocument();
      expect(screen.getByText(/15% conv. rate/i)).toBeInTheDocument();

      // Avg Duration Card (75 seconds -> 1m 15s)
      expect(screen.getByText(/Avg. Duration/i)).toBeInTheDocument();
      expect(screen.getByText("1m 15s")).toBeInTheDocument();
    });

    it("renders safely when KPI values are zero", () => {
      const zeroKpis = {
        totalScans: 0,
        uniqueVisitors: 0,
        totalSessions: 0,
        conversions: 0,
        conversionRate: 0,
        avgDurationSeconds: 0,
        bouncedSessions: 0,
        bounceRate: 0,
      };

      render(<AnalyticsKpiCards kpis={zeroKpis} />);

      expect(screen.getAllByText("0").length).toBeGreaterThanOrEqual(2);
      expect(screen.getByText("0s")).toBeInTheDocument();
      expect(screen.getByText(/0% bounce rate/i)).toBeInTheDocument();
      expect(screen.getByText(/0% conv. rate/i)).toBeInTheDocument();
    });
  });

  describe("AnalyticsTrendChart", () => {
    const mockTimeSeries = [
      { timestamp: "2026-08-01T00:00:00Z", label: "Aug 1", scans: 120, sessions: 90, conversions: 15 },
      { timestamp: "2026-08-02T00:00:00Z", label: "Aug 2", scans: 250, sessions: 180, conversions: 35 },
      { timestamp: "2026-08-03T00:00:00Z", label: "Aug 3", scans: 310, sessions: 220, conversions: 45 },
    ];

    it("renders chart title and metric labels when time series data is provided", () => {
      render(<AnalyticsTrendChart timeSeries={mockTimeSeries} period="7d" />);

      expect(screen.getByText(/Scan & Conversion Trends/i)).toBeInTheDocument();
      expect(screen.getByText(/Performance over time/i)).toBeInTheDocument();
    });

    it("renders empty state gracefully when timeSeries is empty", () => {
      render(<AnalyticsTrendChart timeSeries={[]} period="30d" />);

      expect(screen.getByText(/No scan data available/i)).toBeInTheDocument();
    });
  });

  describe("AnalyticsBreakdowns", () => {
    const mockBreakdowns = {
      devices: [
        { name: "Mobile", value: 120, percentage: 60 },
        { name: "Desktop", value: 60, percentage: 30 },
        { name: "Tablet", value: 20, percentage: 10 },
      ],
      operatingSystems: [
        { name: "iOS", value: 100, percentage: 50 },
        { name: "Android", value: 60, percentage: 30 },
        { name: "macOS", value: 40, percentage: 20 },
      ],
      browsers: [
        { name: "Safari", value: 100, percentage: 50 },
        { name: "Chrome", value: 70, percentage: 35 },
        { name: "Firefox", value: 30, percentage: 15 },
      ],
      countries: [
        { code: "ID", name: "Indonesia", scans: 150, percentage: 75 },
        { code: "US", name: "United States", scans: 50, percentage: 25 },
      ],
      cities: [
        { name: "Jakarta", country: "ID", scans: 100, percentage: 50 },
        { name: "Surabaya", country: "ID", scans: 50, percentage: 25 },
      ],
      hourlyDistribution: [
        { hour: 0, label: "00:00", count: 5 },
        { hour: 12, label: "12:00", count: 45 },
        { hour: 18, label: "18:00", count: 80 },
      ],
    };

    it("renders Device, OS, Browser, Location, and Hourly activity breakdowns", () => {
      render(<AnalyticsBreakdowns breakdowns={mockBreakdowns} />);

      // Device & OS Card
      expect(screen.getByText(/Device & OS Breakdown/i)).toBeInTheDocument();
      expect(screen.getByText("Mobile")).toBeInTheDocument();
      expect(screen.getByText("60%")).toBeInTheDocument();

      // Switch to OS tab
      const osTabBtn = screen.getByRole("button", { name: "OS" });
      fireEvent.click(osTabBtn);
      expect(screen.getByText("iOS")).toBeInTheDocument();

      // Browser Card
      expect(screen.getByText(/Browser Distribution/i)).toBeInTheDocument();
      expect(screen.getByText("Safari")).toBeInTheDocument();
      expect(screen.getByText("Chrome")).toBeInTheDocument();

      // Geographic Insights
      expect(screen.getByText(/Geographic Insights/i)).toBeInTheDocument();
      expect(screen.getByText("Indonesia")).toBeInTheDocument();

      // Switch to Cities tab
      const citiesTabBtn = screen.getByRole("button", { name: "Cities" });
      fireEvent.click(citiesTabBtn);
      expect(screen.getByText("Jakarta")).toBeInTheDocument();

      // Time of Day Activity
      expect(screen.getByText(/Time of Day Activity/i)).toBeInTheDocument();
    });

    it("renders empty state messages gracefully when breakdown lists are empty", () => {
      const emptyBreakdowns = {
        devices: [],
        operatingSystems: [],
        browsers: [],
        countries: [],
        cities: [],
        hourlyDistribution: [],
      };

      render(<AnalyticsBreakdowns breakdowns={emptyBreakdowns} />);

      expect(screen.getByText(/No device data recorded/i)).toBeInTheDocument();
      expect(screen.getByText(/No browser data recorded/i)).toBeInTheDocument();
      expect(screen.getByText(/No location data recorded/i)).toBeInTheDocument();
      expect(screen.getByText(/No hourly activity recorded/i)).toBeInTheDocument();
    });
  });

  describe("AnalyticsTopPerformers", () => {
    const mockTopPerformers = {
      qrCodes: [
        {
          id: "qr-1",
          name: "Main Entrance QR",
          slug: "entrance-qr",
          scans: 1250,
          sessions: 980,
          conversions: 145,
          conversionRate: 14.8,
        },
        {
          id: "qr-2",
          name: "Table Promo QR",
          slug: "table-promo",
          scans: 620,
          sessions: 480,
          conversions: 60,
          conversionRate: 12.5,
        },
      ],
      campaigns: [
        {
          id: "camp-1",
          name: "Summer Restaurant Promo",
          scans: 2400,
          sessions: 1800,
          conversions: 320,
          conversionRate: 17.8,
        },
      ],
    };

    it("renders top QR codes and top campaigns with rank, stats, and conversion rates", () => {
      render(<AnalyticsTopPerformers topPerformers={mockTopPerformers} />);

      expect(screen.getByText(/Top Performing QR Codes/i)).toBeInTheDocument();
      expect(screen.getByText("Main Entrance QR")).toBeInTheDocument();
      expect(screen.getByText("/r/entrance-qr")).toBeInTheDocument();
      expect(screen.getByText("1,250")).toBeInTheDocument();
      expect(screen.getByText("14.8%")).toBeInTheDocument();

      expect(screen.getByText(/Top Performing Campaigns/i)).toBeInTheDocument();
      expect(screen.getByText("Summer Restaurant Promo")).toBeInTheDocument();
      expect(screen.getByText("2,400")).toBeInTheDocument();
      expect(screen.getByText("17.8%")).toBeInTheDocument();
    });

    it("renders empty state message gracefully when no top performers exist", () => {
      render(
        <AnalyticsTopPerformers
          topPerformers={{
            qrCodes: [],
            campaigns: [],
          }}
        />
      );

      expect(screen.getByText(/No QR codes found/i)).toBeInTheDocument();
      expect(screen.getByText(/No campaigns found/i)).toBeInTheDocument();
    });

    it("renders direct relational navigation links and handles drilldown selection", async () => {
      const onSelectQrCode = vi.fn();
      const onSelectCampaign = vi.fn();

      render(
        <AnalyticsTopPerformers
          topPerformers={mockTopPerformers}
          onSelectQrCode={onSelectQrCode}
          onSelectCampaign={onSelectCampaign}
        />
      );

      // Check QR Manager Links
      const qrManagerLinks = screen.getAllByTitle("View in QR Codes");
      expect(qrManagerLinks[0]).toHaveAttribute("href", "/dashboard/qr-codes");

      // Check Visitor Journey Links with relation ID
      const journeyLinks = screen.getAllByTitle("View Visitor Journeys");
      expect(journeyLinks[0]).toHaveAttribute("href", "/dashboard/journeys?qrCodeId=qr-1");
      expect(journeyLinks[1]).toHaveAttribute("href", "/dashboard/journeys?qrCodeId=qr-2");

      // Check Campaign Link
      const campaignManagerLinks = screen.getAllByTitle("View Campaign");
      expect(campaignManagerLinks[0]).toHaveAttribute("href", "/dashboard/campaigns");

      // Test QR Drilldown Click
      const qrDrilldownBtns = screen.getAllByTitle("Drill-down Analytics");
      fireEvent.click(qrDrilldownBtns[0]);
      expect(onSelectQrCode).toHaveBeenCalledWith("qr-1");

      // Test QR name button click
      fireEvent.click(screen.getByText("Main Entrance QR"));
      expect(onSelectQrCode).toHaveBeenCalledWith("qr-1");

      // Test Campaign name button click
      fireEvent.click(screen.getByText("Summer Restaurant Promo"));
      expect(onSelectCampaign).toHaveBeenCalledWith("camp-1");
    });
  });

  describe("AnalyticsTrendChart Metric Toggling", () => {
    const mockTimeSeries = [
      { timestamp: "2026-08-01T00:00:00Z", label: "Aug 1", scans: 100, sessions: 80, conversions: 10 },
      { timestamp: "2026-08-02T00:00:00Z", label: "Aug 2", scans: 200, sessions: 160, conversions: 20 },
    ];

    it("allows toggling between metric curves (Scans, Sessions, Conversions, All Metrics)", () => {
      render(<AnalyticsTrendChart timeSeries={mockTimeSeries} period="30d" />);

      const scansBtn = screen.getByRole("button", { name: "Scans" });
      fireEvent.click(scansBtn);

      const sessionsBtn = screen.getByRole("button", { name: "Sessions" });
      fireEvent.click(sessionsBtn);

      const conversionsBtn = screen.getByRole("button", { name: "Conversions" });
      fireEvent.click(conversionsBtn);

      const allBtn = screen.getByRole("button", { name: "All Metrics" });
      fireEvent.click(allBtn);

      expect(screen.getByText(/300 total scans/i)).toBeInTheDocument();
    });
  });
});
