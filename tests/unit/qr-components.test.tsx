import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import * as React from "react";

import { QRPreview } from "@/components/qr/qr-preview";
import { QRCard } from "@/components/qr/qr-card";
import { QRExportDialog } from "@/components/qr/qr-export-dialog";
import { QRBuilderDialog } from "@/components/qr/qr-builder-dialog";
import type { QRCode as QRCodeModel } from "@/lib/db/schema";

describe("QR Components", () => {
  const sampleQr: QRCodeModel = {
    id: "qr_test_123",
    userId: "user_test_1",
    campaignId: null,
    name: "Summer Menu Table #1",
    slug: "summer-menu-1",
    destinationUrl: "https://example.com/menu",
    status: "active",
    foregroundColor: "#000000",
    backgroundColor: "#ffffff",
    scanCount: 42,
    metadata: {},
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  describe("QRPreview Component", () => {
    it("renders display URL and copy button", async () => {
      render(
        <QRPreview
          value="https://example.com/menu"
          slug="summer-menu-1"
          foregroundColor="#000000"
          backgroundColor="#ffffff"
        />
      );

      expect(screen.getByText(/summer-menu-1/i)).toBeInTheDocument();
      expect(screen.getByText(/Copy URL/i)).toBeInTheDocument();
    });

    it("handles copy URL click", async () => {
      // Mock clipboard
      Object.assign(navigator, {
        clipboard: {
          writeText: vi.fn().mockResolvedValue(undefined),
        },
      });

      render(
        <QRPreview
          value="https://example.com/menu"
          slug="summer-menu-1"
        />
      );

      const copyBtn = screen.getByText(/Copy URL/i);
      fireEvent.click(copyBtn);

      expect(navigator.clipboard.writeText).toHaveBeenCalledWith(
        expect.stringContaining("summer-menu-1")
      );
    });
  });

  describe("QRCard Component", () => {
    it("renders QR details, status badge, and scan count", () => {
      const onEdit = vi.fn();
      const onDelete = vi.fn();
      const onDuplicate = vi.fn();
      const onStatusToggle = vi.fn();

      render(
        <QRCard
          qrCode={sampleQr}
          onEdit={onEdit}
          onDelete={onDelete}
          onDuplicate={onDuplicate}
          onStatusToggle={onStatusToggle}
        />
      );

      expect(screen.getByText("Summer Menu Table #1")).toBeInTheDocument();
      expect(screen.getByText("summer-menu-1")).toBeInTheDocument();
      expect(screen.getByText("Active")).toBeInTheDocument();
      expect(screen.getByText(/42 scans/i)).toBeInTheDocument();
    });
  });

  describe("QRExportDialog Component", () => {
    it("renders export format options (PNG and SVG)", () => {
      const onOpenChange = vi.fn();

      render(
        <QRExportDialog
          open={true}
          onOpenChange={onOpenChange}
          name="Summer Menu"
          slug="summer-menu"
        />
      );

      expect(screen.getByText(/Export QR Code/i)).toBeInTheDocument();
      expect(screen.getByText(/PNG Raster/i)).toBeInTheDocument();
      expect(screen.getByText(/SVG Vector/i)).toBeInTheDocument();
    });
  });

  describe("QRBuilderDialog Component", () => {
    it("renders creation form with inputs for name, destination, and slug", () => {
      const onOpenChange = vi.fn();

      render(
        <QRBuilderDialog
          open={true}
          onOpenChange={onOpenChange}
        />
      );

      expect(screen.getByText(/Create Dynamic QR Code/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/QR Code Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Destination URL/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Custom Short Slug/i)).toBeInTheDocument();
    });

    it("pre-fills form inputs when editing an existing QR code", () => {
      const onOpenChange = vi.fn();

      render(
        <QRBuilderDialog
          open={true}
          onOpenChange={onOpenChange}
          initialData={sampleQr}
        />
      );

      expect(screen.getByText(/Edit Dynamic QR Code/i)).toBeInTheDocument();
      expect(screen.getByDisplayValue("Summer Menu Table #1")).toBeInTheDocument();
      expect(screen.getByDisplayValue("https://example.com/menu")).toBeInTheDocument();
      expect(screen.getByDisplayValue("summer-menu-1")).toBeInTheDocument();
    });
  });
});
