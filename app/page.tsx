import { ABTestingShowcase } from "@/components/home/ab-testing-showcase";
import { CtaBanner } from "@/components/home/cta-banner";
import { FAQSection } from "@/components/home/faq-section";
import { FeatureBento } from "@/components/home/feature-bento";
import { HeroPlayground } from "@/components/home/hero-playground";
import { JourneyVisualizer } from "@/components/home/journey-visualizer";
import { MetricsBanner } from "@/components/home/metrics-banner";
import { RoutingVisualizer } from "@/components/home/routing-visualizer";
import { SiteFooter } from "@/components/home/site-footer";
import { SiteNav } from "@/components/home/site-nav";
import { getCurrentUser } from "@/lib/auth-helpers";

export default async function Home() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col antialiased selection:bg-fire/20 selection:text-fire">
      {/* Top Firecrawl-style announcement bar */}
      {/*<AnnouncementBar />*/}

      {/* Sticky Header with Flame/QR branding */}
      <SiteNav user={user} />

      <main className="flex-1">
        {/* Signature Firecrawl-style Hero Section with Live Interactive QR Sandbox */}
        <HeroPlayground user={user} />

        {/* Key Metrics & Edge Performance Banner */}
        <MetricsBanner />

        {/* Core Platform Capabilities Grid */}
        <FeatureBento />

        {/* Dynamic Smart Routing Visualizer */}
        <RoutingVisualizer />

        {/* End-to-End Scan-to-Conversion Journey Timeline */}
        <JourneyVisualizer />

        {/* A/B Testing & Split Traffic Showcase */}
        <ABTestingShowcase />

        {/* Developer FAQ Accordion */}
        <FAQSection />

        {/* Fiery High-Conversion CTA Banner */}
        <CtaBanner />
      </main>

      {/* Developer-First Footer */}
      <SiteFooter />
    </div>
  );
}
