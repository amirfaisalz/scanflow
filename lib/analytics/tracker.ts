import crypto from "crypto";
import { db } from "@/lib/db";
import { sessions, sessionEvents, conversionGoals } from "@/lib/db/schema";
import { and, eq, sql } from "drizzle-orm";

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

export interface ConversionGoalLike {
  id?: string;
  userId?: string;
  name?: string;
  eventType: string;
  targetPattern?: string | null;
  qrCodeId?: string | null;
  campaignId?: string | null;
  isActive?: boolean | null;
}

export interface GoalEvaluationEvent {
  eventType: string;
  eventData?: Record<string, unknown>;
  qrCodeId?: string | null;
  campaignId?: string | null;
}

const PATTERN_FIELDS = ["goal", "name", "label", "path", "target", "text", "id"];

/**
 * Match a target pattern against candidate string/numeric fields in eventData.
 * Supports exact equality, case-insensitive substring inclusion, and regex.
 */
export function matchesTargetPattern(
  targetPattern?: string | null,
  eventData: Record<string, unknown> = {}
): boolean {
  if (!targetPattern || targetPattern.trim() === "") {
    return true;
  }

  const pattern = targetPattern.trim();
  const lowerPattern = pattern.toLowerCase();

  // Extract values from standard candidate fields
  const candidateValues: string[] = [];
  for (const field of PATTERN_FIELDS) {
    const val = eventData[field];
    if (typeof val === "string" && val.trim() !== "") {
      candidateValues.push(val.trim());
    } else if (typeof val === "number") {
      candidateValues.push(String(val));
    }
  }

  // Fallback to all string values in eventData if standard fields not present
  if (candidateValues.length === 0) {
    for (const val of Object.values(eventData)) {
      if (typeof val === "string" && val.trim() !== "") {
        candidateValues.push(val.trim());
      }
    }
  }

  return candidateValues.some((candidate) => {
    const lowerCandidate = candidate.toLowerCase();
    // Exact or substring match (case-insensitive)
    if (lowerCandidate === lowerPattern || lowerCandidate.includes(lowerPattern)) {
      return true;
    }
    // Regex matching
    try {
      const regex = new RegExp(pattern, "i");
      if (regex.test(candidate)) {
        return true;
      }
    } catch {
      // Ignore invalid regex patterns and treat as literal match
    }
    return false;
  });
}

/**
 * Evaluate whether an incoming event matches a conversion goal definition.
 */
export function evaluateGoalMatch(
  goal: ConversionGoalLike,
  event: GoalEvaluationEvent
): boolean {
  if (goal.isActive === false) {
    return false;
  }

  // 1. Event type matching
  const isTypeMatch =
    goal.eventType === event.eventType ||
    goal.eventType === "CONVERSION" ||
    event.eventType === "CONVERSION";

  if (!isTypeMatch) {
    return false;
  }

  // If goal.eventType is CONVERSION and incoming event is NOT CONVERSION,
  // require a targetPattern to match so a generic goal doesn't trigger on every event.
  if (goal.eventType === "CONVERSION" && event.eventType !== "CONVERSION" && !goal.targetPattern) {
    return false;
  }

  // 2. QR Code Scoping
  if (goal.qrCodeId && goal.qrCodeId !== event.qrCodeId) {
    return false;
  }

  // 3. Campaign Scoping
  if (goal.campaignId && goal.campaignId !== event.campaignId) {
    return false;
  }

  // 4. Target Pattern matching
  if (goal.targetPattern && goal.targetPattern.trim() !== "") {
    if (!matchesTargetPattern(goal.targetPattern, event.eventData || {})) {
      return false;
    }
  }

  return true;
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

  // Fetch active conversion goals for tenant (userId)
  let activeGoals: ConversionGoalLike[] = [];
  try {
    if (db.query?.conversionGoals?.findMany) {
      activeGoals = await db.query.conversionGoals.findMany({
        where: and(
          eq(conversionGoals.userId, session.userId),
          eq(conversionGoals.isActive, true)
        ),
      });
    }
  } catch (err) {
    console.error("Failed to query conversion goals:", err);
  }

  // Evaluate against active conversion goals
  const matchedGoal = activeGoals.find((goal) =>
    evaluateGoalMatch(goal, {
      eventType,
      eventData,
      qrCodeId: session.qrCodeId,
      campaignId: session.campaignId,
    })
  );

  let isConversion = Boolean(session.converted);
  let conversionGoal = session.conversionEvent;

  if (matchedGoal) {
    isConversion = true;
    conversionGoal = matchedGoal.name || "Conversion";
  } else if (eventType === "CONVERSION") {
    isConversion = true;
    conversionGoal =
      (eventData.goal as string) ||
      (eventData.name as string) ||
      session.conversionEvent ||
      "Conversion";
  }

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
