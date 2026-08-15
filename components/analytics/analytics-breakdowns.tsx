"use client";

import * as React from "react";
import {
  Smartphone,
  Compass,
  MapPin,
  Clock,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export interface AnalyticsBreakdownsProps {
  breakdowns: {
    devices: Array<{ name: string; value: number; percentage: number }>;
    operatingSystems: Array<{ name: string; value: number; percentage: number }>;
    browsers: Array<{ name: string; value: number; percentage: number }>;
    countries: Array<{ code: string; name: string; scans: number; percentage: number }>;
    cities: Array<{ name: string; country: string; scans: number; percentage: number }>;
    hourlyDistribution: Array<{ hour: number; label: string; count: number }>;
  };
}

export function AnalyticsBreakdowns({ breakdowns }: AnalyticsBreakdownsProps) {
  const [deviceTab, setDeviceTab] = React.useState<"devices" | "os">("devices");
  const [geoTab, setGeoTab] = React.useState<"countries" | "cities">("countries");

  const devices = breakdowns?.devices ?? [];
  const operatingSystems = breakdowns?.operatingSystems ?? [];
  const browsers = breakdowns?.browsers ?? [];
  const countries = breakdowns?.countries ?? [];
  const cities = breakdowns?.cities ?? [];
  const hourlyDistribution = breakdowns?.hourlyDistribution ?? [];

  const maxHourly = Math.max(1, ...hourlyDistribution.map((h) => h.count));
  const peakHour = hourlyDistribution.reduce(
    (max, curr) => (curr.count > (max?.count ?? 0) ? curr : max),
    hourlyDistribution[0]
  );

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* 1. Device & OS Breakdown */}
      <Card className="rounded-2xl border border-border/80 bg-card/60 shadow-2xs backdrop-blur-md">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <Smartphone className="size-4 text-sky-500" />
              Device &amp; OS Breakdown
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Client hardware and operating systems
            </CardDescription>
          </div>

          <div className="flex items-center gap-1 rounded-xl bg-muted/60 p-1">
            <button
              type="button"
              onClick={() => setDeviceTab("devices")}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-medium transition-all",
                deviceTab === "devices"
                  ? "bg-background text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Devices
            </button>
            <button
              type="button"
              onClick={() => setDeviceTab("os")}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-medium transition-all",
                deviceTab === "os"
                  ? "bg-background text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              OS
            </button>
          </div>
        </CardHeader>

        <CardContent>
          {deviceTab === "devices" ? (
            devices.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No device data recorded
              </div>
            ) : (
              <div className="space-y-3">
                {devices.map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-medium text-foreground">
                        {item.name}
                      </span>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-muted-foreground">{item.value.toLocaleString()} scans</span>
                        <span className="font-mono font-semibold text-foreground">
                          {item.percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-sky-500 transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, item.percentage))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : operatingSystems.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No device data recorded
            </div>
          ) : (
            <div className="space-y-3">
              {operatingSystems.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">
                      {item.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-muted-foreground">{item.value.toLocaleString()} scans</span>
                      <span className="font-mono font-semibold text-foreground">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-indigo-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, item.percentage))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 2. Browser Distribution */}
      <Card className="rounded-2xl border border-border/80 bg-card/60 shadow-2xs backdrop-blur-md">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
            <Compass className="size-4 text-emerald-500" />
            Browser Distribution
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Client web browsers used for scanning
          </CardDescription>
        </CardHeader>

        <CardContent>
          {browsers.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No browser data recorded
            </div>
          ) : (
            <div className="space-y-3">
              {browsers.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-medium text-foreground">
                      {item.name}
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-muted-foreground">{item.value.toLocaleString()} scans</span>
                      <span className="font-mono font-semibold text-foreground">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, item.percentage))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 3. Geographic Insights */}
      <Card className="rounded-2xl border border-border/80 bg-card/60 shadow-2xs backdrop-blur-md">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <MapPin className="size-4 text-purple-500" />
              Geographic Insights
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              Top countries and cities by volume
            </CardDescription>
          </div>

          <div className="flex items-center gap-1 rounded-xl bg-muted/60 p-1">
            <button
              type="button"
              onClick={() => setGeoTab("countries")}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-medium transition-all",
                geoTab === "countries"
                  ? "bg-background text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Countries
            </button>
            <button
              type="button"
              onClick={() => setGeoTab("cities")}
              className={cn(
                "rounded-lg px-2.5 py-1 text-xs font-medium transition-all",
                geoTab === "cities"
                  ? "bg-background text-foreground shadow-2xs font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              Cities
            </button>
          </div>
        </CardHeader>

        <CardContent>
          {geoTab === "countries" ? (
            countries.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                No location data recorded
              </div>
            ) : (
              <div className="space-y-3">
                {countries.map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="h-5 px-1.5 font-mono text-[10px] uppercase">
                          {item.code}
                        </Badge>
                        <span className="font-medium text-foreground truncate">
                          {item.name}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-muted-foreground">{item.scans.toLocaleString()} scans</span>
                        <span className="font-mono font-semibold text-foreground">
                          {item.percentage}%
                        </span>
                      </div>
                    </div>
                    <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                      <div
                        className="h-full rounded-full bg-purple-500 transition-all duration-500"
                        style={{ width: `${Math.min(100, Math.max(0, item.percentage))}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            )
          ) : cities.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No location data recorded
            </div>
          ) : (
            <div className="space-y-3">
              {cities.map((item, idx) => (
                <div key={idx} className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-foreground">
                        {item.name}
                      </span>
                      {item.country && (
                        <span className="text-[10px] text-muted-foreground">({item.country})</span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-muted-foreground">{item.scans.toLocaleString()} scans</span>
                      <span className="font-mono font-semibold text-foreground">
                        {item.percentage}%
                      </span>
                    </div>
                  </div>
                  <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full rounded-full bg-purple-400 transition-all duration-500"
                      style={{ width: `${Math.min(100, Math.max(0, item.percentage))}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* 4. Time of Day Activity */}
      <Card className="rounded-2xl border border-border/80 bg-card/60 shadow-2xs backdrop-blur-md">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <div>
            <CardTitle className="flex items-center gap-2 text-base font-bold text-foreground">
              <Clock className="size-4 text-amber-500" />
              Time of Day Activity
            </CardTitle>
            <CardDescription className="text-xs text-muted-foreground">
              24-hour distribution of scan events
            </CardDescription>
          </div>

          {peakHour && peakHour.count > 0 && (
            <Badge variant="outline" className="bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20 text-[10px]">
              Peak: {peakHour.label} ({peakHour.count} scans)
            </Badge>
          )}
        </CardHeader>

        <CardContent>
          {hourlyDistribution.length === 0 ? (
            <div className="py-8 text-center text-xs text-muted-foreground">
              No hourly activity recorded
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex h-28 items-end gap-1 pt-4">
                {hourlyDistribution.map((slot) => {
                  const heightPercent = slot.count > 0 ? Math.max(12, Math.round((slot.count / maxHourly) * 100)) : 4;
                  const isPeak = peakHour && slot.hour === peakHour.hour && slot.count > 0;
                  return (
                    <div
                      key={slot.hour}
                      className="group relative flex flex-1 flex-col items-center h-full justify-end"
                    >
                      {/* Tooltip on hover */}
                      <div className="absolute -top-7 hidden rounded-md bg-zinc-900 px-1.5 py-0.5 text-[10px] text-white shadow-xs group-hover:block z-10 whitespace-nowrap dark:bg-zinc-100 dark:text-zinc-900">
                        {slot.label}: {slot.count} scans
                      </div>
                      <div
                        className={cn(
                          "w-full rounded-t-sm transition-all duration-300",
                          isPeak
                            ? "bg-amber-500"
                            : slot.count > 0
                            ? "bg-amber-400/60 hover:bg-amber-400"
                            : "bg-muted"
                        )}
                        style={{ height: `${heightPercent}%` }}
                      />
                    </div>
                  );
                })}
              </div>

              {/* Hour X-Axis Labels (Every 3 hours) */}
              <div className="flex justify-between text-[10px] font-mono text-muted-foreground pt-1 border-t border-border/60">
                <span>00:00</span>
                <span>06:00</span>
                <span>12:00</span>
                <span>18:00</span>
                <span>23:00</span>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
