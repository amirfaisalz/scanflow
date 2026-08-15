import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { routingRules } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; ruleId: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: qrCodeId, ruleId } = await params;

    // Verify ownership of the rule
    const existingRule = await db.query.routingRules.findFirst({
      where: and(
        eq(routingRules.id, ruleId),
        eq(routingRules.qrCodeId, qrCodeId),
        eq(routingRules.userId, user.id)
      ),
    });

    if (!existingRule) {
      return NextResponse.json({ error: "Routing rule not found" }, { status: 404 });
    }

    const body = await request.json();
    const { conditionType, conditionValue, destinationUrl, priority, isActive } = body;

    const updateData: Partial<typeof routingRules.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (conditionType !== undefined) {
      const validTypes = ["device", "os", "country", "language", "time_window"];
      if (!validTypes.includes(conditionType.toLowerCase())) {
        return NextResponse.json({ error: "Invalid conditionType" }, { status: 400 });
      }
      updateData.conditionType = conditionType.toLowerCase();
    }

    if (conditionValue !== undefined) {
      if (typeof conditionValue !== "string" || !conditionValue.trim()) {
        return NextResponse.json({ error: "conditionValue cannot be empty" }, { status: 400 });
      }
      updateData.conditionValue = conditionValue.trim();
    }

    if (destinationUrl !== undefined) {
      try {
        new URL(destinationUrl);
      } catch {
        return NextResponse.json({ error: "Invalid destinationUrl" }, { status: 400 });
      }
      updateData.destinationUrl = destinationUrl.trim();
    }

    if (priority !== undefined) {
      updateData.priority = Number(priority) || 1;
    }

    if (isActive !== undefined) {
      updateData.isActive = Boolean(isActive);
    }

    const [updatedRule] = await db
      .update(routingRules)
      .set(updateData)
      .where(and(eq(routingRules.id, ruleId), eq(routingRules.userId, user.id)))
      .returning();

    return NextResponse.json({ rule: updatedRule });
  } catch (error) {
    console.error("PUT /api/qr-codes/[id]/rules/[ruleId] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; ruleId: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: qrCodeId, ruleId } = await params;

    // Verify ownership of the rule
    const existingRule = await db.query.routingRules.findFirst({
      where: and(
        eq(routingRules.id, ruleId),
        eq(routingRules.qrCodeId, qrCodeId),
        eq(routingRules.userId, user.id)
      ),
    });

    if (!existingRule) {
      return NextResponse.json({ error: "Routing rule not found" }, { status: 404 });
    }

    await db
      .delete(routingRules)
      .where(and(eq(routingRules.id, ruleId), eq(routingRules.userId, user.id)))
      .returning();

    return NextResponse.json({ success: true, message: "Rule deleted successfully" });
  } catch (error) {
    console.error("DELETE /api/qr-codes/[id]/rules/[ruleId] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
