"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { authClient } from "@/lib/auth-client";
import { Button } from "@/components/ui/button";
import {
  QrCode,
  LayoutDashboard,
  BarChart3,
  GitBranch,
  FolderGit2,
  LogOut,
  ShieldCheck,
} from "lucide-react";

import { useState } from "react";

interface DashboardHeaderProps {
  user: {
    id: string;
    name: string;
    email: string;
  };
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleSignOut = async () => {
    setIsLoggingOut(true);
    try {
      await authClient.signOut();
      router.push("/login");
      router.refresh();
    } catch (err) {
      console.error("Sign out error:", err);
      setIsLoggingOut(false);
    }
  };

  const navItems = [
    { label: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { label: "QR Codes", href: "/dashboard/qr-codes", icon: QrCode },
    { label: "Campaigns", href: "/dashboard/campaigns", icon: FolderGit2 },
    { label: "Analytics", href: "/dashboard/analytics", icon: BarChart3 },
    { label: "A/B Experiments", href: "/dashboard/experiments", icon: GitBranch },
  ];

  return (
    <header className="sticky top-0 z-40 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
        {/* Brand */}
        <div className="flex items-center gap-6">
          <Link href="/dashboard" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
            <div className="size-8 rounded-lg bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
              <QrCode className="size-5" />
            </div>
            <span>ScanFlow</span>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-secondary text-foreground"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground"
                  }`}
                >
                  <Icon className="size-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* User Profile & Actions */}
        <div className="flex items-center gap-3">
          {/* User Profile Pill */}
          <div className="flex items-center gap-2 rounded-full border border-border/80 bg-secondary/60 px-3 py-1.5 text-xs text-secondary-foreground shadow-xs">
            <div className="size-6 rounded-full bg-primary/10 text-primary flex items-center justify-center font-semibold text-xs uppercase">
              {user.name ? user.name[0] : "U"}
            </div>
            <div className="hidden sm:flex flex-col text-left">
              <span className="font-medium text-foreground leading-tight">{user.name}</span>
              <span className="text-[10px] text-muted-foreground truncate max-w-[140px]">{user.email}</span>
            </div>
            <div title="Multi-tenant Isolated Workspace">
              <ShieldCheck className="size-3.5 text-emerald-600 dark:text-emerald-400 ml-1" />
            </div>
          </div>

          {/* Sign Out Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            disabled={isLoggingOut}
            className="text-muted-foreground hover:text-destructive hover:bg-destructive/10 text-xs"
            title="Sign out of account"
          >
            <LogOut className="size-4 mr-1.5" />
            <span className="hidden sm:inline">{isLoggingOut ? "Signing out..." : "Sign Out"}</span>
          </Button>
        </div>
      </div>
    </header>
  );
}
