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
import { normalizeUrl, isValidUrl } from "@/lib/qr";
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

    const normUrl = normalizeUrl(destinationUrl);
    if (!normUrl || !isValidUrl(normUrl)) {
      setFormError("Please enter a valid destination URL (e.g. google.com or https://...)");
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
          destinationUrl: normUrl,
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
      <DialogContent className="sm:max-w-2xl p-6 rounded-2xl border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl text-foreground max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-500 flex items-center justify-center shadow-2xs">
              <GitFork className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
                Dynamic Routing Rules
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Configure condition-based routing rules for <span className="font-semibold text-foreground">{qrCode.name}</span>. Rules are evaluated in priority order.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        {/* Fallback Destination Banner */}
        <div className="rounded-xl border border-border/80 bg-muted/40 p-3 text-xs flex items-center justify-between mt-3">
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="border-border/80 bg-background text-foreground font-mono">
              Fallback / Default
            </Badge>
            <span className="text-muted-foreground truncate max-w-sm font-mono">{qrCode.destinationUrl}</span>
          </div>
          <span className="text-[11px] text-muted-foreground">When no rules match</span>
        </div>

        {/* Existing Rules List */}
        <div className="space-y-2 mt-4">
          <div className="flex items-center justify-between">
            <Label className="text-xs font-semibold text-foreground uppercase tracking-wider">
              Configured Rules ({rules.length})
            </Label>
          </div>

          {loading ? (
            <div className="py-6 text-center text-xs text-muted-foreground">Loading rules...</div>
          ) : rules.length === 0 ? (
            <div className="rounded-xl border border-dashed border-border/80 p-6 text-center text-xs text-muted-foreground">
              No conditional rules configured. All scans will be routed to the default destination URL.
            </div>
          ) : (
            <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
              {rules.map((rule, idx) => (
                <div
                  key={rule.id}
                  className="rounded-xl border border-border/80 bg-card/60 p-3 flex items-center justify-between gap-3 text-xs transition-colors hover:border-primary/40"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <Badge variant="secondary" className="font-mono text-[10px] px-1.5 py-0.5">
                      #{rule.priority ?? idx + 1}
                    </Badge>

                    <div className="flex items-center gap-1.5 bg-muted/60 px-2 py-1 rounded-lg text-foreground font-medium">
                      {getConditionIcon(rule.conditionType)}
                      <span className="uppercase text-[11px]">{rule.conditionType}:</span>
                      <span className="font-mono text-primary">{rule.conditionValue}</span>
                    </div>

                    <div className="flex items-center gap-1 min-w-0 text-muted-foreground">
                      <span>→</span>
                      <span className="truncate font-mono text-foreground underline">{rule.destinationUrl}</span>
                    </div>
                  </div>

                  <Button
                    type="button"
                    size="sm"
                    variant="ghost"
                    onClick={() => handleDeleteRule(rule.id)}
                    className="size-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 shrink-0 rounded-lg"
                    title="Delete rule"
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Add New Rule Form */}
        <form onSubmit={handleAddRule} className="rounded-xl border border-border/80 bg-muted/30 p-4 space-y-4 mt-4">
          <Label className="text-xs font-semibold text-foreground uppercase tracking-wider block">
            Add Dynamic Rule
          </Label>

          {formError && (
            <div className="rounded-xl bg-destructive/10 border border-destructive/20 p-3 text-xs text-destructive">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {/* Condition Type */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Condition Type</Label>
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
                <SelectTrigger className="bg-background/80 border-border/80 text-foreground text-xs h-9 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-popover border-border/80 text-popover-foreground rounded-xl shadow-xl">
                  <SelectItem value="os">Operating System (OS)</SelectItem>
                  <SelectItem value="device">Device Type</SelectItem>
                  <SelectItem value="country">Country Code</SelectItem>
                  <SelectItem value="language">Language</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Condition Value */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Match Value</Label>
              <Input
                placeholder="e.g. ios, android, US"
                value={conditionValue}
                onChange={(e) => setConditionValue(e.target.value)}
                className="bg-background/80 border-border/80 text-foreground text-xs h-9 rounded-xl"
              />
            </div>

            {/* Priority */}
            <div className="space-y-1.5">
              <Label className="text-xs text-muted-foreground">Priority (1 = Highest)</Label>
              <Input
                type="number"
                min="1"
                max="99"
                value={priority}
                onChange={(e) => setPriority(e.target.value)}
                className="bg-background/80 border-border/80 text-foreground text-xs h-9 rounded-xl"
              />
            </div>
          </div>

          {/* Destination URL */}
          <div className="space-y-1.5">
            <Label className="text-xs text-muted-foreground">Custom Target Destination URL</Label>
            <Input
              placeholder="https://apps.apple.com/app/your-app"
              value={destinationUrl}
              onChange={(e) => setDestinationUrl(e.target.value)}
              className="bg-background/80 border-border/80 text-foreground text-xs h-9 rounded-xl"
            />
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              size="sm"
              disabled={addingRule}
              className="h-8 px-4 text-xs font-semibold rounded-xl shadow-xs bg-primary hover:bg-primary/90 text-primary-foreground gap-1.5"
            >
              <Plus className="size-3.5" />
              <span>{addingRule ? "Adding..." : "Add Rule"}</span>
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
