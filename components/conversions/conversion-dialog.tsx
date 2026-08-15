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
  goal?: ConversionGoalData | null;
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

function ConversionFormContent({
  goal,
  qrCodes = [],
  campaigns = [],
  onSave,
  onClose,
}: {
  goal?: ConversionGoalData | null;
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
  onClose: () => void;
}) {
  const [name, setName] = React.useState(goal?.name || "");
  const [description, setDescription] = React.useState(goal?.description || "");
  const [eventType, setEventType] = React.useState(goal?.eventType || "PAGE_VIEW");
  const [targetPattern, setTargetPattern] = React.useState(goal?.targetPattern || "");
  const [qrCodeId, setQrCodeId] = React.useState<string>(goal?.qrCodeId || "all");
  const [campaignId, setCampaignId] = React.useState<string>(goal?.campaignId || "all");
  const [monetaryValue, setMonetaryValue] = React.useState<string>(
    goal?.monetaryValue !== undefined && goal?.monetaryValue !== null
      ? (goal.monetaryValue / 100).toString()
      : ""
  );
  const [isActive, setIsActive] = React.useState(goal?.isActive !== undefined ? goal.isActive : true);
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const isEditing = Boolean(goal && goal.id);

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

      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save conversion goal");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
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
              Trigger Event Type *
            </Label>
            <Select value={eventType} onValueChange={(val) => { if (val) setEventType(val); }}>
              <SelectTrigger id="goal-event-type" className="bg-zinc-900/60 border-zinc-800 text-zinc-200 text-xs">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
                <SelectItem value="PAGE_VIEW">Page Visit / URL</SelectItem>
                <SelectItem value="BUTTON_CLICK">Button Click</SelectItem>
                <SelectItem value="LINK_CLICK">Link Click</SelectItem>
                <SelectItem value="FORM_SUBMIT">Form Submit</SelectItem>
                <SelectItem value="CONVERSION">Custom Conversion Event</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="goal-value" className="text-xs font-semibold text-zinc-300">
              Monetary Value ($ USD)
            </Label>
            <Input
              id="goal-value"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 29.99"
              value={monetaryValue}
              onChange={(e) => setMonetaryValue(e.target.value)}
              className="bg-zinc-900/60 border-zinc-800 text-zinc-200 text-sm"
            />
          </div>
        </div>

        {/* Target Pattern */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <Label htmlFor="goal-pattern" className="text-xs font-semibold text-zinc-300">
              Target Pattern / Match String
            </Label>
            <span className="text-[11px] text-zinc-400 font-mono">
              {eventType === "PAGE_VIEW"
                ? "e.g. /thank-you or /success"
                : eventType === "FORM_SUBMIT"
                ? "e.g. #contact-form"
                : "e.g. .btn-checkout"}
            </span>
          </div>
          <Input
            id="goal-pattern"
            placeholder={
              eventType === "PAGE_VIEW"
                ? "/thank-you or https://example.com/checkout/success"
                : "CSS Selector, Button ID, or custom event name"
            }
            value={targetPattern}
            onChange={(e) => setTargetPattern(e.target.value)}
            className="bg-zinc-900/60 border-zinc-800 text-zinc-200 text-sm font-mono"
          />
        </div>

        {/* Scope Assignment (QR Code & Campaign) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="goal-scope-qr" className="text-xs font-semibold text-zinc-300">
              Scope: QR Code
            </Label>
            <Select value={qrCodeId} onValueChange={(val) => { if (val) setQrCodeId(val); }}>
              <SelectTrigger id="goal-scope-qr" className="bg-zinc-900/60 border-zinc-800 text-zinc-200 text-xs">
                <SelectValue placeholder="All QR Codes (Global)" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
                <SelectItem value="all">All QR Codes (Global Scope)</SelectItem>
                {qrCodes.map((qr) => (
                  <SelectItem key={qr.id} value={qr.id}>
                    {qr.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="goal-scope-campaign" className="text-xs font-semibold text-zinc-300">
              Scope: Campaign
            </Label>
            <Select value={campaignId} onValueChange={(val) => { if (val) setCampaignId(val); }}>
              <SelectTrigger id="goal-scope-campaign" className="bg-zinc-900/60 border-zinc-800 text-zinc-200 text-xs">
                <SelectValue placeholder="All Campaigns (Global)" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
                <SelectItem value="all">All Campaigns (Global Scope)</SelectItem>
                {campaigns.map((camp) => (
                  <SelectItem key={camp.id} value={camp.id}>
                    {camp.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Active Toggle Switch */}
        <div className="flex items-center justify-between p-3 rounded-lg border border-zinc-800 bg-zinc-900/40">
          <div className="space-y-0.5">
            <Label htmlFor="goal-active" className="text-xs font-medium text-zinc-200 cursor-pointer">
              Active Tracking
            </Label>
            <p className="text-[11px] text-zinc-400">
              When disabled, new visitor actions will not increment conversions for this goal.
            </p>
          </div>
          <input
            type="checkbox"
            id="goal-active"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-zinc-700 bg-zinc-900 text-sky-500 focus:ring-sky-400 focus:ring-offset-zinc-950"
          />
        </div>

        <DialogFooter className="pt-3">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={onClose}
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
    </>
  );
}

export function ConversionDialog({
  open,
  onOpenChange,
  goal,
  qrCodes = [],
  campaigns = [],
  onSave,
}: ConversionDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg bg-zinc-950 border-zinc-800 text-zinc-100 max-h-[90vh] overflow-y-auto">
        {open && (
          <ConversionFormContent
            key={goal?.id || "new"}
            goal={goal}
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
