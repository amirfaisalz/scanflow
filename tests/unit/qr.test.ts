import { describe, it, expect } from "vitest";
import {
  generateQrSvg,
  generateQrDataUrl,
  sanitizeSlug,
  isValidSlug,
  isValidUrl,
  buildRedirectUrl,
} from "@/lib/qr";

describe("QR Library Utilities (lib/qr.ts)", () => {
  describe("generateQrSvg", () => {
    it("generates a valid SVG string", async () => {
      const svg = await generateQrSvg("https://scanflow.io/r/promo", {
        foregroundColor: "#000000",
        backgroundColor: "#ffffff",
        margin: 2,
        width: 256,
      });

      expect(svg).toContain("<svg");
      expect(svg).toContain("</svg>");
      expect(svg).toContain('viewBox="0 0');
    });

    it("applies custom color options", async () => {
      const svg = await generateQrSvg("https://example.com", {
        foregroundColor: "#1e3a8a",
        backgroundColor: "#f8fafc",
      });

      expect(svg).toContain("#1e3a8a");
      expect(svg).toContain("#f8fafc");
    });
  });

  describe("generateQrDataUrl", () => {
    it("generates a valid PNG data URL", async () => {
      const dataUrl = await generateQrDataUrl("https://scanflow.io/r/table-1", {
        width: 512,
      });

      expect(dataUrl).toMatch(/^data:image\/png;base64,/);
      expect(dataUrl.length).toBeGreaterThan(100);
    });
  });

  describe("sanitizeSlug", () => {
    it("converts strings to URL-safe slugs", () => {
      expect(sanitizeSlug("Summer Menu 2026!")).toBe("summer-menu-2026");
      expect(sanitizeSlug("  TABLE #1 Promo  ")).toBe("table-1-promo");
      expect(sanitizeSlug("Special---Offer___Now")).toBe("special-offer___now");
      expect(sanitizeSlug("Hello World @ Discount")).toBe("hello-world-discount");
    });

    it("trims leading and trailing hyphens", () => {
      expect(sanitizeSlug("---test---")).toBe("test");
    });
  });

  describe("isValidSlug", () => {
    it("accepts valid alphanumeric slugs with hyphens and underscores", () => {
      expect(isValidSlug("promo-2026")).toBe(true);
      expect(isValidSlug("menu_summer")).toBe(true);
      expect(isValidSlug("qr123")).toBe(true);
      expect(isValidSlug("ab")).toBe(true);
    });

    it("rejects invalid slugs", () => {
      expect(isValidSlug("")).toBe(false);
      expect(isValidSlug("a")).toBe(false); // Too short
      expect(isValidSlug("promo/table")).toBe(false);
      expect(isValidSlug("promo?query=1")).toBe(false);
      expect(isValidSlug("promo space")).toBe(false);
    });
  });

  describe("isValidUrl", () => {
    it("validates correct HTTP and HTTPS URLs", () => {
      expect(isValidUrl("https://scanflow.io/menu")).toBe(true);
      expect(isValidUrl("http://localhost:3000/test")).toBe(true);
      expect(isValidUrl("https://example.com/path?query=param#hash")).toBe(true);
    });

    it("rejects invalid URLs or unsupported protocols", () => {
      expect(isValidUrl("not-a-url")).toBe(false);
      expect(isValidUrl("javascript:alert(1)")).toBe(false);
      expect(isValidUrl("ftp://files.example.com")).toBe(false);
      expect(isValidUrl("")).toBe(false);
    });
  });

  describe("buildRedirectUrl", () => {
    it("constructs full redirect URLs correctly", () => {
      expect(buildRedirectUrl("table-1", "https://scanflow.io")).toBe("https://scanflow.io/r/table-1");
      expect(buildRedirectUrl("summer-menu", "https://app.example.com/")).toBe("https://app.example.com/r/summer-menu");
    });
  });
});
