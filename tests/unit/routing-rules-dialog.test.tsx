import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import { RoutingRulesDialog } from "@/components/qr/routing-rules-dialog";

// Mock fetch
const mockRules = [
  {
    id: "rule-1",
    qrCodeId: "qr-1",
    priority: 1,
    conditionType: "os",
    conditionValue: "ios",
    destinationUrl: "https://apps.apple.com/app/scanflow",
    isActive: true,
  },
];

describe("RoutingRulesDialog Component", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.stubGlobal(
      "fetch",
      vi.fn().mockResolvedValue({
        ok: true,
        json: async () => ({ rules: mockRules }),
      })
    );
  });

  it("should render dialog title and existing routing rules", async () => {
    render(
      <RoutingRulesDialog
        qrCode={{ id: "qr-1", name: "Summer Promo", destinationUrl: "https://example.com" } as any}
        open={true}
        onOpenChange={() => {}}
      />
    );

    expect(screen.getByText(/Dynamic Routing Rules/i)).toBeDefined();
    await waitFor(() => {
      expect(screen.getByText("https://apps.apple.com/app/scanflow")).toBeDefined();
      expect(screen.getByText("ios")).toBeDefined();
    });
  });

  it("should render add rule form inputs and button", async () => {
    render(
      <RoutingRulesDialog
        qrCode={{ id: "qr-1", name: "Summer Promo", destinationUrl: "https://example.com" } as any}
        open={true}
        onOpenChange={() => {}}
      />
    );

    expect(screen.getByRole("button", { name: /Add Rule/i })).toBeDefined();
  });
});
