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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  GitFork,
  Plus,
  Trash2,
  Smartphone,
  Globe,
  Languages,
  Clock,
} from "lucide-react";
import type { QRCode, RoutingRule } from "@/lib/db/schema";

interface RoutingRulesDialogProps {
  qrCode: QRCode | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RoutingRulesDialog({
  qrCode,
  open,
  onOpenChange,
}: RoutingRulesDialogProps) {
  const [rules, setRules] = React.useState<RoutingRule[]>([]);
  const [loading, setLoading] = React.useState(false);
  const [addingRule, setAddingRule] = React.useState(false);

  // Form state
  const [conditionType, setConditionType] = React.useState("os");
  const [conditionValue, setConditionValue] = React.useState("ios");
  const [destinationUrl, setDestinationUrl] = React.useState("");
  const [priority, setPriority] = React.useState("1");
  const [formError, setFormError] = React.useState("");

  const qrCodeId = qrCode?.id;

  React.useEffect(() => {
    if (!open || !qrCodeId) return;
    let isMounted = true;
    async function load() {
      try {
        setLoading(true);
        const res = await fetch(`/api/qr-codes/${qrCodeId}/rules`);
        if (res.ok && isMounted) {
          const data = await res.json();
          setRules(data.rules || []);
        }
      } catch (err) {
        console.error("Failed to load routing rules:", err);
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    load();
    return () => {
      isMounted = false;
    };
  }, [open, qrCodeId]);

  const handleAddRule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!qrCode?.id) return;
    setFormError("");

    if (!conditionValue.trim()) {
      setFormError("Condition value is required");
      return;
    }

    try {
      new URL(destinationUrl);
    } catch {
      setFormError("Please enter a valid absolute destination URL (e.g. https://...)");
      return;
    }

    try {
      setAddingRule(true);
      const res = await fetch(`/api/qr-codes/${qrCode.id}/rules`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          conditionType,
          conditionValue: conditionValue.trim(),
          destinationUrl: destinationUrl.trim(),
          priority: Number(priority) || 1,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to add routing rule");
      }

      const data = await res.json();
      setRules((prev) => [...prev, data.rule].sort((a, b) => a.priority - b.priority));
      setDestinationUrl("");
      setFormError("");
    } catch (err: unknown) {
      setFormError(err instanceof Error ? err.message : "Failed to add rule");
    } finally {
      setAddingRule(false);
    }
  };

  const handleDeleteRule = async (ruleId: string) => {
    if (!qrCode?.id) return;
    try {
      const res = await fetch(`/api/qr-codes/${qrCode.id}/rules/${ruleId}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setRules((prev) => prev.filter((r) => r.id !== ruleId));
      }
    } catch (err) {
      console.error("Failed to delete rule:", err);
    }
  };

  const getConditionIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case "device":
      case "os":
        return <Smartphone className="h-3.5 w-3.5 text-sky-400" />;
      case "country":
        return <Globe className="h-3.5 w-3.5 text-emerald-400" />;
      case "language":
        return <Languages className="h-3.5 w-3.5 text-purple-400" />;
      case "time_window":
        return <Clock className="h-3.5 w-3.5 text-amber-400" />;
      default:
        return <GitFork className="h-3.5 w-3.5 text-zinc-400" />;
    }
  };

  if (!qrCode) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl bg-zinc-950 border-zinc-800 text-zinc-100 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <GitFork className="h-5 w-5 text-sky-400" />
            <span>Dynamic Routing Rules</span>
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-xs">
            Configure condition-based routing rules for <span className="font-semibold text-zinc-200">{qrCode.name}</span>. Rules are evaluated in priority order.
          </DialogDescription>
        </DialogHeader>

        {/* Fallback Destination Banner */}
        <div className="rounded-lg border border-zinc-800 bg-zinc-900/60 p-3 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-zinc-700 bg-zinc-800 text-zinc-300 font-mono">
              Fallback / Default
            </Badge>
            <span className="text-zinc-400 truncate max-w-sm font-mono">{qrCode.destinationUrl}</span>
          </div>
          <span className="text-[11px] text-zinc-500">When no rules match</span>
        </div>

        {/* Existing Rules List */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider">
              Configured Rules ({rules.length})
            </Label>
          </div>

          {loading ? (
            <div className="py-6 text-center text-xs text-zinc-500">Loading rules...</div>
          ) : rules.length === 0 ? (
            <div className="rounded-lg border border-dashed border-zinc-800 p-6 text-center text-xs text-zinc-500">
              No conditional rules configured. All scans will be routed to the default destination URL.
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {rules.map((rule, idx) => (
                <div
                  key={rule.id}
                  className="rounded-lg border border-zinc-800 bg-zinc-900/40 p-3 flex items-center justify-between gap-3 text-xs transition-colors hover:border-zinc-700"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Badge variant="secondary" className="font-mono text-[10px] bg-zinc-800 text-zinc-300 px-1.5 py-0.5">
                      #{rule.priority ?? idx + 1}
                    </Badge>

                    <div className="flex items-center gap-1.5 bg-zinc-800/80 px-2 py-1 rounded text-zinc-200 font-medium">
                      {getConditionIcon(rule.conditionType)}
                      <span className="uppercase text-[11px]">{rule.conditionType}:</span>
                      <span className="font-mono text-sky-300">{rule.conditionValue}</span>
                    </div>

                    <div className="flex items-center gap-1 min-w-0 text-zinc-400">
                      <span>→</span>
                      <span className="truncate font-mono text-zinc-200 underline">{rule.destinationUrl}</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteRule(rule.id)}
                    className="h-7 w-7 p-0 text-zinc-500 hover:text-red-400 hover:bg-zinc-800 shrink-0"
                    title="Delete rule"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add New Rule Form */}
        <form onSubmit={handleAddRule} className="rounded-xl border border-zinc-800 bg-zinc-900/30 p-4 space-y-4">
          <Label className="text-xs font-semibold text-zinc-300 uppercase tracking-wider block">
            Add Dynamic Rule
          </Label>

          {formError && (
            <div className="rounded-md bg-red-500/10 border border-red-500/30 p-2 text-xs text-red-400">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Condition Type */}
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Condition Type</Label>
              <Select
                value={conditionType}
                onValueChange={(val) => {
                  if (!val) return;
                  setConditionType(val);
                  if (val === "os") setConditionValue("ios");
                  else if (val === "device") setConditionValue("mobile");
                  else if (val === "country") setConditionValue("ID");
                  else if (val === "language") setConditionValue("id");
                }}
              >
                <SelectTrigger className="bg-zinc-950 border-zinc-800 text-zinc-200 text-xs h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-950 border-zinc-800 text-zinc-200">
                  <SelectItem value="os">Operating System (OS)</SelectItem>
                  <SelectItem value="device">Device Type</SelectItem>
                  <SelectItem value="country">Country Code</SelectItem>
                  <SelectItem value="language">Language</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Condition Value */}
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Match Value</Label>
              <Input
                placeholder="e.g. ios, android, US"
                value={conditionValue}
                onChange={(e) => setConditionValue(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-zinc-200 text-xs h-9"
              />
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <Label className="text-xs text-zinc-400">Priority (1 = Highest)</Label>
              <Input
                type="number"
                min="1"
                max="99"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="bg-zinc-950 border-zinc-800 text-zinc-200 text-xs h-9"
              />
            </div>
          </div>

          {/* Destination URL */}
          <div className="space-y-1.5">
            <Label className="text-xs text-zinc-400">Custom Target Destination URL</Label>
            <Input
              placeholder="https://apps.apple.com/app/your-app"
              value={destinationUrl}
              onChange={(e) => setDestinationUrl(e.target.value)}
              className="bg-zinc-950 border-zinc-800 text-zinc-200 text-xs h-9"
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              disabled={addingRule}
              className="bg-sky-600 hover:bg-sky-500 text-white text-xs gap-1.5 h-8"
            >
              <Plus className="h-3.5 w-3.5" />
              <span>{addingRule ? "Adding..." : "Add Rule"}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
