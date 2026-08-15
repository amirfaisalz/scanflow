"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavMain } from "@/components/nav-main";
import { NavUser } from "@/components/nav-user";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import {
  LayoutDashboardIcon,
  QrCode,
  Compass,
  FolderGit2,
  Target,
  BarChart3,
  GitBranch,
  ShieldCheck,
} from "lucide-react";

interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  user?: {
    name: string;
    email: string;
    avatar?: string;
  };
}

export function AppSidebar({ user, ...props }: AppSidebarProps) {
  const pathname = usePathname();

  const currentUser = user || {
    name: "ScanFlow User",
    email: "user@scanflow.io",
    avatar: "",
  };

  const navMain = [
    {
      title: "Dashboard",
      url: "/dashboard",
      icon: <LayoutDashboardIcon className="size-4" />,
      isActive: pathname === "/dashboard",
    },
    {
      title: "QR Codes",
      url: "/dashboard/qr-codes",
      icon: <QrCode className="size-4" />,
      isActive: pathname.startsWith("/dashboard/qr-codes"),
    },
    {
      title: "Scan Journeys",
      url: "/dashboard/journeys",
      icon: <Compass className="size-4" />,
      isActive: pathname.startsWith("/dashboard/journeys"),
    },
    {
      title: "Campaigns",
      url: "/dashboard/campaigns",
      icon: <FolderGit2 className="size-4" />,
      isActive: pathname.startsWith("/dashboard/campaigns"),
    },
    {
      title: "Conversions",
      url: "/dashboard/conversions",
      icon: <Target className="size-4" />,
      isActive: pathname.startsWith("/dashboard/conversions"),
    },
    {
      title: "Analytics",
      url: "/dashboard/analytics",
      icon: <BarChart3 className="size-4" />,
      isActive: pathname.startsWith("/dashboard/analytics"),
    },
    {
      title: "A/B Experiments",
      url: "/dashboard/experiments",
      icon: <GitBranch className="size-4" />,
      isActive: pathname.startsWith("/dashboard/experiments"),
    },
  ];

  return (
    <Sidebar collapsible="icon" {...props}>
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton
              size="lg"
              className="data-[slot=sidebar-menu-button]:p-2 hover:bg-sidebar-accent"
              render={<Link href="/dashboard" />}
            >
              <div className="size-8 rounded-lg bg-linear-to-br from-fire to-fire-hover text-white flex items-center justify-center shadow-xs">
                <QrCode className="size-4 text-white" />
              </div>
              <div className="grid flex-1 text-left text-sm leading-tight">
                <span className="truncate font-semibold text-foreground">ScanFlow</span>
                <span className="truncate text-[10px] text-muted-foreground flex items-center gap-1">
                  <ShieldCheck className="size-3 text-emerald-500" />
                  Isolated Workspace
                </span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      <SidebarContent>
        <NavMain items={navMain} />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
