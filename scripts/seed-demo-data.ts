import * as dotenv from "dotenv";
dotenv.config();

import { db } from "../lib/db";
import {
  user,
  campaigns,
  qrCodes,
  routingRules,
  sessions,
  sessionEvents,
  conversionGoals,
} from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function seedUser(targetUser: { id: string; email: string; name: string }) {
  const userId = targetUser.id;
  const userTag = userId.slice(0, 6);
  console.log(`\n🌱 Seeding demo data for: ${targetUser.email} (${targetUser.name}, ID: ${userId})...`);

  // Clean existing data for this user
  await db.delete(sessionEvents).where(eq(sessionEvents.userId, userId));
  await db.delete(sessions).where(eq(sessions.userId, userId));
  await db.delete(routingRules).where(eq(routingRules.userId, userId));
  await db.delete(qrCodes).where(eq(qrCodes.userId, userId));
  await db.delete(campaigns).where(eq(campaigns.userId, userId));
  await db.delete(conversionGoals).where(eq(conversionGoals.userId, userId));

  // 1. Create Campaigns
  const campaign1Id = `cmp_app_launch_${userTag}`;
  const campaign2Id = `cmp_global_retail_${userTag}`;
  const campaign3Id = `cmp_conference_${userTag}`;

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

  // 2. Create Dynamic QR Codes with unique slugs per user
  const qr1Id = `qr_app_${userTag}`;
  const qr2Id = `qr_box_${userTag}`;
  const qr3Id = `qr_summer_${userTag}`;
  const qr4Id = `qr_bistro_${userTag}`;

  const slugSuffix = targetUser.email === "admin@scanflow.io" ? "" : `-${userTag}`;

  await db.insert(qrCodes).values([
    {
      id: qr1Id,
      userId,
      campaignId: campaign1Id,
      name: "App Launch Universal QR",
      slug: `mobile-app${slugSuffix}`,
      destinationUrl: "https://scanflow.dev/download",
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
      destinationUrl: "https://example.com/product/registration",
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
      destinationUrl: "https://example.com/offers/summer",
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
      destinationUrl: "https://bistromenu.com/today",
      status: "active",
      foregroundColor: "#059669",
      backgroundColor: "#ffffff",
      scanCount: 1330,
      metadata: { format: "svg", errorCorrection: "M" },
      createdAt: new Date(Date.now() - 15 * 24 * 3600 * 1000),
    },
  ]);

  // 3. Create Smart Routing Rules
  const rule1Id = `rule_ios_${userTag}`;
  const rule2Id = `rule_android_${userTag}`;
  const rule3Id = `rule_geo_${userTag}`;

  await db.insert(routingRules).values([
    {
      id: rule1Id,
      qrCodeId: qr1Id,
      userId,
      priority: 1,
      conditionType: "os",
      conditionValue: "iOS",
      destinationUrl: "https://apps.apple.com/app/scanflow-qr",
      isActive: true,
    },
    {
      id: rule2Id,
      qrCodeId: qr1Id,
      userId,
      priority: 2,
      conditionType: "os",
      conditionValue: "Android",
      destinationUrl: "https://play.google.com/store/apps/details?id=io.scanflow",
      isActive: true,
    },
    {
      id: rule3Id,
      qrCodeId: qr2Id,
      userId,
      priority: 1,
      conditionType: "country",
      conditionValue: "ID",
      destinationUrl: "https://example.co.id/garansi",
      isActive: true,
    },
  ]);

  // 4. Generate realistic Time Series Sessions & Events over the last 60 days
  const sessionRows: any[] = [];
  const eventRows: any[] = [];

  const now = Date.now();
  const days = 60;
  const qrIds = [qr1Id, qr2Id, qr3Id, qr4Id];
  const countries = ["US", "US", "ID", "GB", "DE", "SG", "JP", "CA", "AU"];
  const devices = [
    { type: "mobile", os: "iOS", browser: "Safari", weight: 45 },
    { type: "mobile", os: "Android", browser: "Chrome", weight: 35 },
    { type: "desktop", os: "macOS", browser: "Chrome", weight: 12 },
    { type: "desktop", os: "Windows", browser: "Edge", weight: 8 },
  ];

  let totalScans = 0;
  let totalConverted = 0;

  for (let d = days; d >= 0; d--) {
    const dayTimestamp = now - d * 24 * 3600 * 1000;
    const baseDailyScans = Math.floor(25 + (60 - d) * 1.2 + Math.sin(d / 7) * 10);

    for (let s = 0; s < baseDailyScans; s++) {
      const qrId = qrIds[Math.floor(Math.random() * qrIds.length)];
      const country = countries[Math.floor(Math.random() * countries.length)];
      const randDeviceVal = Math.random() * 100;
      let dev = devices[0];
      let cumulative = 0;
      for (const item of devices) {
        cumulative += item.weight;
        if (randDeviceVal <= cumulative) {
          dev = item;
          break;
        }
      }

      const scanTime = new Date(dayTimestamp + Math.floor(Math.random() * 24 * 3600 * 1000));
      const sessionId = `sess_${userTag}_${d}_${s}_${Math.random().toString(36).substring(2, 6)}`;
      const isConverted = Math.random() < 0.18;

      totalScans++;
      if (isConverted) totalConverted++;

      sessionRows.push({
        id: sessionId,
        qrCodeId: qrId,
        userId,
        campaignId: qrId === qr1Id ? campaign1Id : qrId === qr2Id ? campaign2Id : qrId === qr3Id ? campaign3Id : null,
        experimentId: null,
        experimentVariantId: null,
        ipHash: `sha256_${Math.random().toString(36).substring(2, 10)}`,
        userAgent: `Mozilla/5.0 (${dev.os}; CPU) AppleWebKit/537.36 ${dev.browser}`,
        deviceType: dev.type,
        os: dev.os,
        browser: dev.browser,
        country,
        city: country === "US" ? "San Francisco" : country === "ID" ? "Jakarta" : "London",
        referrer: "Direct Scan (Camera)",
        matchedRuleId: dev.os === "iOS" ? rule1Id : dev.os === "Android" ? rule2Id : null,
        initialDestination: dev.os === "iOS" ? "https://apps.apple.com/app/scanflow-qr" : "https://scanflow.dev/download",
        startedAt: scanTime,
        endedAt: new Date(scanTime.getTime() + Math.floor(Math.random() * 180 + 20) * 1000),
        durationSeconds: Math.floor(Math.random() * 180 + 20),
        eventsCount: isConverted ? 2 : 1,
        converted: isConverted,
        conversionEvent: isConverted ? "APP_INSTALL_CONFIRMED" : null,
        createdAt: scanTime,
        updatedAt: scanTime,
      });

      // Events
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
          timestamp: new Date(scanTime.getTime() + 12000),
        });
      }
    }
  }

  // Batch insert sessions
  const batchSize = 250;
  for (let i = 0; i < sessionRows.length; i += batchSize) {
    await db.insert(sessions).values(sessionRows.slice(i, i + batchSize));
  }

  // Batch insert events
  for (let i = 0; i < eventRows.length; i += batchSize) {
    await db.insert(sessionEvents).values(eventRows.slice(i, i + batchSize));
  }

  console.log(`✅ Seeded ${targetUser.email}: 3 campaigns, 4 QRs, ${sessionRows.length} sessions, ${eventRows.length} events.`);
}

