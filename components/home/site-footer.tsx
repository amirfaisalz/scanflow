import Link from "next/link";
import { ExternalLink, QrCode } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50/60 dark:bg-zinc-950/60 py-8 sm:py-10 text-zinc-600 dark:text-zinc-400">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-6">
          {/* Brand & Status */}
          <div className="flex flex-col sm:flex-row items-center gap-3 sm:gap-6 text-center sm:text-left">
            <Link href="/" className="flex items-center gap-2.5 font-bold">
              <div className="size-7 rounded-lg bg-linear-to-br from-fire to-fire-hover text-white flex items-center justify-center shadow-xs shadow-fire/20">
                <QrCode className="size-4 text-white" />
              </div>
              <span className="text-base font-extrabold tracking-tight text-zinc-900 dark:text-white font-sans">
                ScanFlow
              </span>
            </Link>

            <div className="hidden sm:block h-4 w-px bg-zinc-200 dark:bg-zinc-800" />

            <div className="flex items-center gap-2">
              <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-600 dark:text-emerald-400 font-medium font-mono text-xs">
                All Edge Nodes Operational
              </span>
            </div>
          </div>

          {/* Direct App Links & Copyright */}
          <div className="flex flex-col sm:flex-row items-center gap-4 sm:gap-6 text-xs text-zinc-500">
            <div className="flex items-center gap-5 font-medium text-zinc-600 dark:text-zinc-400">
              <Link
                href="/dashboard"
                className="hover:text-fire transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/login"
                className="hover:text-fire transition-colors"
              >
                Sign In
              </Link>
              <a
                href="https://github.com/amirfaisalz/scanflow"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1 hover:text-fire transition-colors"
              >
                <span>GitHub</span>
                <ExternalLink className="size-3 text-zinc-400" />
              </a>
            </div>

            <div className="hidden sm:block h-3.5 w-px bg-zinc-200 dark:bg-zinc-800" />

            <span>&copy; {new Date().getFullYear()} ScanFlow. All rights reserved.</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
