import crypto from "crypto";
import type { RoutingRule } from "@/lib/db/schema";

export interface VisitorContext {
  deviceType: "mobile" | "tablet" | "desktop" | "bot" | "other";
  os: "iOS" | "Android" | "macOS" | "Windows" | "Linux" | "Other";
  browser: "Chrome" | "Safari" | "Firefox" | "Edge" | "Opera" | "Other";
  country: string;
  city?: string | null;
  language: string;
  ipHash: string;
  userAgent: string;
  referrer: string | null;
}

export interface RoutingEvaluationResult {
  destinationUrl: string;
  matchedRuleId: string | null;
  conditionMatched?: string | null;
}

/**
 * Anonymize client IP using a one-way SHA-256 hash with a fixed salt
 */
export function anonymizeIp(ip: string, salt = "scanflow_ip_salt"): string {
  if (!ip) return "unknown";
  return crypto.createHash("sha256").update(`${salt}:${ip}`).digest("hex");
}

/**
 * Lightweight deterministic User-Agent parser
 */
export function parseUserAgent(ua: string): {
  deviceType: VisitorContext["deviceType"];
  os: VisitorContext["os"];
  browser: VisitorContext["browser"];
} {
  if (!ua) {
    return { deviceType: "other", os: "Other", browser: "Other" };
  }

  const lowerUA = ua.toLowerCase();

  // Bot detection
  if (/bot|crawler|spider|crawling|googlebot|bingbot|slurp|duckduckbot|baiduspider|yandexbot|sogou/i.test(lowerUA)) {
    return { deviceType: "bot", os: "Other", browser: "Other" };
  }

  // OS Detection
  let os: VisitorContext["os"] = "Other";
  if (/iphone|ipad|ipod/i.test(lowerUA)) {
    os = "iOS";
  } else if (/android/i.test(lowerUA)) {
    os = "Android";
  } else if (/mac os x|macintosh/i.test(lowerUA)) {
    os = "macOS";
  } else if (/windows|win32|win64/i.test(lowerUA)) {
    os = "Windows";
  } else if (/linux/i.test(lowerUA)) {
    os = "Linux";
  }

  // Device Type Detection
  let deviceType: VisitorContext["deviceType"] = "desktop";
  if (/ipad|tablet|(android(?!.*mobile))/i.test(lowerUA)) {
    deviceType = "tablet";
  } else if (/mobile|iphone|ipod|android/i.test(lowerUA)) {
    deviceType = "mobile";
  } else if (/macintosh|windows|linux/i.test(lowerUA)) {
    deviceType = "desktop";
  } else {
    deviceType = "other";
  }

  // Browser Detection
  let browser: VisitorContext["browser"] = "Other";
  if (/edg\//i.test(lowerUA)) {
    browser = "Edge";
  } else if (/opr\/|opera/i.test(lowerUA)) {
    browser = "Opera";
  } else if (/chrome|crios/i.test(lowerUA) && !/edg\//i.test(lowerUA)) {
    browser = "Chrome";
  } else if (/firefox|fxios/i.test(lowerUA)) {
    browser = "Firefox";
  } else if (/safari/i.test(lowerUA) && !/chrome|crios|android/i.test(lowerUA)) {
    browser = "Safari";
  }

  return { deviceType, os, browser };
}

/**
 * Parse visitor context from incoming request headers
 */
export function parseVisitorContext(headers: Headers, ipAddress?: string): VisitorContext {
  const userAgent = headers.get("user-agent") || "";
  const { deviceType, os, browser } = parseUserAgent(userAgent);

  const country =
    headers.get("x-vercel-ip-country") ||
    headers.get("cf-ipcountry") ||
    headers.get("x-country-code") ||
    headers.get("x-geoip-country") ||
    "Unknown";

  const city =
    headers.get("x-vercel-ip-city") ||
    headers.get("cf-ipcity") ||
    headers.get("x-city") ||
    null;

  const rawLanguage = headers.get("accept-language") || "en";
  // Primary language code (e.g. "id-ID,id;q=0.9" -> "id")
  const primaryLang = rawLanguage.split(",")[0]?.split("-")[0]?.trim().toLowerCase() || "en";

  const referrer = headers.get("referer") || headers.get("referrer") || null;

  const rawIp =
    ipAddress ||
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "127.0.0.1";

  const ipHash = anonymizeIp(rawIp);

  return {
    deviceType,
    os,
    browser,
    country: country.toUpperCase(),
    city,
    language: primaryLang,
    ipHash,
    userAgent,
    referrer,
  };
}

/**
 * Evaluate deterministic dynamic routing rules against visitor context
 */
export function evaluateRoutingRules(
  context: VisitorContext,
  rules: RoutingRule[],
  defaultDestinationUrl: string
): RoutingEvaluationResult {
  if (!rules || rules.length === 0) {
    return { destinationUrl: defaultDestinationUrl, matchedRuleId: null };
  }

  // Active rules sorted by priority ASC (1 is evaluated before 2)
  const activeRules = rules
    .filter((r) => r.isActive)
    .sort((a, b) => (a.priority ?? 1) - (b.priority ?? 1));

  for (const rule of activeRules) {
    const val = rule.conditionValue.trim();

    switch (rule.conditionType.toLowerCase()) {
      case "device": {
        if (context.deviceType.toLowerCase() === val.toLowerCase()) {
          return {
            destinationUrl: rule.destinationUrl,
            matchedRuleId: rule.id,
            conditionMatched: `device:${val}`,
          };
        }
        break;
      }
      case "os": {
        if (context.os.toLowerCase() === val.toLowerCase()) {
          return {
            destinationUrl: rule.destinationUrl,
            matchedRuleId: rule.id,
            conditionMatched: `os:${val}`,
          };
        }
        break;
      }
      case "country": {
        if (context.country.toUpperCase() === val.toUpperCase()) {
          return {
            destinationUrl: rule.destinationUrl,
            matchedRuleId: rule.id,
            conditionMatched: `country:${val}`,
          };
        }
        break;
      }
      case "language": {
        if (
          context.language.toLowerCase() === val.toLowerCase() ||
          context.language.toLowerCase().startsWith(val.toLowerCase())
        ) {
          return {
            destinationUrl: rule.destinationUrl,
            matchedRuleId: rule.id,
            conditionMatched: `language:${val}`,
          };
        }
        break;
      }
      case "time_window": {
        try {
          const parsed = JSON.parse(val);
          if (parsed.start && parsed.end) {
            const now = new Date();
            const currentMinutes = now.getUTCHours() * 60 + now.getUTCMinutes();
            const [sH, sM] = parsed.start.split(":").map(Number);
            const [eH, eM] = parsed.end.split(":").map(Number);
            const startMin = sH * 60 + (sM || 0);
            const endMin = eH * 60 + (eM || 0);

            if (currentMinutes >= startMin && currentMinutes <= endMin) {
              return {
                destinationUrl: rule.destinationUrl,
                matchedRuleId: rule.id,
                conditionMatched: `time_window:${val}`,
              };
            }
          }
        } catch {
          // invalid json time window, skip rule
        }
        break;
      }
    }
  }

  return { destinationUrl: defaultDestinationUrl, matchedRuleId: null };
}
