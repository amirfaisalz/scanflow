import Link from "next/link";
import { QrCode } from "lucide-react";

const footerColumns = [
  {
    title: "Product",
    links: [
      { name: "Dynamic QR Studio", href: "#playground" },
      { name: "Deterministic Smart Routing", href: "#routing" },
      { name: "Visitor Journey Stitching", href: "#journeys" },
      { name: "A/B Traffic Splitter", href: "#ab-testing" },
      { name: "Real-Time Telemetry", href: "#features" },
    ],
  },
  {
    title: "Developers",
    links: [
      { name: "TypeScript SDK", href: "#sdks" },
      { name: "Python Client", href: "#sdks" },
      { name: "REST API Reference", href: "#sdks" },
      { name: "Next.js Integration", href: "#sdks" },
      { name: "Self-Hosting Guide", href: "#" },
    ],
  },
  {
    title: "Resources",
    links: [
      { name: "Documentation", href: "#" },
      { name: "GitHub Repository", href: "https://github.com" },
      { name: "Changelog v2.4", href: "#" },
      { name: "System Architecture", href: "#" },
      { name: "Community Discord", href: "#" },
    ],
  },
  {
    title: "Company",
    links: [
      { name: "Pricing", href: "#pricing" },
      { name: "Enterprise Custom", href: "#pricing" },
      { name: "Security & SOC2", href: "#" },
      { name: "Privacy Policy", href: "#" },
      { name: "Terms of Service", href: "#" },
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="border-t border-zinc-200/80 dark:border-zinc-800/80 bg-zinc-50 dark:bg-zinc-950 py-12 sm:py-16 text-zinc-600 dark:text-zinc-400">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-8 sm:gap-10">
          {/* Brand Column */}
          <div className="col-span-2 sm:col-span-3 lg:col-span-1 space-y-4">
            <Link href="/" className="flex items-center gap-2.5 font-bold">
              <div className="size-8 rounded-xl bg-linear-to-br from-fire to-fire-hover text-white flex items-center justify-center shadow-md shadow-fire/20">
                <QrCode className="size-4 text-white" />
              </div>
              <span className="text-lg font-extrabold tracking-tight text-zinc-900 dark:text-white font-sans">
                ScanFlow
              </span>
            </Link>
            <p className="text-xs sm:text-sm leading-relaxed max-w-xs text-zinc-500 dark:text-zinc-400">
              Programmable dynamic QR infrastructure &amp; edge context routing for high-growth teams.
            </p>
            <div className="flex items-center gap-2 text-xs">
              <span className="flex size-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-emerald-600 dark:text-emerald-400 font-semibold font-mono">
                All Edge Nodes Operational
              </span>
            </div>
          </div>

          {/* Link Columns */}
          {footerColumns.map((column) => (
            <div key={column.title}>
              <h4 className="text-xs sm:text-sm font-bold uppercase tracking-wider text-zinc-900 dark:text-zinc-200 mb-4 font-mono">
                {column.title}
              </h4>
              <ul className="space-y-2.5">
                {column.links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.href}
                      className="text-xs sm:text-sm text-zinc-600 dark:text-zinc-400 hover:text-fire dark:hover:text-fire transition-colors"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-6 border-t border-zinc-200 dark:border-zinc-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-zinc-500">
          <span>&copy; {new Date().getFullYear()} ScanFlow Technologies Inc. All rights reserved.</span>
          <span className="font-mono">
            Powered by Next.js 16 • PostgreSQL • Drizzle ORM • Edge Runtime
          </span>
        </div>
      </div>
    </footer>
  );
}
