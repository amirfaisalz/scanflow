import { NextRequest, NextResponse } from "next/server";
import crypto from "crypto";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { experiments, experimentVariants, qrCodes, sessions } from "@/lib/db/schema";
import { eq, and, desc } from "drizzle-orm";
import { computeExperimentMetrics } from "@/lib/experiments/engine";
import { isValidUrl } from "@/lib/qr";

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [userExperiments, userSessions] = await Promise.all([
      db.query.experiments.findMany({
        where: eq(experiments.userId, user.id),
        orderBy: [desc(experiments.createdAt)],
        with: {
          qrCode: true,
          campaign: true,
          variants: true,
          winnerVariant: true,
        },
      }),
      db.query.sessions.findMany({
        where: eq(sessions.userId, user.id),
      }),
    ]);

    const enrichedExperiments = userExperiments.map((exp) => {
      const relevantSessions = userSessions.filter(
        (s) => s.experimentId === exp.id
      );

      const stats = computeExperimentMetrics(
        exp,
        exp.variants || [],
        relevantSessions
      );

      return {
        ...exp,
        variants: stats.variants,
        stats,
      };
    });

    const totalExperiments = enrichedExperiments.length;
    const activeExperiments = enrichedExperiments.filter(
      (e) => e.status === "active"
    ).length;
    const totalVariants = enrichedExperiments.reduce(
      (sum, e) => sum + (e.variants?.length || 0),
      0
    );
    const totalConversions = enrichedExperiments.reduce(
      (sum, e) => sum + (e.stats?.totalConversions || 0),
      0
    );
    const totalSessions = enrichedExperiments.reduce(
      (sum, e) => sum + (e.stats?.totalSessions || 0),
      0
    );
    const overallConversionRate =
      totalSessions > 0
        ? Number(((totalConversions / totalSessions) * 100).toFixed(1))
        : 0;
    const significantWinnersCount = enrichedExperiments.filter(
      (e) => e.stats?.hasSignificantWinner || Boolean(e.winnerVariantId)
    ).length;

    return NextResponse.json(
      {
        experiments: enrichedExperiments,
        metrics: {
          totalExperiments,
          activeExperiments,
          totalVariants,
          totalConversions,
          totalSessions,
          overallConversionRate,
          significantWinnersCount,
        },
      },
      { headers: { "Cache-Control": "private, max-age=15, stale-while-revalidate=60" } }
    );
  } catch (error) {
    console.error("GET /api/experiments error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const {
      name,
      description,
      qrCodeId,
      campaignId,
      trafficAllocation = 100,
      status = "draft",
      variants,
    } = body;

    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { error: "Experiment name is required" },
        { status: 400 }
      );
    }

    if (!qrCodeId || typeof qrCodeId !== "string" || !qrCodeId.trim()) {
      return NextResponse.json(
        { error: "QR code is required" },
        { status: 400 }
      );
    }

    // Verify QR code ownership
    const qrCode = await db.query.qrCodes.findFirst({
      where: and(eq(qrCodes.id, qrCodeId.trim()), eq(qrCodes.userId, user.id)),
    });

    if (!qrCode) {
      return NextResponse.json(
        { error: "QR code not found or unauthorized" },
        { status: 404 }
      );
    }

    // Validate variants array
    if (!Array.isArray(variants) || variants.length < 2) {
      return NextResponse.json(
        { error: "Experiment requires at least 2 variants" },
        { status: 400 }
      );
    }

    // Validate each variant fields
    for (let i = 0; i < variants.length; i++) {
      const v = variants[i];
      if (!v.name || typeof v.name !== "string" || !v.name.trim()) {
        return NextResponse.json(
          { error: `Variant ${i + 1} requires a valid name` },
          { status: 400 }
        );
      }
      if (!v.destinationUrl || typeof v.destinationUrl !== "string" || !isValidUrl(v.destinationUrl.trim())) {
        return NextResponse.json(
          { error: `Variant "${v.name}" requires a valid URL (http/https)` },
          { status: 400 }
        );
      }
    }

    // Validate traffic weights sum to 100%
    const totalWeight = variants.reduce(
      (sum: number, v: { trafficWeight?: number }) => sum + (Number(v.trafficWeight) || 0),
      0
    );
    if (Math.round(totalWeight) !== 100) {
      return NextResponse.json(
        { error: "Variant traffic weights must sum to 100%" },
        { status: 400 }
      );
    }

    const expId = `exp_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`;
    const parsedTrafficAllocation =
      typeof trafficAllocation === "number"
        ? Math.min(100, Math.max(1, Math.round(trafficAllocation)))
        : 100;

    const hasExplicitControl = variants.some((v: { isControl?: boolean }) => Boolean(v.isControl));

    const [createdExp] = await db
      .insert(experiments)
      .values({
        id: expId,
        userId: user.id,
        qrCodeId: qrCode.id,
        campaignId: campaignId || qrCode.campaignId || null,
        name: name.trim(),
        description: description ? description.trim() : null,
        status: status || "draft",
        trafficAllocation: parsedTrafficAllocation,
        startedAt: status === "active" ? new Date() : null,
      })
      .returning();

    const variantRecords = variants.map((v: { name: string; destinationUrl: string; trafficWeight?: number; isControl?: boolean }, index: number) => {
      const isControl = hasExplicitControl ? Boolean(v.isControl) : index === 0;
      return {
        id: `var_${crypto.randomUUID().replace(/-/g, "").slice(0, 16)}`,
        experimentId: expId,
        userId: user.id,
        name: v.name.trim(),
        destinationUrl: v.destinationUrl.trim(),
        trafficWeight: Math.round(Number(v.trafficWeight)) || 0,
        isControl,
      };
    });

    const createdVariants = await db
      .insert(experimentVariants)
      .values(variantRecords)
      .returning();

    return NextResponse.json(
      {
        experiment: {
          ...createdExp,
          variants: createdVariants,
          qrCode,
        },
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("POST /api/experiments error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
