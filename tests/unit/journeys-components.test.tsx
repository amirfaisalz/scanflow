import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { JourneysTable } from "@/components/journeys/journeys-table";
import { JourneyTimeline } from "@/components/journeys/journey-detail-sheet";

describe("Scan Journey UI Components", () => {
  const mockJourneys = [
    {
      id: "sess_test_12345",
      qrCodeId: "qr-1",
      qrName: "Restaurant Table Menu",
      qrSlug: "table-menu",
      deviceType: "mobile",
      os: "iOS",
      browser: "Safari",
      country: "ID",
      city: "Jakarta",
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
      durationSeconds: 68,
      eventsCount: 4,
      converted: true,
      conversionEvent: "Order Complete",
    },
    {
      id: "sess_test_67890",
      qrCodeId: "qr-2",
      qrName: "Promo Flyer",
      qrSlug: "promo-flyer",
      deviceType: "desktop",
      os: "Windows",
      browser: "Chrome",
      country: "US",
      city: "New York",
      startedAt: new Date().toISOString(),
      endedAt: new Date().toISOString(),
      durationSeconds: 12,
      eventsCount: 1,
      converted: false,
      conversionEvent: null,
    },
  ];

  it("should render journey list table headers and items", () => {
    const onSelect = vi.fn();
    render(<JourneysTable journeys={mockJourneys as any} onSelectJourney={onSelect} />);

    expect(screen.getByText("Restaurant Table Menu")).toBeDefined();
    expect(screen.getByText("Promo Flyer")).toBeDefined();
    expect(screen.getByText("Converted")).toBeDefined();
    expect(screen.getByText("Drop-off")).toBeDefined();

    const viewButtons = screen.getAllByRole("button", { name: /View Journey/i });
    expect(viewButtons.length).toBe(2);
    fireEvent.click(viewButtons[0]);
    expect(onSelect).toHaveBeenCalledWith(mockJourneys[0]);
  });

  it("should render visual step-by-step visitor timeline", () => {
    const mockSession = mockJourneys[0];
    const mockEvents = [
      {
        id: "evt-1",
        eventType: "QR_SCAN",
        eventData: {
          destinationUrl: "https://restaurant.com/menu",
          matchedRuleId: "rule-1",
          conditionMatched: "os:ios",
        },
        timestamp: new Date("2026-08-15T10:00:00Z").toISOString(),
      },
      {
        id: "evt-2",
        eventType: "PAGE_VIEW",
        eventData: { page: "/menu/summer-special" },
        timestamp: new Date("2026-08-15T10:00:05Z").toISOString(),
      },
      {
        id: "evt-3",
        eventType: "BUTTON_CLICK",
        eventData: { buttonId: "order-bowl", target: "Salmon Poke Bowl" },
        timestamp: new Date("2026-08-15T10:00:40Z").toISOString(),
      },
      {
        id: "evt-4",
        eventType: "CONVERSION",
        eventData: { goal: "Order Complete", orderId: "ORD-999" },
        timestamp: new Date("2026-08-15T10:01:08Z").toISOString(),
      },
    ];

    render(<JourneyTimeline session={mockSession as any} events={mockEvents as any} />);

    expect(screen.getByText("QR Scan Detected")).toBeDefined();
    expect(screen.getByText("Page View")).toBeDefined();
    expect(screen.getByText("User Interaction")).toBeDefined();
    expect(screen.getByText("Goal Conversion Achieved")).toBeDefined();
    expect(screen.getByText(/Salmon Poke Bowl/i)).toBeDefined();
  });
});
