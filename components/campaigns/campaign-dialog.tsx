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
      <DialogHeader>
        <DialogTitle className="text-xl font-bold flex items-center gap-2">
          <FolderGit2 className="h-5 w-5 text-sky-400" />
          <span>{isEditing ? "Edit Campaign" : "Create Campaign"}</span>
        </DialogTitle>
        <DialogDescription className="text-zinc-400 text-xs">
          Group dynamic QR codes into cohesive promotional campaigns to compare aggregate metrics.
        </DialogDescription>
      </DialogHeader>

      <form onSubmit={handleSubmit} className="space-y-4 py-2">
        {error && (
          <div className="rounded-md bg-red-500/10 border border-red-500/30 p-2.5 text-xs text-red-400">
            {error}
          </div>
        )}

        {/* Campaign Name */}
        <div className="space-y-1.5">
          <Label htmlFor="campaign-name" className="text-xs font-semibold text-zinc-300">
            Campaign Name
          </Label>
          <Input
            id="campaign-name"
            placeholder="e.g. Summer Restaurant Promo 2026"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="bg-zinc-900/60 border-zinc-800 text-zinc-200 text-sm"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5">
          <Label htmlFor="campaign-description" className="text-xs font-semibold text-zinc-300">
            Description (Optional)
          </Label>
          <Input
            id="campaign-description"
            placeholder="e.g. Table tents, window stickers, and flyer QR codes"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="bg-zinc-900/60 border-zinc-800 text-zinc-200 text-sm"
          />
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <Label htmlFor="campaign-status" className="text-xs font-semibold text-zinc-300">
            Campaign Status
          </Label>
          <Select value={status} onValueChange={(val) => { if (val) setStatus(val); }}>
            <SelectTrigger id="campaign-status" className="bg-zinc-900/60 border-zinc-800 text-zinc-200 text-xs">
              <SelectValue />
            </SelectTrigger>
            <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
              <SelectItem value="active">Active (Tracking Scans & Events)</SelectItem>
              <SelectItem value="paused">Paused (Temporarily Paused)</SelectItem>
              <SelectItem value="archived">Archived (Campaign Concluded)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <DialogFooter className="pt-2">
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
      <DialogContent className="sm:max-w-md bg-zinc-950 border-zinc-800 text-zinc-100">
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
