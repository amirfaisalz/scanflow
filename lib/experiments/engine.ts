/**
 * ScanFlow A/B Testing & Statistical Significance Engine
 * Handles weighted traffic assignment, cookie-based sticky persistence,
 * Chi-Square statistical calculations, confidence levels, and metrics aggregation.
 */

export interface VariantWithStats {
  id: string;
  experimentId: string;
  name: string;
  destinationUrl: string;
  trafficWeight: number;
  isControl: boolean;
  scans: number;
  sessions: number;
  conversions: number;
  conversionRate: number; // %
  bounceRate: number; // %
  lift?: number; // % relative to control
  confidenceLevel?: number; // % (e.g. 96.5%)
  isSignificant?: boolean;
  pValue?: number;
}

export interface ExperimentStats {
  totalScans: number;
  totalSessions: number;
  totalConversions: number;
  conversionRate: number;
  variants: VariantWithStats[];
  winnerVariant?: VariantWithStats | null;
  hasSignificantWinner: boolean;
}

/**
 * Deterministically hashes a visitor seed to a 32-bit integer using FNV-1a.
 */
function hashVisitorSeed(seed: string | number, max: number): number {
  const str = String(seed);
  let h = 2166136261 >>> 0;
  for (let i = 0; i < str.length; i++) {
    h = Math.imul(h ^ str.charCodeAt(i), 16777619) >>> 0;
  }
  return h % max;
}

/**
 * Selects an experiment variant based on sticky cookies or weighted traffic distribution.
 *
 * @param variants List of available variants with traffic weights.
 * @param cookieVariantId Optional variant ID stored in visitor's cookie.
 * @param visitorSeed Optional seed (IP hash, visitor ID) for deterministic assignment.
 */
export function selectExperimentVariant<
  T extends { id: string; trafficWeight: number; destinationUrl: string }
>(
  variants: T[],
  cookieVariantId?: string | null,
  visitorSeed?: string | number
): { selectedVariant: T; isSticky: boolean } {
  if (!variants || variants.length === 0) {
    throw new Error("No variants available for experiment");
  }

  // 1. Check for valid sticky cookie assignment
  if (cookieVariantId) {
    const existing = variants.find((v) => v.id === cookieVariantId);
    if (existing) {
      return { selectedVariant: existing, isSticky: true };
    }
  }

  // 2. Single variant edge-case
  if (variants.length === 1) {
    return { selectedVariant: variants[0], isSticky: false };
  }

  // 3. Weighted traffic assignment
  const totalWeight = variants.reduce((sum, v) => sum + Math.max(0, v.trafficWeight || 0), 0);

  if (totalWeight <= 0) {
    return { selectedVariant: variants[0], isSticky: false };
  }

  let target: number;
  if (visitorSeed !== undefined && visitorSeed !== null) {
    target = hashVisitorSeed(visitorSeed, totalWeight);
  } else {
    target = Math.random() * totalWeight;
  }

  let cumulative = 0;
  for (const variant of variants) {
    const weight = Math.max(0, variant.trafficWeight || 0);
    cumulative += weight;
    if (target < cumulative) {
      return { selectedVariant: variant, isSticky: false };
    }
  }

  return { selectedVariant: variants[variants.length - 1], isSticky: false };
}

/**
 * Error function approximation using Abramowitz and Stegun formula 7.1.26.
 * Maximum error: 1.5 x 10^-7.
 */
function erf(x: number): number {
  const sign = x >= 0 ? 1 : -1;
  const absX = Math.abs(x);

  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const t = 1.0 / (1.0 + p * absX);
  const y =
    1.0 -
    ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);

  return sign * y;
}

/**
 * Complementary error function: erfc(x) = 1 - erf(x).
 */
function erfc(x: number): number {
  return 1 - erf(x);
}

/**
 * Compute two-tailed p-value from Chi-Square test of independence (df = 1).
 * For 1 df: p-value = erfc(sqrt(chiSquare / 2)).
 */
