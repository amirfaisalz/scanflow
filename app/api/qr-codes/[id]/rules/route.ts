import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { qrCodes, routingRules } from "@/lib/db/schema";
import { eq, and, asc } from "drizzle-orm";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: qrCodeId } = await params;

    // Verify ownership of the QR code
    const qrCode = await db.query.qrCodes.findFirst({
      where: and(eq(qrCodes.id, qrCodeId), eq(qrCodes.userId, user.id)),
    });

    if (!qrCode) {
      return NextResponse.json({ error: "QR code not found" }, { status: 404 });
    }

    const rules = await db.query.routingRules.findMany({
      where: eq(routingRules.qrCodeId, qrCodeId),
      orderBy: [asc(routingRules.priority)],
    });

    return NextResponse.json({ rules });
  } catch (error) {
    console.error("GET /api/qr-codes/[id]/rules error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id: qrCodeId } = await params;

    // Verify ownership of the QR code
    const qrCode = await db.query.qrCodes.findFirst({
      where: and(eq(qrCodes.id, qrCodeId), eq(qrCodes.userId, user.id)),
    });

    if (!qrCode) {
      return NextResponse.json({ error: "QR code not found" }, { status: 404 });
    }

    const body = await request.json();
    const { conditionType, conditionValue, destinationUrl, priority, isActive } = body;

    const validConditionTypes = ["device", "os", "country", "language", "time_window"];
    if (!conditionType || !validConditionTypes.includes(conditionType.toLowerCase())) {
      return NextResponse.json(
        { error: "Invalid conditionType. Must be one of: " + validConditionTypes.join(", ") },
        { status: 400 }
      );
    }

    if (!conditionValue || typeof conditionValue !== "string" || !conditionValue.trim()) {
      return NextResponse.json({ error: "conditionValue is required" }, { status: 400 });
    }

    try {
      new URL(destinationUrl);
    } catch {
      return NextResponse.json(
        { error: "Invalid destinationUrl. Must be a valid absolute URL (e.g. https://...)" },
        { status: 400 }
      );
    }

    const ruleId = `rule_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
    const [newRule] = await db
      .insert(routingRules)
      .values({
        id: ruleId,
        qrCodeId,
        userId: user.id,
        priority: typeof priority === "number" ? priority : 1,
        conditionType: conditionType.toLowerCase(),
        conditionValue: conditionValue.trim(),
        destinationUrl: destinationUrl.trim(),
        isActive: isActive !== false,
      })
      .returning();

    return NextResponse.json({ rule: newRule }, { status: 201 });
  } catch (error) {
    console.error("POST /api/qr-codes/[id]/rules error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
