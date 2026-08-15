"use client";

import { Separator } from "@/components/ui/separator";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { usePathname } from "next/navigation";
import { ShieldCheck } from "lucide-react";


export function SiteHeader() {
  const pathname = usePathname();

  const getPageTitle = () => {
    if (pathname.includes("qr-codes")) return "QR Code Management";
    if (pathname.includes("campaigns")) return "Campaigns";
    if (pathname.includes("analytics")) return "Scan Analytics & Journeys";
    if (pathname.includes("experiments")) return "A/B Experiments";
    return "Overview Dashboard";
  };

  return (
    <header className="flex h-(--header-height) shrink-0 items-center justify-between gap-2 border-b border-border/60 bg-background px-4 lg:px-6 transition-[width,height] ease-linear">
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <Separator
          orientation="vertical"
          className="mx-2 h-4 data-vertical:self-auto"
        />
        <Breadcrumb>
          <BreadcrumbList>
            <BreadcrumbItem>
              <BreadcrumbLink href="/dashboard">ScanFlow</BreadcrumbLink>
            </BreadcrumbItem>
            <BreadcrumbSeparator />
            <BreadcrumbItem>
              <BreadcrumbPage className="font-medium text-foreground">
                {getPageTitle()}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>

      <div className="flex items-center gap-2 text-xs">
        <div className="hidden sm:flex items-center gap-1.5 rounded-full border border-border bg-secondary/40 px-2.5 py-1 text-muted-foreground">
          <ShieldCheck className="size-3.5 text-emerald-500" />
          <span>Tenant Isolated</span>
        </div>
      </div>
    </header>
  );
}
