"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavMain } from "@/components/nav-main";
import { NavSecondary } from "@/components/nav-secondary";
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
  FolderGit2,
  BarChart3,
  GitBranch,
  Settings2Icon,
  BookOpenIcon,
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
      title: "Campaigns",
      url: "/dashboard/campaigns",
      icon: <FolderGit2 className="size-4" />,
      isActive: pathname.startsWith("/dashboard/campaigns"),
    },
    {
      title: "Analytics & Journeys",
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

  const navSecondary = [
    {
      title: "Data Isolation & Settings",
      url: "/dashboard/settings",
      icon: <Settings2Icon className="size-4" />,
    },
    {
      title: "Product Documentation",
      url: "/dashboard/docs",
      icon: <BookOpenIcon className="size-4" />,
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
              <div className="size-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-xs">
                <QrCode className="size-5" />
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
        <NavSecondary items={navSecondary} className="mt-auto" />
      </SidebarContent>

      <SidebarFooter>
        <NavUser user={currentUser} />
      </SidebarFooter>
    </Sidebar>
  );
}
