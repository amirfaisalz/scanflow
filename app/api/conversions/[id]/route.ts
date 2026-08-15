import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { conversionGoals } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

const VALID_EVENT_TYPES = [
  "BUTTON_CLICK",
  "LINK_CLICK",
  "FORM_SUBMIT",
  "PAGE_VIEW",
  "CONVERSION",
];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const goal = await db.query.conversionGoals.findFirst({
      where: and(eq(conversionGoals.id, id), eq(conversionGoals.userId, user.id)),
      with: {
        qrCode: true,
        campaign: true,
      },
    });

    if (!goal) {
      return NextResponse.json(
        { error: "Conversion goal not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ goal });
  } catch (error) {
    console.error("GET /api/conversions/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await db.query.conversionGoals.findFirst({
      where: and(eq(conversionGoals.id, id), eq(conversionGoals.userId, user.id)),
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Conversion goal not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      eventType,
      targetPattern,
      qrCodeId,
      campaignId,
      monetaryValue,
      currency,
      isActive,
    } = body;

    const updateData: Partial<typeof conversionGoals.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return NextResponse.json(
          { error: "Goal name cannot be empty" },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    if (description !== undefined) {
      updateData.description =
        typeof description === "string" ? description.trim() : null;
    }

    if (eventType !== undefined) {
      const normalizedEventType =
        typeof eventType === "string" ? eventType.trim().toUpperCase() : "";
      if (
        !normalizedEventType ||
        !VALID_EVENT_TYPES.includes(normalizedEventType)
      ) {
        return NextResponse.json(
          {
            error: `Invalid event type. Allowed values: ${VALID_EVENT_TYPES.join(", ")}`,
          },
          { status: 400 }
        );
      }
      updateData.eventType = normalizedEventType;
    }

    if (targetPattern !== undefined) {
      updateData.targetPattern =
        typeof targetPattern === "string" ? targetPattern.trim() : null;
    }

    if (qrCodeId !== undefined) {
      updateData.qrCodeId = qrCodeId || null;
    }

    if (campaignId !== undefined) {
      updateData.campaignId = campaignId || null;
    }

    if (monetaryValue !== undefined) {
      updateData.monetaryValue =
        typeof monetaryValue === "number"
          ? Math.max(0, Math.round(monetaryValue))
          : Math.max(0, parseInt(monetaryValue, 10) || 0);
    }

    if (currency !== undefined) {
      updateData.currency =
        typeof currency === "string" ? currency.trim().toUpperCase() : "USD";
    }

    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
    }

    const [updatedGoal] = await db
      .update(conversionGoals)
      .set(updateData)
      .where(and(eq(conversionGoals.id, id), eq(conversionGoals.userId, user.id)))
      .returning();

    return NextResponse.json({ goal: updatedGoal });
  } catch (error) {
    console.error("PATCH /api/conversions/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await db.query.conversionGoals.findFirst({
      where: and(eq(conversionGoals.id, id), eq(conversionGoals.userId, user.id)),
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Conversion goal not found" },
        { status: 404 }
      );
    }

    await db
      .delete(conversionGoals)
      .where(and(eq(conversionGoals.id, id), eq(conversionGoals.userId, user.id)))
      .returning();

    return NextResponse.json({
      success: true,
      message: "Conversion goal deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/conversions/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
