import { describe, it, expect, vi, beforeEach } from "vitest";
import { NextRequest } from "next/server";
import * as authHelpers from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { GET as listQrCodes, POST as createQrCode } from "@/app/api/qr-codes/route";
import {
  GET as getSingleQrCode,
  PATCH as updateQrCode,
  DELETE as deleteQrCode,
} from "@/app/api/qr-codes/[id]/route";
import { POST as duplicateQrCode } from "@/app/api/qr-codes/[id]/duplicate/route";

vi.mock("@/lib/auth-helpers", () => ({
  getCurrentUser: vi.fn(),
  getCurrentSession: vi.fn(),
  requireAuth: vi.fn(),
}));

vi.mock("@/lib/db", () => {
  const mockDb = {
    select: vi.fn(),
    insert: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  };
  return {
    db: mockDb,
    default: mockDb,
  };
});

describe("QR Codes API Routes", () => {
  const mockUser = {
    id: "user_123",
    email: "test@scanflow.io",
    name: "Test User",
  };

  const sampleQr = {
    id: "qr_123",
    userId: "user_123",
    campaignId: null,
    name: "Table 1 Promo",
    slug: "table-1-promo",
    destinationUrl: "https://example.com/menu",
    status: "active",
    foregroundColor: "#000000",
    backgroundColor: "#ffffff",
    scanCount: 15,
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("GET /api/qr-codes (List)", () => {
    it("returns 401 if user is not authenticated", async () => {
      vi.mocked(authHelpers.getCurrentUser).mockResolvedValue(null);

      const req = new NextRequest("http://localhost:3000/api/qr-codes");
      const res = await listQrCodes(req);
      const data = await res.json();

      expect(res.status).toBe(401);
      expect(data.error).toBe("Unauthorized");
    });

    it("returns user-isolated QR codes with search and filter parameters", async () => {
      vi.mocked(authHelpers.getCurrentUser).mockResolvedValue(mockUser as any);

      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockOrderBy = vi.fn().mockResolvedValue([sampleQr]);

      vi.mocked(db.select).mockReturnValue({
        from: mockFrom.mockReturnValue({
          where: mockWhere.mockReturnValue({
            orderBy: mockOrderBy,
          }),
        }),
      } as any);

      const req = new NextRequest(
        "http://localhost:3000/api/qr-codes?search=promo&status=active"
      );
      const res = await listQrCodes(req);
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data).toHaveLength(1);
      expect(data.data[0].slug).toBe("table-1-promo");
    });
  });

  describe("POST /api/qr-codes (Create)", () => {
    it("returns 401 if unauthenticated", async () => {
      vi.mocked(authHelpers.getCurrentUser).mockResolvedValue(null);

      const req = new NextRequest("http://localhost:3000/api/qr-codes", {
        method: "POST",
        body: JSON.stringify({ name: "Test" }),
      });
      const res = await createQrCode(req);
      expect(res.status).toBe(401);
    });

    it("returns 400 if validation fails", async () => {
      vi.mocked(authHelpers.getCurrentUser).mockResolvedValue(mockUser as any);

      const req = new NextRequest("http://localhost:3000/api/qr-codes", {
        method: "POST",
        body: JSON.stringify({
          name: "",
          destinationUrl: "invalid-url",
          slug: "",
        }),
      });
      const res = await createQrCode(req);
      const data = await res.json();

      expect(res.status).toBe(400);
      expect(data.error).toBe("Validation failed");
    });

    it("returns 409 if slug is already in use", async () => {
      vi.mocked(authHelpers.getCurrentUser).mockResolvedValue(mockUser as any);

      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([{ id: "existing_qr" }]);

      vi.mocked(db.select).mockReturnValue({
        from: mockFrom.mockReturnValue({
          where: mockWhere.mockReturnValue({
            limit: mockLimit,
          }),
        }),
      } as any);

      const req = new NextRequest("http://localhost:3000/api/qr-codes", {
        method: "POST",
        body: JSON.stringify({
          name: "Promo 1",
          destinationUrl: "https://example.com",
          slug: "existing-slug",
        }),
      });
      const res = await createQrCode(req);
      const data = await res.json();

      expect(res.status).toBe(409);
      expect(data.error).toContain("Slug is already in use");
    });

    it("creates QR code successfully with 201 status", async () => {
      vi.mocked(authHelpers.getCurrentUser).mockResolvedValue(mockUser as any);

      // Slug check returns empty
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([]);

      vi.mocked(db.select).mockReturnValue({
        from: mockFrom.mockReturnValue({
          where: mockWhere.mockReturnValue({
            limit: mockLimit,
          }),
        }),
      } as any);

      const mockValues = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue([sampleQr]);

      vi.mocked(db.insert).mockReturnValue({
        values: mockValues.mockReturnValue({
          returning: mockReturning,
        }),
      } as any);

      const req = new NextRequest("http://localhost:3000/api/qr-codes", {
        method: "POST",
        body: JSON.stringify({
          name: "Table 1 Promo",
          destinationUrl: "https://example.com/menu",
          slug: "table-1-promo",
          status: "active",
          foregroundColor: "#000000",
          backgroundColor: "#ffffff",
        }),
      });
      const res = await createQrCode(req);
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.data.name).toBe("Table 1 Promo");
    });
  });

  describe("GET /api/qr-codes/[id] (Single)", () => {
    it("returns 404 if QR code is not found or not owned by user", async () => {
      vi.mocked(authHelpers.getCurrentUser).mockResolvedValue(mockUser as any);

      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([]);

      vi.mocked(db.select).mockReturnValue({
        from: mockFrom.mockReturnValue({
          where: mockWhere.mockReturnValue({
            limit: mockLimit,
          }),
        }),
      } as any);

      const req = new NextRequest("http://localhost:3000/api/qr-codes/qr_999");
      const res = await getSingleQrCode(req, { params: Promise.resolve({ id: "qr_999" }) });
      expect(res.status).toBe(404);
    });

    it("returns QR code if found and owned by user", async () => {
      vi.mocked(authHelpers.getCurrentUser).mockResolvedValue(mockUser as any);

      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([sampleQr]);

      vi.mocked(db.select).mockReturnValue({
        from: mockFrom.mockReturnValue({
          where: mockWhere.mockReturnValue({
            limit: mockLimit,
          }),
        }),
      } as any);

      const req = new NextRequest("http://localhost:3000/api/qr-codes/qr_123");
      const res = await getSingleQrCode(req, { params: Promise.resolve({ id: "qr_123" }) });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data.id).toBe("qr_123");
    });
  });

  describe("PATCH /api/qr-codes/[id] (Update)", () => {
    it("updates QR code successfully", async () => {
      vi.mocked(authHelpers.getCurrentUser).mockResolvedValue(mockUser as any);

      // Ownership check returns sampleQr
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi.fn().mockResolvedValue([sampleQr]);

      vi.mocked(db.select).mockReturnValue({
        from: mockFrom.mockReturnValue({
          where: mockWhere.mockReturnValue({
            limit: mockLimit,
          }),
        }),
      } as any);

      const updatedQr = { ...sampleQr, name: "Updated Name", status: "paused" };
      const mockSet = vi.fn().mockReturnThis();
      const mockUpdateWhere = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue([updatedQr]);

      vi.mocked(db.update).mockReturnValue({
        set: mockSet.mockReturnValue({
          where: mockUpdateWhere.mockReturnValue({
            returning: mockReturning,
          }),
        }),
      } as any);

      const req = new NextRequest("http://localhost:3000/api/qr-codes/qr_123", {
        method: "PATCH",
        body: JSON.stringify({ name: "Updated Name", status: "paused" }),
      });
      const res = await updateQrCode(req, { params: Promise.resolve({ id: "qr_123" }) });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.data.name).toBe("Updated Name");
      expect(data.data.status).toBe("paused");
    });
  });

  describe("DELETE /api/qr-codes/[id] (Delete)", () => {
    it("deletes QR code scoped to user", async () => {
      vi.mocked(authHelpers.getCurrentUser).mockResolvedValue(mockUser as any);

      const mockWhere = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue([{ id: "qr_123" }]);

      vi.mocked(db.delete).mockReturnValue({
        where: mockWhere.mockReturnValue({
          returning: mockReturning,
        }),
      } as any);

      const req = new NextRequest("http://localhost:3000/api/qr-codes/qr_123", {
        method: "DELETE",
      });
      const res = await deleteQrCode(req, { params: Promise.resolve({ id: "qr_123" }) });
      const data = await res.json();

      expect(res.status).toBe(200);
      expect(data.id).toBe("qr_123");
    });
  });

  describe("POST /api/qr-codes/[id]/duplicate (Duplicate)", () => {
    it("duplicates QR code with unique slug and (Copy) appended to name", async () => {
      vi.mocked(authHelpers.getCurrentUser).mockResolvedValue(mockUser as any);

      // Source QR lookup
      const mockFrom = vi.fn().mockReturnThis();
      const mockWhere = vi.fn().mockReturnThis();
      const mockLimit = vi
        .fn()
        .mockResolvedValueOnce([sampleQr]) // Source QR found
        .mockResolvedValueOnce([]); // Duplicate candidate slug available

      vi.mocked(db.select).mockReturnValue({
        from: mockFrom.mockReturnValue({
          where: mockWhere.mockReturnValue({
            limit: mockLimit,
          }),
        }),
      } as any);

      const duplicatedRecord = {
        ...sampleQr,
        id: "qr_duplicate_456",
        name: "Table 1 Promo (Copy)",
        slug: "table-1-promo-copy",
        scanCount: 0,
      };

      const mockValues = vi.fn().mockReturnThis();
      const mockReturning = vi.fn().mockResolvedValue([duplicatedRecord]);

      vi.mocked(db.insert).mockReturnValue({
        values: mockValues.mockReturnValue({
          returning: mockReturning,
        }),
      } as any);

      const req = new NextRequest("http://localhost:3000/api/qr-codes/qr_123/duplicate", {
        method: "POST",
      });
      const res = await duplicateQrCode(req, { params: Promise.resolve({ id: "qr_123" }) });
      const data = await res.json();

      expect(res.status).toBe(201);
      expect(data.data.name).toBe("Table 1 Promo (Copy)");
      expect(data.data.slug).toBe("table-1-promo-copy");
    });
  });
});