function chiSquarePValue(chiSquare: number): number {
  if (chiSquare <= 0 || isNaN(chiSquare)) return 1.0;
  const z = Math.sqrt(chiSquare);
  const p = erfc(z / Math.SQRT2);
  return Math.max(0, Math.min(1, p));
}

/**
 * Calculates statistical significance between control and variant conversion rates
 * using 2x2 contingency table Pearson Chi-Square test (1 degree of freedom).
 */
export function calculateStatisticalSignificance(
  controlSessions: number,
  controlConversions: number,
  variantSessions: number,
  variantConversions: number
): {
  controlRate: number;
  variantRate: number;
  lift: number;
  confidenceLevel: number;
  isSignificant: boolean;
  pValue: number;
} {
  const validControlSessions = Math.max(0, controlSessions);
  const validVariantSessions = Math.max(0, variantSessions);
  const validControlConv = Math.min(validControlSessions, Math.max(0, controlConversions));
  const validVariantConv = Math.min(validVariantSessions, Math.max(0, variantConversions));

  const controlRate =
    validControlSessions > 0
      ? (validControlConv / validControlSessions) * 100
      : 0;
  const variantRate =
    validVariantSessions > 0
      ? (validVariantConv / validVariantSessions) * 100
      : 0;

  const lift =
    controlRate > 0
      ? ((variantRate - controlRate) / controlRate) * 100
      : 0;

  // If either session count is zero, or both conversion rates are 0 or 100%
  if (validControlSessions === 0 || validVariantSessions === 0) {
    return {
      controlRate: Number(controlRate.toFixed(2)),
      variantRate: Number(variantRate.toFixed(2)),
      lift: Number(lift.toFixed(2)),
      confidenceLevel: 0,
      isSignificant: false,
      pValue: 1,
    };
  }

  const a = validControlConv;
  const b = validControlSessions - validControlConv;
  const c = validVariantConv;
  const d = validVariantSessions - validVariantConv;

  const totalSessions = validControlSessions + validVariantSessions;
  const totalConversions = a + c;
  const totalNonConversions = b + d;

  if (totalConversions === 0 || totalNonConversions === 0) {
    return {
      controlRate: Number(controlRate.toFixed(2)),
      variantRate: Number(variantRate.toFixed(2)),
      lift: Number(lift.toFixed(2)),
      confidenceLevel: 0,
      isSignificant: false,
      pValue: 1,
    };
  }

  // 2x2 Contingency Pearson Chi-Square:
  // chi2 = N * (a*d - b*c)^2 / ( (a+b) * (c+d) * (a+c) * (b+d) )
  const numerator = totalSessions * Math.pow(a * d - b * c, 2);
  const denominator =
    validControlSessions *
    validVariantSessions *
    totalConversions *
    totalNonConversions;

  const chiSquare = denominator > 0 ? numerator / denominator : 0;
  const pValue = chiSquarePValue(chiSquare);
  const confidenceLevel = Math.max(0, Math.min(100, (1 - pValue) * 100));
  const isSignificant = confidenceLevel >= 95.0 && pValue <= 0.05;

  return {
    controlRate: Number(controlRate.toFixed(2)),
    variantRate: Number(variantRate.toFixed(2)),
    lift: Number(lift.toFixed(2)),
    confidenceLevel: Number(confidenceLevel.toFixed(2)),
    isSignificant,
    pValue: Number(pValue.toFixed(4)),
  };
}

/**
 * Aggregates visitor sessions and events to compute complete experiment analytics,
 * conversion rates, bounce rates, confidence levels, and winning variant determination.
 */
