import React from "react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { DashboardHeader } from "@/components/dashboard-header";

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

describe("DashboardHeader", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    currentPathname = "/dashboard";
  });

  it("should render brand, user profile, and navigation items", () => {
    render(
      <DashboardHeader
        user={{
          id: "u-123",
          name: "Alex Morgan",
          email: "alex@scanflow.io",
        }}
      />
    );

    expect(screen.getByText("ScanFlow")).toBeInTheDocument();
    expect(screen.getByText("Alex Morgan")).toBeInTheDocument();
    expect(screen.getByText("alex@scanflow.io")).toBeInTheDocument();
    expect(screen.getByText("A")).toBeInTheDocument(); // Initial
    expect(screen.getByText("Overview")).toBeInTheDocument();
    expect(screen.getByText("QR Codes")).toBeInTheDocument();
    expect(screen.getByText("Campaigns")).toBeInTheDocument();
    expect(screen.getByText("Analytics")).toBeInTheDocument();
    expect(screen.getByText("A/B Experiments")).toBeInTheDocument();
  });

  it("should fallback to initial 'U' when name is empty string", () => {
    render(
      <DashboardHeader
        user={{
          id: "u-456",
          name: "",
          email: "anonymous@scanflow.io",
        }}
      />
    );

    expect(screen.getByText("U")).toBeInTheDocument();
  });

  it("should highlight the active navigation link based on current path", () => {
    currentPathname = "/dashboard/analytics";
    render(
      <DashboardHeader
        user={{
          id: "u-123",
          name: "Alex Morgan",
          email: "alex@scanflow.io",
        }}
      />
    );

    const analyticsLink = screen.getByRole("link", { name: /analytics/i });
    expect(analyticsLink).toHaveClass("bg-secondary");
  });

  it("should handle successful sign-out flow", async () => {
    vi.mocked(authClient.signOut).mockResolvedValue({} as any);

    render(
      <DashboardHeader
        user={{
          id: "u-123",
          name: "Alex Morgan",
          email: "alex@scanflow.io",
        }}
      />
    );

    const signOutBtn = screen.getByRole("button", { name: /sign out/i });
    fireEvent.click(signOutBtn);

    await waitFor(() => {
      expect(authClient.signOut).toHaveBeenCalledTimes(1);
      expect(mockPush).toHaveBeenCalledWith("/login");
      expect(mockRefresh).toHaveBeenCalledTimes(1);
    });
  });

  it("should handle sign-out error gracefully", async () => {
    const consoleSpy = vi.spyOn(console, "error").mockImplementation(() => {});
    vi.mocked(authClient.signOut).mockRejectedValue(new Error("Network disconnect"));

    render(
      <DashboardHeader
        user={{
          id: "u-123",
          name: "Alex Morgan",
          email: "alex@scanflow.io",
        }}
      />
    );

    const signOutBtn = screen.getByRole("button", { name: /sign out/i });
    fireEvent.click(signOutBtn);

    await waitFor(() => {
      expect(authClient.signOut).toHaveBeenCalledTimes(1);
      expect(consoleSpy).toHaveBeenCalledWith("Sign out error:", expect.any(Error));
    });

    consoleSpy.mockRestore();
  });
});
