import { describe, it, expect, vi, beforeEach } from "vitest";
import { GET, POST } from "@/app/api/qr-codes/[id]/rules/route";
import { PUT, DELETE } from "@/app/api/qr-codes/[id]/rules/[ruleId]/route";
import { NextRequest } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";

vi.mock("@/lib/auth-helpers", () => ({
  getCurrentUser: vi.fn(),
}));

vi.mock("@/lib/db", () => ({
  db: {
    query: {
      qrCodes: { findFirst: vi.fn() },
      routingRules: { findMany: vi.fn(), findFirst: vi.fn() },
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

describe("Routing Rules Management API", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (getCurrentUser as any).mockResolvedValue({ id: "user-1", email: "user@example.com" });
  });

  describe("GET /api/qr-codes/[id]/rules", () => {
    it("should return 401 when not authenticated", async () => {
      (getCurrentUser as any).mockResolvedValue(null);
      const req = new NextRequest("http://localhost:3000/api/qr-codes/qr-1/rules");
      const res = await GET(req, { params: Promise.resolve({ id: "qr-1" }) });
      expect(res.status).toBe(401);
    });

    it("should return 404 when QR code is not owned by user", async () => {
      (db.query.qrCodes.findFirst as any).mockResolvedValue(null);
      const req = new NextRequest("http://localhost:3000/api/qr-codes/qr-not-found/rules");
      const res = await GET(req, { params: Promise.resolve({ id: "qr-not-found" }) });
      expect(res.status).toBe(404);
    });

    it("should return list of routing rules for authorized QR code", async () => {
      (db.query.qrCodes.findFirst as any).mockResolvedValue({ id: "qr-1", userId: "user-1" });
      (db.query.routingRules.findMany as any).mockResolvedValue([
        {
          id: "rule-1",
          qrCodeId: "qr-1",
          userId: "user-1",
          priority: 1,
          conditionType: "os",
          conditionValue: "ios",
          destinationUrl: "https://apps.apple.com/123",
          isActive: true,
        },
      ]);

      const req = new NextRequest("http://localhost:3000/api/qr-codes/qr-1/rules");
      const res = await GET(req, { params: Promise.resolve({ id: "qr-1" }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.rules).toHaveLength(1);
      expect(data.rules[0].conditionValue).toBe("ios");
    });
  });

  describe("POST /api/qr-codes/[id]/rules", () => {
    it("should validate destination URL and condition types", async () => {
      (db.query.qrCodes.findFirst as any).mockResolvedValue({ id: "qr-1", userId: "user-1" });

      const req = new NextRequest("http://localhost:3000/api/qr-codes/qr-1/rules", {
        method: "POST",
        body: JSON.stringify({
          conditionType: "invalid_type",
          conditionValue: "ios",
          destinationUrl: "not-a-url",
        }),
      });

      const res = await POST(req, { params: Promise.resolve({ id: "qr-1" }) });
      expect(res.status).toBe(400);
    });

    it("should create new rule successfully", async () => {
      (db.query.qrCodes.findFirst as any).mockResolvedValue({ id: "qr-1", userId: "user-1" });
      const createdRule = {
        id: "rule-new",
        qrCodeId: "qr-1",
        userId: "user-1",
        priority: 1,
        conditionType: "os",
        conditionValue: "ios",
        destinationUrl: "https://apps.apple.com/app/123",
        isActive: true,
      };

      const valuesMock = vi.fn().mockReturnValue({
        returning: vi.fn().mockResolvedValue([createdRule]),
      });
      (db.insert as any).mockReturnValue({ values: valuesMock });

      const req = new NextRequest("http://localhost:3000/api/qr-codes/qr-1/rules", {
        method: "POST",
        body: JSON.stringify({
          conditionType: "os",
          conditionValue: "ios",
          destinationUrl: "https://apps.apple.com/app/123",
          priority: 1,
        }),
      });

      const res = await POST(req, { params: Promise.resolve({ id: "qr-1" }) });
      expect(res.status).toBe(201);
      const data = await res.json();
      expect(data.rule.id).toBe("rule-new");
    });
  });

  describe("PUT /api/qr-codes/[id]/rules/[ruleId]", () => {
    it("should update existing rule", async () => {
      (db.query.routingRules.findFirst as any).mockResolvedValue({
        id: "rule-1",
        qrCodeId: "qr-1",
        userId: "user-1",
      });

      const updatedRule = {
        id: "rule-1",
        qrCodeId: "qr-1",
        userId: "user-1",
        priority: 2,
        conditionType: "country",
        conditionValue: "id",
        destinationUrl: "https://id.scanflow.app",
        isActive: true,
      };

      const setMock = vi.fn().mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([updatedRule]),
        }),
      });
      (db.update as any).mockReturnValue({ set: setMock });

      const req = new NextRequest("http://localhost:3000/api/qr-codes/qr-1/rules/rule-1", {
        method: "PUT",
        body: JSON.stringify({
          priority: 2,
          conditionType: "country",
          conditionValue: "id",
          destinationUrl: "https://id.scanflow.app",
          isActive: true,
        }),
      });

      const res = await PUT(req, { params: Promise.resolve({ id: "qr-1", ruleId: "rule-1" }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.rule.conditionValue).toBe("id");
    });
  });

  describe("DELETE /api/qr-codes/[id]/rules/[ruleId]", () => {
    it("should delete existing rule", async () => {
      (db.query.routingRules.findFirst as any).mockResolvedValue({
        id: "rule-1",
        qrCodeId: "qr-1",
        userId: "user-1",
      });

      (db.delete as any).mockReturnValue({
        where: vi.fn().mockReturnValue({
          returning: vi.fn().mockResolvedValue([{ id: "rule-1" }]),
        }),
      });

      const req = new NextRequest("http://localhost:3000/api/qr-codes/qr-1/rules/rule-1", {
        method: "DELETE",
      });

      const res = await DELETE(req, { params: Promise.resolve({ id: "qr-1", ruleId: "rule-1" }) });
      expect(res.status).toBe(200);
      const data = await res.json();
      expect(data.success).toBe(true);
    });
  });
});
