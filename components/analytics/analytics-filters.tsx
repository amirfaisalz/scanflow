"use client";

import * as React from "react";
import {
  Calendar,
  Filter,
  Download,
  RotateCw,
  QrCode,
  FolderGit2,
  Smartphone,
  FileSpreadsheet,
  FileCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export interface AnalyticsFiltersProps {
  period: "24h" | "7d" | "30d" | "90d" | "all";
  onPeriodChange: (period: "24h" | "7d" | "30d" | "90d" | "all") => void;
  qrCodeId?: string;
  onQrCodeChange: (qrCodeId: string) => void;
  campaignId?: string;
  onCampaignChange: (campaignId: string) => void;
  device?: string;
  onDeviceChange: (device: string) => void;
  qrOptions: Array<{ id: string; name: string }>;
  campaignOptions: Array<{ id: string; name: string }>;
  onExport: (format: "csv" | "json") => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

const PERIOD_OPTIONS: Array<{ value: "24h" | "7d" | "30d" | "90d" | "all"; label: string }> = [
  { value: "24h", label: "24 Hours" },
  { value: "7d", label: "7 Days" },
  { value: "30d", label: "30 Days" },
  { value: "90d", label: "90 Days" },
  { value: "all", label: "All Time" },
];

export function AnalyticsFilters({
  period,
  onPeriodChange,
  qrCodeId = "all",
  onQrCodeChange,
  campaignId = "all",
  onCampaignChange,
  device = "all",
  onDeviceChange,
  qrOptions = [],
  campaignOptions = [],
  onExport,
  onRefresh,
  isLoading = false,
}: AnalyticsFiltersProps) {
  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200/80 bg-white/70 p-4 shadow-sm backdrop-blur-md dark:border-zinc-800/80 dark:bg-zinc-950/70">
      {/* Top row: Time Period selection & Actions (Export, Refresh) */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        {/* Period Selector Tabs */}
        <div className="flex items-center gap-1 rounded-xl bg-zinc-100 p-1 dark:bg-zinc-900">
          <Calendar className="ml-2 mr-1 h-3.5 w-3.5 text-zinc-400" />
          {PERIOD_OPTIONS.map((opt) => {
            const isActive = period === opt.value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => onPeriodChange(opt.value)}
                className={cn(
                  "rounded-lg px-3 py-1.5 text-xs font-medium transition-all",
                  isActive
                    ? "bg-white text-zinc-900 shadow-xs dark:bg-zinc-800 dark:text-zinc-100 font-semibold"
                    : "text-zinc-600 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-zinc-200"
                )}
                aria-pressed={isActive}
              >
                {opt.label}
              </button>
            );
          })}
        </div>

        {/* Action Controls: Export CSV, Export JSON, Refresh */}
        <div className="flex items-center gap-2">
          <div className="flex items-center rounded-lg border border-zinc-200 bg-white p-0.5 shadow-2xs dark:border-zinc-800 dark:bg-zinc-900">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onExport("csv")}
              className="h-7 gap-1.5 px-2.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              <FileSpreadsheet className="h-3.5 w-3.5 text-emerald-500" />
              <span>CSV</span>
            </Button>
            <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
            <Button
              variant="ghost"
              size="sm"
              onClick={() => onExport("json")}
              className="h-7 gap-1.5 px-2.5 text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800 dark:hover:text-zinc-100"
            >
              <FileCode className="h-3.5 w-3.5 text-sky-500" />
              <span>JSON</span>
            </Button>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isLoading}
            className="h-8 gap-1.5 border-zinc-200 bg-white text-xs font-medium text-zinc-700 hover:bg-zinc-100 hover:text-zinc-900 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-300 dark:hover:bg-zinc-800"
            aria-label="Refresh data"
          >
            <RotateCw className={cn("h-3.5 w-3.5", isLoading && "animate-spin text-sky-500")} />
            <span>Refresh</span>
          </Button>
        </div>
      </div>

      {/* Bottom row: Dimensional dropdown filters (QR, Campaign, Device) */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
        {/* QR Code Filter */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="qr-select-filter"
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400"
          >
            <QrCode className="h-3.5 w-3.5 text-sky-500" />
            <span>QR Code</span>
          </label>
          <div className="relative">
            <select
              id="qr-select-filter"
              aria-label="QR Code"
              value={qrCodeId || "all"}
              onChange={(e) => onQrCodeChange(e.target.value)}
              className="w-full appearance-none rounded-xl border border-zinc-200 bg-white px-3 py-2 pr-8 text-xs font-medium text-zinc-800 transition-colors focus:border-sky-500 focus:outline-hidden focus:ring-1 focus:ring-sky-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
            >
              <option value="all">All QR Codes</option>
              {qrOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
            <Filter className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
          </div>
        </div>

        {/* Campaign Filter */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="campaign-select-filter"
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400"
          >
            <FolderGit2 className="h-3.5 w-3.5 text-purple-500" />
            <span>Campaign</span>
          </label>
          <div className="relative">
            <select
              id="campaign-select-filter"
              aria-label="Campaign"
              value={campaignId || "all"}
              onChange={(e) => onCampaignChange(e.target.value)}
              className="w-full appearance-none rounded-xl border border-zinc-200 bg-white px-3 py-2 pr-8 text-xs font-medium text-zinc-800 transition-colors focus:border-purple-500 focus:outline-hidden focus:ring-1 focus:ring-purple-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
            >
              <option value="all">All Campaigns</option>
              {campaignOptions.map((opt) => (
                <option key={opt.id} value={opt.id}>
                  {opt.name}
                </option>
              ))}
            </select>
            <Filter className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
          </div>
        </div>

        {/* Device Filter */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="device-select-filter"
            className="flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400"
          >
            <Smartphone className="h-3.5 w-3.5 text-emerald-500" />
            <span>Device</span>
          </label>
          <div className="relative">
            <select
              id="device-select-filter"
              aria-label="Device"
              value={device || "all"}
              onChange={(e) => onDeviceChange(e.target.value)}
              className="w-full appearance-none rounded-xl border border-zinc-200 bg-white px-3 py-2 pr-8 text-xs font-medium text-zinc-800 transition-colors focus:border-emerald-500 focus:outline-hidden focus:ring-1 focus:ring-emerald-500 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200"
            >
              <option value="all">All Devices</option>
              <option value="mobile">Mobile</option>
              <option value="desktop">Desktop</option>
              <option value="tablet">Tablet</option>
            </select>
            <Filter className="pointer-events-none absolute right-2.5 top-2.5 h-3.5 w-3.5 text-zinc-400" />
          </div>
        </div>
      </div>
    </div>
  );
}
