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
import { Split, Sparkles, Plus, Trash2 } from "lucide-react";
import type { ExperimentData, ExperimentVariantData } from "./experiment-card";

export interface ExperimentDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  experiment?: ExperimentData | any | null;
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
}

function isValidHttpUrl(string: string) {
  try {
    const url = new URL(string);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function ExperimentDialog({
  open,
  onOpenChange,
  experiment,
  qrCodes = [],
  campaigns = [],
  onSave,
}: ExperimentDialogProps) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [qrCodeId, setQrCodeId] = React.useState("");
  const [campaignId, setCampaignId] = React.useState<string>("none");
  const [trafficAllocation, setTrafficAllocation] = React.useState(100);
  const [status, setStatus] = React.useState("draft");

  // Variants state
  const [variantAName, setVariantAName] = React.useState("Variant A (Control)");
  const [variantAUrl, setVariantAUrl] = React.useState("");
  const [variantAWeight, setVariantAWeight] = React.useState(50);

  const [variantBName, setVariantBName] = React.useState("Variant B");
  const [variantBUrl, setVariantBUrl] = React.useState("");
  const [variantBWeight, setVariantBWeight] = React.useState(50);

  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const isEditing = Boolean(experiment && experiment.id);

  React.useEffect(() => {
    if (open) {
      if (experiment) {
        setName(experiment.name || "");
        setDescription(experiment.description || "");
        setQrCodeId(experiment.qrCodeId || "");
        setCampaignId(experiment.campaignId || "none");
        setTrafficAllocation(experiment.trafficAllocation ?? 100);
        setStatus(experiment.status || "draft");

        const expVariants = experiment.variants || [];
        const control = expVariants.find((v: ExperimentVariantData) => v.isControl) || expVariants[0];
        const nonControl = expVariants.find((v: ExperimentVariantData) => !v.isControl) || expVariants[1];

        if (control) {
          setVariantAName(control.name || "Variant A (Control)");
          setVariantAUrl(control.destinationUrl || "");
          setVariantAWeight(control.trafficWeight ?? 50);
        } else {
          setVariantAName("Variant A (Control)");
          setVariantAUrl("");
          setVariantAWeight(50);
        }

        if (nonControl) {
          setVariantBName(nonControl.name || "Variant B");
          setVariantBUrl(nonControl.destinationUrl || "");
          setVariantBWeight(nonControl.trafficWeight ?? 50);
        } else {
          setVariantBName("Variant B");
          setVariantBUrl("");
          setVariantBWeight(50);
        }
      } else {
        setName("");
        setDescription("");
        setQrCodeId(qrCodes.length === 1 ? qrCodes[0].id : "");
        setCampaignId("none");
        setTrafficAllocation(100);
        setStatus("draft");

        setVariantAName("Variant A (Control)");
        setVariantAUrl("");
        setVariantAWeight(50);

        setVariantBName("Variant B");
        setVariantBUrl("");
        setVariantBWeight(50);
      }
      setError("");
    }
  }, [open, experiment, qrCodes]);

  const applyPreset = (weightA: number, weightB: number) => {
    setVariantAWeight(weightA);
    setVariantBWeight(weightB);
  };

  const totalWeight = Number(variantAWeight || 0) + Number(variantBWeight || 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      setError("Experiment name is required");
      return;
    }

    if (!qrCodeId || !qrCodeId.trim() || qrCodeId === "none") {
      setError("Please select a QR code");
      return;
    }

    if (!variantAName.trim()) {
      setError("Variant A requires a name");
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
          ? (experiment.variants.find((v: any) => v.isControl) || experiment.variants[0])?.id
          : undefined;
      const existingNonControlId =
        isEditing && experiment?.variants
          ? (experiment.variants.find((v: any) => !v.isControl) || experiment.variants[1])?.id
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

      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Failed to save experiment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl bg-zinc-950 border-zinc-800 text-zinc-100 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Split className="h-5 w-5 text-sky-400" />
            <span>{isEditing ? "Edit Experiment" : "Create Experiment"}</span>
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-xs">
            Split visitor traffic between different landing pages to measure conversion rate lift and statistical significance.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="rounded-md bg-red-500/10 border border-red-500/30 p-2.5 text-xs text-red-400">
              {error}
            </div>
          )}

          {/* Experiment Name */}
          <div className="space-y-1.5">
            <Label htmlFor="experiment-name" className="text-xs font-semibold text-zinc-300">
              Experiment Name *
            </Label>
            <Input
              id="experiment-name"
              placeholder="e.g. Hero CTA Redesign Test"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-zinc-900/60 border-zinc-800 text-zinc-200 text-sm"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="experiment-description" className="text-xs font-semibold text-zinc-300">
              Description (Optional)
            </Label>
            <Input
              id="experiment-description"
              placeholder="e.g. Testing conversion lift of green vs blue CTA buttons"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-zinc-900/60 border-zinc-800 text-zinc-200 text-sm"
            />
          </div>

          {/* Scope Assignment (QR Code & Campaign) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="experiment-qr-code" className="text-xs font-semibold text-zinc-300">
                QR Code *
              </Label>
              <select
                id="experiment-qr-code"
                value={qrCodeId}
                onChange={(e) => setQrCodeId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs text-zinc-200 shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
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
              <Label htmlFor="experiment-campaign" className="text-xs font-semibold text-zinc-300">
                Campaign (Optional)
              </Label>
              <select
                id="experiment-campaign"
                value={campaignId}
                onChange={(e) => setCampaignId(e.target.value)}
                className="flex h-9 w-full rounded-md border border-zinc-800 bg-zinc-900/60 px-3 py-1 text-xs text-zinc-200 shadow-xs transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-sky-400 disabled:cursor-not-allowed disabled:opacity-50"
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
          <div className="pt-2 border-t border-zinc-850">
            <div className="flex items-center justify-between gap-2 flex-wrap mb-2">
              <span className="text-xs font-semibold text-zinc-300 flex items-center gap-1.5">
                <Split className="h-3.5 w-3.5 text-sky-400" />
                Traffic Split & Variants
              </span>
              <div className="flex items-center gap-1">
                <span className="text-[11px] text-zinc-400 mr-1">Presets:</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => applyPreset(50, 50)}
                  className={`h-6 text-[11px] px-2 border-zinc-800 ${
                    variantAWeight === 50 && variantBWeight === 50
                      ? "bg-sky-500/20 text-sky-400 border-sky-500/30"
                      : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  50 / 50
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => applyPreset(70, 30)}
                  className={`h-6 text-[11px] px-2 border-zinc-800 ${
                    variantAWeight === 70 && variantBWeight === 30
                      ? "bg-sky-500/20 text-sky-400 border-sky-500/30"
                      : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  70 / 30
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => applyPreset(80, 20)}
                  className={`h-6 text-[11px] px-2 border-zinc-800 ${
                    variantAWeight === 80 && variantBWeight === 20
                      ? "bg-sky-500/20 text-sky-400 border-sky-500/30"
                      : "bg-zinc-900/60 text-zinc-400 hover:text-zinc-200"
                  }`}
                >
                  80 / 20
                </Button>
              </div>
            </div>

            {/* Total weight indicator */}
            <div className="mb-3 flex items-center justify-between text-xs px-0.5">
              <span className="text-zinc-400">Total Traffic Split:</span>
              <span
                className={`font-mono font-semibold ${
                  Math.round(totalWeight) === 100
                    ? "text-emerald-400"
                    : "text-red-400"
                }`}
              >
                {totalWeight}% {Math.round(totalWeight) !== 100 ? "(Must sum to 100%)" : "✓"}
              </span>
            </div>

            {/* Variant A (Control) */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3.5 space-y-3 mb-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-zinc-400" />
                  Variant A (Control Baseline)
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  {variantAWeight}% traffic
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="space-y-1 sm:col-span-1">
                  <Label htmlFor="variant-a-name" className="text-[11px] text-zinc-400">
                    Variant A Name
                  </Label>
                  <Input
                    id="variant-a-name"
                    value={variantAName}
                    onChange={(e) => setVariantAName(e.target.value)}
                    className="bg-zinc-950/60 border-zinc-800 text-zinc-200 text-xs h-8"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="variant-a-url" className="text-[11px] text-zinc-400">
                    Variant A Destination URL *
                  </Label>
                  <Input
                    id="variant-a-url"
                    placeholder="https://example.com/control"
                    value={variantAUrl}
                    onChange={(e) => setVariantAUrl(e.target.value)}
                    className="bg-zinc-950/60 border-zinc-800 text-zinc-200 text-xs h-8 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="variant-a-weight" className="text-[11px] text-zinc-400">
                  Variant A Weight (%)
                </Label>
                <Input
                  id="variant-a-weight"
                  type="number"
                  min="0"
                  max="100"
                  value={variantAWeight}
                  onChange={(e) => setVariantAWeight(Number(e.target.value) || 0)}
                  className="bg-zinc-950/60 border-zinc-800 text-zinc-200 text-xs h-8 font-mono max-w-[120px]"
                />
              </div>
            </div>

            {/* Variant B */}
            <div className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-zinc-200 flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-sky-400" />
                  Variant B (Challenger)
                </span>
                <span className="text-xs font-mono text-zinc-400">
                  {variantBWeight}% traffic
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div className="space-y-1 sm:col-span-1">
                  <Label htmlFor="variant-b-name" className="text-[11px] text-zinc-400">
                    Variant B Name
                  </Label>
                  <Input
                    id="variant-b-name"
                    value={variantBName}
                    onChange={(e) => setVariantBName(e.target.value)}
                    className="bg-zinc-950/60 border-zinc-800 text-zinc-200 text-xs h-8"
                  />
                </div>

                <div className="space-y-1 sm:col-span-2">
                  <Label htmlFor="variant-b-url" className="text-[11px] text-zinc-400">
                    Variant B Destination URL *
                  </Label>
                  <Input
                    id="variant-b-url"
                    placeholder="https://example.com/challenger"
                    value={variantBUrl}
                    onChange={(e) => setVariantBUrl(e.target.value)}
                    className="bg-zinc-950/60 border-zinc-800 text-zinc-200 text-xs h-8 font-mono"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <Label htmlFor="variant-b-weight" className="text-[11px] text-zinc-400">
                  Variant B Weight (%)
                </Label>
                <Input
                  id="variant-b-weight"
                  type="number"
                  min="0"
                  max="100"
                  value={variantBWeight}
                  onChange={(e) => setVariantBWeight(Number(e.target.value) || 0)}
                  className="bg-zinc-950/60 border-zinc-800 text-zinc-200 text-xs h-8 font-mono max-w-[120px]"
                />
              </div>
            </div>
          </div>

          <DialogFooter className="pt-3">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="border-zinc-800 bg-zinc-900/60 text-zinc-400 hover:text-zinc-200"
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={loading}
              className="bg-sky-600 hover:bg-sky-500 text-white text-xs gap-1.5"
            >
              <Sparkles className="h-3.5 w-3.5" />
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
      </DialogContent>
    </Dialog>
  );
}
