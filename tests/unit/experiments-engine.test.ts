import { describe, it, expect } from "vitest";
import {
  selectExperimentVariant,
  calculateStatisticalSignificance,
  computeExperimentMetrics,
  type ExperimentStats,
} from "@/lib/experiments/engine";

describe("Experiments Engine", () => {
  describe("selectExperimentVariant", () => {
    const variants = [
      {
        id: "var-control",
        experimentId: "exp-1",
        name: "Control",
        destinationUrl: "https://scanflow.app/original",
        trafficWeight: 50,
        isControl: true,
      },
      {
        id: "var-b",
        experimentId: "exp-1",
        name: "Variant B",
        destinationUrl: "https://scanflow.app/variant-b",
        trafficWeight: 50,
        isControl: false,
      },
    ];

    it("should return sticky variant when valid cookieVariantId is provided", () => {
      const result = selectExperimentVariant(variants, "var-b");
      expect(result.selectedVariant.id).toBe("var-b");
      expect(result.isSticky).toBe(true);
    });

    it("should return control variant when control cookie is provided", () => {
      const result = selectExperimentVariant(variants, "var-control");
      expect(result.selectedVariant.id).toBe("var-control");
      expect(result.isSticky).toBe(true);
    });

    it("should ignore unknown cookieVariantId and fallback to dynamic selection with isSticky=false", () => {
      const result = selectExperimentVariant(variants, "var-deleted", "visitor-seed-123");
      expect(["var-control", "var-b"]).toContain(result.selectedVariant.id);
      expect(result.isSticky).toBe(false);
    });

    it("should assign deterministically with visitorSeed", () => {
      const result1 = selectExperimentVariant(variants, null, "user-session-abc");
      const result2 = selectExperimentVariant(variants, null, "user-session-abc");
      expect(result1.selectedVariant.id).toBe(result2.selectedVariant.id);
      expect(result1.isSticky).toBe(false);
    });

    it("should distribute traffic roughly evenly for 50/50 weights across diverse seeds", () => {
      let controlCount = 0;
      let variantBCount = 0;
      const total = 500;

      for (let i = 0; i < total; i++) {
        const result = selectExperimentVariant(variants, null, `visitor-seed-${i}`);
        if (result.selectedVariant.id === "var-control") {
          controlCount++;
        } else {
          variantBCount++;
        }
      }

      expect(controlCount + variantBCount).toBe(total);
      // For 50/50 split across 500 hashes, each should be between 36% and 64% (180 to 320)
      expect(controlCount).toBeGreaterThan(180);
      expect(variantBCount).toBeGreaterThan(180);
    });

    it("should respect unequal traffic weights (80/20)", () => {
      const weightedVariants = [
        { id: "var-80", trafficWeight: 80, destinationUrl: "https://a.com" },
        { id: "var-20", trafficWeight: 20, destinationUrl: "https://b.com" },
      ];

      let count80 = 0;
      let count20 = 0;
      const total = 500;

      for (let i = 0; i < total; i++) {
        const result = selectExperimentVariant(weightedVariants, null, `seed-hash-key-${i}`);
        if (result.selectedVariant.id === "var-80") {
          count80++;
        } else {
          count20++;
        }
      }

      expect(count80 + count20).toBe(total);
      // 80% of 500 = 400. Expect > 320
      expect(count80).toBeGreaterThan(320);
      expect(count20).toBeLessThan(180);
    });

    it("should handle weights that do not sum to 100 (e.g. 10 / 30)", () => {
      const weightedVariants = [
        { id: "var-10", trafficWeight: 10, destinationUrl: "https://a.com" },
        { id: "var-30", trafficWeight: 30, destinationUrl: "https://b.com" },
      ];

      let count10 = 0;
      let count30 = 0;
      const total = 400;

      for (let i = 0; i < total; i++) {
        const result = selectExperimentVariant(weightedVariants, null, `non-sum-seed-${i}`);
        if (result.selectedVariant.id === "var-10") {
          count10++;
        } else {
          count30++;
        }
      }

      expect(count10 + count30).toBe(total);
      // 25% vs 75% -> 100 vs 300
      expect(count30).toBeGreaterThan(count10);
    });

    it("should handle random selection when visitorSeed is null or undefined", () => {
      const result = selectExperimentVariant(variants, null, undefined);
      expect(["var-control", "var-b"]).toContain(result.selectedVariant.id);
      expect(result.isSticky).toBe(false);
    });

    it("should handle all zero weights gracefully", () => {
      const zeroWeights = [
        { id: "var-z1", trafficWeight: 0, destinationUrl: "https://z1.com" },
        { id: "var-z2", trafficWeight: 0, destinationUrl: "https://z2.com" },
      ];
      const result = selectExperimentVariant(zeroWeights, null, "seed-1");
      expect(result.selectedVariant.id).toBe("var-z1");
    });

    it("should handle single variant edge case", () => {
      const single = [{ id: "var-only", trafficWeight: 100, destinationUrl: "https://only.com" }];
      const result = selectExperimentVariant(single, null, "any-seed");
      expect(result.selectedVariant.id).toBe("var-only");
      expect(result.isSticky).toBe(false);
    });

    it("should throw error if variants array is empty", () => {
      expect(() => selectExperimentVariant([])).toThrow("No variants available for experiment");
    });
  });

  describe("calculateStatisticalSignificance", () => {
    it("should calculate statistically significant improvement (p <= 0.05, confidence >= 95%)", () => {
      // Control: 1000 sessions, 100 conversions (10%)
      // Variant: 1000 sessions, 150 conversions (15%)
      const result = calculateStatisticalSignificance(1000, 100, 1000, 150);

      expect(result.controlRate).toBeCloseTo(10.0, 1);
      expect(result.variantRate).toBeCloseTo(15.0, 1);
      expect(result.lift).toBeCloseTo(50.0, 1); // (15 - 10) / 10 * 100 = 50%
      expect(result.pValue).toBeLessThanOrEqual(0.05);
      expect(result.confidenceLevel).toBeGreaterThanOrEqual(95.0);
      expect(result.isSignificant).toBe(true);
    });

    it("should calculate non-significant result for small difference or small sample", () => {
      // Control: 100 sessions, 10 conversions (10%)
      // Variant: 100 sessions, 11 conversions (11%)
      const result = calculateStatisticalSignificance(100, 10, 100, 11);

      expect(result.controlRate).toBeCloseTo(10.0, 1);
      expect(result.variantRate).toBeCloseTo(11.0, 1);
      expect(result.lift).toBeCloseTo(10.0, 1);
      expect(result.pValue).toBeGreaterThan(0.05);
      expect(result.confidenceLevel).toBeLessThan(95.0);
      expect(result.isSignificant).toBe(false);
    });

    it("should calculate negative lift when variant underperforms control", () => {
      // Control: 1000 sessions, 200 conversions (20%)
      // Variant: 1000 sessions, 100 conversions (10%)
      const result = calculateStatisticalSignificance(1000, 200, 1000, 100);

      expect(result.controlRate).toBeCloseTo(20.0, 1);
      expect(result.variantRate).toBeCloseTo(10.0, 1);
      expect(result.lift).toBeCloseTo(-50.0, 1); // (10 - 20) / 20 * 100 = -50%
      expect(result.pValue).toBeLessThanOrEqual(0.05);
      // High confidence that it is different, but underperforming
      expect(result.confidenceLevel).toBeGreaterThanOrEqual(95.0);
    });

    it("should handle zero sessions without throwing errors or producing NaN", () => {
      const result = calculateStatisticalSignificance(0, 0, 0, 0);

      expect(result.controlRate).toBe(0);
      expect(result.variantRate).toBe(0);
      expect(result.lift).toBe(0);
      expect(result.confidenceLevel).toBe(0);
      expect(result.isSignificant).toBe(false);
      expect(result.pValue).toBe(1);
    });

    it("should handle zero conversions on both sides", () => {
      const result = calculateStatisticalSignificance(500, 0, 500, 0);

      expect(result.controlRate).toBe(0);
      expect(result.variantRate).toBe(0);
      expect(result.lift).toBe(0);
      expect(result.confidenceLevel).toBe(0);
      expect(result.isSignificant).toBe(false);
      expect(result.pValue).toBe(1);
    });

    it("should handle 100% conversions on both sides (totalNonConversions = 0)", () => {
      const result = calculateStatisticalSignificance(50, 50, 50, 50);

      expect(result.controlRate).toBe(100);
      expect(result.variantRate).toBe(100);
      expect(result.lift).toBe(0);
      expect(result.confidenceLevel).toBe(0);
      expect(result.isSignificant).toBe(false);
      expect(result.pValue).toBe(1);
    });

    it("should handle zero control conversions with non-zero variant conversions safely", () => {
      const result = calculateStatisticalSignificance(100, 0, 100, 10);

      expect(result.controlRate).toBe(0);
      expect(result.variantRate).toBe(10);
      expect(result.lift).toBe(0);
      expect(result.pValue).toBeLessThan(0.05);
      expect(result.isSignificant).toBe(true);
    });

    it("should clamp conversions if they exceed total sessions", () => {
      const result = calculateStatisticalSignificance(50, 60, 50, 70);

      expect(result.controlRate).toBe(100);
      expect(result.variantRate).toBe(100);
      expect(result.lift).toBe(0);
    });
  });

  describe("computeExperimentMetrics", () => {
    const experiment = {
      id: "exp-123",
      winnerVariantId: null as string | null,
      status: "active",
    };

    const variants = [
      {
        id: "v-ctrl",
        experimentId: "exp-123",
        name: "Control A",
        destinationUrl: "https://scanflow.app/a",
        trafficWeight: 50,
        isControl: true,
      },
      {
        id: "v-b",
        experimentId: "exp-123",
        name: "Variant B",
        destinationUrl: "https://scanflow.app/b",
        trafficWeight: 50,
        isControl: false,
      },
    ];

    it("should compute accurate aggregation for variants and experiment totals", () => {
      // 100 sessions for control: 10 conversions, 20 bounces (eventsCount <= 1)
      const controlSessions = Array.from({ length: 100 }, (_, i) => ({
        id: `s-c-${i}`,
        experimentVariantId: "v-ctrl",
        converted: i < 10,
        eventsCount: i < 20 ? 1 : 3,
        durationSeconds: 15,
        events: [{ eventType: "QR_SCAN" }],
      }));

      // 100 sessions for variant B: 25 conversions, 10 bounces
      const variantBSessions = Array.from({ length: 100 }, (_, i) => ({
        id: `s-b-${i}`,
        experimentVariantId: "v-b",
        converted: i < 25,
        eventsCount: i < 10 ? 1 : 4,
        durationSeconds: 25,
        events: [{ eventType: "QR_SCAN" }],
      }));

      const allSessions = [...controlSessions, ...variantBSessions];

      const metrics: ExperimentStats = computeExperimentMetrics(experiment, variants, allSessions);

      expect(metrics.totalSessions).toBe(200);
      expect(metrics.totalScans).toBe(200);
      expect(metrics.totalConversions).toBe(35);
      expect(metrics.conversionRate).toBeCloseTo(17.5, 1); // 35 / 200 * 100 = 17.5%

      const ctrlStats = metrics.variants.find((v) => v.id === "v-ctrl")!;
      expect(ctrlStats.sessions).toBe(100);
      expect(ctrlStats.conversions).toBe(10);
      expect(ctrlStats.conversionRate).toBe(10);
      expect(ctrlStats.bounceRate).toBe(20);
      expect(ctrlStats.isControl).toBe(true);

      const bStats = metrics.variants.find((v) => v.id === "v-b")!;
      expect(bStats.sessions).toBe(100);
      expect(bStats.conversions).toBe(25);
      expect(bStats.conversionRate).toBe(25);
      expect(bStats.bounceRate).toBe(10);
      expect(bStats.lift).toBeCloseTo(150.0, 1); // (25 - 10)/10 * 100 = 150%
      expect(bStats.isSignificant).toBe(true);
      expect(metrics.hasSignificantWinner).toBe(true);
      expect(metrics.winnerVariant?.id).toBe("v-b");
    });

    it("should handle multiple QR_SCAN events in session events", () => {
      const sessions = [
        {
          id: "s-1",
          experimentVariantId: "v-ctrl",
          converted: true,
          events: [{ eventType: "QR_SCAN" }, { eventType: "QR_SCAN" }],
        },
      ];

      const metrics = computeExperimentMetrics(experiment, variants, sessions);
      expect(metrics.totalScans).toBe(2);
      expect(metrics.variants.find((v) => v.id === "v-ctrl")?.scans).toBe(2);
    });

    it("should handle experiments with explicit winnerVariantId", () => {
      const expWithWinner = {
        id: "exp-123",
        winnerVariantId: "v-ctrl",
        status: "ended",
      };

      const metrics = computeExperimentMetrics(expWithWinner, variants, []);
      expect(metrics.winnerVariant?.id).toBe("v-ctrl");
      expect(metrics.hasSignificantWinner).toBe(false);
    });

    it("should handle non-existent explicit winnerVariantId", () => {
      const expWithInvalidWinner = {
        id: "exp-123",
        winnerVariantId: "var-ghost",
        status: "ended",
      };

      const metrics = computeExperimentMetrics(expWithInvalidWinner, variants, []);
      expect(metrics.winnerVariant).toBeNull();
    });

    it("should fallback to first variant as control if none is explicitly marked isControl", () => {
      const unflaggedVariants = [
        { id: "v-1", name: "Var 1", trafficWeight: 50, isControl: false, destinationUrl: "https://1.com" },
        { id: "v-2", name: "Var 2", trafficWeight: 50, isControl: false, destinationUrl: "https://2.com" },
      ];

      const sessions = [
        ...Array.from({ length: 100 }, () => ({ experimentVariantId: "v-1", converted: false })),
        ...Array.from({ length: 100 }, (_, i) => ({ experimentVariantId: "v-2", converted: i < 30 })),
      ];

      const metrics = computeExperimentMetrics(experiment, unflaggedVariants, sessions);
      const v2Stats = metrics.variants.find((v) => v.id === "v-2")!;
      expect(v2Stats.lift).toBeDefined();
      expect(v2Stats.confidenceLevel).toBeDefined();
    });

    it("should handle empty sessions gracefully", () => {
      const metrics = computeExperimentMetrics(experiment, variants, []);

      expect(metrics.totalSessions).toBe(0);
      expect(metrics.totalScans).toBe(0);
      expect(metrics.totalConversions).toBe(0);
      expect(metrics.conversionRate).toBe(0);
      expect(metrics.variants).toHaveLength(2);
      expect(metrics.variants[0].conversionRate).toBe(0);
      expect(metrics.variants[0].bounceRate).toBe(0);
      expect(metrics.hasSignificantWinner).toBe(false);
      expect(metrics.winnerVariant).toBeNull();
    });

    it("should handle multi-variant tests (A/B/C testing)", () => {
      const abcVariants = [
        { id: "v-ctrl", name: "Control", trafficWeight: 34, isControl: true, destinationUrl: "https://a.com" },
        { id: "v-b", name: "Variant B", trafficWeight: 33, isControl: false, destinationUrl: "https://b.com" },
        { id: "v-c", name: "Variant C", trafficWeight: 33, isControl: false, destinationUrl: "https://c.com" },
      ];

      const sessions = [
        ...Array.from({ length: 50 }, () => ({ experimentVariantId: "v-ctrl", converted: false, eventsCount: 2 })),
        ...Array.from({ length: 50 }, (_, i) => ({ experimentVariantId: "v-b", converted: i < 5, eventsCount: 2 })),
        ...Array.from({ length: 50 }, (_, i) => ({ experimentVariantId: "v-c", converted: i < 15, eventsCount: 2 })),
      ];

      const metrics = computeExperimentMetrics(experiment, abcVariants, sessions);
      expect(metrics.variants).toHaveLength(3);
      const cStats = metrics.variants.find((v) => v.id === "v-c")!;
      expect(cStats.conversionRate).toBe(30);
      expect(cStats.conversions).toBe(15);
    });
  });
});
