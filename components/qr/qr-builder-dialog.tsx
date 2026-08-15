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
import {
  Loader2,
  QrCode,
  Sparkles,
  Palette,
  Globe,
  CheckCircle2,
  AlertCircle,
  Link2,
  FolderGit2,
  Flame,
  Layers,
} from "lucide-react";
import type { QRCode as QRCodeModel } from "@/lib/db/schema";
import { cn } from "@/lib/utils";

export interface QRBuilderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData?: QRCodeModel | null;
  onSuccess?: (qrCode: QRCodeModel) => void;
}

const PRESET_COLORS = [
  { label: "Fire Flame", fg: "#FA5D29", bg: "#ffffff" },
  { label: "Classic Dark", fg: "#09090b", bg: "#ffffff" },
  { label: "Midnight Indigo", fg: "#1e1b4b", bg: "#ffffff" },
  { label: "Emerald Green", fg: "#047857", bg: "#ffffff" },
  { label: "Royal Sapphire", fg: "#1d4ed8", bg: "#ffffff" },
  { label: "Obsidian Dark", fg: "#ffffff", bg: "#09090b" },
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
  const [foregroundColor, setForegroundColor] = React.useState(initialData?.foregroundColor || "#FA5D29");
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
    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-12 gap-6 pt-1">
      {/* Left Column: Form Controls */}
      <div className="md:col-span-7 space-y-4">
        <Tabs defaultValue="basics" className="w-full">
          <TabsList className="grid w-full grid-cols-2 h-10 p-1 bg-muted/60 rounded-xl border border-border/60 mb-4">
            <TabsTrigger
              value="basics"
              className="rounded-lg text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all gap-1.5 py-1.5"
            >
              <Globe className="size-3.5 text-primary" />
              <span>Destination &amp; Slug</span>
            </TabsTrigger>
            <TabsTrigger
              value="style"
              className="rounded-lg text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all gap-1.5 py-1.5"
            >
              <Palette className="size-3.5 text-primary" />
              <span>Styling &amp; Brand</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basics" className="space-y-4 mt-0">
            {/* QR Code Name */}
            <div className="space-y-1.5">
              <Label htmlFor="qr-name" className="text-xs font-semibold text-foreground flex items-center justify-between">
                <span>QR Code Name</span>
                <span className="text-[10px] text-muted-foreground font-normal">Required</span>
              </Label>
              <Input
                id="qr-name"
                placeholder="e.g. Summer Promo Poster #1"
                value={name}
                onChange={handleNameChange}
                maxLength={100}
                required
                className="h-9.5 text-xs rounded-xl border-border/80 bg-background/80 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 shadow-2xs"
              />
            </div>

            {/* Destination URL */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="qr-destination" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Link2 className="size-3.5 text-primary" />
                  <span>Destination URL</span>
                </Label>
                {destinationUrl && (
                  <span className="text-[11px] flex items-center gap-1 font-medium">
                    {isUrlValid ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="size-3" /> Valid URL
                      </span>
                    ) : (
                      <span className="text-destructive flex items-center gap-1">
                        <AlertCircle className="size-3" /> Needs https://
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
                className="h-9.5 text-xs font-mono rounded-xl border-border/80 bg-background/80 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 shadow-2xs"
              />
              <p className="text-[11px] text-muted-foreground">
                Target webpage or app link where visitors will be routed in real-time.
              </p>
            </div>

            {/* Custom Slug */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <Label htmlFor="qr-slug" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Sparkles className="size-3.5 text-primary" />
                  <span>Custom Short Slug</span>
                </Label>
                {slug && (
                  <span className="text-[11px] font-medium">
                    {isSlugValid ? (
                      <span className="text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="size-3" /> Available
                      </span>
                    ) : (
                      <span className="text-destructive flex items-center gap-1">
                        <AlertCircle className="size-3" /> Letters, numbers, hyphens
                      </span>
                    )}
                  </span>
                )}
              </div>
              <div className="flex rounded-xl border border-border/80 focus-within:border-primary focus-within:ring-2 focus-within:ring-primary/20 bg-background/80 overflow-hidden shadow-2xs transition-all">
                <span className="inline-flex items-center px-3 bg-muted/60 text-muted-foreground text-xs font-mono font-semibold border-r border-border/80 select-none">
                  /r/
                </span>
                <input
                  id="qr-slug"
                  type="text"
                  placeholder="summer-sale"
                  value={slug}
                  onChange={handleSlugChange}
                  required
                  className="flex h-9.5 w-full bg-transparent px-3 py-1 text-xs font-mono font-medium text-foreground focus:outline-none placeholder:text-muted-foreground"
                />
              </div>
              <p className="text-[11px] text-muted-foreground">
                Scan link: <code className="text-[11px] font-mono text-primary font-semibold">{buildRedirectUrl(slug || "slug")}</code>
              </p>
            </div>

            {/* Marketing Campaign (Full Width) */}
            <div className="space-y-1.5">
              <Label htmlFor="qr-campaign" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <FolderGit2 className="size-3.5 text-muted-foreground" />
                <span>Marketing Campaign (Optional)</span>
              </Label>
              <Select
                value={campaignId || "none"}
                onValueChange={(val) => setCampaignId(val === "none" ? null : val)}
              >
                <SelectTrigger id="qr-campaign" className="w-full h-9.5 text-xs rounded-xl border-border/80 bg-background/80 shadow-2xs">
                  <SelectValue placeholder="Standalone (No Campaign)" />
                </SelectTrigger>
                <SelectContent className="rounded-xl w-[var(--radix-select-trigger-width)]">
                  <SelectItem value="none" className="text-xs rounded-lg">
                    Standalone (No Campaign)
                  </SelectItem>
                  {availableCampaigns.map((camp) => (
                    <SelectItem key={camp.id} value={camp.id} className="text-xs rounded-lg">
                      📁 {camp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Initial Status (Full Width) */}
            <div className="space-y-1.5">
              <Label htmlFor="qr-status" className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                <Layers className="size-3.5 text-muted-foreground" />
                <span>Initial Status</span>
              </Label>
              <Select
                value={status}
                onValueChange={(val) => {
                  if (val) setStatus(val as "active" | "paused" | "archived");
                }}
              >
                <SelectTrigger id="qr-status" className="w-full h-9.5 text-xs rounded-xl border-border/80 bg-background/80 shadow-2xs">
                  <SelectValue placeholder="Select status" />
                </SelectTrigger>
                <SelectContent className="rounded-xl w-[var(--radix-select-trigger-width)]">
                  <SelectItem value="active" className="text-xs rounded-lg">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-emerald-500" />
                      Active (Routing Live)
                    </span>
                  </SelectItem>
                  <SelectItem value="paused" className="text-xs rounded-lg">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-amber-500" />
                      Paused (Holding Page)
                    </span>
                  </SelectItem>
                  <SelectItem value="archived" className="text-xs rounded-lg">
                    <span className="flex items-center gap-1.5">
                      <span className="size-2 rounded-full bg-zinc-400" />
                      Archived (Disabled)
                    </span>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </TabsContent>

          <TabsContent value="style" className="space-y-4 mt-0">
            {/* Preset Themes */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                  <Flame className="size-3.5 text-primary" />
                  <span>Brand Color Palettes</span>
                </Label>
                <span className="text-[11px] text-muted-foreground">Click to apply</span>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {PRESET_COLORS.map((preset) => {
                  const isSelected = foregroundColor === preset.fg && backgroundColor === preset.bg;
                  return (
                    <button
                      key={preset.label}
                      type="button"
                      onClick={() => {
                        setForegroundColor(preset.fg);
                        setBackgroundColor(preset.bg);
                      }}
                      className={cn(
                        "flex items-center gap-2 p-2.5 rounded-xl border text-left transition-all text-xs",
                        isSelected
                          ? "border-primary bg-primary/10 ring-1 ring-primary/40 font-semibold shadow-2xs"
                          : "border-border/80 bg-card/60 hover:bg-muted/50 hover:border-border"
                      )}
                    >
                      <div
                        className="size-4 rounded-full border border-black/10 dark:border-white/10 shadow-2xs shrink-0"
                        style={{ backgroundColor: preset.fg }}
                      />
                      <span className="text-[11px] truncate">{preset.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Custom Color Pickers */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1.5">
                <Label htmlFor="qr-fg" className="text-xs font-semibold text-foreground">
                  Foreground (Pattern)
                </Label>
                <div className="flex items-center gap-2 p-1.5 rounded-xl border border-border/80 bg-background/80 shadow-2xs">
                  <input
                    id="qr-fg"
                    type="color"
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    className="size-7 rounded-lg border border-border/80 p-0 cursor-pointer bg-transparent shrink-0"
                  />
                  <Input
                    type="text"
                    value={foregroundColor}
                    onChange={(e) => setForegroundColor(e.target.value)}
                    className="h-7 text-xs font-mono border-0 shadow-none focus-visible:ring-0 px-1 uppercase"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <Label htmlFor="qr-bg" className="text-xs font-semibold text-foreground">
                  Background
                </Label>
                <div className="flex items-center gap-2 p-1.5 rounded-xl border border-border/80 bg-background/80 shadow-2xs">
                  <input
                    id="qr-bg"
                    type="color"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="size-7 rounded-lg border border-border/80 p-0 cursor-pointer bg-transparent shrink-0"
                  />
                  <Input
                    type="text"
                    value={backgroundColor}
                    onChange={(e) => setBackgroundColor(e.target.value)}
                    className="h-7 text-xs font-mono border-0 shadow-none focus-visible:ring-0 px-1 uppercase"
                  />
                </div>
              </div>
            </div>

            {/* Error Correction Level */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <Label className="text-xs font-semibold text-foreground">
                  Error Correction Capability (ECC)
                </Label>
                <span className="text-[11px] text-muted-foreground font-mono">
                  {ecc === "L" && "Low (7% recovery)"}
                  {ecc === "M" && "Medium (15% - Default)"}
                  {ecc === "Q" && "Quartile (25% recovery)"}
                  {ecc === "H" && "High (30% - Print Ready)"}
                </span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {(["L", "M", "Q", "H"] as const).map((level) => (
                  <button
                    key={level}
                    type="button"
                    onClick={() => setEcc(level)}
                    className={cn(
                      "py-2 px-2 rounded-xl border text-xs font-semibold transition-all text-center",
                      ecc === level
                        ? "border-primary bg-primary text-primary-foreground shadow-xs"
                        : "border-border/80 bg-background/80 hover:bg-muted/60 text-muted-foreground hover:text-foreground"
                    )}
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
      <div className="md:col-span-5 flex flex-col items-center justify-between p-4 sm:p-5 bg-card/60 backdrop-blur-md rounded-2xl border border-border/80 shadow-2xs gap-4">
        <div className="w-full flex items-center justify-between">
          <span className="text-[11px] font-bold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5">
            <Sparkles className="size-3 text-primary animate-pulse" />
            Live Preview
          </span>
          <span
            className={cn(
              "text-[10px] px-2.5 py-0.5 rounded-full font-semibold border flex items-center gap-1",
              status === "active"
                ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
                : status === "paused"
                ? "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20"
                : "bg-muted text-muted-foreground border-border"
            )}
          >
            <span
              className={cn(
                "size-1.5 rounded-full",
                status === "active" ? "bg-emerald-500 animate-pulse" : status === "paused" ? "bg-amber-500" : "bg-zinc-400"
              )}
            />
            {status.toUpperCase()}
          </span>
        </div>

        {/* QR Preview Card Frame */}
        <div className="w-full flex items-center justify-center p-3 rounded-xl border border-border/60 bg-background/50 shadow-inner">
          <QRPreview
            value={destinationUrl || "https://scanflow.io"}
            slug={slug || "preview-slug"}
            foregroundColor={foregroundColor}
            backgroundColor={backgroundColor}
            size={160}
            errorCorrectionLevel={ecc}
            showActions={false}
            className="border-0 shadow-none bg-transparent p-0"
          />
        </div>

        {/* Bottom Destination Snippet */}
        <div className="w-full rounded-xl bg-background/80 border border-border/80 p-2.5 text-center shadow-2xs space-y-1">
          <div className="text-[10px] uppercase font-bold tracking-wider text-muted-foreground">
            Target Destination
          </div>
          <div className="font-mono text-xs text-foreground truncate max-w-[210px] mx-auto font-medium" title={destinationUrl}>
            {destinationUrl || "https://..."}
          </div>
        </div>
      </div>

      {/* Form Actions Footer */}
      <div className="col-span-12 flex items-center justify-end gap-2.5 pt-4 mt-1 border-t border-border/60">
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={isSubmitting}
          className="h-9 px-4 text-xs font-medium rounded-xl hover:bg-muted"
        >
          Cancel
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || !name || !slug || !destinationUrl}
          className="h-9 px-5 text-xs font-semibold rounded-xl shadow-xs bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
        >
          {isSubmitting ? (
            <>
              <Loader2 className="size-3.5 animate-spin" />
              <span>Saving...</span>
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
      <DialogContent className="sm:max-w-3xl max-h-[92vh] overflow-y-auto p-6 sm:p-7 rounded-2xl border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl">
        <DialogHeader className="pb-4 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-linear-to-br from-fire to-fire-hover text-white flex items-center justify-center shadow-xs">
              <QrCode className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
                {isEditing ? "Edit Dynamic QR Code" : "Create Dynamic QR Code"}
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
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
