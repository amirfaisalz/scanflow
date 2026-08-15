"use client";

import { useState } from "react";
import { Copy, Check, Code2 } from "lucide-react";

type SdkLanguage = "ts" | "python" | "curl" | "nextjs" | "go";

const SDK_SNIPPETS: Record<SdkLanguage, { title: string; filename: string; code: string }> = {
  ts: {
    title: "TypeScript / Node.js",
    filename: "create-qr.ts",
    code: `import { ScanFlow } from '@scanflow/sdk';

const scanflow = new ScanFlow({
  apiKey: process.env.SCANFLOW_API_KEY!
});

// 1. Create a dynamic QR with contextual routing rules
const qr = await scanflow.qr.create({
  name: 'Summer Product Launch',
  slug: 'summer-2026',
  fallbackUrl: 'https://mysite.com/products/summer',
  rules: [
    {
      priority: 1,
      condition: { os: 'ios' },
      destination: 'https://apps.apple.com/app/mysite'
    },
    {
      priority: 2,
      condition: { country: 'DE' },
      destination: 'https://mysite.de/sommer'
    }
  ]
});

console.log("Edge Redirect Shortlink:", qr.shortUrl);
console.log("Vector SVG Data:", qr.svg);`,
  },
  python: {
    title: "Python SDK",
    filename: "create_qr.py",
    code: `from scanflow import ScanFlow

client = ScanFlow(api_key="sf_live_abc123")

# Create dynamic QR with device & geo targeting
qr = client.qr.create(
    name="Global Retail Promo",
    slug="retail-q3",
    fallback_url="https://acme.com",
    rules=[
        {"os": "android", "destination": "https://play.google.com/store/apps/details?id=com.acme"},
        {"country": "GB", "destination": "https://acme.co.uk"}
    ],
    customization={"dark_color": "#FA5D29", "error_correction": "H"}
)

print(f"Active Edge URL: {qr.short_url}")`,
  },
  curl: {
    title: "cURL / REST API",
    filename: "request.sh",
    code: `curl -X POST https://api.scanflow.dev/v1/qr/create \\
  -H "Authorization: Bearer sf_live_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "name": "Billboards Campaign",
    "fallback_url": "https://mysite.com",
    "rules": [
      { "condition": "os == \\"iOS\\"", "destination": "https://apps.apple.com/app/id999" },
      { "condition": "os == \\"Android\\"", "destination": "https://play.google.com/store/apps/details?id=app" }
    ],
    "customization": {
      "dark_color": "#FA5D29",
      "format": "svg"
    }
  }'`,
  },
  nextjs: {
    title: "Next.js App Router",
    filename: "app/api/qr/route.ts",
    code: `import { NextResponse } from 'next/server';
import { ScanFlow } from '@scanflow/sdk';

const scanflow = new ScanFlow({ apiKey: process.env.SCANFLOW_API_KEY! });

export async function POST(req: Request) {
  const body = await req.json();
  
  const dynamicQr = await scanflow.qr.create({
    name: body.campaignName,
    fallbackUrl: body.targetUrl,
    rules: body.rules
  });

  return NextResponse.json({ success: true, qr: dynamicQr });
}`,
  },
  go: {
    title: "Go SDK",
    filename: "main.go",
    code: `package main

import (
	"context"
	"fmt"
	"github.com/scanflow/scanflow-go"
)

func main() {
	client := scanflow.NewClient("sf_live_abc123")
	
	qr, err := client.QR.Create(context.Background(), &scanflow.CreateQROptions{
		Name:        "Billboard San Francisco",
		FallbackURL: "https://acme.com",
		Rules: []scanflow.Rule{
			{OS: "ios", Destination: "https://apps.apple.com/app"},
		},
	})
	if err != nil {
		panic(err)
	}

	fmt.Println("Edge URL:", qr.ShortURL)
}`,
  },
};

export function SdkShowcase() {
  const [activeLang, setActiveLang] = useState<SdkLanguage>("ts");
  const [copied, setCopied] = useState(false);

  const current = SDK_SNIPPETS[activeLang];

  const handleCopy = () => {
    navigator.clipboard.writeText(current.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <section id="sdks" className="border-b border-zinc-200/80 dark:border-zinc-800/80 py-16 sm:py-24 bg-white dark:bg-zinc-950">
      <div className="container mx-auto max-w-7xl px-4 sm:px-6">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#FA5D29]/25 bg-[#FA5D29]/5 dark:bg-[#FA5D29]/10 px-3.5 py-1 text-xs font-semibold text-[#FA5D29] mb-4">
            <Code2 className="size-3.5" />
            <span>Developer First</span>
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight text-zinc-950 dark:text-white text-balance">
            Integrate in 1 Line of Code
          </h2>
          <p className="text-zinc-600 dark:text-zinc-400 mt-3 text-base sm:text-lg leading-relaxed">
            Native SDKs and REST APIs built for high throughput, type safety, and painless deployment.
          </p>
        </div>

        {/* Code Showcase Terminal */}
        <div className="mx-auto max-w-4xl rounded-2xl border border-zinc-800 bg-[#0D0E11] text-zinc-100 shadow-2xl overflow-hidden font-mono text-xs">
          {/* Header Bar */}
          <div className="border-b border-zinc-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 bg-[#121316]">
            {/* Language Selector */}
            <div className="flex items-center gap-1.5 overflow-x-auto">
              {(["ts", "python", "curl", "nextjs", "go"] as SdkLanguage[]).map((lang) => (
                <button
                  key={lang}
                  type="button"
                  onClick={() => setActiveLang(lang)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                    activeLang === lang
                      ? "bg-[#FA5D29] text-white font-semibold"
                      : "text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800"
                  }`}
                >
                  {SDK_SNIPPETS[lang].title}
                </button>
              ))}
            </div>

            {/* Copy Button */}
            <button
              type="button"
              onClick={handleCopy}
              className="flex items-center gap-1.5 rounded-md bg-zinc-800 hover:bg-zinc-700 px-3 py-1.5 text-xs text-zinc-300 hover:text-white transition-colors"
            >
              {copied ? (
                <>
                  <Check className="size-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="size-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>

          {/* Code Body */}
          <div className="p-5 sm:p-6 overflow-x-auto code-scroll leading-relaxed min-h-[300px]">
            <pre className="text-zinc-200 font-mono text-xs sm:text-[13px] whitespace-pre selection:bg-[#FA5D29]/30">
              {current.code}
            </pre>
          </div>
        </div>
      </div>
    </section>
  );
}
