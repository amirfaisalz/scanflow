import Link from "next/link";
import { Button } from "@/components/ui/button";
import { getCurrentUser } from "@/lib/auth-helpers";
import {
  QrCode,
  ArrowRight,
  GitBranch,
  ShieldCheck,
  Zap,
  Activity,
  Sparkles,
} from "lucide-react";


export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col">
      {/* Navigation Bar */}
      <header className="sticky top-0 z-50 w-full border-b border-border/60 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5 font-bold text-lg tracking-tight">
            <div className="size-9 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shadow-sm">
              <QrCode className="size-5" />
            </div>
            <span className="text-xl">ScanFlow</span>
          </Link>

          <div className="flex items-center gap-3">
            {user ? (
              <Link href="/dashboard">
                <Button size="sm" className="font-medium gap-1.5">
                  Go to Dashboard
                  <ArrowRight className="size-4" />
                </Button>
              </Link>
            ) : (
              <>
                <Link href="/login">
                  <Button variant="ghost" size="sm" className="font-medium">
                    Sign In
                  </Button>
                </Link>
                <Link href="/register">
                  <Button size="sm" className="font-medium gap-1.5 shadow-sm">
                    Get Started
                    <ArrowRight className="size-4" />
                  </Button>
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="container mx-auto max-w-7xl px-4 sm:px-6 py-20 md:py-28 flex flex-col items-center text-center space-y-8">
          {/* Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-primary/20 bg-primary/5 px-3.5 py-1 text-xs font-medium text-primary">
            <Sparkles className="size-3.5" />
            Next-Generation Programmable QR Platform
          </div>

          {/* Headline */}
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight max-w-4xl text-balance">
            Turn QR codes into programmable entry points.
          </h1>

          {/* Subheading */}
          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl text-balance leading-relaxed">
            ScanFlow combines dynamic smart routing, visitor session tracking, chronological scan journeys, and A/B conversion testing in one unified flow.
          </p>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
            <Link href={user ? "/dashboard" : "/login"}>
              <Button size="lg" className="h-12 px-6 text-base font-medium shadow-md">
                {user ? "Open Your Dashboard" : "Try Interactive Demo"}
                <ArrowRight className="size-4 ml-1.5" />
              </Button>
            </Link>
            {!user && (
              <Link href="/register">
                <Button variant="outline" size="lg" className="h-12 px-6 text-base font-medium">
                  Create Free Account
                </Button>
              </Link>
            )}
          </div>

          {/* Value Props Grid */}
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4 w-full pt-16 text-left">
            <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-xs space-y-3">
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Zap className="size-5" />
              </div>
              <h3 className="font-semibold text-lg">Dynamic Routing</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Route scans deterministically based on device, OS, location, language, and custom campaign conditions.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-xs space-y-3">
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <Activity className="size-5" />
              </div>
              <h3 className="font-semibold text-lg">Scan Journey</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Follow the full chronological timeline from initial QR scan to page view, click, and conversion.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-xs space-y-3">
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <GitBranch className="size-5" />
              </div>
              <h3 className="font-semibold text-lg">A/B Testing</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Split traffic between destination variants to automatically find the highest converting landing page.
              </p>
            </div>

            <div className="p-6 rounded-2xl border border-border/80 bg-card shadow-xs space-y-3">
              <div className="size-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center">
                <ShieldCheck className="size-5" />
              </div>
              <h3 className="font-semibold text-lg">Multi-Tenant Isolation</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Every account has strict database-level isolation powered by PostgreSQL and Better Auth.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border/60 py-8 bg-muted/20">
        <div className="container mx-auto max-w-7xl px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="size-5 rounded-md bg-primary text-primary-foreground flex items-center justify-center text-[10px] font-bold">
              SF
            </div>
            <span>ScanFlow Analytics &copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex items-center gap-4">
            <span>Powered by Next.js 16, PostgreSQL & Drizzle ORM</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
