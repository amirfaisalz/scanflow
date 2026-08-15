import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { sessions, sessionEvents } from "@/lib/db/schema";
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

    const { id: sessionId } = await params;

    // Verify session belongs to user
    const session = await db.query.sessions.findFirst({
      where: and(eq(sessions.id, sessionId), eq(sessions.userId, user.id)),
      with: {
        qrCode: true,
        matchedRule: true,
      },
    });

    if (!session) {
      return NextResponse.json({ error: "Session not found" }, { status: 404 });
    }

    // Fetch all events for this session ordered chronologically
    const events = await db.query.sessionEvents.findMany({
      where: eq(sessionEvents.sessionId, sessionId),
      orderBy: [asc(sessionEvents.timestamp)],
    });

    return NextResponse.json({
      session,
      events,
    });
  } catch (error) {
    console.error("GET /api/analytics/sessions/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
