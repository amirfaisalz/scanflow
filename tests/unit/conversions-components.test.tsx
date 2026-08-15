import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import React from "react";
import {
  ConversionCard,
  ConversionDialog,
  SnippetDialog,
  ConversionGoalData,
} from "@/components/conversions";

describe("Conversions UI Components", () => {
  const mockGoal: ConversionGoalData = {
    id: "goal-1",
    userId: "user-1",
    name: "Summer Promo Sign-up",
    description: "Tracks newsletter subscriptions from summer flyer QR code",
    eventType: "FORM_SUBMIT",
    targetPattern: "#newsletter-form",
    qrCodeId: "qr-1",
    campaignId: "camp-1",
    monetaryValue: 1500, // $15.00
    currency: "USD",
    isActive: true,
    createdAt: "2026-06-01T10:00:00Z",
    updatedAt: "2026-06-01T10:00:00Z",
    qrCode: {
      id: "qr-1",
      name: "Summer Menu Table Tent",
    },
    campaign: {
      id: "camp-1",
      name: "Summer Promo 2026",
    },
    totalConversions: 42,
    totalSessions: 350,
    conversionRate: 12.0,
    totalRevenue: 630.0,
  };

  const mockInactiveGoal: ConversionGoalData = {
    ...mockGoal,
    id: "goal-2",
    name: "Purchase Checkout",
    eventType: "CONVERSION",
    targetPattern: "/checkout/success",
    qrCodeId: null,
    campaignId: null,
    qrCode: null,
    campaign: null,
    isActive: false,
    monetaryValue: 5000, // $50.00
    totalConversions: 0,
    totalSessions: 0,
    conversionRate: 0,
    totalRevenue: 0,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("ConversionCard", () => {
    it("should render goal details, event trigger badge, and scope", () => {
      const onEdit = vi.fn();
      const onDelete = vi.fn();
      const onStatusToggle = vi.fn();
      const onViewSnippet = vi.fn();

      render(
        <ConversionCard
          goal={mockGoal}
          onEdit={onEdit}
          onDelete={onDelete}
          onStatusToggle={onStatusToggle}
          onViewSnippet={onViewSnippet}
        />
      );

      expect(screen.getByText("Summer Promo Sign-up")).toBeInTheDocument();
      expect(
        screen.getByText(/Tracks newsletter subscriptions from summer flyer/i)
      ).toBeInTheDocument();
      expect(screen.getByText("FORM_SUBMIT")).toBeInTheDocument();
      expect(screen.getByText(/#newsletter-form/)).toBeInTheDocument();
      expect(screen.getByText(/Summer Menu Table Tent/)).toBeInTheDocument();
      expect(screen.getByText(/Summer Promo 2026/)).toBeInTheDocument();
      expect(screen.getByText("Active")).toBeInTheDocument();
    });

    it("should render metrics correctly (conversions, rate, revenue)", () => {
      render(
        <ConversionCard
          goal={mockGoal}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onStatusToggle={vi.fn()}
        />
      );

      expect(screen.getByText("42")).toBeInTheDocument();
      expect(screen.getByText("12%")).toBeInTheDocument();
      expect(screen.getByText("$630.00")).toBeInTheDocument();
    });

    it("should render global scope when qrCode and campaign are null", () => {
      render(
        <ConversionCard
          goal={mockInactiveGoal}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onStatusToggle={vi.fn()}
        />
      );

      expect(screen.getByText("Purchase Checkout")).toBeInTheDocument();
      expect(screen.getByText("Inactive")).toBeInTheDocument();
      expect(screen.getByText(/All QR Codes|Global Scope/i)).toBeInTheDocument();
      expect(screen.getByText("CONVERSION")).toBeInTheDocument();
    });

    it("should trigger onEdit when edit action is clicked", () => {
      const onEdit = vi.fn();
      render(
        <ConversionCard
          goal={mockGoal}
          onEdit={onEdit}
          onDelete={vi.fn()}
          onStatusToggle={vi.fn()}
        />
      );

      const trigger = screen.getByRole("button", { name: /actions|more/i });
      fireEvent.click(trigger);

      const editBtn = screen.getByText(/Edit Goal|Edit Details/i);
      fireEvent.click(editBtn);

      expect(onEdit).toHaveBeenCalledTimes(1);
      expect(onEdit).toHaveBeenCalledWith(mockGoal);
    });

    it("should trigger onStatusToggle with opposite isActive boolean", () => {
      const onStatusToggle = vi.fn();
      render(
        <ConversionCard
          goal={mockGoal}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onStatusToggle={onStatusToggle}
        />
      );

      const trigger = screen.getByRole("button", { name: /actions|more/i });
      fireEvent.click(trigger);

      const toggleBtn = screen.getByText(/Deactivate Goal|Pause Goal/i);
      fireEvent.click(toggleBtn);

      expect(onStatusToggle).toHaveBeenCalledTimes(1);
      expect(onStatusToggle).toHaveBeenCalledWith("goal-1", false);
    });

    it("should trigger onDelete when delete action is clicked", () => {
      const onDelete = vi.fn();
      render(
        <ConversionCard
          goal={mockGoal}
          onEdit={vi.fn()}
          onDelete={onDelete}
          onStatusToggle={vi.fn()}
        />
      );

      const trigger = screen.getByRole("button", { name: /actions|more/i });
      fireEvent.click(trigger);

      const deleteBtn = screen.getByText(/Delete Goal/i);
      fireEvent.click(deleteBtn);

      expect(onDelete).toHaveBeenCalledTimes(1);
      expect(onDelete).toHaveBeenCalledWith("goal-1");
    });

    it("should trigger onViewSnippet when snippet button/menu is clicked", () => {
      const onViewSnippet = vi.fn();
      render(
        <ConversionCard
          goal={mockGoal}
          onEdit={vi.fn()}
          onDelete={vi.fn()}
          onStatusToggle={vi.fn()}
          onViewSnippet={onViewSnippet}
        />
      );

      const snippetBtn = screen.getByRole("button", { name: /get code snippet|code snippet|snippet/i });
      fireEvent.click(snippetBtn);

      expect(onViewSnippet).toHaveBeenCalledTimes(1);
      expect(onViewSnippet).toHaveBeenCalledWith(mockGoal);
    });
  });

  describe("ConversionDialog", () => {
    const mockQrCodes = [
      { id: "qr-1", name: "Summer Menu Table Tent" },
      { id: "qr-2", name: "Window Sticker" },
    ];
    const mockCampaigns = [
      { id: "camp-1", name: "Summer Promo 2026" },
      { id: "camp-2", name: "Fall Launch" },
    ];

    it("should render create goal modal with empty inputs", () => {
      render(
        <ConversionDialog
          open={true}
          onOpenChange={vi.fn()}
          qrCodes={mockQrCodes}
          campaigns={mockCampaigns}
        />
      );

      expect(screen.getByText("Create Conversion Goal")).toBeInTheDocument();
      expect(screen.getByLabelText(/Goal Name/i)).toHaveValue("");
      expect(screen.getByLabelText(/Description/i)).toHaveValue("");
      expect(screen.getByLabelText(/Target Pattern/i)).toHaveValue("");
    });

    it("should render edit goal modal prefilled with goal data", () => {
      render(
        <ConversionDialog
          open={true}
          onOpenChange={vi.fn()}
          goal={mockGoal}
          qrCodes={mockQrCodes}
          campaigns={mockCampaigns}
        />
      );

      expect(screen.getByText("Edit Conversion Goal")).toBeInTheDocument();
      expect(screen.getByLabelText(/Goal Name/i)).toHaveValue("Summer Promo Sign-up");
      expect(screen.getByLabelText(/Description/i)).toHaveValue(
        "Tracks newsletter subscriptions from summer flyer QR code"
      );
      expect(screen.getByLabelText(/Target Pattern/i)).toHaveValue("#newsletter-form");
      expect(screen.getByLabelText(/Monetary Value/i)).toHaveValue(15);
    });

    it("should validate required goal name on submit", async () => {
      const onSave = vi.fn();
      render(
        <ConversionDialog
          open={true}
          onOpenChange={vi.fn()}
          onSave={onSave}
        />
      );

      const submitBtn = screen.getByRole("button", { name: /create goal|save goal|save changes/i });
      fireEvent.click(submitBtn);

      expect(await screen.findByText(/Goal name is required/i)).toBeInTheDocument();
      expect(onSave).not.toHaveBeenCalled();
    });

    it("should call onSave with correct payload and converted monetary cents", async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const onOpenChange = vi.fn();

      render(
        <ConversionDialog
          open={true}
          onOpenChange={onOpenChange}
          onSave={onSave}
          qrCodes={mockQrCodes}
          campaigns={mockCampaigns}
        />
      );

      fireEvent.change(screen.getByLabelText(/Goal Name/i), {
        target: { value: "Lead Form Submit" },
      });
      fireEvent.change(screen.getByLabelText(/Description/i), {
        target: { value: "Landing page inquiry" },
      });
      fireEvent.change(screen.getByLabelText(/Target Pattern/i), {
        target: { value: ".lead-form" },
      });
      fireEvent.change(screen.getByLabelText(/Monetary Value/i), {
        target: { value: "25.50" },
      });

      const submitBtn = screen.getByRole("button", { name: /create goal|save goal|save changes/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(onSave).toHaveBeenCalledWith(
          expect.objectContaining({
            name: "Lead Form Submit",
            description: "Landing page inquiry",
            targetPattern: ".lead-form",
            monetaryValue: 2550, // in cents
            isActive: true,
          })
        );
        expect(onOpenChange).toHaveBeenCalledWith(false);
      });
    });

    it("should handle API fetch when onSave is not provided", async () => {
      const mockFetch = vi.spyOn(global, "fetch").mockResolvedValue({
        ok: true,
        json: async () => ({ goal: { id: "goal-new" } }),
      } as any);

      const onOpenChange = vi.fn();
      render(
        <ConversionDialog
          open={true}
          onOpenChange={onOpenChange}
        />
      );

      fireEvent.change(screen.getByLabelText(/Goal Name/i), {
        target: { value: "Checkout Success" },
      });

      const submitBtn = screen.getByRole("button", { name: /create goal|save goal|save changes/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith(
          "/api/conversions",
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
        json: async () => ({ error: "Duplicate goal name exists" }),
      } as any);

      render(
        <ConversionDialog
          open={true}
          onOpenChange={vi.fn()}
        />
      );

      fireEvent.change(screen.getByLabelText(/Goal Name/i), {
        target: { value: "Duplicate Name" },
      });

      const submitBtn = screen.getByRole("button", { name: /create goal|save goal|save changes/i });
      fireEvent.click(submitBtn);

      expect(await screen.findByText("Duplicate goal name exists")).toBeInTheDocument();
      mockFetch.mockRestore();
    });
  });

  describe("SnippetDialog", () => {
    beforeEach(() => {
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn().mockResolvedValue(undefined),
        },
      });
    });

    it("should render code snippets for the given goal", async () => {
      render(
        <SnippetDialog
          open={true}
          onOpenChange={vi.fn()}
          goal={mockGoal}
        />
      );

      expect(screen.getByText("Conversion Tracking Snippet")).toBeInTheDocument();
      expect(screen.getByText(/ScanFlow\.convert\("Summer Promo Sign-up"/i)).toBeInTheDocument();

      // Click HTML tab to verify HTML snippet
      const htmlTab = screen.getByRole("tab", { name: /html/i });
      fireEvent.click(htmlTab);
      expect(await screen.findByText(/data-scanflow-convert="Summer Promo Sign-up"/i)).toBeInTheDocument();
    });

    it("should copy snippet to clipboard on click", async () => {
      render(
        <SnippetDialog
          open={true}
          onOpenChange={vi.fn()}
          goal={mockGoal}
        />
      );

      const copyBtn = screen.getAllByRole("button", { name: /copy/i })[0];
      fireEvent.click(copyBtn);

      await waitFor(() => {
        expect(navigator.clipboard.writeText).toHaveBeenCalledTimes(1);
        expect(screen.getByText(/Copied!/i)).toBeInTheDocument();
      });
    });

    it("should not render snippet content if goal is null", () => {
      const { container } = render(
        <SnippetDialog
          open={true}
          onOpenChange={vi.fn()}
          goal={null}
        />
      );

      expect(container.textContent).not.toContain("ScanFlow.convert");
    });
  });
});
