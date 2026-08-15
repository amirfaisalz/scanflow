import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  recordSessionEvent,
  evaluateGoalMatch,
  matchesTargetPattern,
} from "@/lib/analytics/tracker";
import { db } from "@/lib/db";

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      sessions: { findFirst: vi.fn() },
      conversionGoals: { findMany: vi.fn() },
    },
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockResolvedValue([]),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockResolvedValue([]),
      }),
    }),
  },
}));

describe("Automatic Conversion Tracker Engine", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Pattern Matching Helper (matchesTargetPattern)", () => {
    it("should return true when target pattern is empty or null", () => {
      expect(matchesTargetPattern("", { label: "Click Me" })).toBe(true);
      expect(matchesTargetPattern("   ", { label: "Click Me" })).toBe(true);
    });

    it("should match target pattern against standard eventData fields (exact & case-insensitive)", () => {
      expect(matchesTargetPattern("Order Now", { label: "order now" })).toBe(true);
      expect(matchesTargetPattern("checkout", { path: "/checkout" })).toBe(true);
      expect(matchesTargetPattern("submit_btn", { id: "submit_btn" })).toBe(true);
      expect(matchesTargetPattern("Buy Product", { name: "Buy Product" })).toBe(true);
      expect(matchesTargetPattern("Pricing CTA", { text: "pricing cta" })).toBe(true);
      expect(matchesTargetPattern("newsletter-signup", { target: "newsletter-signup" })).toBe(true);
      expect(matchesTargetPattern("lead_captured", { goal: "lead_captured" })).toBe(true);
    });

    it("should support regex matching in pattern", () => {
      expect(matchesTargetPattern("^/checkout/.*", { path: "/checkout/success" })).toBe(true);
      expect(matchesTargetPattern("^btn-.*-submit", { id: "btn-primary-submit" })).toBe(true);
      expect(matchesTargetPattern("^/dashboard", { path: "/settings" })).toBe(false);
    });

    it("should return false when eventData fields do not match pattern", () => {
      expect(matchesTargetPattern("Order Now", { label: "Contact Us" })).toBe(false);
      expect(matchesTargetPattern("Order Now", {})).toBe(false);
    });
  });

  describe("Goal Evaluation Helper (evaluateGoalMatch)", () => {
    const baseGoal = {
      id: "goal-1",
      userId: "user-1",
      name: "Purchase Goal",
      eventType: "BUTTON_CLICK",
      targetPattern: "Order Now",
      qrCodeId: null,
      campaignId: null,
      isActive: true,
      monetaryValue: 1500,
      currency: "USD",
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    it("should return false if goal is inactive", () => {
      const inactiveGoal = { ...baseGoal, isActive: false };
      const match = evaluateGoalMatch(inactiveGoal, {
        eventType: "BUTTON_CLICK",
        eventData: { label: "Order Now" },
        qrCodeId: "qr-1",
        campaignId: null,
      });
      expect(match).toBe(false);
    });

    it("should match event type and pattern", () => {
      const match = evaluateGoalMatch(baseGoal, {
        eventType: "BUTTON_CLICK",
        eventData: { label: "Order Now" },
        qrCodeId: "qr-1",
        campaignId: null,
      });
      expect(match).toBe(true);
    });

    it("should not match if eventType differs", () => {
      const match = evaluateGoalMatch(baseGoal, {
        eventType: "PAGE_VIEW",
        eventData: { label: "Order Now" },
        qrCodeId: "qr-1",
        campaignId: null,
      });
      expect(match).toBe(false);
    });

    it("should match generic CONVERSION goal type with matching target pattern", () => {
      const conversionGoal = { ...baseGoal, eventType: "CONVERSION", targetPattern: "Checkout" };
      const match = evaluateGoalMatch(conversionGoal, {
        eventType: "BUTTON_CLICK",
        eventData: { label: "Checkout" },
        qrCodeId: "qr-1",
        campaignId: null,
      });
      expect(match).toBe(true);
    });

    it("should enforce qrCodeId scoping when defined on goal", () => {
      const scopedGoal = { ...baseGoal, qrCodeId: "qr-premium" };

      // Matching QR
      expect(
        evaluateGoalMatch(scopedGoal, {
          eventType: "BUTTON_CLICK",
          eventData: { label: "Order Now" },
          qrCodeId: "qr-premium",
          campaignId: null,
        })
      ).toBe(true);

      // Different QR
      expect(
        evaluateGoalMatch(scopedGoal, {
          eventType: "BUTTON_CLICK",
          eventData: { label: "Order Now" },
          qrCodeId: "qr-standard",
          campaignId: null,
        })
      ).toBe(false);
    });

    it("should enforce campaignId scoping when defined on goal", () => {
      const scopedGoal = { ...baseGoal, campaignId: "camp-summer" };

      // Matching Campaign
      expect(
        evaluateGoalMatch(scopedGoal, {
          eventType: "BUTTON_CLICK",
          eventData: { label: "Order Now" },
          qrCodeId: "qr-1",
          campaignId: "camp-summer",
        })
      ).toBe(true);

      // Different Campaign
      expect(
        evaluateGoalMatch(scopedGoal, {
          eventType: "BUTTON_CLICK",
          eventData: { label: "Order Now" },
          qrCodeId: "qr-1",
          campaignId: "camp-winter",
        })
      ).toBe(false);

      // Missing Campaign
      expect(
        evaluateGoalMatch(scopedGoal, {
          eventType: "BUTTON_CLICK",
          eventData: { label: "Order Now" },
          qrCodeId: "qr-1",
          campaignId: null,
        })
      ).toBe(false);
    });
  });

  describe("recordSessionEvent with Automatic Goal Evaluation", () => {
    const mockSession = {
      id: "sess-abc",
      qrCodeId: "qr-123",
      campaignId: "camp-promo",
      userId: "user-tenant-1",
      startedAt: new Date(Date.now() - 30000), // 30s ago
      eventsCount: 1,
      converted: false,
      conversionEvent: null,
    };

    it("should return error if session does not exist", async () => {
      (db.query.sessions.findFirst as any).mockResolvedValue(null);

      const result = await recordSessionEvent({
        sessionId: "non-existent-session",
        eventType: "PAGE_VIEW",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("Session not found");
    });

    it("should automatically convert session when event matches an active goal", async () => {
      (db.query.sessions.findFirst as any).mockResolvedValue({ ...mockSession });
      (db.query.conversionGoals.findMany as any).mockResolvedValue([
        {
          id: "goal-btn-order",
          userId: "user-tenant-1",
          name: "Order Completed",
          eventType: "BUTTON_CLICK",
          targetPattern: "Order Now",
          qrCodeId: null,
          campaignId: null,
          isActive: true,
        },
      ]);

      const result = await recordSessionEvent({
        sessionId: "sess-abc",
        eventType: "BUTTON_CLICK",
        eventData: { label: "Order Now", price: 29.99 },
      });

      expect(result.success).toBe(true);
      expect(result.converted).toBe(true);
      expect(result.conversionEvent).toBe("Order Completed");

      // Verify db.update set conversion flag and event name
      expect(db.update).toHaveBeenCalled();
    });

    it("should ignore inactive goals during evaluation", async () => {
      (db.query.sessions.findFirst as any).mockResolvedValue({ ...mockSession });
      (db.query.conversionGoals.findMany as any).mockResolvedValue([]);

      const result = await recordSessionEvent({
        sessionId: "sess-abc",
        eventType: "BUTTON_CLICK",
        eventData: { label: "Order Now" },
      });

      expect(result.success).toBe(true);
      expect(result.converted).toBe(false);
      expect(result.conversionEvent).toBeNull();
    });

    it("should not convert when pattern does not match goal targetPattern", async () => {
      (db.query.sessions.findFirst as any).mockResolvedValue({ ...mockSession });
      (db.query.conversionGoals.findMany as any).mockResolvedValue([
        {
          id: "goal-form-signup",
          userId: "user-tenant-1",
          name: "Newsletter Signup",
          eventType: "FORM_SUBMIT",
          targetPattern: "newsletter_form",
          isActive: true,
        },
      ]);

      const result = await recordSessionEvent({
        sessionId: "sess-abc",
        eventType: "FORM_SUBMIT",
        eventData: { id: "contact_us_form" },
      });

      expect(result.success).toBe(true);
      expect(result.converted).toBe(false);
      expect(result.conversionEvent).toBeNull();
    });

    it("should support direct fallback CONVERSION event when no goals match", async () => {
      (db.query.sessions.findFirst as any).mockResolvedValue({ ...mockSession });
      (db.query.conversionGoals.findMany as any).mockResolvedValue([]);

      const result = await recordSessionEvent({
        sessionId: "sess-abc",
        eventType: "CONVERSION",
        eventData: { goal: "Custom Direct Goal" },
      });

      expect(result.success).toBe(true);
      expect(result.converted).toBe(true);
      expect(result.conversionEvent).toBe("Custom Direct Goal");
    });

    it("should preserve already converted state on subsequent non-converting events", async () => {
      const alreadyConvertedSession = {
        ...mockSession,
        converted: true,
        conversionEvent: "Previous Goal",
        eventsCount: 3,
      };

      (db.query.sessions.findFirst as any).mockResolvedValue(alreadyConvertedSession);
      (db.query.conversionGoals.findMany as any).mockResolvedValue([]);

      const result = await recordSessionEvent({
        sessionId: "sess-abc",
        eventType: "PAGE_VIEW",
        eventData: { path: "/about" },
      });

      expect(result.success).toBe(true);
      expect(result.converted).toBe(true);
      expect(result.conversionEvent).toBe("Previous Goal");
    });
  });
});
