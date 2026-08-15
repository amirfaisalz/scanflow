import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AnalyticsView } from "@/components/analytics/analytics-view";
import { toast } from "sonner";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

// Mock recharts ResponsiveContainer to avoid size computation errors in jsdom
vi.mock("recharts", async () => {
  const original = await vi.importActual<any>("recharts");
  return {
    ...original,
    ResponsiveContainer: ({ children }: any) => <div className="recharts-responsive-container">{children}</div>,
  };
});

describe("Analytics Dashboard Page (app/dashboard/analytics/page.tsx)", () => {
  const mockOverviewData = {
    kpis: {
      totalScans: 15420,
      uniqueVisitors: 8930,
      totalSessions: 12400,
      conversions: 1860,
      conversionRate: 15.0,
      avgDurationSeconds: 75,
      bouncedSessions: 3100,
      bounceRate: 25.0,
    },
    timeSeries: [
      { timestamp: "2026-08-01T00:00:00Z", label: "Aug 1", scans: 120, sessions: 90, conversions: 15 },
      { timestamp: "2026-08-02T00:00:00Z", label: "Aug 2", scans: 250, sessions: 180, conversions: 35 },
    ],
    breakdowns: {
      devices: [
        { name: "Mobile", value: 120, percentage: 60 },
        { name: "Desktop", value: 60, percentage: 30 },
      ],
      operatingSystems: [
        { name: "iOS", value: 100, percentage: 50 },
        { name: "Android", value: 60, percentage: 30 },
      ],
      browsers: [
        { name: "Safari", value: 100, percentage: 50 },
        { name: "Chrome", value: 70, percentage: 35 },
      ],
      countries: [
        { code: "US", name: "United States", scans: 150, percentage: 75 },
      ],
      cities: [
        { name: "New York", country: "US", scans: 100, percentage: 50 },
      ],
      hourlyDistribution: [
        { hour: 0, label: "00:00", count: 5 },
        { hour: 12, label: "12:00", count: 45 },
      ],
    },
    topPerformers: {
      qrCodes: [
        {
          id: "qr-1",
          name: "Main Menu QR",
          slug: "main-menu",
          scans: 1250,
          sessions: 980,
          conversions: 145,
          conversionRate: 14.8,
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
    },
  };

  const mockQrCodes = [
    { id: "qr-1", name: "Main Menu QR", slug: "main-menu" },
    { id: "qr-2", name: "Table Promo QR", slug: "table-promo" },
  ];

  const mockCampaigns = [
    { id: "camp-1", name: "Summer Restaurant Promo" },
    { id: "camp-2", name: "Winter Sale" },
  ];

  let createObjectURLSpy: any;
  let revokeObjectURLSpy: any;

  beforeEach(() => {
    vi.clearAllMocks();

    createObjectURLSpy = vi.fn().mockReturnValue("blob:http://localhost:3000/mock-uuid");
    revokeObjectURLSpy = vi.fn();
    global.URL.createObjectURL = createObjectURLSpy;
    global.URL.revokeObjectURL = revokeObjectURLSpy;

    // Default successful fetch mocks
    global.fetch = vi.fn().mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/api/analytics/overview")) {
        return {
          ok: true,
          json: async () => ({ data: mockOverviewData }),
        } as Response;
      }
      if (url.includes("/api/qr-codes")) {
        return {
          ok: true,
          json: async () => ({ data: mockQrCodes }),
        } as Response;
      }
      if (url.includes("/api/campaigns")) {
        return {
          ok: true,
          json: async () => ({ campaigns: mockCampaigns }),
        } as Response;
      }
      return {
        ok: false,
        status: 404,
        json: async () => ({ error: "Not found" }),
      } as Response;
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("renders header with title, subtitle, breadcrumb, and tenant badge", async () => {
    render(<AnalyticsView initialData={mockOverviewData} qrOptions={mockQrCodes} campaignOptions={mockCampaigns} />);

    expect(screen.getByText(/Analytics Deep-Dive/i)).toBeInTheDocument();
    expect(screen.getByText(/Isolated Tenant/i)).toBeInTheDocument();
    expect(screen.getByText(/Explore scans, visitor hardware telemetry/i)).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("15,420")).toBeInTheDocument();
    });
  });

  it("loads analytics data and populates all child component sections", async () => {
    render(<AnalyticsView initialData={mockOverviewData} qrOptions={mockQrCodes} campaignOptions={mockCampaigns} />);

    await waitFor(() => {
      // KPI Cards
      expect(screen.getByText("15,420")).toBeInTheDocument();
      expect(screen.getByText("12,400")).toBeInTheDocument();
      expect(screen.getByText("1,860")).toBeInTheDocument();
      expect(screen.getByText("1m 15s")).toBeInTheDocument();

      // Trend Chart
      expect(screen.getByText(/Scan & Conversion Trends/i)).toBeInTheDocument();

      // Breakdowns
      expect(screen.getByText(/Device & OS Breakdown/i)).toBeInTheDocument();
      expect(screen.getByText(/Browser Distribution/i)).toBeInTheDocument();
      expect(screen.getByText(/Geographic Insights/i)).toBeInTheDocument();

      // Top Performers
      expect(screen.getByText(/Top Performing QR Codes/i)).toBeInTheDocument();
      expect(screen.getByText(/Top Performing Campaigns/i)).toBeInTheDocument();
    });
  });

  it("re-fetches overview when period filter changes", async () => {
    render(<AnalyticsView initialData={mockOverviewData} qrOptions={mockQrCodes} campaignOptions={mockCampaigns} />);

    await waitFor(() => {
      expect(screen.getByText("15,420")).toBeInTheDocument();
    });

    const period7dBtn = screen.getByRole("button", { name: /7d|7 Days/i });
    fireEvent.click(period7dBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/analytics/overview?period=7d")
      );
    });
  });

  it("re-fetches overview when QR code, Campaign, or Device filter changes", async () => {
    render(<AnalyticsView initialData={mockOverviewData} qrOptions={mockQrCodes} campaignOptions={mockCampaigns} />);

    await waitFor(() => {
      expect(screen.getByText("15,420")).toBeInTheDocument();
    });

    // QR filter
    const qrSelect = screen.getByLabelText(/QR Code/i);
    fireEvent.change(qrSelect, { target: { value: "qr-1" } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("qrCodeId=qr-1")
      );
    });

    // Campaign filter
    const campaignSelect = screen.getByLabelText(/Campaign/i);
    fireEvent.change(campaignSelect, { target: { value: "camp-1" } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("campaignId=camp-1")
      );
    });

    // Device filter
    const deviceSelect = screen.getByLabelText(/Device/i);
    fireEvent.change(deviceSelect, { target: { value: "mobile" } });

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining("device=mobile")
      );
    });
  });

  it("triggers manual reload when refresh button is clicked", async () => {
    render(<AnalyticsView initialData={mockOverviewData} qrOptions={mockQrCodes} campaignOptions={mockCampaigns} />);

    await waitFor(() => {
      expect(screen.getByText("15,420")).toBeInTheDocument();
    });

    const initialFetchCount = (global.fetch as any).mock.calls.length;

    const refreshBtn = screen.getByRole("button", { name: /Refresh/i });
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect((global.fetch as any).mock.calls.length).toBeGreaterThan(initialFetchCount);
    });
  });

  it("handles CSV export and triggers browser download", async () => {
    const appendChildSpy = vi.spyOn(document.body, "appendChild");
    const removeChildSpy = vi.spyOn(document.body, "removeChild");

    render(<AnalyticsView initialData={mockOverviewData} qrOptions={mockQrCodes} campaignOptions={mockCampaigns} />);

    await waitFor(() => {
      expect(screen.getByText("15,420")).toBeInTheDocument();
    });

    const csvBtn = screen.getByRole("button", { name: /CSV/i });
    fireEvent.click(csvBtn);

    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining("CSV"));

    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });

  it("handles JSON export and triggers browser download", async () => {
    const appendChildSpy = vi.spyOn(document.body, "appendChild");
    const removeChildSpy = vi.spyOn(document.body, "removeChild");

    render(<AnalyticsView initialData={mockOverviewData} qrOptions={mockQrCodes} campaignOptions={mockCampaigns} />);

    await waitFor(() => {
      expect(screen.getByText("15,420")).toBeInTheDocument();
    });

    const jsonBtn = screen.getByRole("button", { name: /JSON/i });
    fireEvent.click(jsonBtn);

    expect(createObjectURLSpy).toHaveBeenCalled();
    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining("JSON"));

    appendChildSpy.mockRestore();
    removeChildSpy.mockRestore();
  });

  it("handles error state and provides a retry mechanism", async () => {
    // Fail first overview call
    global.fetch = vi.fn().mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/api/analytics/overview")) {
        return {
          ok: false,
          status: 500,
          json: async () => ({ error: "Internal Server Error" }),
        } as Response;
      }
      return {
        ok: true,
        json: async () => ({ data: [] }),
      } as Response;
    });

    render(<AnalyticsView initialData={mockOverviewData} qrOptions={mockQrCodes} campaignOptions={mockCampaigns} />);

    const refreshBtn = screen.getByRole("button", { name: /Refresh/i });
    fireEvent.click(refreshBtn);

    await waitFor(() => {
      expect(screen.getAllByText(/Failed to load analytics overview/i).length).toBeGreaterThanOrEqual(1);
    });

    // Setup success for retry
    global.fetch = vi.fn().mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/api/analytics/overview")) {
        return {
          ok: true,
          json: async () => ({ data: mockOverviewData }),
        } as Response;
      }
      return {
        ok: true,
        json: async () => ({ data: [] }),
      } as Response;
    });

    const retryBtn = screen.getByRole("button", { name: /Try Again|Retry/i });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText("15,420")).toBeInTheDocument();
    });
  });

  it("renders gracefully when analytics data is empty", async () => {
    const emptyOverview = {
      kpis: {
        totalScans: 0,
        uniqueVisitors: 0,
        totalSessions: 0,
        conversions: 0,
        conversionRate: 0,
        avgDurationSeconds: 0,
        bouncedSessions: 0,
        bounceRate: 0,
      },
      timeSeries: [],
      breakdowns: {
        devices: [],
        operatingSystems: [],
        browsers: [],
        countries: [],
        cities: [],
        hourlyDistribution: [],
      },
      topPerformers: {
        qrCodes: [],
        campaigns: [],
      },
    };

    global.fetch = vi.fn().mockImplementation(async () => {
      return {
        ok: true,
        json: async () => ({ data: emptyOverview }),
      } as Response;
    });

    render(<AnalyticsView initialData={emptyOverview} qrOptions={mockQrCodes} campaignOptions={mockCampaigns} />);

    await waitFor(() => {
      expect(screen.getByText(/No scan data available/i)).toBeInTheDocument();
      expect(screen.getByText(/No device data recorded/i)).toBeInTheDocument();
      expect(screen.getByText(/No QR codes found/i)).toBeInTheDocument();
    });
  });
});
