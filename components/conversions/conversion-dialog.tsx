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
      <DialogHeader className="pb-3 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-500 flex items-center justify-center shadow-2xs">
            <Target className="size-5" />
          </div>
          <div>
            <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
              {isEditing ? "Edit Conversion Goal" : "Create Conversion Goal"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              Track key visitor actions such as button clicks, page visits, form submissions, and revenue events.
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

        {/* Goal Name */}
        <div className="space-y-1.5">
          <Label htmlFor="goal-name" className="text-xs font-semibold text-foreground">
            Goal Name *
          </Label>
          <Input
            id="goal-name"
            placeholder="e.g. Newsletter Sign-up or Checkout Completed"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9.5 text-xs rounded-xl border-border/80 bg-background/80 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 shadow-2xs"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="goal-description" className="text-xs font-semibold text-foreground">
            Description
          </Label>
          <Input
            id="goal-description"
            placeholder="e.g. Measures sign-ups triggered from table tent QR codes"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-9.5 text-xs rounded-xl border-border/80 bg-background/80 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 shadow-2xs"
          />
        </div>

        {/* Event Type & Monetary Value Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label htmlFor="goal-event-type" className="text-xs font-semibold text-foreground">
              Trigger Event Type *
            </Label>
            <Select value={eventType} onValueChange={(val) => { if (val) setEventType(val); }}>
              <SelectTrigger id="goal-event-type" className="h-9.5 text-xs rounded-xl border-border/80 bg-background/80">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border/80 text-popover-foreground rounded-xl shadow-xl">
                <SelectItem value="PAGE_VIEW">Page Visit / URL</SelectItem>
                <SelectItem value="BUTTON_CLICK">Button Click</SelectItem>
                <SelectItem value="LINK_CLICK">Link Click</SelectItem>
                <SelectItem value="FORM_SUBMIT">Form Submit</SelectItem>
                <SelectItem value="CONVERSION">Custom Conversion Event</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label htmlFor="goal-value" className="text-xs font-semibold text-foreground">
              Monetary Value
            </Label>
            <Input
              id="goal-value"
              type="number"
              step="0.01"
              min="0"
              placeholder="e.g. 29.99"
              value={monetaryValue}
              onChange={(e) => setMonetaryValue(e.target.value)}
              className="h-9.5 text-xs rounded-xl border-border/80 bg-background/80 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 shadow-2xs"
            />
          </div>
        </div>

        {/* Target Pattern */}
        <div className="space-y-1.5">
          <Label htmlFor="goal-pattern" className="text-xs font-semibold text-foreground">
            Target Pattern
          </Label>
          <Input
            id="goal-pattern"
            placeholder={
              eventType === "PAGE_VIEW"
                ? "/thank-you or https://example.com/checkout/success"
                : "CSS Selector, Button ID, or custom event name"
            }
            value={targetPattern}
            onChange={(e) => setTargetPattern(e.target.value)}
            className="h-9.5 text-xs rounded-xl border-border/80 bg-background/80 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 shadow-2xs font-mono"
          />
        </div>

        {/* Scope Assignment (QR Code & Campaign) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <div className="space-y-1.5">
            <Label htmlFor="goal-scope-qr" className="text-xs font-semibold text-foreground">
              Scope: QR Code
            </Label>
            <Select value={qrCodeId} onValueChange={(val) => { if (val) setQrCodeId(val); }}>
              <SelectTrigger id="goal-scope-qr" className="h-9.5 text-xs rounded-xl border-border/80 bg-background/80">
                <SelectValue placeholder="All QR Codes (Global)" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border/80 text-popover-foreground rounded-xl shadow-xl">
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
            <Label htmlFor="goal-scope-campaign" className="text-xs font-semibold text-foreground">
              Scope: Campaign
            </Label>
            <Select value={campaignId} onValueChange={(val) => { if (val) setCampaignId(val); }}>
              <SelectTrigger id="goal-scope-campaign" className="h-9.5 text-xs rounded-xl border-border/80 bg-background/80">
                <SelectValue placeholder="All Campaigns (Global)" />
              </SelectTrigger>
              <SelectContent className="bg-popover border-border/80 text-popover-foreground rounded-xl shadow-xl">
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
        <div className="flex items-center justify-between p-3 rounded-xl border border-border/80 bg-muted/40">
          <div className="space-y-0.5">
            <Label htmlFor="goal-active" className="text-xs font-medium text-foreground cursor-pointer">
              Active Tracking
            </Label>
            <p className="text-[11px] text-muted-foreground">
              When disabled, new visitor actions will not increment conversions for this goal.
            </p>
          </div>
          <input
            type="checkbox"
            id="goal-active"
            checked={isActive}
            onChange={(e) => setIsActive(e.target.checked)}
            className="h-4 w-4 rounded border-border bg-background text-primary focus:ring-primary"
          />
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
      <DialogContent className="sm:max-w-lg p-6 rounded-2xl border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl text-foreground max-h-[90vh] overflow-y-auto">
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