export function computeExperimentMetrics(
  experiment: { id: string; winnerVariantId?: string | null; status: string },
  variants: Array<{
    id: string;
    experimentId?: string;
    name?: string;
    destinationUrl?: string;
    trafficWeight?: number;
    isControl?: boolean;
  }>,
  sessions: Array<{
    id?: string;
    experimentVariantId?: string | null;
    converted?: boolean;
    eventsCount?: number;
    durationSeconds?: number;
  }>
): ExperimentStats {
  const totalSessions = sessions.length;
  let totalScans = 0;
  for (const s of sessions) {
    const scanEvts = (s as any).events?.filter((e: any) => e.eventType === "QR_SCAN")?.length;
    totalScans += scanEvts && scanEvts > 0 ? scanEvts : 1;
  }
  const totalConversions = sessions.filter((s) => Boolean(s.converted)).length;
  const overallConversionRate =
    totalSessions > 0 ? Number(((totalConversions / totalSessions) * 100).toFixed(2)) : 0;

  // Identify control variant
  const controlVariant = variants.find((v) => Boolean(v.isControl)) || variants[0];
  const controlSessions = controlVariant
    ? sessions.filter((s) => s.experimentVariantId === controlVariant.id)
    : [];
  const controlConversions = controlSessions.filter((s) => Boolean(s.converted)).length;

  const variantsWithStats: VariantWithStats[] = variants.map((variant) => {
    const variantSessions = sessions.filter((s) => s.experimentVariantId === variant.id);
    const varSessionCount = variantSessions.length;
    let varScanCount = 0;
    for (const s of variantSessions) {
      const scanEvts = (s as any).events?.filter((e: any) => e.eventType === "QR_SCAN")?.length;
      varScanCount += scanEvts && scanEvts > 0 ? scanEvts : 1;
    }
    const varConversions = variantSessions.filter((s) => Boolean(s.converted)).length;
    const conversionRate =
      varSessionCount > 0 ? Number(((varConversions / varSessionCount) * 100).toFixed(2)) : 0;

    const bouncedSessions = variantSessions.filter((s) => (s.eventsCount || 1) <= 1).length;
    const bounceRate =
      varSessionCount > 0 ? Number(((bouncedSessions / varSessionCount) * 100).toFixed(2)) : 0;

    const isControl = Boolean(variant.isControl);

    const baseVariant: VariantWithStats = {
      id: variant.id,
      experimentId: variant.experimentId || experiment.id,
      name: variant.name || "Variant",
      destinationUrl: variant.destinationUrl || "",
      trafficWeight: variant.trafficWeight ?? 0,
      isControl,
      scans: varScanCount,
      sessions: varSessionCount,
      conversions: varConversions,
      conversionRate,
      bounceRate,
    };

    if (!isControl && controlVariant && controlVariant.id !== variant.id) {
      const stats = calculateStatisticalSignificance(
        controlSessions.length,
        controlConversions,
        varSessionCount,
        varConversions
      );
      baseVariant.lift = stats.lift;
      baseVariant.confidenceLevel = stats.confidenceLevel;
      baseVariant.isSignificant = stats.isSignificant;
      baseVariant.pValue = stats.pValue;
    }

    return baseVariant;
  });

  // Determine winner variant
  let winnerVariant: VariantWithStats | null = null;
  let hasSignificantWinner = false;

  if (experiment.winnerVariantId) {
    winnerVariant = variantsWithStats.find((v) => v.id === experiment.winnerVariantId) || null;
  } else {
    // Check if any variant has significant positive lift
    const candidateWinners = variantsWithStats.filter(
      (v) => !v.isControl && v.isSignificant && (v.lift ?? 0) > 0
    );

    if (candidateWinners.length > 0) {
      hasSignificantWinner = true;
      // Sort by highest conversion rate then highest lift
      candidateWinners.sort(
        (a, b) => b.conversionRate - a.conversionRate || (b.lift ?? 0) - (a.lift ?? 0)
      );
      winnerVariant = candidateWinners[0];
    }
  }

  return {
    totalScans,
    totalSessions,
    totalConversions,
    conversionRate: overallConversionRate,
    variants: variantsWithStats,
    winnerVariant,
    hasSignificantWinner,
  };
}
