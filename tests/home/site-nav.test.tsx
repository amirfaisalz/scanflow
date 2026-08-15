import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SiteNav } from "@/components/home/site-nav";

describe("SiteNav Component", () => {
  it("renders brand logo and navigation links", () => {
    render(<SiteNav user={null} />);
    
    expect(screen.getByText("ScanFlow")).toBeInTheDocument();
    expect(screen.getByText("Features")).toBeInTheDocument();
    expect(screen.getByText("Playground")).toBeInTheDocument();
    expect(screen.getByText("Pricing")).toBeInTheDocument();
    expect(screen.getByText("FAQ")).toBeInTheDocument();
  });

  it("renders login and register buttons when user is not authenticated", () => {
    render(<SiteNav user={null} />);
    
    expect(screen.getByText("Sign In")).toBeInTheDocument();
    expect(screen.getByText("Get Started")).toBeInTheDocument();
  });

  it("renders dashboard link when user is authenticated", () => {
    render(<SiteNav user={{ id: "1", name: "Alice", email: "alice@example.com" }} />);
    
    expect(screen.getByText("Go to Dashboard")).toBeInTheDocument();
    expect(screen.queryByText("Sign In")).not.toBeInTheDocument();
  });
});
