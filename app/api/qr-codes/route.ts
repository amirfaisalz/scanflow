import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { qrCodes } from "@/lib/db/schema";
import { and, desc, eq, ilike, or } from "drizzle-orm";
import { z } from "zod";
import { isValidSlug, isValidUrl, sanitizeSlug } from "@/lib/qr";
import { ensureUserDemoData } from "@/lib/db/seed-user";

const createQrCodeSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  destinationUrl: z.string().url("Invalid destination URL").refine(isValidUrl, "URL must be http or https"),
  slug: z
    .string()
    .min(2, "Slug must be at least 2 characters")
    .max(64, "Slug cannot exceed 64 characters")
    .transform((val) => sanitizeSlug(val))
    .refine(isValidSlug, "Slug must contain only lowercase letters, numbers, hyphens, and underscores"),
  campaignId: z.string().optional().nullable(),
  status: z.enum(["active", "paused", "archived"]).default("active"),
  foregroundColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color").default("#000000"),
  backgroundColor: z.string().regex(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/, "Invalid hex color").default("#ffffff"),
  metadata: z.record(z.string(), z.unknown()).optional(),
});

/**
 * GET /api/qr-codes - List QR codes for authenticated user
 */
export async function GET(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const search = searchParams.get("search");
    const status = searchParams.get("status");
    const campaignId = searchParams.get("campaignId");

    const conditions = [eq(qrCodes.userId, user.id)];

    if (status && ["active", "paused", "archived"].includes(status)) {
      conditions.push(eq(qrCodes.status, status));
    }

    if (campaignId) {
      conditions.push(eq(qrCodes.campaignId, campaignId));
    }

    if (search) {
      conditions.push(
        or(
          ilike(qrCodes.name, `%${search}%`),
          ilike(qrCodes.slug, `%${search}%`),
          ilike(qrCodes.destinationUrl, `%${search}%`)
        )!
      );
    }

    let userQrCodes = await db
      .select()
      .from(qrCodes)
      .where(and(...conditions))
      .orderBy(desc(qrCodes.createdAt));

    if (userQrCodes.length === 0 && !search && !status && !campaignId) {
      await ensureUserDemoData(user.id, user.email);
      userQrCodes = await db
        .select()
        .from(qrCodes)
        .where(and(...conditions))
        .orderBy(desc(qrCodes.createdAt));
    }

    return NextResponse.json({ data: userQrCodes });
  } catch (error) {
    console.error("Error fetching QR codes:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

/**
 * POST /api/qr-codes - Create new QR code
 */
export async function POST(req: NextRequest) {
  try {
    const user = await getCurrentUser(req);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const parseResult = createQrCodeSchema.safeParse(body);

    if (!parseResult.success) {
      return NextResponse.json(
        { error: "Validation failed", details: parseResult.error.flatten() },
        { status: 400 }
      );
    }

    const data = parseResult.data;

    // Check if slug is already in use globally
    const [existingQr] = await db
      .select({ id: qrCodes.id })
      .from(qrCodes)
      .where(eq(qrCodes.slug, data.slug))
      .limit(1);

    if (existingQr) {
      return NextResponse.json(
        { error: "Slug is already in use. Please choose another unique slug." },
        { status: 409 }
      );
    }

    const newId = `qr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const [createdQr] = await db
      .insert(qrCodes)
      .values({
        id: newId,
        userId: user.id,
        name: data.name,
        slug: data.slug,
        destinationUrl: data.destinationUrl,
        campaignId: data.campaignId || null,
        status: data.status,
        foregroundColor: data.foregroundColor,
        backgroundColor: data.backgroundColor,
        metadata: data.metadata || {},
      })
      .returning();

    return NextResponse.json({ data: createdQr }, { status: 201 });
  } catch (error) {
    console.error("Error creating QR code:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
