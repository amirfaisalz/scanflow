import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { conversionGoals, sessions } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";

const VALID_EVENT_TYPES = [
  "BUTTON_CLICK",
  "LINK_CLICK",
  "FORM_SUBMIT",
  "PAGE_VIEW",
  "CONVERSION",
];

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [userGoals, userSessions] = await Promise.all([
      db.query.conversionGoals.findMany({
        where: eq(conversionGoals.userId, user.id),
        orderBy: [desc(conversionGoals.createdAt)],
        with: {
          qrCode: true,
          campaign: true,
        },
      }),
      db.query.sessions.findMany({
        where: eq(sessions.userId, user.id),
      }),
    ]);

    const enrichedGoals = userGoals.map((goal) => {
      // Filter sessions relevant to this goal's scope
      const relevantSessions = userSessions.filter((s) => {
        if (goal.qrCodeId && s.qrCodeId !== goal.qrCodeId) return false;
        if (goal.campaignId && s.campaignId !== goal.campaignId) return false;
        return true;
      });

      const totalSessions = relevantSessions.length;
      const convertedSessions = relevantSessions.filter(
        (s) => s.converted && s.conversionEvent === goal.name
      );
      const totalConversions = convertedSessions.length;
      const conversionRate =
        totalSessions > 0
          ? Math.round((totalConversions / totalSessions) * 1000) / 10
          : 0;

      // monetaryValue is in cents, convert to currency units ($)
      const totalRevenue = (totalConversions * (goal.monetaryValue || 0)) / 100;

      return {
        id: goal.id,
        userId: goal.userId,
        name: goal.name,
        description: goal.description,
        eventType: goal.eventType,
        targetPattern: goal.targetPattern,
        qrCodeId: goal.qrCodeId,
        campaignId: goal.campaignId,
        monetaryValue: goal.monetaryValue,
        currency: goal.currency,
        isActive: goal.isActive,
        createdAt: goal.createdAt,
        updatedAt: goal.updatedAt,
        qrCode: goal.qrCode || null,
        campaign: goal.campaign || null,
        totalConversions,
        totalSessions,
        conversionRate,
        totalRevenue,
      };
    });

    const totalConversions = enrichedGoals.reduce(
      (sum, g) => sum + g.totalConversions,
      0
    );
    const totalRevenue = enrichedGoals.reduce(
      (sum, g) => sum + g.totalRevenue,
      0
    );
    const activeGoalsCount = enrichedGoals.filter((g) => g.isActive).length;
    const overallConversionRate =
      userSessions.length > 0
        ? Math.round((totalConversions / userSessions.length) * 1000) / 10
        : 0;

    return NextResponse.json({
      goals: enrichedGoals,
      metrics: {
        totalConversions,
        totalRevenue,
        activeGoalsCount,
        overallConversionRate,
      },
    });
  } catch (error) {
    console.error("GET /api/conversions error:", error);
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
    const {
      name,
      description,
      eventType,
      targetPattern,
      qrCodeId,
      campaignId,
      monetaryValue = 0,
      currency = "USD",
      isActive = true,
    } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Goal name is required" },
        { status: 400 }
      );
    }

    const normalizedEventType =
      typeof eventType === "string" ? eventType.trim().toUpperCase() : "";

    if (!normalizedEventType || !VALID_EVENT_TYPES.includes(normalizedEventType)) {
      return NextResponse.json(
        {
          error: `Invalid event type. Allowed values: ${VALID_EVENT_TYPES.join(", ")}`,
        },
        { status: 400 }
      );
    }

    const goalId = `goal_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
    const parsedMonetaryValue =
      typeof monetaryValue === "number"
        ? Math.max(0, Math.round(monetaryValue))
        : Math.max(0, parseInt(monetaryValue, 10) || 0);

    const [newGoal] = await db
      .insert(conversionGoals)
      .values({
        id: goalId,
        userId: user.id,
        name: name.trim(),
        description: description ? description.trim() : null,
        eventType: normalizedEventType,
        targetPattern: targetPattern ? targetPattern.trim() : null,
        qrCodeId: qrCodeId || null,
        campaignId: campaignId || null,
        monetaryValue: parsedMonetaryValue,
        currency: currency ? currency.trim().toUpperCase() : "USD",
        isActive: isActive !== undefined ? Boolean(isActive) : true,
      })
      .returning();

    return NextResponse.json({ goal: newGoal }, { status: 201 });
  } catch (error) {
    console.error("POST /api/conversions error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
