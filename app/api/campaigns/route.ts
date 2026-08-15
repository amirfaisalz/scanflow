import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { campaigns } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userCampaigns = await db.query.campaigns.findMany({
      where: eq(campaigns.userId, user.id),
      orderBy: [desc(campaigns.createdAt)],
      with: {
        qrCodes: true,
        sessions: true,
      },
    });

    const enrichedCampaigns = userCampaigns.map((camp: any) => {
      const qrList = camp.qrCodes || [];
      const sessionList = camp.sessions || [];

      const totalScans = qrList.reduce((sum: number, q: any) => sum + (q.scanCount || 0), 0);
      const totalSessions = sessionList.length;
      const conversions = sessionList.filter((s: any) => s.converted).length;
      const conversionRate =
        totalSessions > 0 ? Math.round((conversions / totalSessions) * 1000) / 10 : 0;

      return {
        id: camp.id,
        name: camp.name,
        description: camp.description,
        status: camp.status,
        createdAt: camp.createdAt,
        updatedAt: camp.updatedAt,
        qrCodesCount: qrList.length,
        totalScans,
        totalSessions,
        conversions,
        conversionRate,
      };
    });

    return NextResponse.json({ campaigns: enrichedCampaigns });
  } catch (error) {
    console.error("GET /api/campaigns error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { name, description, status = "active" } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json({ error: "Campaign name is required" }, { status: 400 });
    }

    const validStatuses = ["active", "paused", "archived"];
    if (status && !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: "Invalid status. Allowed values: active, paused, archived" },
        { status: 400 }
      );
    }

    const campaignId = `camp_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
    const [newCampaign] = await db
      .insert(campaigns)
      .values({
        id: campaignId,
        userId: user.id,
        name: name.trim(),
        description: description ? description.trim() : null,
        status,
      })
      .returning();

    return NextResponse.json({ campaign: newCampaign }, { status: 201 });
  } catch (error) {
    console.error("POST /api/campaigns error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
