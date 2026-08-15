"use client";

import * as React from "react";
import QRCode from "qrcode";
import { Download, FileCode, ImageIcon } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";


import { buildRedirectUrl } from "@/lib/qr";

export interface QRExportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  name: string;
  slug: string;
  destinationUrl?: string;
  foregroundColor?: string;
  backgroundColor?: string;
}

export function QRExportDialog({
  open,
  onOpenChange,
  name,
  slug,
  foregroundColor = "#000000",
  backgroundColor = "#ffffff",
}: QRExportDialogProps) {
  const [format, setFormat] = React.useState<"png" | "svg">("png");
  const [resolution, setResolution] = React.useState<number>(1024);
  const [ecc, setEcc] = React.useState<"L" | "M" | "Q" | "H">("M");
  const [isExporting, setIsExporting] = React.useState(false);

  const redirectUrl = buildRedirectUrl(slug);
  const baseFilename = `scanflow-${slug || "qr"}`;

  const handleExport = async () => {
    setIsExporting(true);
    try {
      if (format === "svg") {
        const svgContent = await QRCode.toString(redirectUrl, {
          type: "svg",
          color: {
            dark: foregroundColor,
            light: backgroundColor,
          },
          margin: 2,
          errorCorrectionLevel: ecc,
        });

        const blob = new Blob([svgContent], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${baseFilename}.svg`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
        toast.success("Vector SVG downloaded successfully");
      } else {
        const dataUrl = await QRCode.toDataURL(redirectUrl, {
          color: {
            dark: foregroundColor,
            light: backgroundColor,
          },
          margin: 2,
          errorCorrectionLevel: ecc,
          width: resolution,
        });

        const a = document.createElement("a");
        a.href = dataUrl;
        a.download = `${baseFilename}-${resolution}px.png`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        toast.success(`High-res PNG (${resolution}x${resolution}) downloaded`);
      }
      onOpenChange(false);
    } catch (error) {
      console.error("Export error:", error);
      toast.error("Failed to export QR code");
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Download className="size-5 text-primary" />
            Export QR Code
          </DialogTitle>
          <DialogDescription>
            Download high-resolution image or scalable vector graphic for <strong>{name}</strong>.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-5 py-2">
          {/* Format Selection */}
          <div className="space-y-2">
            <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Export Format
            </Label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFormat("png")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-left transition-all ${
                  format === "png"
                    ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary"
                    : "border-border hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                <ImageIcon className="size-6 mb-1.5 text-primary" />
                <span className="text-sm font-semibold">PNG Raster</span>
                <span className="text-[11px] text-muted-foreground">Digital & Web Displays</span>
              </button>

              <button
                type="button"
                onClick={() => setFormat("svg")}
                className={`flex flex-col items-center justify-center p-3 rounded-xl border text-left transition-all ${
                  format === "svg"
                    ? "border-primary bg-primary/5 text-foreground ring-1 ring-primary"
                    : "border-border hover:bg-muted/50 text-muted-foreground"
                }`}
              >
                <FileCode className="size-6 mb-1.5 text-primary" />
                <span className="text-sm font-semibold">SVG Vector</span>
                <span className="text-[11px] text-muted-foreground">Print & Infinite Scalability</span>
              </button>
            </div>
          </div>

          {/* PNG Resolution (if PNG selected) */}
          {format === "png" && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Resolution
              </Label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { label: "512px", val: 512, desc: "Standard" },
                  { label: "1024px", val: 1024, desc: "HD" },
                  { label: "2048px", val: 2048, desc: "Print" },
                  { label: "4096px", val: 4096, desc: "4K Poster" },
                ].map((item) => (
                  <button
                    key={item.val}
                    type="button"
                    onClick={() => setResolution(item.val)}
                    className={`flex flex-col items-center justify-center py-2 px-1 rounded-lg border text-center transition-all ${
                      resolution === item.val
                        ? "border-primary bg-primary/10 text-primary font-bold"
                        : "border-border hover:bg-muted/50 text-xs"
                    }`}
                  >
                    <span className="text-xs">{item.label}</span>
                    <span className="text-[9px] text-muted-foreground">{item.desc}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Error Correction Level */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
                Error Correction Level
              </Label>
              <span className="text-[11px] text-muted-foreground">
                {ecc === "L" && "Low (7% recovery)"}
                {ecc === "M" && "Medium (15% recovery - recommended)"}
                {ecc === "Q" && "Quartile (25% recovery)"}
                {ecc === "H" && "High (30% recovery for print)"}
              </span>
            </div>
            <div className="grid grid-cols-4 gap-2">
              {(["L", "M", "Q", "H"] as const).map((level) => (
                <button
                  key={level}
                  type="button"
                  onClick={() => setEcc(level)}
                  className={`py-1.5 px-2 rounded-lg border text-xs font-medium transition-all ${
                    ecc === level
                      ? "border-primary bg-primary/10 text-primary font-bold"
                      : "border-border hover:bg-muted/50"
                  }`}
                >
                  Level {level}
                </button>
              ))}
            </div>
          </div>

          {/* Info Banner */}
          <div className="rounded-lg bg-muted/50 p-3 text-xs text-muted-foreground flex items-center justify-between">
            <div>
              <span>Filename: </span>
              <code className="font-mono text-foreground font-semibold">
                {baseFilename}.{format === "svg" ? "svg" : `${resolution}px.png`}
              </code>
            </div>
            <div
              className="size-4 rounded-full border shadow-xs"
              style={{ backgroundColor: foregroundColor }}
              title={`Foreground: ${foregroundColor}`}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleExport} disabled={isExporting} className="gap-2">
            <Download className="size-4" />
            {isExporting ? "Generating..." : `Download ${format.toUpperCase()}`}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
