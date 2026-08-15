import { Skeleton } from "@/components/ui/skeleton";

export default function ConversionsLoading() {
  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6 animate-pulse">
      {/* Header */}
      <div className="mx-4 lg:mx-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="space-y-1.5">
          <div className="flex items-center gap-2">
            <Skeleton className="h-4 w-20" />
            <span className="text-muted-foreground">/</span>
            <Skeleton className="h-4 w-28" />
          </div>
          <Skeleton className="h-7 w-64" />
          <Skeleton className="h-4 w-80" />
        </div>
        <Skeleton className="h-9 w-36 rounded-lg" />
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 sm:grid-cols-2 lg:grid-cols-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="p-4 rounded-xl border border-border/60 bg-card/40 space-y-2">
            <Skeleton className="h-3.5 w-24" />
            <Skeleton className="h-7 w-20" />
            <Skeleton className="h-3 w-32" />
          </div>
        ))}
      </div>

      {/* Goals & Events Grid */}
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 lg:grid-cols-2">
        <div className="p-5 rounded-2xl border border-border/60 bg-card/40 space-y-3">
          <Skeleton className="h-5 w-36" />
          <div className="space-y-2 pt-2">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-16 w-full rounded-xl" />
            ))}
          </div>
        </div>
        <div className="p-5 rounded-2xl border border-border/60 bg-card/40 space-y-3">
          <Skeleton className="h-5 w-40" />
          <div className="space-y-2 pt-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-12 w-full rounded-xl" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
