import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteNav } from "@/components/home/site-nav";

describe("SiteNav Component", () => {
  it("renders ScanFlow logo and primary navigation links", () => {
    render(<SiteNav user={null} />);

    expect(screen.getByText("ScanFlow")).toBeInTheDocument();
    expect(screen.getByText("Features")).toBeInTheDocument();
    expect(screen.getByText("Routing")).toBeInTheDocument();
    expect(screen.getByText("Journey")).toBeInTheDocument();
    expect(screen.getByText("A/B Testing")).toBeInTheDocument();
    expect(screen.getByText("FAQ")).toBeInTheDocument();
  });

  it("renders high-converting Create Free QR CTA button when logged out", () => {
    render(<SiteNav user={null} />);
    expect(screen.getByRole("button", { name: /Create Free QR/i })).toBeInTheDocument();
  });

  it("renders Dashboard CTA button when logged in", () => {
    render(
      <SiteNav
        user={{ id: "user_123", name: "Amir", email: "amir@example.com" }}
      />
    );
    expect(screen.getByRole("button", { name: /Go to Dashboard/i })).toBeInTheDocument();
  });
});
