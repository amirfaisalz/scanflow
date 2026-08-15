"use client";

import * as React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Split, Sparkles } from "lucide-react";
import { normalizeUrl, isValidUrl } from "@/lib/qr";
import type { ExperimentData, ExperimentVariantData } from "./experiment-card";

function isValidHttpUrl(string: string) {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function ExperimentFormContent({
  experiment,
  qrCodes = [],
  campaigns = [],
  onSave,
  onClose,
}: {
  experiment?: ExperimentData | null;
  qrCodes?: Array<{ id: string; name: string; destinationUrl?: string }>;
  campaigns?: Array<{ id: string; name: string }>;
  onSave?: (data: {
    name: string;
    description?: string;
    qrCodeId: string;
    campaignId?: string | null;
    trafficAllocation?: number;
    status?: string;
    variants: Array<{
      id?: string;
      name: string;
      destinationUrl: string;
      trafficWeight: number;
      isControl: boolean;
    }>;
  }) => Promise<void> | void;
  onClose: () => void;
}) {
  const isEditing = Boolean(experiment?.id);

  // Form states
  const [name, setName] = React.useState(experiment?.name || "");
  const [description, setDescription] = React.useState(
    experiment?.description || ""
  );
  const [qrCodeId, setQrCodeId] = React.useState(
    experiment?.qrCodeId || ""
  );
  const [campaignId, setCampaignId] = React.useState(
    experiment?.campaignId || "none"
  );
  const [status, setStatus] = React.useState(
    experiment?.status || "draft"
  );
  const [trafficAllocation, setTrafficAllocation] = React.useState(
    experiment?.trafficAllocation || 100
  );

  // Variants state (typically A & B)
  const defaultControl = experiment?.variants?.find((v) => v.isControl) || experiment?.variants?.[0];
  const defaultChallenger = experiment?.variants?.find((v) => !v.isControl) || experiment?.variants?.[1];

  const [variantAName, setVariantAName] = React.useState(
    defaultControl?.name || "Variant A (Control)"
  );
  const [variantAUrl, setVariantAUrl] = React.useState(
    defaultControl?.destinationUrl || ""
  );
  const [variantAWeight, setVariantAWeight] = React.useState(
    defaultControl?.trafficWeight ?? 50
  );

  const [variantBName, setVariantBName] = React.useState(
    defaultChallenger?.name || "Variant B"
  );
  const [variantBUrl, setVariantBUrl] = React.useState(
    defaultChallenger?.destinationUrl || ""
  );
  const [variantBWeight, setVariantBWeight] = React.useState(
    defaultChallenger?.trafficWeight ?? 50
  );

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  // When QR code changes and URL is empty, prefill variant A with selected QR destinationUrl
  React.useEffect(() => {
    if (!variantAUrl && qrCodeId) {
      const selected = qrCodes.find((q) => q.id === qrCodeId);
      if (selected?.destinationUrl) {
        setVariantAUrl(selected.destinationUrl);
      }
    }
  }, [qrCodeId, qrCodes, variantAUrl]);

  const totalWeight = Number(variantAWeight) + Number(variantBWeight);

  const applyPreset = (a: number, b: number) => {
    setVariantAWeight(a);
    setVariantBWeight(b);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Experiment name is required");
      return;
    }

    if (!qrCodeId.trim()) {
      setError("Please select a QR code");
      return;
    }

    if (!variantAUrl.trim() || !isValidHttpUrl(variantAUrl.trim())) {
      setError("Variant A requires a valid URL (http/https)");
      return;
    }

    if (!variantBName.trim()) {
      setError("Variant B requires a name");
      return;
    }

    if (!variantBUrl.trim() || !isValidHttpUrl(variantBUrl.trim())) {
      setError("Variant B requires a valid URL (http/https)");
      return;
    }

    if (Math.round(totalWeight) !== 100) {
      setError("Variant traffic weights must sum to 100%");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const existingControlId =
        isEditing && experiment?.variants
          ? (experiment.variants.find((v: ExperimentVariantData) => v.isControl) || experiment.variants[0])?.id
          : undefined;
      const existingNonControlId =
        isEditing && experiment?.variants
          ? (experiment.variants.find((v: ExperimentVariantData) => !v.isControl) || experiment.variants[1])?.id
          : undefined;

      const variantsPayload = [
        {
          id: existingControlId,
          name: variantAName.trim(),
          destinationUrl: variantAUrl.trim(),
          trafficWeight: Math.round(Number(variantAWeight)),
          isControl: true,
        },
        {
          id: existingNonControlId,
          name: variantBName.trim(),
          destinationUrl: variantBUrl.trim(),
          trafficWeight: Math.round(Number(variantBWeight)),
          isControl: false,
        },
      ];

      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        qrCodeId: qrCodeId.trim(),
        campaignId: campaignId !== "none" ? campaignId : null,
        trafficAllocation: Number(trafficAllocation) || 100,
        status: isEditing ? status : "draft",
        variants: variantsPayload,
      };

      if (onSave) {
        await onSave(payload);
      } else {
        const url = isEditing && experiment ? `/api/experiments/${experiment.id}` : "/api/experiments";
        const method = isEditing ? "PATCH" : "POST";

        const res = await fetch(url, {
          method,
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to save experiment");
        }
      }

      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save experiment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DialogHeader className="pb-3 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-500 flex items-center justify-center shadow-2xs">
            <Split className="size-5" />
          </div>
          <div>
            <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
              {isEditing ? "Edit Experiment" : "Create Experiment"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              Split visitor traffic between different landing pages to measure conversion rate lift and statistical significance.
            </DialogDescription>
          </div>
        </div>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 pt-3">
        {error && (
          <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
            {error}
          </div>
        )}

        {/* Experiment Name */}
        <div className="space-y-1.5">
          <Label htmlFor="experiment-name" className="text-xs font-semibold text-foreground">
            Experiment Name *
          </Label>
          <Input
            id="experiment-name"
            placeholder="e.g. Hero CTA Redesign Test"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9.5 text-xs rounded-xl border-border/80 bg-background/80 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 shadow-2xs"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="experiment-description" className="text-xs font-semibold text-foreground">
            Description (Optional)
          </Label>
          <Input
            id="experiment-description"
            placeholder="e.g. Testing conversion lift of green vs blue CTA buttons"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-9.5 text-xs rounded-xl border-border/80 bg-background/80 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 shadow-2xs"
          />
        </div>

        {/* Scope Assignment (QR Code & Campaign) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="experiment-qr-code" className="text-xs font-semibold text-foreground">
              QR Code *
            </Label>
            <select
              id="experiment-qr-code"
              value={qrCodeId}
              onChange={(e) => setQrCodeId(e.target.value)}
              className="flex h-9.5 w-full rounded-xl border border-border/80 bg-background/80 px-3 py-1 text-xs text-foreground shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="">Select a QR code...</option>
              {qrCodes.map((qr) => (
                <option key={qr.id} value={qr.id}>
                  {qr.name}
                </option>
              ))}
            </select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="experiment-campaign" className="text-xs font-semibold text-foreground">
              Campaign (Optional)
            </Label>
            <select
              id="experiment-campaign"
              value={campaignId}
              onChange={(e) => setCampaignId(e.target.value)}
              className="flex h-9.5 w-full rounded-xl border border-border/80 bg-background/80 px-3 py-1 text-xs text-foreground shadow-2xs transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/20 focus-visible:border-primary disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="none">None (Independent)</option>
              {campaigns.map((camp) => (
                <option key={camp.id} value={camp.id}>
                  {camp.name}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Split Presets & Traffic Weights Header */}
        <div className="pt-2 border-t border-border/60">
          <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
            <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
              <Split className="size-3.5 text-primary" />
              Traffic Split &amp; Variants
            </span>
            <div className="flex items-center gap-1">
              <span className="text-[11px] text-muted-foreground mr-1">Presets:</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyPreset(50, 50)}
                className={`h-6 text-[11px] px-2 rounded-lg border-border/80 ${
                  variantAWeight === 50 && variantBWeight === 50
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "bg-muted/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                50 / 50
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyPreset(70, 30)}
                className={`h-6 text-[11px] px-2 rounded-lg border-border/80 ${
                  variantAWeight === 70 && variantBWeight === 30
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "bg-muted/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                70 / 30
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => applyPreset(80, 20)}
                className={`h-6 text-[11px] px-2 rounded-lg border-border/80 ${
                  variantAWeight === 80 && variantBWeight === 20
                    ? "bg-primary/10 text-primary border-primary/30"
                    : "bg-muted/40 text-muted-foreground hover:text-foreground"
                }`}
              >
                80 / 20
              </Button>
            </div>
          </div>

          {/* Total weight indicator */}
          <div className="mb-3 flex items-center justify-between text-xs px-0.5">
            <span className="text-muted-foreground">Total Traffic Split:</span>
            <span
              className={`font-mono font-semibold ${
                Math.round(totalWeight) === 100
                  ? "text-emerald-600 dark:text-emerald-400"
                  : "text-destructive"
              }`}
            >
              {totalWeight}% {Math.round(totalWeight) !== 100 ? "(Must sum to 100%)" : "✓"}
            </span>
          </div>

          {/* Variant A (Control) */}
          <div className="rounded-xl border border-border/80 bg-muted/40 p-3.5 space-y-3 mb-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-muted-foreground" />
                Variant A (Control Baseline)
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                {variantAWeight}% traffic
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="space-y-1 sm:col-span-1">
                <Label htmlFor="variant-a-name" className="text-[11px] text-muted-foreground">
                  Variant A Name
                </Label>
                <Input
                  id="variant-a-name"
                  value={variantAName}
                  onChange={(e) => setVariantAName(e.target.value)}
                  className="bg-background/80 border-border/80 text-foreground text-xs h-8 rounded-lg"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="variant-a-url" className="text-[11px] text-muted-foreground">
                  Variant A Destination URL *
                </Label>
                <Input
                  id="variant-a-url"
                  placeholder="https://example.com/control"
                  value={variantAUrl}
                  onChange={(e) => setVariantAUrl(e.target.value)}
                  className="bg-background/80 border-border/80 text-foreground text-xs h-8 font-mono rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="variant-a-weight" className="text-[11px] text-muted-foreground">
                Variant A Weight (%)
              </Label>
              <Input
                id="variant-a-weight"
                type="number"
                min="0"
                max="100"
                value={variantAWeight}
                onChange={(e) => setVariantAWeight(Number(e.target.value) || 0)}
                className="bg-background/80 border-border/80 text-foreground text-xs h-8 font-mono max-w-[120px] rounded-lg"
              />
            </div>
          </div>

          {/* Variant B */}
          <div className="rounded-xl border border-border/80 bg-muted/40 p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground flex items-center gap-1.5">
                <span className="size-2 rounded-full bg-sky-500" />
                Variant B (Challenger)
              </span>
              <span className="text-xs font-mono text-muted-foreground">
                {variantBWeight}% traffic
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              <div className="space-y-1 sm:col-span-1">
                <Label htmlFor="variant-b-name" className="text-[11px] text-muted-foreground">
                  Variant B Name
                </Label>
                <Input
                  id="variant-b-name"
                  value={variantBName}
                  onChange={(e) => setVariantBName(e.target.value)}
                  className="bg-background/80 border-border/80 text-foreground text-xs h-8 rounded-lg"
                />
              </div>

              <div className="space-y-1 sm:col-span-2">
                <Label htmlFor="variant-b-url" className="text-[11px] text-muted-foreground">
                  Variant B Destination URL *
                </Label>
                <Input
                  id="variant-b-url"
                  placeholder="https://example.com/challenger"
                  value={variantBUrl}
                  onChange={(e) => setVariantBUrl(e.target.value)}
                  className="bg-background/80 border-border/80 text-foreground text-xs h-8 font-mono rounded-lg"
                />
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="variant-b-weight" className="text-[11px] text-muted-foreground">
                Variant B Weight (%)
              </Label>
              <Input
                id="variant-b-weight"
                type="number"
                min="0"
                max="100"
                value={variantBWeight}
                onChange={(e) => setVariantBWeight(Number(e.target.value) || 0)}
                className="bg-background/80 border-border/80 text-foreground text-xs h-8 font-mono max-w-[120px] rounded-lg"
              />
            </div>
          </div>
        </div>

        <DialogFooter className="pt-3 border-t border-border/60 flex items-center justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
            className="h-9 px-4 text-xs font-medium rounded-xl hover:bg-muted"
          >
            Cancel
          </Button>
          <Button
            type="submit"
            size="sm"
            disabled={loading}
            className="h-9 px-5 text-xs font-semibold rounded-xl shadow-xs bg-primary hover:bg-primary/90 text-primary-foreground gap-2"
          >
            <Sparkles className="size-3.5" />
            <span>
              {loading
                ? "Saving..."
                : isEditing
                ? "Save Changes"
                : "Create Experiment"}
            </span>
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

export function ExperimentDialog({
  open,
  onOpenChange,
  experiment,
  qrCodes = [],
  campaigns = [],
  onSave,
}: ExperimentDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-6 rounded-2xl border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl text-foreground max-h-[90vh] overflow-y-auto">
        {open && (
          <ExperimentFormContent
            key={experiment?.id || "new"}
            experiment={experiment}
            qrCodes={qrCodes}
            campaigns={campaigns}
            onSave={onSave}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
