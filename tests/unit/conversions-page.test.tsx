import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import * as React from "react";
import ConversionsDashboardPage from "@/app/dashboard/conversions/page";
import { toast } from "sonner";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}));

describe("Conversions Dashboard Page (app/dashboard/conversions/page.tsx)", () => {
  const mockGoals = [
    {
      id: "goal-1",
      userId: "user-1",
      name: "Newsletter Sign-up",
      description: "Captures subscribers from flyer QR codes",
      eventType: "FORM_SUBMIT",
      targetPattern: "#signup-form",
      qrCodeId: "qr-1",
      campaignId: "camp-1",
      monetaryValue: 1500, // $15.00
      currency: "USD",
      isActive: true,
      createdAt: "2026-07-01T10:00:00Z",
      updatedAt: "2026-07-01T10:00:00Z",
      qrCode: { id: "qr-1", name: "Summer Flyer QR" },
      campaign: { id: "camp-1", name: "Summer Campaign 2026" },
      totalConversions: 45,
      totalSessions: 300,
      conversionRate: 15.0,
      totalRevenue: 675.0,
    },
    {
      id: "goal-2",
      userId: "user-1",
      name: "Checkout Purchase",
      description: "Measures completed purchase events",
      eventType: "CONVERSION",
      targetPattern: "/checkout/success",
      qrCodeId: null,
      campaignId: null,
      monetaryValue: 5000, // $50.00
      currency: "USD",
      isActive: false,
      createdAt: "2026-07-10T12:00:00Z",
      updatedAt: "2026-07-10T12:00:00Z",
      qrCode: null,
      campaign: null,
      totalConversions: 10,
      totalSessions: 200,
      conversionRate: 5.0,
      totalRevenue: 500.0,
    },
    {
      id: "goal-3",
      userId: "user-1",
      name: "Demo Video Click",
      description: "Tracks clicks on demo video CTA",
      eventType: "BUTTON_CLICK",
      targetPattern: ".watch-demo-btn",
      qrCodeId: "qr-2",
      campaignId: null,
      monetaryValue: 0,
      currency: "USD",
      isActive: true,
      createdAt: "2026-07-15T09:00:00Z",
      updatedAt: "2026-07-15T09:00:00Z",
      qrCode: { id: "qr-2", name: "Landing Page Sticker" },
      campaign: null,
      totalConversions: 80,
      totalSessions: 400,
      conversionRate: 20.0,
      totalRevenue: 0,
    },
    {
      id: "goal-4",
      userId: "user-1",
      name: "Pricing Page View",
      description: "Tracks visits to enterprise pricing",
      eventType: "PAGE_VIEW",
      targetPattern: "/pricing",
      qrCodeId: null,
      campaignId: "camp-2",
      monetaryValue: 200, // $2.00
      currency: "USD",
      isActive: true,
      createdAt: "2026-07-20T14:00:00Z",
      updatedAt: "2026-07-20T14:00:00Z",
      qrCode: null,
      campaign: { id: "camp-2", name: "Fall Enterprise Launch" },
      totalConversions: 120,
      totalSessions: 600,
      conversionRate: 20.0,
      totalRevenue: 240.0,
    },
  ];

  const mockMetrics = {
    totalConversions: 255,
    totalRevenue: 1415.0,
    activeGoalsCount: 3,
    overallConversionRate: 17.0,
  };

  const mockQrCodes = [
    { id: "qr-1", name: "Summer Flyer QR" },
    { id: "qr-2", name: "Landing Page Sticker" },
  ];

  const mockCampaigns = [
    { id: "camp-1", name: "Summer Campaign 2026" },
    { id: "camp-2", name: "Fall Enterprise Launch" },
  ];

  beforeEach(() => {
    vi.clearAllMocks();

    global.fetch = vi.fn().mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = String(input);
      const method = init?.method || "GET";

      if (url.includes("/api/conversions") && method === "GET") {
        return {
          ok: true,
          json: async () => ({
            goals: mockGoals,
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

      if (url.includes("/api/conversions") && method === "POST") {
        const body = JSON.parse(init?.body as string);
        return {
          ok: true,
          status: 201,
          json: async () => ({
            goal: {
              id: "goal-new",
              ...body,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
              totalConversions: 0,
              totalSessions: 0,
              conversionRate: 0,
              totalRevenue: 0,
            },
          }),
        } as Response;
      }

      if (url.includes("/api/conversions/") && method === "PATCH") {
        const body = JSON.parse(init?.body as string);
        return {
          ok: true,
          json: async () => ({
            goal: {
              ...mockGoals[0],
              ...body,
              id: "goal-1",
              updatedAt: new Date().toISOString(),
            },
          }),
        } as Response;
      }

      if (url.includes("/api/conversions/") && method === "DELETE") {
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
    render(<ConversionsDashboardPage />);

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Conversion Goals/i })).toBeInTheDocument();
    expect(screen.getByText("Isolated Tenant")).toBeInTheDocument();
    expect(
      screen.getByText(/Track, attribute, and analyze high-value visitor conversion events/i)
    ).toBeInTheDocument();

    expect(screen.getByRole("button", { name: /refresh/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /new goal|create goal|new conversion goal/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /^tracking code$/i })).toBeInTheDocument();

    await waitFor(() => {
      expect(screen.getByText("Newsletter Sign-up")).toBeInTheDocument();
    });
  });

  it("loads and displays all 4 summary KPI metric cards", async () => {
    render(<ConversionsDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("255")).toBeInTheDocument(); // Total Conversions
      expect(screen.getByText("$1,415.00")).toBeInTheDocument(); // Attributed Revenue
      expect(screen.getByText("3")).toBeInTheDocument(); // Active Goals
      expect(screen.getByText("17%")).toBeInTheDocument(); // Overall Conv. Rate
    });
  });

  it("renders all goal cards with details, scope, and badges", async () => {
    render(<ConversionsDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Newsletter Sign-up")).toBeInTheDocument();
      expect(screen.getByText("Checkout Purchase")).toBeInTheDocument();
      expect(screen.getByText("Demo Video Click")).toBeInTheDocument();
      expect(screen.getByText("Pricing Page View")).toBeInTheDocument();

      // Check event types
      expect(screen.getByText("FORM_SUBMIT")).toBeInTheDocument();
      expect(screen.getByText("CONVERSION")).toBeInTheDocument();
      expect(screen.getByText("BUTTON_CLICK")).toBeInTheDocument();
      expect(screen.getByText("PAGE_VIEW")).toBeInTheDocument();

      // Check scope tags
      expect(screen.getByText("Summer Flyer QR")).toBeInTheDocument();
      expect(screen.getByText("Summer Campaign 2026")).toBeInTheDocument();
      expect(screen.getByText(/All QR Codes \(Global Scope\)/i)).toBeInTheDocument();
    });
  });

  it("filters goals by search query in name or description", async () => {
    render(<ConversionsDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Newsletter Sign-up")).toBeInTheDocument();
    });

    const searchInput = screen.getByPlaceholderText(/search/i);
    fireEvent.change(searchInput, { target: { value: "Newsletter" } });

    expect(screen.getByText("Newsletter Sign-up")).toBeInTheDocument();
    expect(screen.queryByText("Checkout Purchase")).not.toBeInTheDocument();
    expect(screen.queryByText("Demo Video Click")).not.toBeInTheDocument();

    // Search by description keyword
    fireEvent.change(searchInput, { target: { value: "enterprise" } });
    expect(screen.getByText("Pricing Page View")).toBeInTheDocument();
    expect(screen.queryByText("Newsletter Sign-up")).not.toBeInTheDocument();
  });

  it("filters goals by status (active vs paused/inactive vs all)", async () => {
    render(<ConversionsDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Newsletter Sign-up")).toBeInTheDocument();
    });

    const statusFilter = screen.getByLabelText(/status/i);

    // Active only
    fireEvent.change(statusFilter, { target: { value: "active" } });
    expect(screen.getByText("Newsletter Sign-up")).toBeInTheDocument();
    expect(screen.getByText("Demo Video Click")).toBeInTheDocument();
    expect(screen.getByText("Pricing Page View")).toBeInTheDocument();
    expect(screen.queryByText("Checkout Purchase")).not.toBeInTheDocument();

    // Paused / Inactive only
    fireEvent.change(statusFilter, { target: { value: "paused" } });
    expect(screen.getByText("Checkout Purchase")).toBeInTheDocument();
    expect(screen.queryByText("Newsletter Sign-up")).not.toBeInTheDocument();

    // All
    fireEvent.change(statusFilter, { target: { value: "all" } });
    expect(screen.getByText("Newsletter Sign-up")).toBeInTheDocument();
    expect(screen.getByText("Checkout Purchase")).toBeInTheDocument();
  });

  it("filters goals by scope (all, global, qr_only, campaign_only)", async () => {
    render(<ConversionsDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Newsletter Sign-up")).toBeInTheDocument();
    });

    const scopeFilter = screen.getByLabelText(/scope/i);

    // Global only
    fireEvent.change(scopeFilter, { target: { value: "global" } });
    expect(screen.getByText("Checkout Purchase")).toBeInTheDocument();
    expect(screen.queryByText("Newsletter Sign-up")).not.toBeInTheDocument();

    // QR only
    fireEvent.change(scopeFilter, { target: { value: "qr_only" } });
    expect(screen.getByText("Newsletter Sign-up")).toBeInTheDocument();
    expect(screen.getByText("Demo Video Click")).toBeInTheDocument();
    expect(screen.queryByText("Checkout Purchase")).not.toBeInTheDocument();

    // Campaign only
    fireEvent.change(scopeFilter, { target: { value: "campaign_only" } });
    expect(screen.getByText("Newsletter Sign-up")).toBeInTheDocument();
    expect(screen.getByText("Pricing Page View")).toBeInTheDocument();
    expect(screen.queryByText("Checkout Purchase")).not.toBeInTheDocument();
  });

  it("toggles between Grid and List views", async () => {
    render(<ConversionsDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Newsletter Sign-up")).toBeInTheDocument();
    });

    const listBtn = screen.getByRole("button", { name: /list view/i });
    fireEvent.click(listBtn);

    const container = screen.getByTestId("conversions-container");
    expect(container).toHaveAttribute("data-view", "list");

    const gridBtn = screen.getByRole("button", { name: /grid view/i });
    fireEvent.click(gridBtn);
    expect(container).toHaveAttribute("data-view", "grid");
  });

  it("opens create goal dialog, submits data, and shows success toast", async () => {
    render(<ConversionsDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Newsletter Sign-up")).toBeInTheDocument();
    });

    const newGoalBtn = screen.getByRole("button", { name: /new goal|create goal|new conversion goal/i });
    fireEvent.click(newGoalBtn);

    expect(screen.getByText("Create Conversion Goal")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText(/Goal Name/i), {
      target: { value: "Free Trial Start" },
    });
    fireEvent.change(screen.getByLabelText(/Description/i), {
      target: { value: "New user registrations" },
    });
    fireEvent.change(screen.getByLabelText(/Target Pattern/i), {
      target: { value: ".signup-btn" },
    });
    fireEvent.change(screen.getByLabelText(/Monetary Value/i), {
      target: { value: "10.00" },
    });

    const submitBtn = screen.getByRole("button", { name: /save changes|create goal/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/conversions",
        expect.objectContaining({
          method: "POST",
        })
      );
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining("created"));
    });
  });

  it("opens edit goal dialog, updates goal, and shows success toast", async () => {
    render(<ConversionsDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Newsletter Sign-up")).toBeInTheDocument();
    });

    // Open dropdown on first card
    const actionButtons = screen.getAllByRole("button", { name: /actions/i });
    fireEvent.click(actionButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Edit Goal/i)).toBeInTheDocument();
    });
    const editBtn = screen.getByText(/Edit Goal/i);
    fireEvent.click(editBtn);

    expect(screen.getByText("Edit Conversion Goal")).toBeInTheDocument();
    expect(screen.getByLabelText(/Goal Name/i)).toHaveValue("Newsletter Sign-up");

    fireEvent.change(screen.getByLabelText(/Goal Name/i), {
      target: { value: "Updated Newsletter Goal" },
    });

    const submitBtn = screen.getByRole("button", { name: /save changes/i });
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/conversions/goal-1",
        expect.objectContaining({
          method: "PATCH",
        })
      );
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining("updated"));
    });
  });

  it("toggles goal status (active/deactivate) and shows success toast", async () => {
    render(<ConversionsDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Newsletter Sign-up")).toBeInTheDocument();
    });

    const actionButtons = screen.getAllByRole("button", { name: /actions/i });
    fireEvent.click(actionButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Deactivate Goal/i)).toBeInTheDocument();
    });
    const toggleBtn = screen.getByText(/Deactivate Goal/i);
    fireEvent.click(toggleBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/conversions/goal-1",
        expect.objectContaining({
          method: "PATCH",
          body: JSON.stringify({ isActive: false }),
        })
      );
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining("deactivated"));
    });
  });

  it("deletes a goal after confirmation and shows success toast", async () => {
    vi.spyOn(window, "confirm").mockReturnValue(true);

    render(<ConversionsDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Newsletter Sign-up")).toBeInTheDocument();
    });

    const actionButtons = screen.getAllByRole("button", { name: /actions/i });
    fireEvent.click(actionButtons[0]);

    await waitFor(() => {
      expect(screen.getByText(/Delete Goal/i)).toBeInTheDocument();
    });
    const deleteBtn = screen.getByText(/Delete Goal/i);
    fireEvent.click(deleteBtn);

    expect(window.confirm).toHaveBeenCalled();

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/conversions/goal-1",
        expect.objectContaining({
          method: "DELETE",
        })
      );
      expect(toast.success).toHaveBeenCalledWith(expect.stringContaining("deleted"));
      expect(screen.queryByText("Newsletter Sign-up")).not.toBeInTheDocument();
    });
  });

  it("opens tracking code snippet dialog from header action and from card", async () => {
    render(<ConversionsDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText("Newsletter Sign-up")).toBeInTheDocument();
    });

    // From header
    const headerSnippetBtn = screen.getByRole("button", { name: /^tracking code$/i });
    fireEvent.click(headerSnippetBtn);

    expect(screen.getByText("Conversion Tracking Snippet")).toBeInTheDocument();

    // Close dialog
    fireEvent.click(screen.getByRole("button", { name: /close/i }));

    // From card footer
    const cardSnippetButtons = screen.getAllByRole("button", { name: /get code snippet/i });
    fireEvent.click(cardSnippetButtons[0]);

    expect(screen.getByText("Conversion Tracking Snippet")).toBeInTheDocument();
    expect(screen.getByText(/ScanFlow\.convert\("Newsletter Sign-up"/i)).toBeInTheDocument();
  });

  it("handles error state and provides retry functionality", async () => {
    // Fail first call
    global.fetch = vi.fn().mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/api/conversions")) {
        return {
          ok: false,
          status: 500,
          json: async () => ({ error: "Failed to load conversion goals" }),
        } as Response;
      }
      return {
        ok: true,
        json: async () => ({ data: [] }),
      } as Response;
    });

    render(<ConversionsDashboardPage />);

    await waitFor(() => {
      expect(screen.getAllByText(/Failed to load conversion goals/i).length).toBeGreaterThanOrEqual(1);
    });

    // Mock success for retry
    global.fetch = vi.fn().mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/api/conversions")) {
        return {
          ok: true,
          json: async () => ({
            goals: mockGoals,
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
      expect(screen.getByText("Newsletter Sign-up")).toBeInTheDocument();
    });
  });

  it("renders clean empty state when no goals exist", async () => {
    global.fetch = vi.fn().mockImplementation(async (input: RequestInfo | URL) => {
      const url = String(input);
      if (url.includes("/api/conversions")) {
        return {
          ok: true,
          json: async () => ({
            goals: [],
            metrics: {
              totalConversions: 0,
              totalRevenue: 0,
              activeGoalsCount: 0,
              overallConversionRate: 0,
            },
          }),
        } as Response;
      }
      return {
        ok: true,
        json: async () => ({ data: [] }),
      } as Response;
    });

    render(<ConversionsDashboardPage />);

    await waitFor(() => {
      expect(screen.getByText(/No conversion goals created yet/i)).toBeInTheDocument();
    });
  });
});
