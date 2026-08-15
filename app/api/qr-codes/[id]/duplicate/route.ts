import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { qrCodes } from "@/lib/db/schema";
import { and, eq } from "drizzle-orm";
import { sanitizeSlug } from "@/lib/qr";

interface RouteParams {
  params: Promise<{ id: string }>;
}

/**
 * POST /api/qr-codes/[id]/duplicate - Duplicate an existing QR code
 */
export async function POST(req: NextRequest, { params }: RouteParams) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const [sourceQr] = await db
      .select()
      .from(qrCodes)
      .where(and(eq(qrCodes.id, id), eq(qrCodes.userId, user.id)))
      .limit(1);

    if (!sourceQr) {
      return NextResponse.json({ error: "QR code not found" }, { status: 404 });
    }

    // Generate unique slug for the duplicate
    let candidateSlug = sanitizeSlug(`${sourceQr.slug}-copy`);
    let suffix = 1;

    while (true) {
      const [existing] = await db
        .select({ id: qrCodes.id })
        .from(qrCodes)
        .where(eq(qrCodes.slug, candidateSlug))
        .limit(1);

      if (!existing) break;
      suffix += 1;
      candidateSlug = sanitizeSlug(`${sourceQr.slug}-copy-${suffix}`);
    }

    const newId = `qr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    const [duplicatedQr] = await db
      .insert(qrCodes)
      .values({
        id: newId,
        userId: user.id,
        name: `${sourceQr.name} (Copy)`,
        slug: candidateSlug,
        destinationUrl: sourceQr.destinationUrl,
        campaignId: sourceQr.campaignId,
        status: "active",
        foregroundColor: sourceQr.foregroundColor,
        backgroundColor: sourceQr.backgroundColor,
        scanCount: 0,
        metadata: sourceQr.metadata || {},
      })
      .returning();

    return NextResponse.json({ data: duplicatedQr }, { status: 201 });
  } catch (error) {
    console.error("Error duplicating QR code:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
