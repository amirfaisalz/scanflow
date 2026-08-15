import { db } from "@/lib/db";
import {
  campaigns,
  qrCodes,
  routingRules,
  sessions,
  sessionEvents,
  conversionGoals,
} from "@/lib/db/schema";
import { eq } from "drizzle-orm";

/**
 * Ensures a user has initial demo campaigns, dynamic QR codes, routing rules,
 * and realistic analytics events in the database.
 */
export async function ensureUserDemoData(userId: string, email: string) {
  try {
    const existing = await db.query.campaigns.findFirst({
      where: eq(campaigns.userId, userId),
    });

    if (existing) {
      return; // User already has data
    }

    const userTag = userId.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6) || "demo";
    const campaign1Id = `cmp_app_${userTag}_${Date.now()}`;
    const campaign2Id = `cmp_retail_${userTag}_${Date.now()}`;
    const campaign3Id = `cmp_summit_${userTag}_${Date.now()}`;

    // 1. Create Campaigns
    await db.insert(campaigns).values([
      {
        id: campaign1Id,
        userId,
        name: "📱 Universal App Store Launch",
        description: "Smart OS dynamic routing between Apple App Store & Google Play",
        status: "active",
        createdAt: new Date(Date.now() - 60 * 24 * 3600 * 1000),
      },
      {
        id: campaign2Id,
        userId,
        name: "🌍 Global Product Packaging Inserts",
        description: "Geo-targeted customer manual and direct warranty registration",
        status: "active",
        createdAt: new Date(Date.now() - 45 * 24 * 3600 * 1000),
      },
      {
        id: campaign3Id,
        userId,
        name: "🎪 Tech Summit 2026 Billboard QRs",
        description: "High-traffic physical billboard & booth badge engagement",
        status: "active",
        createdAt: new Date(Date.now() - 30 * 24 * 3600 * 1000),
      },
    ]);

    // 2. Create Dynamic QR Codes
    const qr1Id = `qr_app_${userTag}_${Date.now()}`;
    const qr2Id = `qr_box_${userTag}_${Date.now()}`;
    const qr3Id = `qr_summer_${userTag}_${Date.now()}`;
    const qr4Id = `qr_bistro_${userTag}_${Date.now()}`;

    const slugSuffix = `-${userTag}-${Math.random().toString(36).substring(2, 6)}`;

    await db.insert(qrCodes).values([
      {
        id: qr1Id,
        userId,
        campaignId: campaign1Id,
        name: "App Launch Universal QR",
        slug: `mobile-app${slugSuffix}`,
        destinationUrl: "https://www.google.com",
        status: "active",
        foregroundColor: "#FA5D29",
        backgroundColor: "#ffffff",
        scanCount: 5420,
        metadata: { format: "svg", errorCorrection: "H" },
        createdAt: new Date(Date.now() - 50 * 24 * 3600 * 1000),
      },
      {
        id: qr2Id,
        userId,
        campaignId: campaign2Id,
        name: "Product Packaging Insert QR",
        slug: `packaging-v2${slugSuffix}`,
        destinationUrl: "https://www.google.com",
        status: "active",
        foregroundColor: "#09090b",
        backgroundColor: "#ffffff",
        scanCount: 4180,
        metadata: { format: "svg", errorCorrection: "M" },
        createdAt: new Date(Date.now() - 40 * 24 * 3600 * 1000),
      },
      {
        id: qr3Id,
        userId,
        campaignId: campaign3Id,
        name: "Global 50% Promo Billboard",
        slug: `summer-deal${slugSuffix}`,
        destinationUrl: "https://www.google.com",
        status: "active",
        foregroundColor: "#4f46e5",
        backgroundColor: "#ffffff",
        scanCount: 3890,
        metadata: { format: "svg", errorCorrection: "Q" },
        createdAt: new Date(Date.now() - 25 * 24 * 3600 * 1000),
      },
      {
        id: qr4Id,
        userId,
        campaignId: null,
        name: "Downtown Bistro Live Menu",
        slug: `bistro-menu${slugSuffix}`,
        destinationUrl: "https://www.google.com",
        status: "active",
        foregroundColor: "#059669",
        backgroundColor: "#ffffff",
        scanCount: 1330,
        metadata: { format: "svg", errorCorrection: "M" },
        createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000),
      },
    ]);

    // 3. Create Smart Routing Rules
    const rule1Id = `rule_ios_${userTag}_${Date.now()}`;
    const rule2Id = `rule_android_${userTag}_${Date.now()}`;
    const rule3Id = `rule_geo_${userTag}_${Date.now()}`;

    await db.insert(routingRules).values([
      {
        id: rule1Id,
        qrCodeId: qr1Id,
        userId,
        priority: 1,
        conditionType: "os",
        conditionValue: "iOS",
        destinationUrl: "https://www.google.com",
        isActive: true,
      },
      {
        id: rule2Id,
        qrCodeId: qr1Id,
        userId,
        priority: 2,
        conditionType: "os",
        conditionValue: "Android",
        destinationUrl: "https://www.google.com",
        isActive: true,
      },
      {
        id: rule3Id,
        qrCodeId: qr2Id,
        userId,
        priority: 1,
        conditionType: "country",
        conditionValue: "ID",
        destinationUrl: "https://www.google.com",
        isActive: true,
      },
    ]);

    // 4. Generate Initial Sample Sessions for Instant Analytics Visualization
    const sessionRows: any[] = [];
    const eventRows: any[] = [];
    const now = Date.now();
    const qrIds = [qr1Id, qr2Id, qr3Id, qr4Id];
    const countries = ["US", "US", "ID", "GB", "DE", "SG", "JP"];

    for (let d = 30; d >= 0; d--) {
      const dayTimestamp = now - d * 24 * 3600 * 1000;
      const count = Math.floor(15 + Math.random() * 20);

      for (let s = 0; s < count; s++) {
        const qrId = qrIds[Math.floor(Math.random() * qrIds.length)];
        const country = countries[Math.floor(Math.random() * countries.length)];
        const isIos = Math.random() > 0.5;
        const scanTime = new Date(dayTimestamp + Math.floor(Math.random() * 24 * 3600 * 1000));
        const sessionId = `sess_${userTag}_${d}_${s}_${Math.random().toString(36).substring(2, 6)}`;
        const isConverted = Math.random() < 0.2;

        sessionRows.push({
          id: sessionId,
          qrCodeId: qrId,
          userId,
          campaignId: qrId === qr1Id ? campaign1Id : qrId === qr2Id ? campaign2Id : qrId === qr3Id ? campaign3Id : null,
          experimentId: null,
          experimentVariantId: null,
          ipHash: `sha256_${Math.random().toString(36).substring(2, 8)}`,
          userAgent: isIos
            ? "Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)"
            : "Mozilla/5.0 (Linux; Android 14)",
          deviceType: "mobile",
          os: isIos ? "iOS" : "Android",
          browser: isIos ? "Safari" : "Chrome",
          country,
          city: country === "US" ? "San Francisco" : country === "ID" ? "Jakarta" : "London",
          referrer: "Direct Scan (Camera)",
          matchedRuleId: isIos ? rule1Id : rule2Id,
          initialDestination: isIos ? "https://apps.apple.com/app/scanflow-qr" : "https://scanflow.dev/download",
          startedAt: scanTime,
          endedAt: new Date(scanTime.getTime() + 45000),
          durationSeconds: 45,
          eventsCount: isConverted ? 2 : 1,
          converted: isConverted,
          conversionEvent: isConverted ? "APP_INSTALL_CONFIRMED" : null,
          createdAt: scanTime,
          updatedAt: scanTime,
        });

        eventRows.push({
          id: `ev_${sessionId}_1`,
          sessionId,
          qrCodeId: qrId,
          userId,
          eventType: "QR_SCAN",
          eventData: { destination: "https://scanflow.dev/r/" + qrId },
          timestamp: scanTime,
        });

        if (isConverted) {
          eventRows.push({
            id: `ev_${sessionId}_2`,
            sessionId,
            qrCodeId: qrId,
            userId,
            eventType: "CONVERSION",
            eventData: { goal: "App Install / Registration" },
            timestamp: new Date(scanTime.getTime() + 10000),
          });
        }
      }
    }

    if (sessionRows.length > 0) {
      await db.insert(sessions).values(sessionRows);
    }
    if (eventRows.length > 0) {
      await db.insert(sessionEvents).values(eventRows);
    }
  } catch (error) {
    console.error("ensureUserDemoData error:", error);
  }
}
