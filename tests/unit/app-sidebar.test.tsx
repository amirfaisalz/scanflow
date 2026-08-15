import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { NavUser } from "@/components/nav-user";
import { SidebarProvider } from "@/components/ui/sidebar";

// Mock next/navigation
const mockPush = vi.fn();
const mockRefresh = vi.fn();
let currentPathname = "/dashboard";

vi.mock("next/navigation", () => ({
  usePathname: () => currentPathname,
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
}));

// Mock @/lib/auth-client
vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signOut: vi.fn(),
  },
}));

import { authClient } from "@/lib/auth-client";

describe("AppSidebar & SiteHeader (dashboard-01 components)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentPathname = "/dashboard";
  });

  describe("AppSidebar", () => {
    it("should render ScanFlow branding and navigation links", () => {
      render(
        <SidebarProvider>
          <AppSidebar
            user={{
              name: "Alex Morgan",
              email: "alex@scanflow.io",
            }}
          />
        </SidebarProvider>
      );

      expect(screen.getByText("ScanFlow")).toBeInTheDocument();
      expect(screen.getByText("Isolated Workspace")).toBeInTheDocument();
      expect(screen.getByText("Dashboard")).toBeInTheDocument();
      expect(screen.getByText("QR Codes")).toBeInTheDocument();
      expect(screen.getByText("Campaigns")).toBeInTheDocument();
      expect(screen.getByText("Analytics & Journeys")).toBeInTheDocument();
      expect(screen.getByText("A/B Experiments")).toBeInTheDocument();
      expect(screen.getByText("Data Isolation & Settings")).toBeInTheDocument();
      expect(screen.getByText("Product Documentation")).toBeInTheDocument();
    });

    it("should fallback to default user when user prop is not provided", () => {
      render(
        <SidebarProvider>
          <AppSidebar />
        </SidebarProvider>
      );

      expect(screen.getByText("ScanFlow User")).toBeInTheDocument();
    });
  });

  describe("NavUser", () => {
    it("should render user initial and handle sign out", async () => {
      vi.mocked(authClient.signOut).mockResolvedValue({} as any);

      render(
        <SidebarProvider>
          <NavUser
            user={{
              name: "Alex Morgan",
              email: "alex@scanflow.io",
            }}
          />
        </SidebarProvider>
      );

      expect(screen.getByText("Alex Morgan")).toBeInTheDocument();
      expect(screen.getByText("alex@scanflow.io")).toBeInTheDocument();
      expect(screen.getByText("A")).toBeInTheDocument();

      // Open dropdown menu
      const trigger = screen.getByRole("button");
      fireEvent.click(trigger);

      // Find and click Log out
      const logoutBtn = await screen.findByText("Log out");
      fireEvent.click(logoutBtn);

      await waitFor(() => {
        expect(authClient.signOut).toHaveBeenCalledTimes(1);
        expect(mockPush).toHaveBeenCalledWith("/login");
        expect(mockRefresh).toHaveBeenCalledTimes(1);
      });
    });

    it("should render with avatar image when avatar is provided", () => {
      render(
        <SidebarProvider>
          <NavUser
            user={{
              name: "Alex Morgan",
              email: "alex@scanflow.io",
              avatar: "https://example.com/avatar.png",
            }}
          />
        </SidebarProvider>
      );

      expect(screen.getByText("Alex Morgan")).toBeInTheDocument();
      const trigger = screen.getByRole("button");
      fireEvent.click(trigger);
      expect(screen.getByText("Isolated Workspace")).toBeInTheDocument();
    });

    it("should handle sign out error gracefully", async () => {
      const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
      vi.mocked(authClient.signOut).mockRejectedValue(new Error("Network failed"));

      render(
        <SidebarProvider>
          <NavUser
            user={{
              name: "Alex Morgan",
              email: "alex@scanflow.io",
            }}
          />
        </SidebarProvider>
      );

      const trigger = screen.getByRole("button");
      fireEvent.click(trigger);

      const logoutBtn = await screen.findByText("Log out");
      fireEvent.click(logoutBtn);

      await waitFor(() => {
        expect(authClient.signOut).toHaveBeenCalledTimes(1);
        expect(consoleSpy).toHaveBeenCalledWith("Sign out failed:", expect.any(Error));
      });

      consoleSpy.mockRestore();
    });

    it("should render dropdown with bottom alignment when on mobile", async () => {
      window.innerWidth = 500;
      window.dispatchEvent(new Event("resize"));

      render(
        <SidebarProvider defaultOpen={false}>
          <NavUser
            user={{
              name: "Alex Morgan",
              email: "alex@scanflow.io",
            }}
          />
        </SidebarProvider>
      );

      const trigger = screen.getByRole("button");
      fireEvent.click(trigger);
      expect(await screen.findByText("Log out")).toBeInTheDocument();
    });

    it("should fallback to 'U' when name is empty string", () => {
      render(
        <SidebarProvider>
          <NavUser
            user={{
              name: "",
              email: "user@scanflow.io",
            }}
          />
        </SidebarProvider>
      );

      expect(screen.getByText("U")).toBeInTheDocument();
    });
  });

  describe("SiteHeader", () => {
    it("should render overview page title when pathname is /dashboard", () => {
      currentPathname = "/dashboard";
      render(
        <SidebarProvider>
          <SiteHeader />
        </SidebarProvider>
      );

      expect(screen.getByText("Overview Dashboard")).toBeInTheDocument();
      expect(screen.getByText("Tenant Isolated")).toBeInTheDocument();
    });

    it("should render appropriate titles for subroutes", () => {
      const routes = [
        { path: "/dashboard/qr-codes", expected: "QR Code Management" },
        { path: "/dashboard/campaigns", expected: "Campaigns" },
        { path: "/dashboard/analytics", expected: "Scan Analytics & Journeys" },
        { path: "/dashboard/experiments", expected: "A/B Experiments" },
      ];

      routes.forEach(({ path, expected }) => {
        currentPathname = path;
        const { unmount } = render(
          <SidebarProvider>
            <SiteHeader />
          </SidebarProvider>
        );

        expect(screen.getByText(expected)).toBeInTheDocument();
        unmount();
      });
    });
  });
});
