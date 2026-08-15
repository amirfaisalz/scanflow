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
  goal: ConversionGoalData | any | null;
}

export function SnippetDialog({ open, onOpenChange, goal }: SnippetDialogProps) {
  const [copiedTab, setCopiedTab] = React.useState<string | null>(null);

  if (!goal) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg bg-zinc-950 border-zinc-800 text-zinc-100">
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
      <DialogContent className="sm:max-w-xl bg-zinc-950 border-zinc-800 text-zinc-100 max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold flex items-center gap-2">
            <Code className="h-5 w-5 text-sky-400" />
            <span>Conversion Tracking Snippet</span>
          </DialogTitle>
          <DialogDescription className="text-zinc-400 text-xs">
            Integrate conversion tracking for &quot;{goal.name}&quot; into your landing page or web application.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <Tabs defaultValue="javascript" className="w-full">
            <TabsList className="grid w-full grid-cols-3 bg-zinc-900/80 border border-zinc-800 text-zinc-400">
              <TabsTrigger
                value="javascript"
                className="text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 flex items-center gap-1.5"
              >
                <Terminal className="h-3.5 w-3.5" />
                <span>JavaScript</span>
              </TabsTrigger>
              <TabsTrigger
                value="html"
                className="text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 flex items-center gap-1.5"
              >
                <Tag className="h-3.5 w-3.5" />
                <span>HTML Tag</span>
              </TabsTrigger>
              <TabsTrigger
                value="script"
                className="text-xs data-[state=active]:bg-zinc-800 data-[state=active]:text-zinc-100 flex items-center gap-1.5"
              >
                <Globe className="h-3.5 w-3.5" />
                <span>Script Tag</span>
              </TabsTrigger>
            </TabsList>

            {/* JavaScript SDK Tab */}
            <TabsContent value="javascript" className="mt-3 space-y-2">
              <div className="relative rounded-xl border border-zinc-800 bg-zinc-900/90 p-4 font-mono text-xs text-zinc-200">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(jsSnippet, "javascript")}
                  aria-label="Copy JavaScript snippet"
                  className="absolute right-2.5 top-2.5 h-7 px-2 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 gap-1"
                >
                  {copiedTab === "javascript" ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
                <pre className="overflow-x-auto pt-2 text-[12px] leading-relaxed text-sky-300">
                  <code>{jsSnippet}</code>
                </pre>
              </div>
              <p className="text-[11px] text-zinc-500">
                Execute when a user completes a custom interaction (e.g. within an `onClick` or async submit handler).
              </p>
            </TabsContent>

            {/* HTML Attribute Tab */}
            <TabsContent value="html" className="mt-3 space-y-2">
              <div className="relative rounded-xl border border-zinc-800 bg-zinc-900/90 p-4 font-mono text-xs text-zinc-200">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(htmlSnippet, "html")}
                  aria-label="Copy HTML snippet"
                  className="absolute right-2.5 top-2.5 h-7 px-2 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 gap-1"
                >
                  {copiedTab === "html" ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
                <pre className="overflow-x-auto pt-2 text-[12px] leading-relaxed text-emerald-300">
                  <code>{htmlSnippet}</code>
                </pre>
              </div>
              <p className="text-[11px] text-zinc-500">
                Add data attributes directly to your HTML elements. The ScanFlow tracker will auto-detect click events.
              </p>
            </TabsContent>

            {/* Script Tag Tab */}
            <TabsContent value="script" className="mt-3 space-y-2">
              <div className="relative rounded-xl border border-zinc-800 bg-zinc-900/90 p-4 font-mono text-xs text-zinc-200">
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => copyToClipboard(headScript, "script")}
                  aria-label="Copy Script tag"
                  className="absolute right-2.5 top-2.5 h-7 px-2 text-xs text-zinc-400 hover:text-zinc-100 hover:bg-zinc-800 gap-1"
                >
                  {copiedTab === "script" ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </Button>
                <pre className="overflow-x-auto pt-2 text-[12px] leading-relaxed text-amber-300">
                  <code>{headScript}</code>
                </pre>
              </div>
              <p className="text-[11px] text-zinc-500">
                Paste this tracking library onto destination pages reachable from your QR codes.
              </p>
            </TabsContent>
          </Tabs>
        </div>
      </DialogContent>
    </Dialog>
  );
}
