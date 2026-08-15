import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import * as React from "react";
import ExperimentsDashboardPage from "@/app/dashboard/experiments/page";
import { toast } from "sonner";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe("Experiments Dashboard Page (app/dashboard/experiments/page.tsx)", () => {
  const mockExperiments = [
    {
      id: "exp-1",
      userId: "user-1",
      name: "Homepage CTA Split Test",
      description: "Testing blue button vs green button conversion rates",
      status: "active",
      qrCodeId: "qr-1",
      campaignId: "camp-1",
      trafficAllocation: 100,
      winnerVariantId: null,
      startedAt: "2026-07-01T10:00:00Z",
      endedAt: null,
      createdAt: "2026-07-01T10:00:00Z",
      updatedAt: "2026-07-01T10:00:00Z",
      qrCode: { id: "qr-1", name: "Summer Flyer QR", slug: "summer-flyer" },
      campaign: { id: "camp-1", name: "Summer Launch 2026" },
      variants: [
        {
          id: "var-1",
          experimentId: "exp-1",
          name: "Variant A (Control)",
          destinationUrl: "https://example.com/control",
          trafficWeight: 50,
          isControl: true,
          scans: 300,
          sessions: 250,
          conversions: 25,
          conversionRate: 10.0,
          bounceRate: 35.0,
        },
        {
          id: "var-2",
          experimentId: "exp-1",
          name: "Variant B (Green CTA)",
          destinationUrl: "https://example.com/green",
          trafficWeight: 50,
          isControl: false,
          scans: 350,
          sessions: 300,
          conversions: 60,
          conversionRate: 20.0,
          bounceRate: 25.0,
          lift: 100.0,
          confidenceLevel: 96.5,
          isSignificant: true,
          pValue: 0.035,
        },
      ],
      stats: {
        totalScans: 650,
        totalSessions: 550,
        totalConversions: 85,
        conversionRate: 15.5,
        hasSignificantWinner: true,
        winnerVariant: {
          id: "var-2",
          name: "Variant B (Green CTA)",
        },
      },
    },
    {
      id: "exp-2",
      userId: "user-1",
      name: "Checkout Pricing Test",
      description: "Annual vs Monthly discount emphasis on checkout",
      status: "paused",
      qrCodeId: "qr-2",
      campaignId: null,
      trafficAllocation: 80,
      winnerVariantId: null,
      startedAt: "2026-07-10T10:00:00Z",
      endedAt: null,
      createdAt: "2026-07-10T10:00:00Z",
      updatedAt: "2026-07-10T10:00:00Z",
      qrCode: { id: "qr-2", name: "Product Box QR", slug: "product-box" },
      campaign: null,
      variants: [
        {
          id: "var-3",
          experimentId: "exp-2",
          name: "Monthly First",
          destinationUrl: "https://example.com/pricing-monthly",
          trafficWeight: 50,
          isControl: true,
          scans: 200,
          sessions: 180,
          conversions: 18,
          conversionRate: 10.0,
        },
        {
          id: "var-4",
          experimentId: "exp-2",
          name: "Annual First",
          destinationUrl: "https://example.com/pricing-annual",
          trafficWeight: 50,
          isControl: false,
          scans: 220,
          sessions: 200,
          conversions: 24,
          conversionRate: 12.0,
          lift: 20.0,
          confidenceLevel: 80.0,
          isSignificant: false,
        },
      ],
      stats: {
        totalScans: 420,
        totalSessions: 380,
        totalConversions: 42,
        conversionRate: 11.1,
        hasSignificantWinner: false,
      },
    },
    {
      id: "exp-3",
      userId: "user-1",
      name: "Pre-launch Draft Experiment",
      description: "Testing upcoming holiday landing page designs",
      status: "draft",
      qrCodeId: "qr-1",
      campaignId: "camp-1",
      trafficAllocation: 100,
      winnerVariantId: null,
      startedAt: null,
      endedAt: null,
      createdAt: "2026-07-20T10:00:00Z",
      updatedAt: "2026-07-20T10:00:00Z",
      qrCode: { id: "qr-1", name: "Summer Flyer QR", slug: "summer-flyer" },
      campaign: { id: "camp-1", name: "Summer Launch 2026" },
      variants: [
        {
          id: "var-5",
          experimentId: "exp-3",
          name: "Variant A (Control)",
          destinationUrl: "https://example.com/v1",
          trafficWeight: 50,
          isControl: true,
          scans: 0,
          sessions: 0,
          conversions: 0,
          conversionRate: 0,
        },
        {
          id: "var-6",
          experimentId: "exp-3",
          name: "Variant B",
          destinationUrl: "https://example.com/v2",
          trafficWeight: 50,
          isControl: false,
          scans: 0,
          sessions: 0,
          conversions: 0,
          conversionRate: 0,
        },
      ],
      stats: {
        totalScans: 0,
        totalSessions: 0,
        totalConversions: 0,
        conversionRate: 0,
        hasSignificantWinner: false,
      },
    },
  ];

  const mockMetrics = {
    totalExperiments: 3,
    activeExperiments: 1,
    totalVariants: 6,
    totalConversions: 127,
    totalSessions: 930,
    overallConversionRate: 13.7,
    significantWinnersCount: 1,
  };

  const mockQrCodes = [
    { id: "qr-1", name: "Summer Flyer QR", destinationUrl: "https://example.com/flyer" },
    { id: "qr-2", name: "Product Box QR", destinationUrl: "https://example.com/box" },
  ];

  const mockCampaigns = [
    { id: "camp-1", name: "Summer Launch 2026" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    global.fetch = vi.fn().mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method || "GET";

      if (url.includes("/api/experiments") && !url.includes("/api/experiments/") && method === "GET") {
        return {
          ok: true,
          json: async () => ({
            experiments: mockExperiments,
            metrics: mockMetrics,
          }),
        } as Response;
      }

      if (url.includes("/api/qr-codes") && method === "GET") {
        return {
          ok: true,
          json: async () => ({ data: mockQrCodes }),
        } as Response;
      }

      if (url.includes("/api/campaigns") && method === "GET") {
        return {
          ok: true,
          json: async () => ({ campaigns: mockCampaigns }),
        } as Response;
      }

      if (url.includes("/api/experiments") && !url.includes("/api/experiments/") && method === "POST") {
        const body = JSON.parse(init?.body as string);
        return {
          ok: true,
          status: 201,
          json: async () => ({
            experiment: {
              id: "exp-new",
              ...body,
              status: body.status || "draft",
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              variants: body.variants?.map((v: any, idx: number) => ({
                id: `var-new-${idx}`,
                ...v,
              })) || [],
            },
          }),
        } as Response;
      }

      if (url.includes("/api/experiments/") && method === "PATCH") {
        const body = JSON.parse(init?.body as string);
        const expId = url.split("/api/experiments/")[1].split("?")[0];
        const existing = mockExperiments.find((e) => e.id === expId) || mockExperiments[0];
        return {
          ok: true,
          json: async () => ({
            experiment: {
              ...existing,
              ...body,
              updatedAt: new Date().toISOString(),
            },
          }),
        } as Response;
      }

      if (url.includes("/api/experiments/") && method === "DELETE") {
        return {
          ok: true,
          json: async () => ({ success: true }),
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

  it("renders breadcrumb, header title, tenant badge, and action buttons", async () => {
    render(<ExperimentsDashboardPage />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /A\/B Testing Experiments/i })).toBeInTheDocument();
    expect(screen.getByText("Isolated Tenant")).toBeInTheDocument();
    expect(
      screen.getByText(/split-testing destinations/i)
    ).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /refresh/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /new experiment|create experiment/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Homepage CTA Split Test")).toBeInTheDocument();
    });
  });

  it("loads and displays all 4 summary KPI metric cards", async () => {
    render(<ExperimentsDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Active Experiments")).toBeInTheDocument();
      expect(screen.getByText("of 3 total tests")).toBeInTheDocument();
      expect(screen.getByText("Total Sessions")).toBeInTheDocument();
      expect(screen.getByText("930")).toBeInTheDocument();
      expect(screen.getByText("Avg Conv. Rate")).toBeInTheDocument();
      expect(screen.getByText("13.7%")).toBeInTheDocument();
      expect(screen.getByText("Significant Winners")).toBeInTheDocument();
      expect(screen.getByText("Statistically validated")).toBeInTheDocument();
    });
  });

  it("renders all experiment cards with names, variants, and badges", async () => {
    render(<ExperimentsDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Homepage CTA Split Test")).toBeInTheDocument();
      expect(screen.getByText("Checkout Pricing Test")).toBeInTheDocument();
      expect(screen.getByText("Pre-launch Draft Experiment")).toBeInTheDocument();

      // Check variant names
      expect(screen.getAllByText("Variant A (Control)").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Variant B (Green CTA)").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Monthly First").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Annual First").length).toBeGreaterThanOrEqual(1);

      // Check QR link labels
      expect(screen.getAllByText("Summer Flyer QR").length).toBeGreaterThanOrEqual(1);
      expect(screen.getAllByText("Product Box QR").length).toBeGreaterThanOrEqual(1);
    });
  });

  it("filters experiments by search query in name or description", async () => {
    render(<ExperimentsDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Homepage CTA Split Test")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search experiments/i);
    fireEvent.change(searchInput, { target: { value: "Pricing" } });

    expect(screen.getByText("Checkout Pricing Test")).toBeInTheDocument();
    expect(screen.queryByText("Homepage CTA Split Test")).not.toBeInTheDocument();
    expect(screen.queryByText("Pre-launch Draft Experiment")).not.toBeInTheDocument();

    // Search by description keyword
    fireEvent.change(searchInput, { target: { value: "holiday" } });
    expect(screen.getByText("Pre-launch Draft Experiment")).toBeInTheDocument();
    expect(screen.queryByText("Checkout Pricing Test")).not.toBeInTheDocument();
  });

  it("filters experiments by status (all, active, paused, ended, draft)", async () => {
    render(<ExperimentsDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Homepage CTA Split Test")).toBeInTheDocument();
    });

    const statusFilter = screen.getByLabelText("Status filter");

    // Active only
    fireEvent.change(statusFilter, { target: { value: "active" } });
    expect(screen.getByText("Homepage CTA Split Test")).toBeInTheDocument();
    expect(screen.queryByText("Checkout Pricing Test")).not.toBeInTheDocument();
    expect(screen.queryByText("Pre-launch Draft Experiment")).not.toBeInTheDocument();

    // Paused only
    fireEvent.change(statusFilter, { target: { value: "paused" } });
    expect(screen.getByText("Checkout Pricing Test")).toBeInTheDocument();
    expect(screen.queryByText("Homepage CTA Split Test")).not.toBeInTheDocument();

    // Draft only
    fireEvent.change(statusFilter, { target: { value: "draft" } });
    expect(screen.getByText("Pre-launch Draft Experiment")).toBeInTheDocument();
    expect(screen.queryByText("Homepage CTA Split Test")).not.toBeInTheDocument();

    // All
    fireEvent.change(statusFilter, { target: { value: "all" } });
    expect(screen.getByText("Homepage CTA Split Test")).toBeInTheDocument();
    expect(screen.getByText("Checkout Pricing Test")).toBeInTheDocument();
  });

  it("filters experiments by QR Code", async () => {
    render(<ExperimentsDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Homepage CTA Split Test")).toBeInTheDocument();
    });

    const qrFilter = screen.getByLabelText("QR Code filter");

    // Filter by QR-2 (Product Box QR)
    fireEvent.change(qrFilter, { target: { value: "qr-2" } });
    expect(screen.getByText("Checkout Pricing Test")).toBeInTheDocument();
    expect(screen.queryByText("Homepage CTA Split Test")).not.toBeInTheDocument();
    expect(screen.queryByText("Pre-launch Draft Experiment")).not.toBeInTheDocument();

    // Filter by QR-1 (Summer Flyer QR)
    fireEvent.change(qrFilter, { target: { value: "qr-1" } });
    expect(screen.getByText("Homepage CTA Split Test")).toBeInTheDocument();
    expect(screen.getByText("Pre-launch Draft Experiment")).toBeInTheDocument();
    expect(screen.queryByText("Checkout Pricing Test")).not.toBeInTheDocument();
  });

  it("opens create experiment dialog, submits data, and shows success toast", async () => {
    render(<ExperimentsDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Homepage CTA Split Test")).toBeInTheDocument();
    });

    const newBtn = screen.getByRole("button", { name: /new experiment|create experiment/i });
    fireEvent.click(newBtn);

    expect(screen.getByRole("heading", { name: "Create Experiment" })).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/experiment name \*/i), {
      target: { value: "Header Color Test" },
    });
    fireEvent.change(screen.getByLabelText(/qr code \*/i), {
      target: { value: "qr-1" },
    });
    fireEvent.change(screen.getByLabelText(/variant a destination url \*/i), {
      target: { value: "https://example.com/v-a" },
    });
    fireEvent.change(screen.getByLabelText(/variant b destination url \*/i), {
      target: { value: "https://example.com/v-b" },
    });

    const submitBtn = screen.getByRole("button", { name: /^create experiment$/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/experiments",
        expect.objectContaining({
          method: "POST",
        })
      );
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining("created"));
    });
  });

  it("opens edit experiment dialog, updates experiment, and shows success toast", async () => {
    render(<ExperimentsDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Homepage CTA Split Test")).toBeInTheDocument();
    });

    // Open dropdown on first card
    const actionButtons = screen.getAllByRole("button", { name: /actions/i });
    fireEvent.click(actionButtons[0]);

    const editBtn = screen.getByText(/Edit Experiment/i);
    fireEvent.click(editBtn);

    expect(screen.getByRole("heading", { name: "Edit Experiment" })).toBeInTheDocument();
    expect(screen.getByLabelText(/experiment name \*/i)).toHaveValue("Homepage CTA Split Test");

    fireEvent.change(screen.getByLabelText(/experiment name \*/i), {
      target: { value: "Updated Homepage Test" },
    });

    const submitBtn = screen.getByRole("button", { name: /save changes/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/experiments/exp-1",
        expect.objectContaining({
          method: "PATCH",
        })
      );
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining("updated"));
    });
  });

  it("toggles experiment status (start/pause/activate/end) and shows success toast", async () => {
    render(<ExperimentsDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Homepage CTA Split Test")).toBeInTheDocument();
    });

    // Pause the active experiment (exp-1)
    const actionButtons = screen.getAllByRole("button", { name: /actions/i });
    fireEvent.click(actionButtons[0]);

    const pauseBtn = screen.getByText(/Pause Experiment/i);
    fireEvent.click(pauseBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/experiments/exp-1",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ status: "paused" }),
        })
      );
      expect(toast.success).toHaveBeenCalledWith(expect.stringMatching(/paused|status updated/i));
    });
  });

  it("declares winner variant, updates experiment status to ended, and shows toast", async () => {
    render(<ExperimentsDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Homepage CTA Split Test")).toBeInTheDocument();
    });

    const actionButtons = screen.getAllByRole("button", { name: /actions/i });
    fireEvent.click(actionButtons[0]);

    const declareWinnerBtn = screen.getByText(/Declare Winner: Variant B \(Green CTA\)/i);
    fireEvent.click(declareWinnerBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/experiments/exp-1",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ winnerVariantId: "var-2", status: "ended" }),
        })
      );
      expect(toast.success).toHaveBeenCalledWith(expect.stringMatching(/winner declared/i));
    });
  });

  it("deletes an experiment after confirmation and shows success toast", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<ExperimentsDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Homepage CTA Split Test")).toBeInTheDocument();
    });

    const actionButtons = screen.getAllByRole("button", { name: /actions/i });
    fireEvent.click(actionButtons[0]);

    const deleteBtn = screen.getByText(/Delete Experiment/i);
    fireEvent.click(deleteBtn);

    expect(window.confirm).toHaveBeenCalled();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/experiments/exp-1",
        expect.objectContaining({
          method: "DELETE",
        })
      );
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining("deleted"));
      expect(screen.queryByText("Homepage CTA Split Test")).not.toBeInTheDocument();
    });
  });

  it("handles error state and provides retry functionality", async () => {
    // Fail first call
    global.fetch = vi.fn().mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/api/experiments")) {
        return {
          ok: false,
          status: 500,
          json: async () => ({ error: "Failed to load experiments" }),
        } as Response;
      }
      return {
        ok: true,
        json: async () => ({ data: [] }),
      } as Response;
    });

    render(<ExperimentsDashboardPage />);

    await waitFor(() => {
      expect(screen.getAllByText(/Failed to load experiments/i).length).toBeGreaterThanOrEqual(1);
    });

    // Mock success for retry
    global.fetch = vi.fn().mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/api/experiments")) {
        return {
          ok: true,
          json: async () => ({
            experiments: mockExperiments,
            metrics: mockMetrics,
          }),
        } as Response;
      }
      return {
        ok: true,
        json: async () => ({ data: [] }),
      } as Response;
    });

    const retryBtn = screen.getByRole("button", { name: /try again|retry/i });
    fireEvent.click(retryBtn);

    await waitFor(() => {
      expect(screen.getByText("Homepage CTA Split Test")).toBeInTheDocument();
    });
  });

  it("renders clean empty state when no experiments exist", async () => {
    global.fetch = vi.fn().mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/api/experiments")) {
        return {
          ok: true,
          json: async () => ({
            experiments: [],
            metrics: {
              totalExperiments: 0,
              activeExperiments: 0,
              totalVariants: 0,
              totalConversions: 0,
              totalSessions: 0,
              overallConversionRate: 0,
              significantWinnersCount: 0,
            },
          }),
        } as Response;
      }
      return {
        ok: true,
        json: async () => ({ data: [] }),
      } as Response;
    });

    render(<ExperimentsDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/No A\/B experiments yet|No experiments created yet/i)).toBeInTheDocument();
    });
  });
});
