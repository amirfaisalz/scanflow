import { db } from "../lib/db";
import { user, qrCodes, campaigns, sessions, sessionEvents } from "../lib/db/schema";
import { eq } from "drizzle-orm";

async function main() {
  const users = await db.select().from(user);
  console.log("Users:", users);

  const qrs = await db.select().from(qrCodes);
  console.log("QRs count:", qrs.length);

  const sess = await db.select().from(sessions);
  console.log("Sessions count:", sess.length);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
