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
import { FolderGit2, Sparkles } from "lucide-react";
import type { Campaign } from "@/lib/db/schema";
import type { CampaignData } from "./campaign-card";

interface CampaignDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  campaign?: Campaign | CampaignData | null;
  onSave?: (data: { name: string; description?: string; status: string }) => Promise<void> | void;
}

function CampaignFormContent({
  campaign,
  onSave,
  onClose,
}: {
  campaign?: Campaign | CampaignData | null;
  onSave?: (data: { name: string; description?: string; status: string }) => Promise<void> | void;
  onClose: () => void;
}) {
  const [name, setName] = React.useState(campaign?.name || "");
  const [description, setDescription] = React.useState(campaign?.description || "");
  const [status, setStatus] = React.useState(campaign?.status || "active");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState("");

  const isEditing = Boolean(campaign);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Campaign name is required");
      return;
    }

    try {
      setLoading(true);
      setError("");

      if (onSave) {
        await onSave({
          name: name.trim(),
          description: description.trim() || undefined,
          status,
        });
      } else {
        const url = isEditing
          ? `/api/campaigns/${campaign?.id}`
          : "/api/campaigns";
        const method = isEditing ? "PATCH" : "POST";

        const res = await fetch(url, {
          method,
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: name.trim(),
            description: description.trim() || undefined,
            status,
          }),
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Failed to save campaign");
        }
      }

      onClose();
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to save campaign");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <DialogHeader className="pb-3 border-b border-border/60">
        <div className="flex items-center gap-3">
          <div className="size-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-500 flex items-center justify-center shadow-2xs">
            <FolderGit2 className="size-5" />
          </div>
          <div>
            <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
              {isEditing ? "Edit Campaign" : "Create Campaign"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-0.5">
              Group dynamic QR codes into cohesive promotional campaigns to compare aggregate metrics.
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

        {/* Campaign Name */}
        <div className="space-y-1.5">
          <Label htmlFor="campaign-name" className="text-xs font-semibold text-foreground">
            Campaign Name
          </Label>
          <Input
            id="campaign-name"
            placeholder="e.g. Summer Restaurant Promo 2026"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-9.5 text-xs rounded-xl border-border/80 bg-background/80 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 shadow-2xs"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="campaign-description" className="text-xs font-semibold text-foreground">
            Description (Optional)
          </Label>
          <Input
            id="campaign-description"
            placeholder="e.g. Table tents, window stickers, and flyer QR codes"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="h-9.5 text-xs rounded-xl border-border/80 bg-background/80 focus-visible:border-primary focus-visible:ring-2 focus-visible:ring-primary/20 shadow-2xs"
          />
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <Label htmlFor="campaign-status" className="text-xs font-semibold text-foreground">
            Campaign Status
          </Label>
          <Select value={status} onValueChange={(val) => { if (val) setStatus(val); }}>
            <SelectTrigger id="campaign-status" className="h-9.5 text-xs rounded-xl border-border/80 bg-background/80">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-popover border-border/80 text-popover-foreground rounded-xl shadow-xl">
              <SelectItem value="active">Active (Tracking Scans & Events)</SelectItem>
              <SelectItem value="paused">Paused (Temporarily Paused)</SelectItem>
              <SelectItem value="archived">Archived (Campaign Concluded)</SelectItem>
            </SelectContent>
          </Select>
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
            <span>{loading ? "Saving..." : isEditing ? "Save Changes" : "Create Campaign"}</span>
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

export function CampaignDialog({
  open,
  onOpenChange,
  campaign,
  onSave,
}: CampaignDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-6 rounded-2xl border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl text-foreground">
        {open && (
          <CampaignFormContent
            key={campaign?.id || "new"}
            campaign={campaign}
            onSave={onSave}
            onClose={() => onOpenChange(false)}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
