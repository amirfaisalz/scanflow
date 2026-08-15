import { Suspense } from "react";
import { getCurrentUser } from "@/lib/auth-helpers";
import { db } from "@/lib/db";
import { qrCodes } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import { QRCodesView } from "@/components/qr/qr-codes-view";
import { Skeleton } from "@/components/ui/skeleton";

function QRCodesSkeleton() {
  return (
    <div className="flex flex-col gap-6 p-4 sm:p-6 max-w-7xl mx-auto w-full animate-pulse">
      {/* Breadcrumb Skeleton */}
      <div className="flex items-center gap-2">
        <Skeleton className="h-4 w-20" />
        <span className="text-muted-foreground/40">/</span>
        <Skeleton className="h-4 w-24" />
      </div>

      {/* Header Banner Skeleton */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 p-4 sm:p-5 rounded-2xl border border-border/60 bg-card/40">
        <div className="flex items-center gap-3">
          <Skeleton className="size-10 rounded-xl" />
          <div className="space-y-1.5">
            <div className="flex items-center gap-2">
              <Skeleton className="h-5 w-44" />
              <Skeleton className="h-4 w-24 rounded-full" />
            </div>
            <Skeleton className="h-3 w-72" />
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Skeleton className="h-8 w-24 rounded-lg" />
          <Skeleton className="h-8 w-36 rounded-lg" />
        </div>
      </div>

      {/* KPI Cards Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-5 rounded-2xl border border-border/60 bg-card/40 space-y-3">
            <div className="flex items-center justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="size-9 rounded-full" />
            </div>
            <div className="my-3 space-y-1">
              <Skeleton className="h-8 w-24" />
            </div>
            <div className="flex items-center gap-2">
              <Skeleton className="h-3.5 w-16" />
              <Skeleton className="h-3 w-20" />
            </div>
          </div>
        ))}
      </div>

      {/* Search & Filter Toolbar Skeleton */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl border border-border/60 bg-card/40">
        <Skeleton className="h-9 w-full sm:w-80 rounded-lg" />
        <div className="flex items-center gap-2">
          <Skeleton className="h-9 w-36 rounded-lg" />
          <Skeleton className="h-9 w-20 rounded-lg" />
        </div>
      </div>

      {/* QR Cards Grid Skeleton */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {[...Array(6)].map((_, i) => (
          <div
            key={i}
            className="p-5 rounded-2xl border border-border/60 bg-card/40 space-y-4 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-32" />
                <Skeleton className="h-5 w-16 rounded-full" />
              </div>
              <Skeleton className="h-3.5 w-48" />
              <div className="flex items-center justify-center p-6 bg-muted/20 rounded-xl">
                <Skeleton className="size-32 rounded-lg" />
              </div>
            </div>
            <div className="space-y-2 pt-3 border-t border-border/40">
              <div className="flex justify-between items-center">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-3 w-16" />
              </div>
              <div className="flex gap-2 pt-1">
                <Skeleton className="h-8 flex-1 rounded-lg" />
                <Skeleton className="size-8 rounded-lg" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

async function QRCodesDataLoader() {
  const user = await getCurrentUser();
  if (!user) return null;

  // 1. Fetch QR codes directly from DB on the server (no seed fallback)
  const userQrCodes = await db.query.qrCodes.findMany({
    where: eq(qrCodes.userId, user.id),
    orderBy: [desc(qrCodes.createdAt)],
  });

  // 2. Render Interactive Client Component with Server-Fetched Initial Data
  return <QRCodesView initialQrCodes={userQrCodes} />;
}

export default function QRCodesPage() {
  return (
    <Suspense fallback={<QRCodesSkeleton />}>
      <QRCodesDataLoader />
    </Suspense>
  );
}
