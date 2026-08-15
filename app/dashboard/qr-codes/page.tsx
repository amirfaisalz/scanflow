import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { qrCodes } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { ensureUserDemoData } from "@/lib/db/seed-user";
import { QRCodesView } from "@/components/qr/qr-codes-view";

export default async function QRCodesPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  // 1. Fetch QR codes directly on the server
  let userQrCodes = await db.query.qrCodes.findMany({
    where: eq(qrCodes.userId, user.id),
    orderBy: [desc(qrCodes.createdAt)],
  });

  // Seed demo data if first-time user
  if (userQrCodes.length === 0) {
    await ensureUserDemoData(user.id, user.email);
    userQrCodes = await db.query.qrCodes.findMany({
      where: eq(qrCodes.userId, user.id),
      orderBy: [desc(qrCodes.createdAt)],
    });
  }

  // 2. Render Interactive Client Component with Server-Fetched Initial Data
  return <QRCodesView initialQrCodes={userQrCodes} />;
}
