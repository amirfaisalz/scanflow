import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { db } from "@/lib/db";
import { qrCodes, routingRules, sessions, sessionEvents, experiments } from "@/lib/db/schema";
import { and, eq, sql } from "drizzle-orm";
import { parseVisitorContext, evaluateRoutingRules } from "@/lib/routing/engine";
import { selectExperimentVariant } from "@/lib/experiments/engine";

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;
    if (!code) {
      return new NextResponse("QR code slug is required", { status: 400 });
    }

    // 1. Fetch QR Code from database
    const qrCode = await db.query.qrCodes.findFirst({
      where: eq(qrCodes.slug, code),
    });

    if (!qrCode) {
      return new NextResponse(
        `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>QR Code Not Found | ScanFlow</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background-color: #09090b; color: #f4f4f5; }
    .card { max-width: 440px; padding: 32px; background: #18181b; border: 1px solid #27272a; border-radius: 16px; text-align: center; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
    h1 { font-size: 24px; margin-bottom: 12px; font-weight: 700; color: #fafafa; }
    p { font-size: 14px; color: #a1a1aa; line-height: 1.5; margin-bottom: 24px; }
    .badge { display: inline-block; padding: 4px 12px; background: #3f3f46; color: #e4e4e7; border-radius: 9999px; font-size: 12px; font-weight: 600; margin-bottom: 16px; }
  </style>
</head>
<body>
  <div class="card">
    <div class="badge">404 Not Found</div>
    <h1>QR Code Not Found</h1>
    <p>The QR code destination you are looking for does not exist or may have been removed.</p>
  </div>
</body>
</html>`,
        {
          status: 404,
          headers: { "content-type": "text/html; charset=utf-8" },
        }
      );
    }

    // 2. Handle Paused Status
    if (qrCode.status === "paused") {
      return new NextResponse(
        `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Campaign Paused | ScanFlow</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background-color: #09090b; color: #f4f4f5; }
    .card { max-width: 440px; padding: 32px; background: #18181b; border: 1px solid #27272a; border-radius: 16px; text-align: center; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
    .status-dot { width: 12px; height: 12px; background: #eab308; border-radius: 50%; display: inline-block; margin-right: 6px; }
    h1 { font-size: 22px; margin: 16px 0 8px 0; font-weight: 700; color: #fafafa; }
    p { font-size: 14px; color: #a1a1aa; line-height: 1.5; margin-bottom: 8px; }
    .qr-name { font-weight: 600; color: #e4e4e7; }
  </style>
</head>
<body>
  <div class="card">
    <div><span class="status-dot"></span><span style="font-size: 13px; color: #eab308; font-weight: 600;">Temporarily Inactive</span></div>
    <h1>Campaign Paused</h1>
    <p>The destination for <span class="qr-name">"${qrCode.name}"</span> is currently paused by the campaign owner.</p>
    <p>Please check back later or scan again soon.</p>
  </div>
</body>
</html>`,
        {
          status: 200,
          headers: { "content-type": "text/html; charset=utf-8" },
        }
      );
    }

    // 3. Handle Archived Status
    if (qrCode.status === "archived") {
      return new NextResponse(
        `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Campaign Archived | ScanFlow</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; display: flex; align-items: center; justify-content: center; min-height: 100vh; margin: 0; background-color: #09090b; color: #f4f4f5; }
    .card { max-width: 440px; padding: 32px; background: #18181b; border: 1px solid #27272a; border-radius: 16px; text-align: center; box-shadow: 0 20px 25px -5px rgba(0,0,0,0.5); }
    .status-dot { width: 12px; height: 12px; background: #71717a; border-radius: 50%; display: inline-block; margin-right: 6px; }
    h1 { font-size: 22px; margin: 16px 0 8px 0; font-weight: 700; color: #fafafa; }
    p { font-size: 14px; color: #a1a1aa; line-height: 1.5; margin-bottom: 8px; }
  </style>
</head>
<body>
  <div class="card">
    <div><span class="status-dot"></span><span style="font-size: 13px; color: #a1a1aa; font-weight: 600;">Ended</span></div>
    <h1>Campaign Archived</h1>
    <p>This QR campaign has concluded and is no longer accepting new visits.</p>
  </div>
</body>
</html>`,
        {
          status: 200,
          headers: { "content-type": "text/html; charset=utf-8" },
        }
      );
    }

    // 4. Active Status: Parse visitor context & evaluate experiments / routing rules
    const visitorContext = parseVisitorContext(request.headers);

    // Check for active experiment on this QR code
    const activeExperiment = await db.query.experiments.findFirst({
      where: and(
        eq(experiments.qrCodeId, qrCode.id),
        eq(experiments.status, "active")
      ),
      with: {
        variants: true,
      },
    });

    let destinationUrl = qrCode.destinationUrl;
    let matchedRuleId: string | null = null;
    let conditionMatched: string | null = null;
    let experimentId: string | null = null;
    let experimentVariantId: string | null = null;

    if (
      activeExperiment &&
      activeExperiment.variants &&
      activeExperiment.variants.length > 0
    ) {
      const cookieVariantId = request.cookies.get(
        `sf_exp_${activeExperiment.id}`
      )?.value;

      const { selectedVariant } = selectExperimentVariant(
        activeExperiment.variants,
        cookieVariantId,
        visitorContext.ipHash
      );

      destinationUrl = selectedVariant.destinationUrl;
      experimentId = activeExperiment.id;
      experimentVariantId = selectedVariant.id;
    } else {
      // No active experiment -> evaluate standard dynamic routing rules
      const rules = await db.query.routingRules.findMany({
        where: eq(routingRules.qrCodeId, qrCode.id),
      });

      const routingResult = evaluateRoutingRules(
        visitorContext,
        rules,
        qrCode.destinationUrl
      );

      destinationUrl = routingResult.destinationUrl;
      matchedRuleId = routingResult.matchedRuleId;
      conditionMatched = routingResult.conditionMatched || null;
    }

    // 5. Session Identification & Cookie Management
    const existingCookieSid = request.cookies.get("sf_sid")?.value;
    const sessionId =
      existingCookieSid ||
      `sess_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
    const isNewSession = !existingCookieSid;

    // 6. Asynchronous / Background Ingestion
    try {
      if (isNewSession) {
        await db.insert(sessions).values({
          id: sessionId,
          qrCodeId: qrCode.id,
          userId: qrCode.userId,
          campaignId: qrCode.campaignId || null,
          experimentId: experimentId || null,
          experimentVariantId: experimentVariantId || null,
          ipHash: visitorContext.ipHash,
          userAgent: visitorContext.userAgent,
          deviceType: visitorContext.deviceType,
          os: visitorContext.os,
          browser: visitorContext.browser,
          country: visitorContext.country,
          city: visitorContext.city,
          referrer: visitorContext.referrer,
          matchedRuleId: matchedRuleId || null,
          initialDestination: destinationUrl,
          startedAt: new Date(),
          endedAt: new Date(),
          durationSeconds: 0,
          eventsCount: 1,
          converted: false,
        });
      } else {
        await db
          .update(sessions)
          .set({
            eventsCount: sql`${sessions.eventsCount} + 1`,
            endedAt: new Date(),
            updatedAt: new Date(),
          })
          .where(eq(sessions.id, sessionId));
      }

      // Record QR_SCAN event
      await db.insert(sessionEvents).values({
        id: `evt_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`,
        sessionId,
        qrCodeId: qrCode.id,
        userId: qrCode.userId,
        experimentId: experimentId || null,
        experimentVariantId: experimentVariantId || null,
        eventType: "QR_SCAN",
        eventData: {
          destinationUrl,
          matchedRuleId: matchedRuleId || null,
          conditionMatched: conditionMatched || null,
          experimentId: experimentId || null,
          experimentVariantId: experimentVariantId || null,
          device: visitorContext.deviceType,
          os: visitorContext.os,
          browser: visitorContext.browser,
          country: visitorContext.country,
        },
        timestamp: new Date(),
      });

      // Increment QR code scan count
      await db
        .update(qrCodes)
        .set({
          scanCount: sql`${qrCodes.scanCount} + 1`,
          updatedAt: new Date(),
        })
        .where(eq(qrCodes.id, qrCode.id));
    } catch (err) {
      // Ingestion error must never prevent visitor redirect
      console.error("Scan ingestion non-blocking error:", err);
    }

    // 7. Return 307 Temporary Redirect with Session Cookie & Sticky Experiment Cookie
    const response = NextResponse.redirect(destinationUrl, {
      status: 307,
    });

    response.cookies.set("sf_sid", sessionId, {
      path: "/",
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 24 * 30, // 30 days
    });

    if (experimentId && experimentVariantId) {
      response.cookies.set(`sf_exp_${experimentId}`, experimentVariantId, {
        path: "/",
        httpOnly: true,
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 30, // 30 days
      });
    }

    return response;
  } catch (error) {
    console.error("GET /r/[code] fatal error:", error);
    return new NextResponse("Internal Server Error", { status: 500 });
  }
}
