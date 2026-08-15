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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Target, Sparkles } from "lucide-react";
import type { ConversionGoalData } from "./conversion-card";

export interface ConversionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal?: ConversionGoalData | any | null;
  qrCodes?: Array<{ id: string; name: string }>;
  campaigns?: Array<{ id: string; name: string }>;
  onSave?: (data: {
    name: string;
    description?: string;
    eventType: string;
    targetPattern?: string;
    qrCodeId?: string | null;
    campaignId?: string | null;
    monetaryValue?: number;
    currency?: string;
    isActive?: boolean;
  }) => Promise<void> | void;
}

export function ConversionDialog({
  open,
  onOpenChange,
  goal,
  qrCodes = [],
  campaigns = [],
  onSave,
}: ConversionDialogProps) {
  const [name, setName] = React.useState("");
  const [description, setDescription] = React.useState("");
  const [eventType, setEventType] = React.useState("PAGE_VIEW");
  const [targetPattern, setTargetPattern] = React.useState("");
  const [qrCodeId, setQrCodeId] = React.useState<string>("all");
  const [campaignId, setCampaignId] = React.useState<string>("all");
  const [monetaryValue, setMonetaryValue] = React.useState<string>("");
  const [isActive, setIsActive] = React.useState(true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const isEditing = Boolean(goal && goal.id);

  React.useEffect(() => {
    if (open) {
      if (goal) {
        setName(goal.name || "");
        setDescription(goal.description || "");
        setEventType(goal.eventType || "PAGE_VIEW");
        setTargetPattern(goal.targetPattern || "");
        setQrCodeId(goal.qrCodeId || "all");
        setCampaignId(goal.campaignId || "all");
        setMonetaryValue(
          goal.monetaryValue !== undefined && goal.monetaryValue !== null
            ? (goal.monetaryValue / 100).toString()
            : ""
        );
        setIsActive(goal.isActive !== undefined ? goal.isActive : true);
      } else {
        setName("");
        setDescription("");
        setEventType("PAGE_VIEW");
        setTargetPattern("");
        setQrCodeId("all");
        setCampaignId("all");
        setMonetaryValue("");
        setIsActive(true);
      }
      setError("");
    }
  }, [open, goal]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Goal name is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      const parsedDollars = parseFloat(monetaryValue) || 0;
      const parsedCents = Math.max(0, Math.round(parsedDollars * 100));

      const payload = {
        name: name.trim(),
        description: description.trim() || undefined,
        eventType,
        targetPattern: targetPattern.trim() || undefined,
        qrCodeId: qrCodeId !== "all" ? qrCodeId : null,
        campaignId: campaignId !== "all" ? campaignId : null,
        monetaryValue: parsedCents,
        currency: "USD",
        isActive,
      };

      if (onSave) {
        await onSave(payload);
      } else {
        const url = isEditing && goal ? `/api/conversions/${goal.id}` : "/api/conversions";
        const method = isEditing ? "PATCH" : "POST";

        const res = await fetch(url, {
          method,
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to save conversion goal");
        }
      }

      onOpenChange(false);
    } catch (err: any) {
      setError(err.message || "Failed to save conversion goal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-zinc-950 border-zinc-800 text-zinc-100 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Target className="h-5 w-5 text-sky-400" />
            <span>{isEditing ? "Edit Conversion Goal" : "Create Conversion Goal"}</span>
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-xs">
            Track key visitor actions such as button clicks, page visits, form submissions, and revenue events.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2">
          {error && (
            <div className="rounded-md bg-red-500/10 border border-red-500/30 p-2.5 text-xs text-red-400">
              {error}
            </div>
          )}

          {/* Goal Name */}
          <div className="space-y-1.5">
            <Label htmlFor="goal-name" className="text-xs font-semibold text-zinc-300">
              Goal Name *
            </Label>
            <Input
              id="goal-name"
              placeholder="e.g. Newsletter Sign-up or Checkout Completed"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="bg-zinc-900/60 border-zinc-800 text-zinc-200 text-sm"
            />
          </div>

          {/* Description */}
          <div className="space-y-1.5">
            <Label htmlFor="goal-description" className="text-xs font-semibold text-zinc-300">
              Description (Optional)
            </Label>
            <Input
              id="goal-description"
              placeholder="e.g. Measures sign-ups triggered from table tent QR codes"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="bg-zinc-900/60 border-zinc-800 text-zinc-200 text-sm"
            />
          </div>

          {/* Event Type & Monetary Value Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="goal-event-type" className="text-xs font-semibold text-zinc-300">
                Event Type
              </Label>
              <Select value={eventType} onValueChange={setEventType}>
                <SelectTrigger
                  id="goal-event-type"
                  className="bg-zinc-900/60 border-zinc-800 text-zinc-200 text-xs"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
                  <SelectItem value="PAGE_VIEW">Page View (URL Path / View)</SelectItem>
                  <SelectItem value="BUTTON_CLICK">Button Click (CTA Click)</SelectItem>
                  <SelectItem value="LINK_CLICK">Link Click (Outbound / Anchor)</SelectItem>
                  <SelectItem value="FORM_SUBMIT">Form Submit (Lead / Registration)</SelectItem>
                  <SelectItem value="CONVERSION">Custom Conversion / Purchase</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="goal-monetary-value" className="text-xs font-semibold text-zinc-300">
                Monetary Value ($)
              </Label>
              <Input
                id="goal-monetary-value"
                type="number"
                step="0.01"
                min="0"
                placeholder="0.00"
                value={monetaryValue}
                onChange={(e) => setMonetaryValue(e.target.value)}
                className="bg-zinc-900/60 border-zinc-800 text-zinc-200 text-sm font-mono"
              />
            </div>
          </div>

          {/* Target Pattern */}
          <div className="space-y-1.5">
            <Label htmlFor="goal-target-pattern" className="text-xs font-semibold text-zinc-300">
              Target Pattern (CSS Selector, Path, or ID)
            </Label>
            <Input
              id="goal-target-pattern"
              placeholder="e.g. #signup-form, .cta-button, or /checkout/success"
              value={targetPattern}
              onChange={(e) => setTargetPattern(e.target.value)}
              className="bg-zinc-900/60 border-zinc-800 text-zinc-200 text-sm font-mono"
            />
          </div>

          {/* Scope Assignment (QR Code & Campaign) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label htmlFor="goal-qr-code" className="text-xs font-semibold text-zinc-300">
                QR Code Scope
              </Label>
              <Select value={qrCodeId} onValueChange={setQrCodeId}>
                <SelectTrigger
                  id="goal-qr-code"
                  className="bg-zinc-900/60 border-zinc-800 text-zinc-200 text-xs"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
                  <SelectItem value="all">All QR Codes (Global)</SelectItem>
                  {qrCodes.map((qr) => (
                    <SelectItem key={qr.id} value={qr.id}>
                      {qr.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="goal-campaign" className="text-xs font-semibold text-zinc-300">
                Campaign Scope
              </Label>
              <Select value={campaignId} onValueChange={setCampaignId}>
                <SelectTrigger
                  id="goal-campaign"
                  className="bg-zinc-900/60 border-zinc-800 text-zinc-200 text-xs"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
                  <SelectItem value="all">All Campaigns (Global)</SelectItem>
                  {campaigns.map((camp) => (
                    <SelectItem key={camp.id} value={camp.id}>
                      {camp.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Status Toggle */}
          <div className="space-y-1.5">
            <Label htmlFor="goal-status" className="text-xs font-semibold text-zinc-300">
              Goal Status
            </Label>
            <Select
              value={isActive ? "active" : "inactive"}
              onValueChange={(val) => setIsActive(val === "active")}
            >
              <SelectTrigger
                id="goal-status"
                className="bg-zinc-900/60 border-zinc-800 text-zinc-200 text-xs"
              >
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
                <SelectItem value="active">Active (Tracking Enabled)</SelectItem>
                <SelectItem value="inactive">Inactive (Tracking Paused)</SelectItem>
              </SelectContent>
            </Select>
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
                  : "Create Goal"}
              </span>
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
