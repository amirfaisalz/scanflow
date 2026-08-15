import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import {
  ExperimentCard,
  ExperimentDialog,
  ExperimentData,
} from "@/components/experiments";

describe("Experiments UI Components", () => {
  const mockExperiment: ExperimentData = {
    id: "exp-1",
    userId: "user-1",
    name: "Homepage Hero CTA Test",
    description: "Testing blue vs green button on landing page conversion",
    status: "active",
    qrCodeId: "qr-1",
    campaignId: "camp-1",
    trafficAllocation: 100,
    winnerVariantId: null,
    startedAt: "2026-06-01T10:00:00Z",
    createdAt: "2026-06-01T10:00:00Z",
    updatedAt: "2026-06-01T10:00:00Z",
    qrCode: {
      id: "qr-1",
      name: "Main Entrance Banner",
    },
    campaign: {
      id: "camp-1",
      name: "Summer 2026 Promo",
    },
    variants: [
      {
        id: "var-1",
        experimentId: "exp-1",
        name: "Variant A (Control)",
        destinationUrl: "https://example.com/control",
        trafficWeight: 50,
        isControl: true,
        scans: 120,
        sessions: 100,
        conversions: 10,
        conversionRate: 10.0,
        bounceRate: 40.0,
      },
      {
        id: "var-2",
        experimentId: "exp-1",
        name: "Variant B (Green CTA)",
        destinationUrl: "https://example.com/green",
        trafficWeight: 50,
        isControl: false,
        scans: 130,
        sessions: 100,
        conversions: 20,
        conversionRate: 20.0,
        bounceRate: 30.0,
        lift: 100.0,
        confidenceLevel: 96.2,
        isSignificant: true,
        pValue: 0.038,
      },
    ],
    stats: {
      totalScans: 250,
      totalSessions: 200,
      totalConversions: 30,
      conversionRate: 15.0,
      hasSignificantWinner: true,
      winnerVariant: {
        id: "var-2",
        name: "Variant B (Green CTA)",
        destinationUrl: "https://example.com/green",
        trafficWeight: 50,
        isControl: false,
        scans: 130,
        sessions: 100,
        conversions: 20,
        conversionRate: 20.0,
        lift: 100.0,
        confidenceLevel: 96.2,
        isSignificant: true,
      },
    },
  };

  const mockDraftExperiment: ExperimentData = {
    id: "exp-2",
    userId: "user-1",
    name: "Draft Checkout Experiment",
    description: "Pre-launch test for one-click checkout",
    status: "draft",
    qrCodeId: "qr-2",
    trafficAllocation: 100,
    winnerVariantId: null,
    createdAt: "2026-06-02T10:00:00Z",
    updatedAt: "2026-06-02T10:00:00Z",
    qrCode: {
      id: "qr-2",
      name: "Checkout Table Tent",
    },
    variants: [
      {
        id: "var-3",
        name: "Control",
        destinationUrl: "https://example.com/old-checkout",
        trafficWeight: 50,
        isControl: true,
        scans: 0,
        sessions: 0,
        conversions: 0,
        conversionRate: 0,
      },
      {
        id: "var-4",
        name: "New Flow",
        destinationUrl: "https://example.com/new-checkout",
        trafficWeight: 50,
        isControl: false,
        scans: 0,
        sessions: 0,
        conversions: 0,
        conversionRate: 0,
      },
    ],
  };

  const mockEndedExperimentWithWinner: ExperimentData = {
    id: "exp-3",
    userId: "user-1",
    name: "Completed Discount Test",
    description: "Testing $10 vs 15% off discounts",
    status: "ended",
    qrCodeId: "qr-3",
    trafficAllocation: 100,
    winnerVariantId: "var-6",
    createdAt: "2026-05-01T10:00:00Z",
    updatedAt: "2026-05-15T10:00:00Z",
    variants: [
      {
        id: "var-5",
        name: "$10 Discount",
        destinationUrl: "https://example.com/d10",
        trafficWeight: 50,
        isControl: true,
        scans: 500,
        sessions: 400,
        conversions: 40,
        conversionRate: 10.0,
      },
      {
        id: "var-6",
        name: "15% Off Discount",
        destinationUrl: "https://example.com/p15",
        trafficWeight: 50,
        isControl: false,
        scans: 520,
        sessions: 410,
        conversions: 82,
        conversionRate: 20.0,
        lift: 100.0,
        confidenceLevel: 99.8,
        isSignificant: true,
      },
    ],
    stats: {
      totalScans: 1020,
      totalSessions: 810,
      totalConversions: 122,
      conversionRate: 15.06,
      hasSignificantWinner: true,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("ExperimentCard", () => {
    it("should render experiment details, status badge, and QR code association", () => {
      const onEdit = vi.fn();
      const onDelete = vi.fn();
      const onStatusToggle = vi.fn();
      const onDeclareWinner = vi.fn();

      render(
        <ExperimentCard
          experiment={mockExperiment}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusToggle={onStatusToggle}
          onDeclareWinner={onDeclareWinner}
        />
      );

      expect(screen.getByText("Homepage Hero CTA Test")).toBeInTheDocument();
      expect(
        screen.getByText(/Testing blue vs green button on landing page conversion/i)
      ).toBeInTheDocument();
      expect(screen.getByText("Active")).toBeInTheDocument();
      expect(screen.getByText(/Main Entrance Banner/)).toBeInTheDocument();
      expect(screen.getByText(/Summer 2026 Promo/)).toBeInTheDocument();
    });

    it("should render aggregate metrics correctly (total scans, conversions, overall conversion rate)", () => {
      render(
        <ExperimentCard
          experiment={mockExperiment}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onStatusToggle={vi.fn()}
        />
      );

      expect(screen.getByText("250")).toBeInTheDocument(); // total scans
      expect(screen.getByText("30")).toBeInTheDocument(); // total conversions
      expect(screen.getByText("15%")).toBeInTheDocument(); // overall conversion rate
    });

    it("should render variant comparison bars, metrics, lift, and significance badges", () => {
      render(
        <ExperimentCard
          experiment={mockExperiment}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onStatusToggle={vi.fn()}
        />
      );

      // Check variant names
      expect(screen.getByText("Variant A (Control)")).toBeInTheDocument();
      expect(screen.getByText("Variant B (Green CTA)")).toBeInTheDocument();

      // Check traffic weights
      const weights = screen.getAllByText(/50%/);
      expect(weights.length).toBeGreaterThanOrEqual(2);

      // Check conversion rates
      expect(screen.getByText("10%")).toBeInTheDocument();
      expect(screen.getByText("20%")).toBeInTheDocument();

      // Check lift and significance
      expect(screen.getByText("+100%")).toBeInTheDocument();
      expect(screen.getByText(/96.2% Confident|Significant/i)).toBeInTheDocument();
    });

    it("should render winner crown/badge on declared or statistically significant winning variant", () => {
      render(
        <ExperimentCard
          experiment={mockEndedExperimentWithWinner}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onStatusToggle={vi.fn()}
        />
      );

      expect(screen.getByText("Ended")).toBeInTheDocument();
      expect(screen.getByText(/Winner/i)).toBeInTheDocument();
    });

    it("should trigger onEdit when edit action is clicked", () => {
      const onEdit = vi.fn();
      render(
        <ExperimentCard
          experiment={mockExperiment}
          onEdit={onEdit}
          onDelete={vi.fn()}
          onStatusToggle={vi.fn()}
        />
      );

      const trigger = screen.getByRole("button", { name: /actions|more/i });
      fireEvent.click(trigger);

      const editBtn = screen.getByText(/Edit Experiment|Edit Details/i);
      fireEvent.click(editBtn);

      expect(onEdit).toHaveBeenCalledTimes(1);
      expect(onEdit).toHaveBeenCalledWith(mockExperiment);
    });

    it("should trigger onStatusToggle when pause/activate/end actions are clicked", () => {
      const onStatusToggle = vi.fn();
      const { rerender } = render(
        <ExperimentCard
          experiment={mockExperiment}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onStatusToggle={onStatusToggle}
        />
      );

      // Active experiment -> pause option
      const trigger = screen.getByRole("button", { name: /actions|more/i });
      fireEvent.click(trigger);

      const pauseBtn = screen.getByText(/Pause Experiment/i);
      fireEvent.click(pauseBtn);
      expect(onStatusToggle).toHaveBeenCalledWith("exp-1", "paused");

      // Draft experiment -> start option
      rerender(
        <ExperimentCard
          experiment={mockDraftExperiment}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onStatusToggle={onStatusToggle}
        />
      );

      const triggerDraft = screen.getByRole("button", { name: /actions|more/i });
      fireEvent.click(triggerDraft);

      const startBtn = screen.getByText(/Start Experiment|Activate Experiment/i);
      fireEvent.click(startBtn);
      expect(onStatusToggle).toHaveBeenCalledWith("exp-2", "active");
    });

    it("should trigger onDeclareWinner when winner variant is selected", () => {
      const onDeclareWinner = vi.fn();
      render(
        <ExperimentCard
          experiment={mockExperiment}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onStatusToggle={vi.fn()}
          onDeclareWinner={onDeclareWinner}
        />
      );

      const trigger = screen.getByRole("button", { name: /actions|more/i });
      fireEvent.click(trigger);

      const declareBtn = screen.getByText(/Declare Winner: Variant B/i);
      fireEvent.click(declareBtn);

      expect(onDeclareWinner).toHaveBeenCalledWith("exp-1", "var-2");
    });

    it("should trigger onDelete when delete action is clicked", () => {
      const onDelete = vi.fn();
      render(
        <ExperimentCard
          experiment={mockExperiment}
          onEdit={vi.fn()}
          onDelete={onDelete}
          onStatusToggle={vi.fn()}
        />
      );

      const trigger = screen.getByRole("button", { name: /actions|more/i });
      fireEvent.click(trigger);

      const deleteBtn = screen.getByText(/Delete Experiment/i);
      fireEvent.click(deleteBtn);

      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onDelete).toHaveBeenCalledWith("exp-1");
    });

    it("should handle paused experiment status and trigger activate/end", () => {
      const onStatusToggle = vi.fn();
      const mockPausedExp: ExperimentData = {
        ...mockExperiment,
        id: "exp-paused",
        status: "paused",
      };

      render(
        <ExperimentCard
          experiment={mockPausedExp}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onStatusToggle={onStatusToggle}
        />
      );

      expect(screen.getByText("Paused")).toBeInTheDocument();

      const trigger = screen.getByRole("button", { name: /actions|more/i });
      fireEvent.click(trigger);

      const activateBtn = screen.getByText(/Activate Experiment/i);
      fireEvent.click(activateBtn);
      expect(onStatusToggle).toHaveBeenCalledWith("exp-paused", "active");
    });

    it("should display negative lift when variant underperforms control", () => {
      const mockUnderperformingExp: ExperimentData = {
        ...mockExperiment,
        variants: [
          mockExperiment.variants[0],
          {
            ...mockExperiment.variants[1],
            lift: -25.5,
            isSignificant: false,
            confidenceLevel: 80.0,
          },
        ],
      };

      render(
        <ExperimentCard
          experiment={mockUnderperformingExp}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onStatusToggle={vi.fn()}
        />
      );

      expect(screen.getByText("-25.5%")).toBeInTheDocument();
    });

    it("should trigger onViewDetails when manage button is clicked", () => {
      const onViewDetails = vi.fn();
      render(
        <ExperimentCard
          experiment={mockExperiment}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onStatusToggle={vi.fn()}
          onViewDetails={onViewDetails}
        />
      );

      const manageBtn = screen.getByRole("button", { name: /manage experiment/i });
      fireEvent.click(manageBtn);

      expect(onViewDetails).toHaveBeenCalledTimes(1);
      expect(onViewDetails).toHaveBeenCalledWith(mockExperiment);
    });
  });

  describe("ExperimentDialog", () => {
    const mockQrCodes = [
      { id: "qr-1", name: "Main Entrance Banner", destinationUrl: "https://example.com" },
      { id: "qr-2", name: "Checkout Table Tent", destinationUrl: "https://example.com/checkout" },
    ];
    const mockCampaigns = [
      { id: "camp-1", name: "Summer 2026 Promo" },
      { id: "camp-2", name: "Fall Campaign" },
    ];

    it("should render create experiment modal with initial empty inputs and default variants", () => {
      render(
        <ExperimentDialog
          open={true}
          onOpenChange={vi.fn()}
          qrCodes={mockQrCodes}
          campaigns={mockCampaigns}
        />
      );

      expect(screen.getByRole("heading", { name: "Create Experiment" })).toBeInTheDocument();
      expect(screen.getByLabelText(/Experiment Name/i)).toHaveValue("");
      expect(screen.getByLabelText(/Description/i)).toHaveValue("");
      expect(screen.getByLabelText(/Variant A Name/i)).toHaveValue("Variant A (Control)");
      expect(screen.getByLabelText(/Variant B Name/i)).toHaveValue("Variant B");
    });

    it("should render edit experiment modal prefilled with existing experiment data", () => {
      render(
        <ExperimentDialog
          open={true}
          onOpenChange={vi.fn()}
          experiment={mockExperiment}
          qrCodes={mockQrCodes}
          campaigns={mockCampaigns}
        />
      );

      expect(screen.getByRole("heading", { name: "Edit Experiment" })).toBeInTheDocument();
      expect(screen.getByLabelText(/Experiment Name/i)).toHaveValue("Homepage Hero CTA Test");
      expect(screen.getByLabelText(/Description/i)).toHaveValue(
        "Testing blue vs green button on landing page conversion"
      );
      expect(screen.getByLabelText(/Variant A Destination URL/i)).toHaveValue(
        "https://example.com/control"
      );
      expect(screen.getByLabelText(/Variant B Destination URL/i)).toHaveValue(
        "https://example.com/green"
      );
    });

    it("should update variant traffic weights when clicking split presets (50/50, 70/30, 80/20)", () => {
      render(
        <ExperimentDialog
          open={true}
          onOpenChange={vi.fn()}
          qrCodes={mockQrCodes}
        />
      );

      const preset7030 = screen.getByRole("button", { name: "70 / 30" });
      fireEvent.click(preset7030);

      expect(screen.getByLabelText(/Variant A Weight/i)).toHaveValue(70);
      expect(screen.getByLabelText(/Variant B Weight/i)).toHaveValue(30);

      const preset8020 = screen.getByRole("button", { name: "80 / 20" });
      fireEvent.click(preset8020);

      expect(screen.getByLabelText(/Variant A Weight/i)).toHaveValue(80);
      expect(screen.getByLabelText(/Variant B Weight/i)).toHaveValue(20);

      const preset5050 = screen.getByRole("button", { name: "50 / 50" });
      fireEvent.click(preset5050);

      expect(screen.getByLabelText(/Variant A Weight/i)).toHaveValue(50);
      expect(screen.getByLabelText(/Variant B Weight/i)).toHaveValue(50);
    });

    it("should validate required experiment name", async () => {
      const onSave = vi.fn();
      render(
        <ExperimentDialog
          open={true}
          onOpenChange={vi.fn()}
          onSave={onSave}
          qrCodes={mockQrCodes}
        />
      );

      const submitBtn = screen.getByRole("button", {
        name: /create experiment|save experiment|save changes/i,
      });
      fireEvent.click(submitBtn);

      expect(await screen.findByText(/Experiment name is required/i)).toBeInTheDocument();
      expect(onSave).not.toHaveBeenCalled();
    });

    it("should validate required QR code selection", async () => {
      const onSave = vi.fn();
      render(
        <ExperimentDialog
          open={true}
          onOpenChange={vi.fn()}
          onSave={onSave}
          qrCodes={mockQrCodes}
        />
      );

      fireEvent.change(screen.getByLabelText(/Experiment Name/i), {
        target: { value: "Test Experiment" },
      });

      const submitBtn = screen.getByRole("button", {
        name: /create experiment|save experiment|save changes/i,
      });
      fireEvent.click(submitBtn);

      expect(await screen.findByText(/Please select a QR code/i)).toBeInTheDocument();
      expect(onSave).not.toHaveBeenCalled();
    });

    it("should validate valid variant URLs", async () => {
      const onSave = vi.fn();
      render(
        <ExperimentDialog
          open={true}
          onOpenChange={vi.fn()}
          onSave={onSave}
          qrCodes={mockQrCodes}
        />
      );

      fireEvent.change(screen.getByLabelText(/Experiment Name/i), {
        target: { value: "URL Validation Test" },
      });
      fireEvent.change(screen.getByLabelText(/QR Code/i), {
        target: { value: "qr-1" },
      });
      fireEvent.change(screen.getByLabelText(/Variant A Destination URL/i), {
        target: { value: "invalid-url" },
      });
      fireEvent.change(screen.getByLabelText(/Variant B Destination URL/i), {
        target: { value: "https://example.com/b" },
      });

      const submitBtn = screen.getByRole("button", {
        name: /create experiment|save experiment|save changes/i,
      });
      fireEvent.click(submitBtn);

      expect(
        await screen.findByText(/requires a valid URL \(http\/https\)/i)
      ).toBeInTheDocument();
      expect(onSave).not.toHaveBeenCalled();
    });

    it("should validate that traffic weights sum to 100%", async () => {
      const onSave = vi.fn();
      render(
        <ExperimentDialog
          open={true}
          onOpenChange={vi.fn()}
          onSave={onSave}
          qrCodes={mockQrCodes}
        />
      );

      fireEvent.change(screen.getByLabelText(/Experiment Name/i), {
        target: { value: "Weight Test" },
      });
      fireEvent.change(screen.getByLabelText(/QR Code/i), {
        target: { value: "qr-1" },
      });
      fireEvent.change(screen.getByLabelText(/Variant A Destination URL/i), {
        target: { value: "https://example.com/a" },
      });
      fireEvent.change(screen.getByLabelText(/Variant B Destination URL/i), {
        target: { value: "https://example.com/b" },
      });
      fireEvent.change(screen.getByLabelText(/Variant A Weight/i), {
        target: { value: "40" },
      });
      fireEvent.change(screen.getByLabelText(/Variant B Weight/i), {
        target: { value: "40" },
      });

      const submitBtn = screen.getByRole("button", {
        name: /create experiment|save experiment|save changes/i,
      });
      fireEvent.click(submitBtn);

      expect(
        await screen.findByText(/Variant traffic weights must sum to 100%/i)
      ).toBeInTheDocument();
      expect(onSave).not.toHaveBeenCalled();
    });

    it("should call onSave with correct experiment and variants payload", async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const onOpenChange = vi.fn();

      render(
        <ExperimentDialog
          open={true}
          onOpenChange={onOpenChange}
          onSave={onSave}
          qrCodes={mockQrCodes}
          campaigns={mockCampaigns}
        />
      );

      fireEvent.change(screen.getByLabelText(/Experiment Name/i), {
        target: { value: "Sign-up Page Split" },
      });
      fireEvent.change(screen.getByLabelText(/Description/i), {
        target: { value: "Split test on landing page v2" },
      });
      fireEvent.change(screen.getByLabelText(/QR Code/i), {
        target: { value: "qr-1" },
      });
      fireEvent.change(screen.getByLabelText(/Variant A Destination URL/i), {
        target: { value: "https://example.com/original" },
      });
      fireEvent.change(screen.getByLabelText(/Variant B Destination URL/i), {
        target: { value: "https://example.com/variation" },
      });

      const submitBtn = screen.getByRole("button", {
        name: /create experiment|save experiment|save changes/i,
      });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith(
          expect.objectContaining({
            name: "Sign-up Page Split",
            description: "Split test on landing page v2",
            qrCodeId: "qr-1",
            variants: expect.arrayContaining([
              expect.objectContaining({
                name: "Variant A (Control)",
                destinationUrl: "https://example.com/original",
                trafficWeight: 50,
                isControl: true,
              }),
              expect.objectContaining({
                name: "Variant B",
                destinationUrl: "https://example.com/variation",
                trafficWeight: 50,
                isControl: false,
              }),
            ]),
          })
        );
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it("should handle API fetch when onSave is not provided", async () => {
      const mockFetch = vi.spyOn(global, "fetch").mockResolvedValue({
        ok: true,
        json: async () => ({ experiment: { id: "exp-new" } }),
      } as any);

      const onOpenChange = vi.fn();
      render(
        <ExperimentDialog
          open={true}
          onOpenChange={onOpenChange}
          qrCodes={mockQrCodes}
        />
      );

      fireEvent.change(screen.getByLabelText(/Experiment Name/i), {
        target: { value: "API Direct Experiment" },
      });
      fireEvent.change(screen.getByLabelText(/QR Code/i), {
        target: { value: "qr-2" },
      });
      fireEvent.change(screen.getByLabelText(/Variant A Destination URL/i), {
        target: { value: "https://example.com/a" },
      });
      fireEvent.change(screen.getByLabelText(/Variant B Destination URL/i), {
        target: { value: "https://example.com/b" },
      });

      const submitBtn = screen.getByRole("button", {
        name: /create experiment|save experiment|save changes/i,
      });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/experiments",
          expect.objectContaining({
            method: "POST",
          })
        );
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });

      mockFetch.mockRestore();
    });

    it("should display server error message when API call fails", async () => {
      const mockFetch = vi.spyOn(global, "fetch").mockResolvedValue({
        ok: false,
        json: async () => ({ error: "Active experiment already running on this QR code" }),
      } as any);

      render(
        <ExperimentDialog
          open={true}
          onOpenChange={vi.fn()}
          qrCodes={mockQrCodes}
        />
      );

      fireEvent.change(screen.getByLabelText(/Experiment Name/i), {
        target: { value: "Failing Exp" },
      });
      fireEvent.change(screen.getByLabelText(/QR Code/i), {
        target: { value: "qr-1" },
      });
      fireEvent.change(screen.getByLabelText(/Variant A Destination URL/i), {
        target: { value: "https://example.com/a" },
      });
      fireEvent.change(screen.getByLabelText(/Variant B Destination URL/i), {
        target: { value: "https://example.com/b" },
      });

      const submitBtn = screen.getByRole("button", {
        name: /create experiment|save experiment|save changes/i,
      });
      fireEvent.click(submitBtn);

      expect(
        await screen.findByText("Active experiment already running on this QR code")
      ).toBeInTheDocument();
      mockFetch.mockRestore();
    });
  });
});
