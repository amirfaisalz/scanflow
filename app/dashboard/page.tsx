import { ChartAreaInteractive } from "@/components/chart-area-interactive";
import { DataTable } from "@/components/data-table";
import { SectionCards } from "@/components/section-cards";
import { getCurrentUser } from "@/lib/auth-helpers";
import { ShieldCheck, Sparkles } from "lucide-react";
import data from "./data.json";

export default async function DashboardPage() {
  const user = await getCurrentUser();

  return (
    <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
      {/* Workspace Identity Banner */}
      <div className="mx-4 lg:mx-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 p-4 rounded-xl border border-border/80 bg-card/60 shadow-2xs">
        <div className="flex items-center gap-3">
          <div className="size-9 rounded-lg bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
            {user?.name ? user.name[0].toUpperCase() : "U"}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-sm font-semibold text-foreground">
                {user?.name}'s Workspace
              </h2>
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
                <span className="size-1 rounded-full bg-emerald-500 animate-pulse" />
                Isolated Tenant
              </span>
            </div>
            <p className="text-xs text-muted-foreground">
              {user?.email} • Database ID: <code className="text-[11px] font-mono">{user?.id?.slice(0, 10)}...</code>
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <ShieldCheck className="size-4 text-emerald-500" />
          <span>PostgreSQL Multi-Tenant Scoped</span>
        </div>
      </div>

      {/* Top Metric Cards */}
      <SectionCards />

      {/* Interactive Scan Area Chart */}
      <div className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </div>

      {/* Data Table */}
      <DataTable data={data} />
    </div>
  );
}
