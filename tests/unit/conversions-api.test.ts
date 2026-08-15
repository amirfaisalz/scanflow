import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/conversions/route";
import {
  GET as getConversionGoal,
  PATCH,
  DELETE,
} from "@/app/api/conversions/[id]/route";
import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

vi.mock("@/lib/auth-helpers", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      conversionGoals: { findMany: vi.fn(), findFirst: vi.fn() },
      sessions: { findMany: vi.fn() },
      qrCodes: { findMany: vi.fn(), findFirst: vi.fn() },
      campaigns: { findMany: vi.fn(), findFirst: vi.fn() },
    },
    insert: vi.fn().mockReturnValue({
      values: vi.fn().mockReturnValue({
        returning: vi.fn(),
      }),
    }),
    update: vi.fn().mockReturnValue({
      set: vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn(),
        }),
      }),
    }),
    delete: vi.fn().mockReturnValue({
      where: vi.fn().mockReturnValue({
        returning: vi.fn(),
      }),
    }),
  },
}));

describe("Conversion Goals CRUD REST API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getCurrentUser as any).mockResolvedValue({
      id: "user-tenant-1",
      email: "tenant@scanflow.io",
    });
  });

  describe("GET /api/conversions", () => {
    it("should return 401 when user is unauthorized", async () => {
      (getCurrentUser as any).mockResolvedValue(null);
      const req = new NextRequest("http://localhost:3000/api/conversions");
      const res = await GET(req);
      expect(res.status).toBe(401);
      const data = await res.json();
      expect(data.error).toBe("Unauthorized");
    });

    it("should return list of conversion goals with calculated performance metrics", async () => {
      const mockGoals = [
        {
          id: "goal-1",
          userId: "user-tenant-1",
          name: "Order Completed",
          description: "Online order checkouts",
          eventType: "BUTTON_CLICK",
          targetPattern: "Order Now",
          qrCodeId: "qr-1",
          campaignId: null,
          monetaryValue: 2500, // $25.00
          currency: "USD",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
          qrCode: { id: "qr-1", name: "Table 1" },
          campaign: null,
        },
        {
          id: "goal-2",
          userId: "user-tenant-1",
          name: "Menu Download",
          description: "PDF menu downloads",
          eventType: "LINK_CLICK",
          targetPattern: "Download Menu",
          qrCodeId: null,
          campaignId: "camp-summer",
          monetaryValue: 0,
          currency: "USD",
          isActive: false,
          createdAt: new Date(),
          updatedAt: new Date(),
          qrCode: null,
          campaign: { id: "camp-summer", name: "Summer Promo" },
        },
      ];

      const mockSessions = [
        {
          id: "sess-1",
          userId: "user-tenant-1",
          qrCodeId: "qr-1",
          campaignId: null,
          converted: true,
          conversionEvent: "Order Completed",
        },
        {
          id: "sess-2",
          userId: "user-tenant-1",
          qrCodeId: "qr-1",
          campaignId: null,
          converted: true,
          conversionEvent: "Order Completed",
        },
        {
          id: "sess-3",
          userId: "user-tenant-1",
          qrCodeId: "qr-1",
          campaignId: null,
          converted: false,
          conversionEvent: null,
        },
        {
          id: "sess-4",
          userId: "user-tenant-1",
          qrCodeId: "qr-2",
          campaignId: "camp-summer",
          converted: true,
          conversionEvent: "Menu Download",
        },
        {
          id: "sess-5",
          userId: "user-tenant-1",
          qrCodeId: "qr-2",
          campaignId: "camp-summer",
          converted: false,
          conversionEvent: null,
        },
      ];

      (db.query.conversionGoals.findMany as any).mockResolvedValue(mockGoals);
      (db.query.sessions.findMany as any).mockResolvedValue(mockSessions);

      const req = new NextRequest("http://localhost:3000/api/conversions");
      const res = await GET(req);
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.goals).toHaveLength(2);

      // Goal 1 stats: qr-1 has 3 sessions total, 2 converted to "Order Completed"
      const goal1 = body.goals[0];
      expect(goal1.id).toBe("goal-1");
      expect(goal1.totalConversions).toBe(2);
      expect(goal1.totalSessions).toBe(3);
      expect(goal1.conversionRate).toBe(66.7); // (2/3)*100 rounded to 1 decimal
      expect(goal1.totalRevenue).toBe(50); // 2 * $25.00

      // Goal 2 stats: camp-summer has 2 sessions, 1 converted to "Menu Download"
      const goal2 = body.goals[1];
      expect(goal2.id).toBe("goal-2");
      expect(goal2.totalConversions).toBe(1);
      expect(goal2.totalSessions).toBe(2);
      expect(goal2.conversionRate).toBe(50);
      expect(goal2.totalRevenue).toBe(0);

      // Metrics overview
      expect(body.metrics).toBeDefined();
      expect(body.metrics.totalConversions).toBe(3);
      expect(body.metrics.totalRevenue).toBe(50);
      expect(body.metrics.activeGoalsCount).toBe(1);
      expect(body.metrics.overallConversionRate).toBe(60); // 3 / 5 = 60%
    });

    it("should handle empty goals and zero sessions without division errors", async () => {
      (db.query.conversionGoals.findMany as any).mockResolvedValue([]);
      (db.query.sessions.findMany as any).mockResolvedValue([]);

      const req = new NextRequest("http://localhost:3000/api/conversions");
      const res = await GET(req);
      expect(res.status).toBe(200);

      const body = await res.json();
      expect(body.goals).toEqual([]);
      expect(body.metrics).toEqual({
        totalConversions: 0,
        totalRevenue: 0,
        activeGoalsCount: 0,
        overallConversionRate: 0,
      });
    });

    it("should handle server/database error gracefully", async () => {
      (db.query.conversionGoals.findMany as any).mockRejectedValue(
        new Error("Database connection lost")
      );
      const req = new NextRequest("http://localhost:3000/api/conversions");
      const res = await GET(req);
      expect(res.status).toBe(500);
      const body = await res.json();
      expect(body.error).toBe("Internal Server Error");
    });
  });

  describe("POST /api/conversions", () => {
    it("should return 401 when unauthorized", async () => {
      (getCurrentUser as any).mockResolvedValue(null);
      const req = new NextRequest("http://localhost:3000/api/conversions", {
        method: "POST",
        body: JSON.stringify({ name: "Sign Up", eventType: "BUTTON_CLICK" }),
      });
      const res = await POST(req);
      expect(res.status).toBe(401);
    });

    it("should return 400 when name is missing or empty", async () => {
      const req = new NextRequest("http://localhost:3000/api/conversions", {
        method: "POST",
        body: JSON.stringify({ name: "", eventType: "BUTTON_CLICK" }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/name is required/i);
    });

    it("should return 400 when eventType is missing or invalid", async () => {
      const req = new NextRequest("http://localhost:3000/api/conversions", {
        method: "POST",
        body: JSON.stringify({ name: "Checkout Goal", eventType: "INVALID_EVENT" }),
      });
      const res = await POST(req);
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/invalid event type/i);
    });

    it("should create conversion goal successfully with default and custom values", async () => {
      const createdGoal = {
        id: "goal_123456",
        userId: "user-tenant-1",
        name: "Purchase Pro Plan",
        description: "User upgraded to Pro",
        eventType: "BUTTON_CLICK",
        targetPattern: "Upgrade Now",
        qrCodeId: "qr-100",
        campaignId: "camp-200",
        monetaryValue: 4900,
        currency: "USD",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const valuesMock = vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([createdGoal]),
      });
      (db.insert as any).mockReturnValue({ values: valuesMock });

      const req = new NextRequest("http://localhost:3000/api/conversions", {
        method: "POST",
        body: JSON.stringify({
          name: "Purchase Pro Plan",
          description: "User upgraded to Pro",
          eventType: "BUTTON_CLICK",
          targetPattern: "Upgrade Now",
          qrCodeId: "qr-100",
          campaignId: "camp-200",
          monetaryValue: 4900,
          currency: "USD",
        }),
      });

      const res = await POST(req);
      expect(res.status).toBe(201);
      const body = await res.json();
      expect(body.goal).toBeDefined();
      expect(body.goal.name).toBe("Purchase Pro Plan");
      expect(body.goal.monetaryValue).toBe(4900);
      expect(valuesMock).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: "user-tenant-1",
          name: "Purchase Pro Plan",
          eventType: "BUTTON_CLICK",
          monetaryValue: 4900,
          currency: "USD",
          isActive: true,
        })
      );
    });

    it("should handle error during creation", async () => {
      const valuesMock = vi.fn().mockReturnValue({
        returning: vi.fn().mockRejectedValue(new Error("Insert failed")),
      });
      (db.insert as any).mockReturnValue({ values: valuesMock });

      const req = new NextRequest("http://localhost:3000/api/conversions", {
        method: "POST",
        body: JSON.stringify({ name: "Checkout", eventType: "CONVERSION" }),
      });
      const res = await POST(req);
      expect(res.status).toBe(500);
    });
  });

  describe("GET /api/conversions/[id]", () => {
    it("should return 401 when unauthorized", async () => {
      (getCurrentUser as any).mockResolvedValue(null);
      const req = new NextRequest("http://localhost:3000/api/conversions/goal-1");
      const res = await getConversionGoal(req, {
        params: Promise.resolve({ id: "goal-1" }),
      });
      expect(res.status).toBe(401);
    });

    it("should return 404 when goal is not found or belongs to another tenant", async () => {
      (db.query.conversionGoals.findFirst as any).mockResolvedValue(null);
      const req = new NextRequest("http://localhost:3000/api/conversions/goal-missing");
      const res = await getConversionGoal(req, {
        params: Promise.resolve({ id: "goal-missing" }),
      });
      expect(res.status).toBe(404);
      const body = await res.json();
      expect(body.error).toBe("Conversion goal not found");
    });

    it("should return conversion goal details", async () => {
      const mockGoal = {
        id: "goal-1",
        userId: "user-tenant-1",
        name: "Newsletter Signup",
        description: "Subscribed via landing page",
        eventType: "FORM_SUBMIT",
        targetPattern: "newsletter_form",
        qrCodeId: null,
        campaignId: null,
        monetaryValue: 500,
        currency: "USD",
        isActive: true,
        qrCode: null,
        campaign: null,
      };

      (db.query.conversionGoals.findFirst as any).mockResolvedValue(mockGoal);

      const req = new NextRequest("http://localhost:3000/api/conversions/goal-1");
      const res = await getConversionGoal(req, {
        params: Promise.resolve({ id: "goal-1" }),
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.goal.name).toBe("Newsletter Signup");
      expect(body.goal.monetaryValue).toBe(500);
    });
  });

  describe("PATCH /api/conversions/[id]", () => {
    it("should return 401 when unauthorized", async () => {
      (getCurrentUser as any).mockResolvedValue(null);
      const req = new NextRequest("http://localhost:3000/api/conversions/goal-1", {
        method: "PATCH",
        body: JSON.stringify({ name: "Updated Name" }),
      });
      const res = await PATCH(req, {
        params: Promise.resolve({ id: "goal-1" }),
      });
      expect(res.status).toBe(401);
    });

    it("should return 404 when goal does not exist", async () => {
      (db.query.conversionGoals.findFirst as any).mockResolvedValue(null);
      const req = new NextRequest("http://localhost:3000/api/conversions/goal-1", {
        method: "PATCH",
        body: JSON.stringify({ name: "Updated Name" }),
      });
      const res = await PATCH(req, {
        params: Promise.resolve({ id: "goal-1" }),
      });
      expect(res.status).toBe(404);
    });

    it("should return 400 when updating with empty name", async () => {
      (db.query.conversionGoals.findFirst as any).mockResolvedValue({
        id: "goal-1",
        userId: "user-tenant-1",
      });

      const req = new NextRequest("http://localhost:3000/api/conversions/goal-1", {
        method: "PATCH",
        body: JSON.stringify({ name: "   " }),
      });
      const res = await PATCH(req, {
        params: Promise.resolve({ id: "goal-1" }),
      });
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/name cannot be empty/i);
    });

    it("should return 400 when updating with invalid eventType", async () => {
      (db.query.conversionGoals.findFirst as any).mockResolvedValue({
        id: "goal-1",
        userId: "user-tenant-1",
      });

      const req = new NextRequest("http://localhost:3000/api/conversions/goal-1", {
        method: "PATCH",
        body: JSON.stringify({ eventType: "UNSUPPORTED_TYPE" }),
      });
      const res = await PATCH(req, {
        params: Promise.resolve({ id: "goal-1" }),
      });
      expect(res.status).toBe(400);
      const body = await res.json();
      expect(body.error).toMatch(/invalid event type/i);
    });

    it("should update goal successfully", async () => {
      (db.query.conversionGoals.findFirst as any).mockResolvedValue({
        id: "goal-1",
        userId: "user-tenant-1",
      });

      const updatedGoal = {
        id: "goal-1",
        userId: "user-tenant-1",
        name: "VIP Checkout",
        description: "Updated VIP checkout goal",
        eventType: "BUTTON_CLICK",
        targetPattern: "btn-vip-checkout",
        qrCodeId: "qr-vip",
        campaignId: "camp-vip",
        monetaryValue: 9900,
        currency: "EUR",
        isActive: false,
      };

      const setMock = vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([updatedGoal]),
        }),
      });
      (db.update as any).mockReturnValue({ set: setMock });

      const req = new NextRequest("http://localhost:3000/api/conversions/goal-1", {
        method: "PATCH",
        body: JSON.stringify({
          name: "VIP Checkout",
          description: "Updated VIP checkout goal",
          eventType: "BUTTON_CLICK",
          targetPattern: "btn-vip-checkout",
          qrCodeId: "qr-vip",
          campaignId: "camp-vip",
          monetaryValue: 9900,
          currency: "EUR",
          isActive: false,
        }),
      });

      const res = await PATCH(req, {
        params: Promise.resolve({ id: "goal-1" }),
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.goal.name).toBe("VIP Checkout");
      expect(body.goal.isActive).toBe(false);
      expect(body.goal.currency).toBe("EUR");
    });
  });

  describe("DELETE /api/conversions/[id]", () => {
    it("should return 401 when unauthorized", async () => {
      (getCurrentUser as any).mockResolvedValue(null);
      const req = new NextRequest("http://localhost:3000/api/conversions/goal-1", {
        method: "DELETE",
      });
      const res = await DELETE(req, {
        params: Promise.resolve({ id: "goal-1" }),
      });
      expect(res.status).toBe(401);
    });

    it("should return 404 when goal does not exist", async () => {
      (db.query.conversionGoals.findFirst as any).mockResolvedValue(null);
      const req = new NextRequest("http://localhost:3000/api/conversions/goal-1", {
        method: "DELETE",
      });
      const res = await DELETE(req, {
        params: Promise.resolve({ id: "goal-1" }),
      });
      expect(res.status).toBe(404);
    });

    it("should delete goal successfully", async () => {
      (db.query.conversionGoals.findFirst as any).mockResolvedValue({
        id: "goal-1",
        userId: "user-tenant-1",
      });

      (db.delete as any).mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: "goal-1" }]),
        }),
      });

      const req = new NextRequest("http://localhost:3000/api/conversions/goal-1", {
        method: "DELETE",
      });

      const res = await DELETE(req, {
        params: Promise.resolve({ id: "goal-1" }),
      });
      expect(res.status).toBe(200);
      const body = await res.json();
      expect(body.success).toBe(true);
    });
  });
});
