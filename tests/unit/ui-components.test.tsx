import React from "react";
import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Button, buttonVariants } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardAction,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

describe("UI Components", () => {
  describe("Button", () => {
    it("should render default button correctly", () => {
      render(<Button>Click Me</Button>);
      const button = screen.getByRole("button", { name: "Click Me" });
      expect(button).toBeInTheDocument();
      expect(button).toHaveAttribute("data-slot", "button");
    });

    it("should handle clicks and disabled states", () => {
      const handleClick = vi.fn();
      const { rerender } = render(<Button onClick={handleClick}>Active Button</Button>);
      const button = screen.getByRole("button", { name: "Active Button" });
      fireEvent.click(button);
      expect(handleClick).toHaveBeenCalledTimes(1);

      rerender(
        <Button disabled onClick={handleClick}>
          Disabled Button
        </Button>
      );
      const disabledButton = screen.getByRole("button", { name: "Disabled Button" });
      expect(disabledButton).toBeDisabled();
    });

    it("should support all variants and sizes via buttonVariants", () => {
      const variants = [
        "default",
        "outline",
        "secondary",
        "ghost",
        "destructive",
        "link",
      ] as const;

      const sizes = [
        "default",
        "xs",
        "sm",
        "lg",
        "icon",
        "icon-xs",
        "icon-sm",
        "icon-lg",
      ] as const;

      variants.forEach((variant) => {
        const className = buttonVariants({ variant });
        expect(className).toBeDefined();
        expect(typeof className).toBe("string");
      });

      sizes.forEach((size) => {
        const className = buttonVariants({ size });
        expect(className).toBeDefined();
        expect(typeof className).toBe("string");
      });

      // Default arguments
      expect(buttonVariants()).toBeDefined();
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLButtonElement>();
      render(<Button ref={ref}>Ref Button</Button>);
      expect(ref.current).toBeInstanceOf(HTMLButtonElement);
    });
  });

  describe("Input", () => {
    it("should render input element and handle input changes", () => {
      const handleChange = vi.fn();
      render(
        <Input
          placeholder="Enter text..."
          type="text"
          onChange={handleChange}
          data-testid="test-input"
        />
      );

      const input = screen.getByTestId("test-input");
      expect(input).toBeInTheDocument();
      expect(input).toHaveAttribute("placeholder", "Enter text...");

      fireEvent.change(input, { target: { value: "Hello World" } });
      expect(handleChange).toHaveBeenCalledTimes(1);
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLInputElement>();
      render(<Input ref={ref} data-testid="ref-input" />);
      expect(ref.current).toBeInstanceOf(HTMLInputElement);
    });
  });

  describe("Label", () => {
    it("should render label with text content and htmlFor", () => {
      render(
        <Label htmlFor="email-input" className="custom-label">
          Email Address
        </Label>
      );

      const label = screen.getByText("Email Address");
      expect(label).toBeInTheDocument();
      expect(label).toHaveAttribute("for", "email-input");
      expect(label).toHaveClass("custom-label");
    });

    it("should forward ref correctly", () => {
      const ref = React.createRef<HTMLLabelElement>();
      render(<Label ref={ref}>Label with Ref</Label>);
      expect(ref.current).toBeInstanceOf(HTMLLabelElement);
    });
  });

  describe("Card Components", () => {
    it("should render full Card structure with all subcomponents", () => {
      render(
        <Card size="sm" className="card-custom">
          <CardHeader className="header-custom">
            <CardTitle className="title-custom">Card Title</CardTitle>
            <CardDescription className="desc-custom">Card Description</CardDescription>
            <CardAction className="action-custom">
              <button>Action</button>
            </CardAction>
          </CardHeader>
          <CardContent className="content-custom">
            <p>Main Card Body</p>
          </CardContent>
          <CardFooter className="footer-custom">
            <p>Card Footer</p>
          </CardFooter>
        </Card>
      );

      expect(screen.getByText("Card Title")).toBeInTheDocument();
      expect(screen.getByText("Card Description")).toBeInTheDocument();
      expect(screen.getByText("Action")).toBeInTheDocument();
      expect(screen.getByText("Main Card Body")).toBeInTheDocument();
      expect(screen.getByText("Card Footer")).toBeInTheDocument();
    });

    it("should render default Card size", () => {
      render(
        <Card data-testid="default-card">
          <CardContent>Content</CardContent>
        </Card>
      );

      expect(screen.getByTestId("default-card")).toHaveAttribute("data-size", "default");
    });
  });
});
