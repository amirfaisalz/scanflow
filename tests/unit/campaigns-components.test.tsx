import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { CampaignCard } from "@/components/campaigns/campaign-card";
import { CampaignDialog } from "@/components/campaigns/campaign-dialog";

describe("Campaigns UI Components", () => {
  const mockCampaign = {
    id: "camp-1",
    name: "Summer Restaurant Promo 2026",
    description: "All table tents and flyer QR codes for summer menu",
    status: "active" as const,
    qrCodesCount: 4,
    totalScans: 1280,
    totalSessions: 840,
    conversions: 98,
    conversionRate: 11.7,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  it("should render CampaignCard with stats and badges", () => {
    const onEdit = vi.fn();
    const onDelete = vi.fn();
    const onStatusToggle = vi.fn();

    render(
      <CampaignCard
        campaign={mockCampaign as any}
        onEdit={onEdit}
        onDelete={onDelete}
        onStatusToggle={onStatusToggle}
      />
    );

    expect(screen.getByText("Summer Restaurant Promo 2026")).toBeDefined();
    expect(screen.getByText(/All table tents and flyer QR codes/i)).toBeDefined();
    expect(screen.getByText("1,280")).toBeDefined();
    expect(screen.getByText("11.7%")).toBeDefined();
    expect(screen.getByText("4")).toBeDefined();
  });

  it("should render CampaignDialog with input fields", () => {
    const onSave = vi.fn();
    render(
      <CampaignDialog
        open={true}
        onOpenChange={() => {}}
        onSave={onSave}
      />
    );

    expect(screen.getAllByText("Create Campaign").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByLabelText(/Campaign Name/i)).toBeDefined();
    expect(screen.getByLabelText(/Description/i)).toBeDefined();
  });
});
