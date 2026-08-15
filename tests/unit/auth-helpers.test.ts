import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCurrentSession, getCurrentUser, requireAuth } from "@/lib/auth-helpers";

// Mock next/headers
vi.mock("next/headers", () => ({
  headers: vi.fn(),
}));

// Mock next/navigation
vi.mock("next/navigation", () => ({
  redirect: vi.fn(),
}));

// Mock @/lib/auth
vi.mock("@/lib/auth", () => ({
  auth: {
    api: {
      getSession: vi.fn(),
    },
  },
}));

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";

describe("lib/auth-helpers", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCurrentSession", () => {
    it("should retrieve session with request headers", async () => {
      const mockHeaders = new Headers();
      vi.mocked(headers).mockResolvedValue(mockHeaders as any);

      const mockSession = {
        user: { id: "u123", email: "test@scanflow.io", name: "Test User" },
        session: { id: "s123", token: "tok123" },
      };
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);

      const result = await getCurrentSession();
      expect(headers).toHaveBeenCalledTimes(1);
      expect(auth.api.getSession).toHaveBeenCalledWith({ headers: mockHeaders });
      expect(result).toEqual(mockSession);
    });

    it("should return null if no session is active", async () => {
      vi.mocked(headers).mockResolvedValue(new Headers() as any);
      vi.mocked(auth.api.getSession).mockResolvedValue(null as any);

      const result = await getCurrentSession();
      expect(result).toBeNull();
    });
  });

  describe("getCurrentUser", () => {
    it("should return user object from session", async () => {
      vi.mocked(headers).mockResolvedValue(new Headers() as any);
      const mockUser = { id: "u123", email: "test@scanflow.io", name: "Test User" };
      vi.mocked(auth.api.getSession).mockResolvedValue({ user: mockUser } as any);

      const user = await getCurrentUser();
      expect(user).toEqual(mockUser);
    });

    it("should return null when session is null", async () => {
      vi.mocked(headers).mockResolvedValue(new Headers() as any);
      vi.mocked(auth.api.getSession).mockResolvedValue(null as any);

      const user = await getCurrentUser();
      expect(user).toBeNull();
    });

    it("should return null when session has no user property", async () => {
      vi.mocked(headers).mockResolvedValue(new Headers() as any);
      vi.mocked(auth.api.getSession).mockResolvedValue({} as any);

      const user = await getCurrentUser();
      expect(user).toBeNull();
    });
  });

  describe("requireAuth", () => {
    it("should return session when authenticated", async () => {
      vi.mocked(headers).mockResolvedValue(new Headers() as any);
      const mockSession = {
        user: { id: "u123", email: "test@scanflow.io", name: "Test User" },
      };
      vi.mocked(auth.api.getSession).mockResolvedValue(mockSession as any);

      const session = await requireAuth();
      expect(session).toEqual(mockSession);
      expect(redirect).not.toHaveBeenCalled();
    });

    it("should redirect to /login when unauthenticated without returnUrl", async () => {
      vi.mocked(headers).mockResolvedValue(new Headers() as any);
      vi.mocked(auth.api.getSession).mockResolvedValue(null as any);

      await requireAuth();
      expect(redirect).toHaveBeenCalledWith("/login");
    });

    it("should redirect to /login with callbackUrl when returnUrl is provided", async () => {
      vi.mocked(headers).mockResolvedValue(new Headers() as any);
      vi.mocked(auth.api.getSession).mockResolvedValue(null as any);

      await requireAuth("/dashboard/analytics?view=realtime");
      expect(redirect).toHaveBeenCalledWith(
        "/login?callbackUrl=%2Fdashboard%2Fanalytics%3Fview%3Drealtime"
      );
    });

    it("should redirect when session exists but has no user property", async () => {
      vi.mocked(headers).mockResolvedValue(new Headers() as any);
      vi.mocked(auth.api.getSession).mockResolvedValue({} as any);

      await requireAuth();
      expect(redirect).toHaveBeenCalledWith("/login");
    });
  });
});
