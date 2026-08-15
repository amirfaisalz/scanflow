import { describe, it, expect, vi } from "vitest";
import { proxy, config } from "@/proxy";
import { NextRequest } from "next/server";

describe("proxy.ts (Next.js 16 Route Protection)", () => {
  function createMockRequest(pathname: string, cookies: Record<string, string> = {}) {
    const url = `http://localhost:3323${pathname}`;
    const req = new NextRequest(url);

    // Populate cookies
    Object.entries(cookies).forEach(([name, value]) => {
      req.cookies.set(name, value);
    });

    return req;
  }

  it("should export a valid matcher config", () => {
    expect(config).toBeDefined();
    expect(config.matcher).toBeInstanceOf(Array);
    expect(config.matcher.length).toBeGreaterThan(0);
  });

  describe("Protected Routes (/dashboard/*)", () => {
    it("should redirect unauthenticated users from /dashboard to /login with callbackUrl", () => {
      const req = createMockRequest("/dashboard");
      const res = proxy(req);

      expect(res.status).toBe(307); // NextResponse.redirect default status
      expect(res.headers.get("location")).toBe("http://localhost:3323/login?callbackUrl=%2Fdashboard");
    });

    it("should redirect unauthenticated users from /dashboard/analytics to /login with nested callbackUrl", () => {
      const req = createMockRequest("/dashboard/analytics");
      const res = proxy(req);

      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toBe("http://localhost:3323/login?callbackUrl=%2Fdashboard%2Fanalytics");
    });

    it("should allow authenticated users with standard session token into /dashboard", () => {
      const req = createMockRequest("/dashboard", {
        "better-auth.session_token": "valid_token_123",
      });
      const res = proxy(req);

      expect(res.headers.get("location")).toBeNull();
    });

    it("should allow authenticated users with __Secure- session token into /dashboard", () => {
      const req = createMockRequest("/dashboard", {
        "__Secure-better-auth.session_token": "secure_token_456",
      });
      const res = proxy(req);

      expect(res.headers.get("location")).toBeNull();
    });
  });

  describe("Auth Routes (/login, /register)", () => {
    it("should allow unauthenticated users to access /login", () => {
      const req = createMockRequest("/login");
      const res = proxy(req);

      expect(res.headers.get("location")).toBeNull();
    });

    it("should allow unauthenticated users to access /register", () => {
      const req = createMockRequest("/register");
      const res = proxy(req);

      expect(res.headers.get("location")).toBeNull();
    });

    it("should redirect authenticated users from /login to /dashboard", () => {
      const req = createMockRequest("/login", {
        "better-auth.session_token": "valid_token_123",
      });
      const res = proxy(req);

      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toBe("http://localhost:3323/dashboard");
    });

    it("should redirect authenticated users from /register to /dashboard", () => {
      const req = createMockRequest("/register", {
        "better-auth.session_token": "valid_token_123",
      });
      const res = proxy(req);

      expect(res.status).toBe(307);
      expect(res.headers.get("location")).toBe("http://localhost:3323/dashboard");
    });
  });

  describe("Public Routes (/)", () => {
    it("should allow unauthenticated users on public landing page", () => {
      const req = createMockRequest("/");
      const res = proxy(req);

      expect(res.headers.get("location")).toBeNull();
    });

    it("should allow authenticated users on public landing page", () => {
      const req = createMockRequest("/", {
        "better-auth.session_token": "valid_token_123",
      });
      const res = proxy(req);

      expect(res.headers.get("location")).toBeNull();
    });
  });
});
