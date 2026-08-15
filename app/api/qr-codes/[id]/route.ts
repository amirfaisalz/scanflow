import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { qrCodes } from "@/lib/db/schema";
import { and, eq, ne } from "drizzle-orm";
import { z } from "zod";
import { isValidSlug, isValidUrl, sanitizeSlug } from "@/lib/qr";

const updateQrCodeSchema = z.object({
  name: z.string().min(1, "Name is required").max(100).optional(),
  destinationUrl: z
    .string()
    .url("Invalid destination URL")
    .refine(isValidUrl, "URL must be http or https")
    .optional(),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(64, "Slug cannot exceed 64 characters")
    .transform((val) => sanitizeSlug(val))
    .refine(isValidSlug, "Slug must contain only lowercase letters, numbers, hyphens, and underscores")
    .optional(),
  campaignId: z.string().optional().nullable(),
  status: z.enum(["active", "paused", "archived"]).optional(),
  foregroundColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color")
    .optional(),
  backgroundColor: z
    .string()
    .regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color")
    .optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * GET /api/qr-codes/[id] - Get single QR code owned by user
 */
export async function GET(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [qrCode] = await db
      .select()
      .from(qrCodes)
      .where(and(eq(qrCodes.id, id), eq(qrCodes.userId, user.id)))
      .limit(1);

    if (!qrCode) {
      return NextResponse.json({ error: "QR code not found" }, { status: 404 });
    }

    return NextResponse.json({ data: qrCode });
  } catch (error) {
    console.error("Error fetching QR code:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * PATCH /api/qr-codes/[id] - Update QR code
 */
export async function PATCH(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    // Check ownership
    const [existing] = await db
      .select()
      .from(qrCodes)
      .where(and(eq(qrCodes.id, id), eq(qrCodes.userId, user.id)))
      .limit(1);

    if (!existing) {
      return NextResponse.json({ error: "QR code not found" }, { status: 404 });
    }

    const body = await req.json();
    const parseResult = updateQrCodeSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // If slug is being updated, verify uniqueness across all other QR codes
    if (data.slug && data.slug !== existing.slug) {
      const [conflict] = await db
        .select({ id: qrCodes.id })
        .from(qrCodes)
        .where(and(eq(qrCodes.slug, data.slug), ne(qrCodes.id, id)))
        .limit(1);

      if (conflict) {
        return NextResponse.json(
          { error: "Slug is already in use by another QR code." },
          { status: 409 }
        );
      }
    }

    const [updated] = await db
      .update(qrCodes)
      .set({
        ...data,
        updatedAt: new Date(),
      })
      .where(and(eq(qrCodes.id, id), eq(qrCodes.userId, user.id)))
      .returning();

    return NextResponse.json({ data: updated });
  } catch (error) {
    console.error("Error updating QR code:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * DELETE /api/qr-codes/[id] - Delete QR code
 */
export async function DELETE(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [deleted] = await db
      .delete(qrCodes)
      .where(and(eq(qrCodes.id, id), eq(qrCodes.userId, user.id)))
      .returning({ id: qrCodes.id });

    if (!deleted) {
      return NextResponse.json({ error: "QR code not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "QR code deleted successfully", id: deleted.id });
  } catch (error) {
    console.error("Error deleting QR code:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
