"use client";

import * as React from "react";
import QRCode from "qrcode";
import { Copy, Check, Download, ExternalLink, QrCode as QrIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { buildRedirectUrl } from "@/lib/qr";

export interface QRPreviewProps {
  value: string;
  slug?: string;
  foregroundColor?: string;
  backgroundColor?: string;
  size?: number;
  margin?: number;
  errorCorrectionLevel?: "L" | "M" | "Q" | "H";
  showActions?: boolean;
  onExportClick?: () => void;
  className?: string;
}

export function QRPreview({
  value,
  slug,
  foregroundColor = "#000000",
  backgroundColor = "#ffffff",
  size = 200,
  margin = 2,
  errorCorrectionLevel = "M",
  showActions = true,
  onExportClick,
  className = "",
}: QRPreviewProps) {
  const canvasRef = React.useRef<HTMLCanvasElement | null>(null);
  const [svgData, setSvgData] = React.useState<string>("");
  const [hasCopied, setHasCopied] = React.useState(false);
  const [renderError, setRenderError] = React.useState<string | null>(null);

  const displayUrl = slug ? buildRedirectUrl(slug) : value || "https://scanflow.io/r/demo";

  React.useEffect(() => {
    let isMounted = true;

    async function renderQR() {
      try {
        setRenderError(null);
        if (!displayUrl) return;

        // Generate SVG markup for crisp vector display
        const svg = await QRCode.toString(displayUrl, {
          type: "svg",
          color: {
            dark: foregroundColor || "#000000",
            light: backgroundColor || "#ffffff",
          },
          margin,
          errorCorrectionLevel,
          width: size,
        });

        if (isMounted) {
          setSvgData(svg);
        }

        // Also render on canvas if needed for PNG rasterization
        if (canvasRef.current && isMounted) {
          await QRCode.toCanvas(canvasRef.current, displayUrl, {
            color: {
              dark: foregroundColor || "#000000",
              light: backgroundColor || "#ffffff",
            },
            margin,
            errorCorrectionLevel,
            width: size * 2, // 2x for retina display clarity
          });
        }
      } catch (err: unknown) {
        if (isMounted) {
          setRenderError((err as Error)?.message || "Failed to render QR preview");
        }
      }
    }

    renderQR();

    return () => {
      isMounted = false;
    };
  }, [displayUrl, foregroundColor, backgroundColor, margin, errorCorrectionLevel, size]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(displayUrl);
      setHasCopied(true);
      toast.success("Redirect URL copied to clipboard");
      setTimeout(() => setHasCopied(false), 2000);
    } catch {
      toast.error("Failed to copy URL");
    }
  };

  const handleQuickDownloadPng = async () => {
    try {
      const dataUrl = await QRCode.toDataURL(displayUrl, {
        color: {
          dark: foregroundColor || "#000000",
          light: backgroundColor || "#ffffff",
        },
        margin,
        errorCorrectionLevel,
        width: 1024,
      });

      const a = document.createElement("a");
      a.href = dataUrl;
      a.download = `qr-${slug || "scanflow"}.png`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      toast.success("Downloaded high-res PNG (1024px)");
    } catch {
      toast.error("Failed to download QR code");
    }
  };

  return (
    <div
      className={`flex flex-col items-center justify-center p-5 rounded-2xl border border-border/80 bg-card shadow-xs transition-all ${className}`}
    >
      <div
        className="relative flex items-center justify-center rounded-xl p-3 shadow-inner border border-border/40 overflow-hidden"
        style={{ backgroundColor: backgroundColor || "#ffffff" }}
      >
        {renderError ? (
          <div className="flex flex-col items-center justify-center p-6 text-center text-xs text-muted-foreground w-48 h-48">
            <QrIcon className="size-8 text-destructive/60 mb-2" />
            <span>Invalid QR Content</span>
          </div>
        ) : svgData ? (
          <div
            className="flex items-center justify-center transition-transform hover:scale-[1.02]"
            style={{ width: size, height: size }}
            dangerouslySetInnerHTML={{ __html: svgData }}
          />
        ) : (
          <div
            className="flex items-center justify-center animate-pulse bg-muted/40 rounded-lg"
            style={{ width: size, height: size }}
          >
            <QrIcon className="size-8 text-muted-foreground/40" />
          </div>
        )}
      </div>

      <div className="mt-3 text-center max-w-xs w-full px-2">
        <p className="text-xs font-mono truncate text-muted-foreground select-all">
          {displayUrl}
        </p>
      </div>

      {showActions && (
        <div className="mt-4 flex items-center gap-2 w-full justify-center">
          <Button
            variant="outline"
            size="sm"
            onClick={handleCopy}
            className="h-8 text-xs gap-1.5"
            title="Copy dynamic redirect URL"
          >
            {hasCopied ? <Check className="size-3.5 text-emerald-500" /> : <Copy className="size-3.5" />}
            {hasCopied ? "Copied" : "Copy URL"}
          </Button>

          {onExportClick ? (
            <Button
              variant="default"
              size="sm"
              onClick={onExportClick}
              className="h-8 text-xs gap-1.5"
            >
              <Download className="size-3.5" />
              Export
            </Button>
          ) : (
            <Button
              variant="default"
              size="sm"
              onClick={handleQuickDownloadPng}
              className="h-8 text-xs gap-1.5"
            >
              <Download className="size-3.5" />
              PNG
            </Button>
          )}

          {value && (
            <Button
              variant="ghost"
              size="icon-sm"
              className="h-8 w-8"
              onClick={() => window.open(value, "_blank", "noopener,noreferrer")}
              title="Test destination URL directly"
            >
              <ExternalLink className="size-3.5" />
            </Button>
          )}
        </div>
      )}

      {/* Hidden Canvas for raster exports */}
      <canvas ref={canvasRef} style={{ display: "none" }} />
    </div>
  );
}
