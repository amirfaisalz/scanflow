import crypto from "crypto";
import { db } from "@/lib/db";
import { sessions, sessionEvents } from "@/lib/db/schema";
import { eq, sql } from "drizzle-orm";

export type AllowedEventType =
  | "QR_SCAN"
  | "PAGE_VIEW"
  | "BUTTON_CLICK"
  | "LINK_CLICK"
  | "FORM_SUBMIT"
  | "CONVERSION"
  | "EXTERNAL_REDIRECT";

export interface RecordEventOptions {
  sessionId: string;
  eventType: AllowedEventType;
  eventData?: Record<string, unknown>;
}

export async function recordSessionEvent({
  sessionId,
  eventType,
  eventData = {},
}: RecordEventOptions) {
  const session = await db.query.sessions.findFirst({
    where: eq(sessions.id, sessionId),
  });

  if (!session) {
    return { success: false, error: "Session not found" };
  }

  const now = new Date();
  const eventId = `evt_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;

  // Insert event
  await db.insert(sessionEvents).values({
    id: eventId,
    sessionId: session.id,
    qrCodeId: session.qrCodeId,
    userId: session.userId,
    eventType,
    eventData,
    timestamp: now,
  });

  // Calculate new duration in seconds
  const startMs = new Date(session.startedAt).getTime();
  const durationSeconds = Math.max(0, Math.floor((now.getTime() - startMs) / 1000));
  const isConversion = eventType === "CONVERSION" || Boolean(session.converted);
  const conversionGoal =
    eventType === "CONVERSION"
      ? (eventData.goal as string) || (eventData.name as string) || "Conversion"
      : session.conversionEvent;

  // Update session duration, eventsCount, and conversion state
  await db
    .update(sessions)
    .set({
      endedAt: now,
      durationSeconds,
      eventsCount: sql`${sessions.eventsCount} + 1`,
      converted: isConversion,
      conversionEvent: conversionGoal || null,
      updatedAt: now,
    })
    .where(eq(sessions.id, session.id));

  return {
    success: true,
    eventId,
    sessionId: session.id,
    eventType,
    eventsCount: session.eventsCount + 1,
    durationSeconds,
    converted: isConversion,
    conversionEvent: conversionGoal || null,
  };
}
