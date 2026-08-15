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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Code, Copy, Check, Terminal, Globe, Tag } from "lucide-react";
import type { ConversionGoalData } from "./conversion-card";

export interface SnippetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  goal: ConversionGoalData | null;
}

export function SnippetDialog({ open, onOpenChange, goal }: SnippetDialogProps) {
  const [copiedTab, setCopiedTab] = React.useState<string | null>(null);

  if (!goal) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg p-6 rounded-2xl border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl text-foreground">
          <DialogHeader>
            <DialogTitle className="text-lg font-bold">Conversion Tracking Snippet</DialogTitle>
          </DialogHeader>
        </DialogContent>
      </Dialog>
    );
  }

  const monetaryVal =
    goal.monetaryValue !== undefined && goal.monetaryValue !== null
      ? (goal.monetaryValue / 100).toFixed(2)
      : "0.00";
  const currency = goal.currency || "USD";

  const jsSnippet = `// Trigger conversion programmatically via ScanFlow SDK
ScanFlow.convert("${goal.name}", {
  value: ${monetaryVal},
  currency: "${currency}"
});`;

  const htmlSnippet = `<!-- Add data-scanflow-convert to any interactive button or link -->
<button 
  data-scanflow-convert="${goal.name}"
  data-scanflow-value="${monetaryVal}"
  data-scanflow-currency="${currency}"
  class="btn-primary"
>
  Complete Action
</button>`;

  const headScript = `<!-- Include ScanFlow Tracking Library in <head> or before </body> -->
<script
  src="https://cdn.scanflow.io/tracker.js"
  data-scanflow-id="${goal.userId || "WORKSPACE_ID"}"
  async
></script>`;

  const copyToClipboard = async (text: string, tabKey: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text);
        setCopiedTab(tabKey);
        setTimeout(() => {
          setCopiedTab(null);
        }, 2000);
      }
    } catch (err) {
      console.error("Failed to copy snippet:", err);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-xl p-6 rounded-2xl border-border/80 bg-background/95 backdrop-blur-xl shadow-2xl text-foreground max-h-[90vh] overflow-y-auto">
        <DialogHeader className="pb-3 border-b border-border/60">
          <div className="flex items-center gap-3">
            <div className="size-10 rounded-xl bg-sky-500/10 border border-sky-500/20 text-sky-500 flex items-center justify-center shadow-2xs">
              <Code className="size-5" />
            </div>
            <div>
              <DialogTitle className="text-lg font-bold tracking-tight text-foreground">
                Conversion Tracking Snippet
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Integrate conversion tracking for &quot;{goal.name}&quot; into your landing page or web application.
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 pt-3">
          <Tabs defaultValue="javascript" className="w-full">
            <TabsList className="grid w-full grid-cols-3 h-10 p-1 bg-muted/60 rounded-xl border border-border/60 mb-2">
              <TabsTrigger
                value="javascript"
                className="rounded-lg text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all gap-1.5 py-1.5"
              >
                <Terminal className="size-3.5" />
                <span>JavaScript</span>
              </TabsTrigger>
              <TabsTrigger
                value="html"
                className="rounded-lg text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all gap-1.5 py-1.5"
              >
                <Tag className="size-3.5" />
                <span>HTML Tag</span>
              </TabsTrigger>
              <TabsTrigger
                value="script"
                className="rounded-lg text-xs font-semibold data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow-xs transition-all gap-1.5 py-1.5"
              >
                <Globe className="size-3.5" />
                <span>Script Tag</span>
              </TabsTrigger>
            </TabsList>

            {/* JavaScript SDK Tab */}
            <TabsContent value="javascript" className="mt-3 space-y-2">
              <div className="relative rounded-xl border border-border/80 bg-muted/50 dark:bg-zinc-900/90 p-4 font-mono text-xs text-foreground">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(jsSnippet, "javascript")}
                  aria-label="Copy JavaScript snippet"
                  className="absolute right-2.5 top-2.5 h-7 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted gap-1"
                >
                  {copiedTab === "javascript" ? (
                    <>
                      <Check className="size-3.5 text-emerald-500" />
                      <span className="text-emerald-500 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
                <pre className="overflow-x-auto pt-2 text-[12px] leading-relaxed text-sky-600 dark:text-sky-300">
                  <code>{jsSnippet}</code>
                </pre>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Execute when a user completes a custom interaction (e.g. within an `onClick` or async submit handler).
              </p>
            </TabsContent>

            {/* HTML Attribute Tab */}
            <TabsContent value="html" className="mt-3 space-y-2">
              <div className="relative rounded-xl border border-border/80 bg-muted/50 dark:bg-zinc-900/90 p-4 font-mono text-xs text-foreground">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(htmlSnippet, "html")}
                  aria-label="Copy HTML snippet"
                  className="absolute right-2.5 top-2.5 h-7 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted gap-1"
                >
                  {copiedTab === "html" ? (
                    <>
                      <Check className="size-3.5 text-emerald-500" />
                      <span className="text-emerald-500 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
                <pre className="overflow-x-auto pt-2 text-[12px] leading-relaxed text-emerald-600 dark:text-emerald-300">
                  <code>{htmlSnippet}</code>
                </pre>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Add data attributes directly to your HTML elements. The ScanFlow tracker will auto-detect click events.
              </p>
            </TabsContent>

            {/* Script Tag Tab */}
            <TabsContent value="script" className="mt-3 space-y-2">
              <div className="relative rounded-xl border border-border/80 bg-muted/50 dark:bg-zinc-900/90 p-4 font-mono text-xs text-foreground">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(headScript, "script")}
                  aria-label="Copy Script tag"
                  className="absolute right-2.5 top-2.5 h-7 px-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted gap-1"
                >
                  {copiedTab === "script" ? (
                    <>
                      <Check className="size-3.5 text-emerald-500" />
                      <span className="text-emerald-500 font-semibold">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="size-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
                <pre className="overflow-x-auto pt-2 text-[12px] leading-relaxed text-amber-600 dark:text-amber-300">
                  <code>{headScript}</code>
                </pre>
              </div>
              <p className="text-[11px] text-muted-foreground">
                Paste this tracking library onto destination pages reachable from your QR codes.
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
