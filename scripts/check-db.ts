import * as dotenv from "dotenv";
dotenv.config();

import { db } from "../lib/db";
import { user, qrCodes, campaigns, sessions, sessionEvents, routingRules } from "../lib/db/schema";

async function main() {
  const rawDbUrl = process.env.DATABASE_URL || "postgresql://postgres:postgres@localhost:5432/scanflow";
  const maskedDbUrl = rawDbUrl.replace(/:[^:@]+@/, ":***@");
  console.log(`\n🔗 Connected to database: ${maskedDbUrl}\n`);

  try {
    const users = await db.select().from(user);
    const campaignsList = await db.select().from(campaigns);
    const qrs = await db.select().from(qrCodes);
    const rules = await db.select().from(routingRules);
    const sess = await db.select().from(sessions);
    const events = await db.select().from(sessionEvents);

    console.log("📊 Database Record Summary:");
    console.log(` - Users:          ${users.length}`);
    if (users.length > 0) {
      users.forEach((u) => console.log(`    • ${u.email} (${u.name}) - ID: ${u.id}`));
    }
    console.log(` - Campaigns:      ${campaignsList.length}`);
    if (campaignsList.length > 0) {
      campaignsList.forEach((c) => console.log(`    • [${c.id}] "${c.name}" -> Owner UserID: ${c.userId}`));
    }
    console.log(` - QR Codes:       ${qrs.length}`);
    if (qrs.length > 0) {
      qrs.forEach((q) => console.log(`    • [${q.id}] "${q.name}" -> Owner UserID: ${q.userId}`));
    }
    console.log(` - Routing Rules:  ${rules.length}`);
    console.log(` - Sessions:       ${sess.length}`);
    console.log(` - Events:         ${events.length}`);
    console.log("\n✅ Database connection and schema query succeeded!\n");
  } catch (err: any) {
    console.error("❌ Database query failed:", err.message);
    if (err.code === "42P01") {
      console.error("⚠️ Tables do not exist yet! Run `npm run db:push` first to create the schema.");
    }
  }
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
