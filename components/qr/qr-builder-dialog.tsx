"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { QRPreview } from "@/components/qr/qr-preview";
import { sanitizeSlug, isValidSlug, isValidUrl, buildRedirectUrl } from "@/lib/qr";
import { toast } from "sonner";
import { Loader2, QrCode, Sparkles, Palette, Globe, CheckCircle2, AlertCircle } from "lucide-react";
import type { QRCode as QRCodeModel } from "@/lib/db/schema";

export interface QRBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: QRCodeModel | null;
  onSuccess?: (qrCode: QRCodeModel) => void;
}

const PRESET_COLORS = [
  { label: "Classic Black", fg: "#000000", bg: "#ffffff" },
  { label: "Midnight Indigo", fg: "#1e1b4b", bg: "#ffffff" },
  { label: "Emerald Brand", fg: "#065f46", bg: "#ffffff" },
  { label: "Royal Sapphire", fg: "#1e3a8a", bg: "#ffffff" },
  { label: "Crimson Bold", fg: "#991b1b", bg: "#ffffff" },
  { label: "Charcoal Dark", fg: "#ffffff", bg: "#0f172a" },
];

interface FormProps {
  initialData?: QRCodeModel | null;
  onCancel: () => void;
  onSuccess?: (qrCode: QRCodeModel) => void;
}

