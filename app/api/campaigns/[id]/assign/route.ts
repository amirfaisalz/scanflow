import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { campaigns, qrCodes } from "@/lib/db/schema";
import { eq, and, inArray } from "drizzle-orm";

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: campaignId } = await params;

    // Verify campaign ownership
    const campaign = await db.query.campaigns.findFirst({
      where: and(eq(campaigns.id, campaignId), eq(campaigns.userId, user.id)),
    });

    if (!campaign) {
      return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
    }

    const body = await request.json();
    const { qrCodeIds } = body;

    if (!Array.isArray(qrCodeIds)) {
      return NextResponse.json({ error: "qrCodeIds must be an array of IDs" }, { status: 400 });
    }

    if (qrCodeIds.length > 0) {
      await db
        .update(qrCodes)
        .set({ campaignId, updatedAt: new Date() })
        .where(and(inArray(qrCodes.id, qrCodeIds), eq(qrCodes.userId, user.id)));
    }

    return NextResponse.json({ success: true, count: qrCodeIds.length });
  } catch (error) {
    console.error("POST /api/campaigns/[id]/assign error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
