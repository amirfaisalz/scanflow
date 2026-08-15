import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LoginForm } from "@/components/login-form";
import LoginPage from "@/app/login/page";

// Mock next/navigation
const mockPush = vi.fn();
const mockRefresh = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    refresh: mockRefresh,
  }),
  useSearchParams: () => ({
    get: (key: string) => (key === "callbackUrl" ? "/dashboard" : null),
  }),
}));

describe("LoginForm Component (shadcn login-03)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    global.fetch = vi.fn();
  });

  it("renders welcome title, quick evaluation admin demo button, and google login button", () => {
    render(<LoginForm />);

    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(screen.getByText("Quick Evaluation")).toBeInTheDocument();
    expect(screen.getByText("1-Click Demo Admin Sign-In")).toBeInTheDocument();
    expect(screen.getByText("Login with Google")).toBeInTheDocument();
  });

  it("triggers 1-Click Demo Admin sign in when demo button is clicked", async () => {
    (global.fetch as any).mockResolvedValueOnce({
      ok: true,
      json: async () => ({ success: true }),
    });

    render(<LoginForm />);

    const demoButton = screen.getByRole("button", {
      name: /1-Click Demo Admin Sign-In/i,
    });
    fireEvent.click(demoButton);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        "/api/auth/demo-login",
        expect.objectContaining({
          method: "POST",
        })
      );
    });
  });

  it("displays notice when Google login is clicked in demo environment", async () => {
    render(<LoginForm />);

    const googleBtn = screen.getByRole("button", {
      name: /Login with Google/i,
    });
    fireEvent.click(googleBtn);

    await waitFor(() => {
      expect(screen.getByText(/Google OAuth is disabled/i)).toBeInTheDocument();
    });
  });
});

describe("LoginPage Component", () => {
  it("renders ScanFlow branding header and login container", () => {
    render(<LoginPage />);

    expect(screen.getByText("ScanFlow")).toBeInTheDocument();
    expect(screen.getByText("Welcome back")).toBeInTheDocument();
  });
});
