import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { LoginForm } from "@/components/login-form";
import LoginPage from "@/app/login/page";
import { authClient } from "@/lib/auth-client";

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

// Mock auth-client
vi.mock("@/lib/auth-client", () => ({
  authClient: {
    signIn: {
      email: vi.fn(),
    },
    signUp: {
      email: vi.fn(),
    },
  },
}));

describe("LoginForm Component (shadcn login-03)", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("renders welcome title, quick evaluation admin demo button, and google login button", () => {
    render(<LoginForm />);

    expect(screen.getByText("Welcome back")).toBeInTheDocument();
    expect(screen.getByText("Quick Evaluation")).toBeInTheDocument();
    expect(screen.getByText("1-Click Demo Admin Sign-In")).toBeInTheDocument();
    expect(screen.getByText("Login with Google")).toBeInTheDocument();
  });

  it("triggers 1-Click Demo Admin sign in when demo button is clicked", async () => {
    vi.mocked(authClient.signIn.email).mockResolvedValueOnce({
      data: { session: { token: "admin-token", user: { id: "admin-1" } } } as any,
      error: null,
    });

    render(<LoginForm />);

    const demoButton = screen.getByRole("button", {
      name: /1-Click Demo Admin Sign-In/i,
    });
    fireEvent.click(demoButton);

    await waitFor(() => {
      expect(authClient.signIn.email).toHaveBeenCalledWith({
        email: "admin@scanflow.io",
        password: "AdminPassword123!",
      });
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
    });
  });

  it("handles demo signup fallback if account does not exist initially", async () => {
    vi.mocked(authClient.signIn.email).mockResolvedValueOnce({
      data: null,
      error: { message: "User not found", status: 404 } as any,
    });
    vi.mocked(authClient.signUp.email).mockResolvedValueOnce({
      data: { user: { id: "admin-1", email: "admin@scanflow.io" } } as any,
      error: null,
    });

    render(<LoginForm />);

    const demoButton = screen.getByRole("button", {
      name: /1-Click Demo Admin Sign-In/i,
    });
    fireEvent.click(demoButton);

    await waitFor(() => {
      expect(authClient.signUp.email).toHaveBeenCalledWith({
        email: "admin@scanflow.io",
        password: "AdminPassword123!",
        name: "Admin Demo User",
      });
      expect(mockPush).toHaveBeenCalledWith("/dashboard");
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
