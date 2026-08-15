import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { getAnalyticsOverview } from "@/lib/analytics/overview";

const VALID_PERIODS = ["24h", "7d", "30d", "90d", "all"] as const;
type Period = (typeof VALID_PERIODS)[number];

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const searchParams = request.nextUrl.searchParams;
    const rawPeriod = searchParams.get("period");
    const qrCodeId = searchParams.get("qrCodeId") || undefined;
    const campaignId = searchParams.get("campaignId") || undefined;
    const device = searchParams.get("device") || undefined;

    const period: Period =
      rawPeriod && VALID_PERIODS.includes(rawPeriod as Period)
        ? (rawPeriod as Period)
        : "24h";

    const overviewData = await getAnalyticsOverview(user.id, {
      period,
      qrCodeId,
      campaignId,
      device,
    });

    return NextResponse.json({ data: overviewData });
  } catch (error) {
    console.error("GET /api/analytics/overview error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