async function main() {
  const rawDbUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/scanflow";
  const maskedDbUrl = rawDbUrl.replace(/:[^:@]+@/, ":***@");
  console.log(`\n🔗 Connecting to database: ${maskedDbUrl}`);

  const arg = process.env.SEED_EMAIL || process.argv[2];

  // Fetch all existing users from database
  let usersList = await db.select().from(user);

  if (usersList.length === 0) {
    // If database is brand new with 0 users, create admin demo user
    console.log("✨ No users found in database. Creating admin@scanflow.io...");
    const [createdAdmin] = await db
      .insert(user)
      .values({
        id: "usr_admin_scanflow_prod",
        name: "Admin Demo User",
        email: "admin@scanflow.io",
        emailVerified: true,
      })
      .onConflictDoNothing()
      .returning();

    usersList = [createdAdmin || (await db.query.user.findFirst({ where: eq(user.email, "admin@scanflow.io") })) as any];
  }

  if (arg && arg !== "all") {
    // Target specific user by email
    let matchedUser = usersList.find((u) => u.email.toLowerCase() === arg.toLowerCase());
    if (!matchedUser) {
      console.log(`✨ Creating user '${arg}'...`);
      const [newUser] = await db
        .insert(user)
        .values({
          id: `usr_${Math.random().toString(36).substring(2, 10)}`,
          name: arg.split("@")[0],
          email: arg,
          emailVerified: true,
        })
        .onConflictDoNothing()
        .returning();
      matchedUser = newUser || (await db.query.user.findFirst({ where: eq(user.email, arg) }));
    }
    if (matchedUser) {
      await seedUser(matchedUser);
    }
  } else {
    // Seed all users in the database
    console.log(`👥 Seeding demo data for all ${usersList.length} users in the database...`);
    for (const u of usersList) {
      await seedUser(u);
    }
  }

  console.log("\n🎉 All requested demo data seeded successfully!\n");
  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Seed error:", err);
  process.exit(1);
});