function QRBuilderForm({ initialData, onCancel, onSuccess }: FormProps) {
  const isEditing = Boolean(initialData);

  const [name, setName] = React.useState(initialData?.name || "");
  const [destinationUrl, setDestinationUrl] = React.useState(initialData?.destinationUrl || (isEditing ? "" : "https://"));
  const [slug, setSlug] = React.useState(initialData?.slug || "");
  const [campaignId, setCampaignId] = React.useState<string | null>(initialData?.campaignId || null);
  const [availableCampaigns, setAvailableCampaigns] = React.useState<{ id: string; name: string }[]>([]);
  const [status, setStatus] = React.useState<"active" | "paused" | "archived">(
    (initialData?.status as "active" | "paused" | "archived") || "active"
  );
  const [foregroundColor, setForegroundColor] = React.useState(initialData?.foregroundColor || "#000000");
  const [backgroundColor, setBackgroundColor] = React.useState(initialData?.backgroundColor || "#ffffff");
  const [ecc, setEcc] = React.useState<"L" | "M" | "Q" | "H">("M");
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [autoSlug, setAutoSlug] = React.useState(!isEditing && !initialData?.slug);

  React.useEffect(() => {
    fetch("/api/campaigns")
      .then((res) => res.json())
      .then((data) => {
        if (data.campaigns) {
          setAvailableCampaigns(data.campaigns);
        }
      })
      .catch(() => {});
  }, []);

  const handleNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newName = e.target.value;
    setName(newName);
    if (autoSlug && !isEditing) {
      setSlug(sanitizeSlug(newName));
    }
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAutoSlug(false);
    setSlug(sanitizeSlug(e.target.value));
  };

  const isSlugValid = isValidSlug(slug);
  const isUrlValid = isValidUrl(destinationUrl);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter a name for the QR code");
      return;
    }

    if (!isValidUrl(destinationUrl)) {
      toast.error("Please enter a valid destination URL (http:// or https://)");
      return;
    }

    if (!isValidSlug(slug)) {
      toast.error("Please enter a valid slug (letters, numbers, hyphens, min 2 chars)");
      return;
    }

    setIsSubmitting(true);

    try {
      const payload = {
        name: name.trim(),
        destinationUrl: destinationUrl.trim(),
        slug: slug.trim(),
        campaignId: campaignId || null,
        status,
        foregroundColor,
        backgroundColor,
      };

      const url = isEditing && initialData ? `/api/qr-codes/${initialData.id}` : "/api/qr-codes";
      const method = isEditing ? "PATCH" : "POST";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const json = await res.json();

      if (!res.ok) {
        throw new Error(json.error || "Failed to save QR code");
      }

      toast.success(isEditing ? "QR Code updated successfully" : "Dynamic QR Code created!");
      onSuccess?.(json.data);
      onCancel();
    } catch (error: unknown) {
      console.error("Save error:", error);
      toast.error((error as Error)?.message || "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6 py-2">
      {/* Left Column: Form Controls */}
      <div className="md:col-span-7 space-y-4">
        <Tabs defaultValue="basics" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-9 mb-3">
            <TabsTrigger value="basics" className="text-xs gap-1.5">
              <Globe className="size-3.5" />
              Destination & Slug
            </TabsTrigger>
            <TabsTrigger value="style" className="text-xs gap-1.5">
              <Palette className="size-3.5" />
              Styling & ECC
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basics" className="space-y-3.5 mt-0">
            {/* QR Code Name */}
            <div className="space-y-1.5">
              <Label htmlFor="qr-name" className="text-xs font-medium">
                QR Code Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="qr-name"
                placeholder="e.g. Summer Promo Poster #1"
                value={name}
                onChange={handleNameChange}
                maxLength={100}
                required
                className="h-9 text-xs"
              />
            </div>

            {/* Destination URL */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="qr-destination" className="text-xs font-medium">
                  Destination URL <span className="text-destructive">*</span>
                </Label>
                {destinationUrl && (
                  <span className="text-[10px] flex items-center gap-1">
                    {isUrlValid ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-0.5">
                        <CheckCircle2 className="size-3" /> Valid URL
                      </span>
                    ) : (
                      <span className="text-destructive flex items-center gap-0.5">
                        <AlertCircle className="size-3" /> Enter full URL (https://)
                      </span>
                    )}
                  </span>
                )}
              </div>
              <Input
                id="qr-destination"
                type="url"
                placeholder="https://example.com/special-offer"
                value={destinationUrl}
                onChange={(e) => setDestinationUrl(e.target.value)}
                required
                className="h-9 text-xs font-mono"
              />
              <p className="text-[11px] text-muted-foreground">
                Visitors will be redirected here when scanning the QR code.
              </p>
            </div>

            {/* Custom Slug */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="qr-slug" className="text-xs font-medium">
                  Custom Short Slug <span className="text-destructive">*</span>
                </Label>
                {slug && (
                  <span className="text-[10px]">
                    {isSlugValid ? (
                      <span className="text-emerald-600 dark:text-emerald-400">Slug OK</span>
                    ) : (
                      <span className="text-destructive">Invalid slug format</span>
                    )}
                  </span>
                )}
              </div>
              <div className="flex rounded-md border border-input focus-within:ring-1 focus-within:ring-ring overflow-hidden">
                <span className="inline-flex items-center px-2.5 bg-muted text-muted-foreground text-[11px] font-mono border-r select-none">
                  /r/
                </span>
                <input
                  id="qr-slug"
                  type="text"
                  placeholder="promo-menu"
                  value={slug}
                  onChange={handleSlugChange}
                  required
                  className="flex h-9 w-full bg-transparent px-3 py-1 text-xs font-mono shadow-none focus:outline-none"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Permanent scan link: <code className="text-[10px] font-mono">{buildRedirectUrl(slug || "slug")}</code>
              </p>
            </div>

            {/* Marketing Campaign */}
            <div className="space-y-1.5">
              <Label htmlFor="qr-campaign" className="text-xs font-medium">
                Marketing Campaign (Optional)
              </Label>
              <Select
                value={campaignId || "none"}
                onValueChange={(val) => setCampaignId(val === "none" ? null : val)}
              >
                <SelectTrigger id="qr-campaign" className="h-9 text-xs">
                  <SelectValue placeholder="No Campaign (Standalone QR)" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none" className="text-xs">
                    No Campaign (Standalone QR)
                  </SelectItem>
                  {availableCampaigns.map((camp) => (
                    <SelectItem key={camp.id} value={camp.id} className="text-xs">
                      📁 {camp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Initial Status */}
            <div className="space-y-1.5">
              <Label htmlFor="qr-status" className="text-xs font-medium">
                Initial Status
              </Label>
              <Select
                value={status}
                onValueChange={(val) => {
                  if (val) setStatus(val as "active" | "paused" | "archived");
                }}
              >
                <SelectTrigger id="qr-status" className="h-9 text-xs">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active" className="text-xs">
                    🟢 Active (Scanning enabled & redirects normally)
                  </SelectItem>
                  <SelectItem value="paused" className="text-xs">
                    🟡 Paused (Temporarily redirects to maintenance page)
                  </SelectItem>
                  <SelectItem value="archived" className="text-xs">
                    ⚪ Archived (Disabled)
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="style" className="space-y-4 mt-0">
            {/* Preset Themes */}
            <div className="space-y-2">
              <Label className="text-xs font-medium">Color Presets</Label>
              <div className="grid grid-cols-3 gap-2">
                {PRESET_COLORS.map((preset) => (
                  <button
                    key={preset.label}
                    type="button"
                    onClick={() => {
                      setForegroundColor(preset.fg);
                      setBackgroundColor(preset.bg);
                    }}
                    className={`flex items-center gap-2 p-2 rounded-lg border text-left transition-all ${
                      foregroundColor === preset.fg && backgroundColor === preset.bg
                        ? "border-primary bg-primary/5 ring-1 ring-primary"
                        : "border-border hover:bg-muted/50"
                    }`}
                  >
                    <div
                      className="size-4 rounded-full border shadow-2xs shrink-0"
                      style={{ backgroundColor: preset.fg }}
                    />
                    <span className="text-[11px] font-medium truncate">{preset.label}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Custom Color Pickers */}
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label htmlFor="qr-fg" className="text-xs font-medium">
                  Foreground Color
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    id="qr-fg"
                    type="color"
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    className="size-8 rounded border p-0.5 cursor-pointer bg-transparent"
                  />
                  <Input
                    type="text"
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="qr-bg" className="text-xs font-medium">
                  Background Color
                </Label>
                <div className="flex items-center gap-2">
                  <input
                    id="qr-bg"
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="size-8 rounded border p-0.5 cursor-pointer bg-transparent"
                  />
                  <Input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="h-8 text-xs font-mono"
                  />
                </div>
              </div>
            </div>

            {/* Error Correction Level */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-medium">Error Correction (ECC)</Label>
                <span className="text-[10px] text-muted-foreground">
                  {ecc === "L" && "Low (7%)"}
                  {ecc === "M" && "Medium (15%) - Recommended"}
                  {ecc === "Q" && "Quartile (25%)"}
                  {ecc === "H" && "High (30%) - Best for Print"}
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
                        : "border-border hover:bg-muted/50 text-muted-foreground"
                    }`}
                  >
                    Level {level}
                  </button>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>

      {/* Right Column: Live Dynamic Preview */}
      <div className="md:col-span-5 flex flex-col items-center justify-center p-3 bg-muted/20 rounded-xl border border-border/60">
        <div className="w-full flex items-center justify-between mb-2">
          <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1">
            <Sparkles className="size-3 text-amber-500" />
            Live Preview
          </span>
          <span
            className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
              status === "active"
                ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                : status === "paused"
                ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                : "bg-muted text-muted-foreground"
            }`}
          >
            {status.toUpperCase()}
          </span>
        </div>

        <QRPreview
          value={destinationUrl || "https://scanflow.io"}
          slug={slug || "preview-slug"}
          foregroundColor={foregroundColor}
          backgroundColor={backgroundColor}
          size={170}
          errorCorrectionLevel={ecc}
          showActions={false}
          className="w-full bg-background"
        />

        <div className="mt-3 text-center text-[11px] text-muted-foreground">
          Dynamic Destination:
          <div className="font-mono text-foreground truncate max-w-[200px] mt-0.5 font-medium">
            {destinationUrl || "https://..."}
          </div>
        </div>
      </div>

      {/* Form Actions Footer */}
      <div className="col-span-12 flex items-center justify-end gap-2 pt-2 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={isSubmitting || !name || !slug || !destinationUrl} className="gap-2">
          {isSubmitting ? (
            <>
              <Loader2 className="size-4 animate-spin" />
              Saving...
            </>
          ) : isEditing ? (
            "Update QR Code"
          ) : (
            "Create QR Code"
          )}
        </Button>
      </div>
    </form>
  );
}

export function QRBuilderDialog({
  open,
  onOpenChange,
  initialData,
  onSuccess,
}: QRBuilderDialogProps) {
  const isEditing = Boolean(initialData);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="size-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
              <QrCode className="size-4" />
            </div>
            <div>
              <DialogTitle className="text-base font-semibold">
                {isEditing ? "Edit Dynamic QR Code" : "Create Dynamic QR Code"}
              </DialogTitle>
              <DialogDescription className="text-xs">
                Configure your dynamic QR code destination, custom short slug, and styling.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {open && (
          <QRBuilderForm
            key={initialData?.id || "create-new"}
            initialData={initialData}
            onCancel={() => onOpenChange(false)}
            onSuccess={onSuccess}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
