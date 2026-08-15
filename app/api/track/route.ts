import { NextRequest, NextResponse } from "next/server";
import { recordSessionEvent, AllowedEventType } from "@/lib/analytics/tracker";

const VALID_EVENT_TYPES: AllowedEventType[] = [
  "QR_SCAN",
  "PAGE_VIEW",
  "BUTTON_CLICK",
  "LINK_CLICK",
  "FORM_SUBMIT",
  "CONVERSION",
  "EXTERNAL_REDIRECT",
];

export async function POST(request: NextRequest) {
  try {
    const body = await request.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
    }

    const { sessionId, eventType, eventData } = body;

    if (!sessionId || typeof sessionId !== "string") {
      return NextResponse.json({ error: "sessionId is required" }, { status: 400 });
    }

    if (!eventType || !VALID_EVENT_TYPES.includes(eventType as AllowedEventType)) {
      return NextResponse.json(
        {
          error:
            "Invalid eventType. Allowed types: " + VALID_EVENT_TYPES.join(", "),
        },
        { status: 400 }
      );
    }

    const result = await recordSessionEvent({
      sessionId,
      eventType: eventType as AllowedEventType,
      eventData: typeof eventData === "object" && eventData !== null ? eventData : {},
    });

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 404 });
    }

    return NextResponse.json(result, { status: 200 });
  } catch (error) {
    console.error("POST /api/track error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
