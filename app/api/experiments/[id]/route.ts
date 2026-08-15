import { NextRequest, NextResponse } from "next/server";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { experiments, experimentVariants, sessions } from "@/lib/db/schema";
import { eq, and } from "drizzle-orm";
import { computeExperimentMetrics } from "@/lib/experiments/engine";

const VALID_STATUSES = ["draft", "active", "paused", "ended"];

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const experiment = await db.query.experiments.findFirst({
      where: and(eq(experiments.id, id), eq(experiments.userId, user.id)),
      with: {
        qrCode: true,
        campaign: true,
        variants: true,
        winnerVariant: true,
      },
    });

    if (!experiment) {
      return NextResponse.json(
        { error: "Experiment not found" },
        { status: 404 }
      );
    }

    const experimentSessions = await db.query.sessions.findMany({
      where: and(eq(sessions.experimentId, id), eq(sessions.userId, user.id)),
    });

    const stats = computeExperimentMetrics(
      experiment,
      experiment.variants || [],
      experimentSessions
    );

    return NextResponse.json({
      experiment: {
        ...experiment,
        variants: stats.variants,
        stats,
      },
    });
  } catch (error) {
    console.error("GET /api/experiments/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await db.query.experiments.findFirst({
      where: and(eq(experiments.id, id), eq(experiments.userId, user.id)),
      with: {
        variants: true,
      },
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Experiment not found" },
        { status: 404 }
      );
    }

    const body = await request.json();
    const {
      name,
      description,
      status,
      trafficAllocation,
      winnerVariantId,
      variants,
    } = body;

    const updateData: Partial<typeof experiments.$inferInsert> = {
      updatedAt: new Date(),
    };

    if (name !== undefined) {
      if (typeof name !== "string" || !name.trim()) {
        return NextResponse.json(
          { error: "Experiment name cannot be empty" },
          { status: 400 }
        );
      }
      updateData.name = name.trim();
    }

    if (description !== undefined) {
      updateData.description =
        typeof description === "string" ? description.trim() : null;
    }

    if (status !== undefined) {
      const normalizedStatus =
        typeof status === "string" ? status.trim().toLowerCase() : "";
      if (!VALID_STATUSES.includes(normalizedStatus)) {
        return NextResponse.json(
          {
            error: `Invalid status. Allowed values: ${VALID_STATUSES.join(", ")}`,
          },
          { status: 400 }
        );
      }
      updateData.status = normalizedStatus;

      if (normalizedStatus === "active" && !existing.startedAt) {
        updateData.startedAt = new Date();
      }

      if (normalizedStatus === "ended" && !existing.endedAt) {
        updateData.endedAt = new Date();
      }
    }

    if (trafficAllocation !== undefined) {
      updateData.trafficAllocation =
        typeof trafficAllocation === "number"
          ? Math.min(100, Math.max(1, Math.round(trafficAllocation)))
          : 100;
    }

    if (winnerVariantId !== undefined) {
      if (winnerVariantId !== null) {
        const matchingVariant = existing.variants?.find(
          (v: any) => v.id === winnerVariantId
        );
        if (!matchingVariant) {
          return NextResponse.json(
            { error: "Winner variant does not belong to this experiment" },
            { status: 400 }
          );
        }
      }
      updateData.winnerVariantId = winnerVariantId;
    }

    if (Array.isArray(variants)) {
      const totalWeight = variants.reduce(
        (sum: number, v: any) => sum + (Number(v.trafficWeight) || 0),
        0
      );
      if (Math.round(totalWeight) !== 100) {
        return NextResponse.json(
          { error: "Variant traffic weights must sum to 100%" },
          { status: 400 }
        );
      }

      for (const v of variants) {
        if (v.id) {
          await db
            .update(experimentVariants)
            .set({
              name: v.name !== undefined ? v.name.trim() : undefined,
              destinationUrl:
                v.destinationUrl !== undefined
                  ? v.destinationUrl.trim()
                  : undefined,
              trafficWeight:
                v.trafficWeight !== undefined
                  ? Math.round(Number(v.trafficWeight))
                  : undefined,
              isControl:
                v.isControl !== undefined ? Boolean(v.isControl) : undefined,
              updatedAt: new Date(),
            })
            .where(
              and(
                eq(experimentVariants.id, v.id),
                eq(experimentVariants.experimentId, id)
              )
            );
        }
      }
    }

    const [updatedExperiment] = await db
      .update(experiments)
      .set(updateData)
      .where(and(eq(experiments.id, id), eq(experiments.userId, user.id)))
      .returning();

    return NextResponse.json({ experiment: updatedExperiment });
  } catch (error) {
    console.error("PATCH /api/experiments/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser(request);
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { id } = await params;

    const existing = await db.query.experiments.findFirst({
      where: and(eq(experiments.id, id), eq(experiments.userId, user.id)),
    });

    if (!existing) {
      return NextResponse.json(
        { error: "Experiment not found" },
        { status: 404 }
      );
    }

    await db
      .delete(experiments)
      .where(and(eq(experiments.id, id), eq(experiments.userId, user.id)))
      .returning();

    return NextResponse.json({
      success: true,
      message: "Experiment deleted successfully",
    });
  } catch (error) {
    console.error("DELETE /api/experiments/[id] error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
