import { describe, it, expect } from "vitest";
import { parseVisitorContext, evaluateRoutingRules, anonymizeIp, type VisitorContext } from "@/lib/routing/engine";
import type { RoutingRule } from "@/lib/db/schema";

describe("Routing Engine", () => {
  describe("Visitor Context Extraction", () => {
    it("should parse iOS mobile Safari visitor context", () => {
      const headers = new Headers({
        "user-agent": "Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1",
        "accept-language": "id-ID,id;q=0.9,en-US;q=0.8",
        "x-vercel-ip-country": "ID",
        "x-vercel-ip-city": "Jakarta",
        "referer": "https://instagram.com",
      });

      const context = parseVisitorContext(headers, "203.0.113.195");
      expect(context.deviceType).toBe("mobile");
      expect(context.os).toBe("iOS");
      expect(context.browser).toBe("Safari");
      expect(context.country).toBe("ID");
      expect(context.city).toBe("Jakarta");
      expect(context.language).toBe("id");
      expect(context.referrer).toBe("https://instagram.com");
      expect(context.ipHash).toBeDefined();
    });

    it("should parse Android Chrome visitor context", () => {
      const headers = new Headers({
        "user-agent": "Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.6261.64 Mobile Safari/537.36",
        "accept-language": "en-US,en;q=0.9",
        "cf-ipcountry": "US",
      });

      const context = parseVisitorContext(headers, "198.51.100.1");
      expect(context.deviceType).toBe("mobile");
      expect(context.os).toBe("Android");
      expect(context.browser).toBe("Chrome");
      expect(context.country).toBe("US");
      expect(context.language).toBe("en");
    });

    it("should parse macOS Desktop Firefox visitor context", () => {
      const headers = new Headers({
        "user-agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:123.0) Gecko/20100101 Firefox/123.0",
        "accept-language": "ja",
      });

      const context = parseVisitorContext(headers, "127.0.0.1");
      expect(context.deviceType).toBe("desktop");
      expect(context.os).toBe("macOS");
      expect(context.browser).toBe("Firefox");
      expect(context.language).toBe("ja");
    });
  });

  describe("IP Anonymization", () => {
    it("should hash IP consistently without revealing raw IP", () => {
      const hash1 = anonymizeIp("192.168.1.50");
      const hash2 = anonymizeIp("192.168.1.50");
      const hash3 = anonymizeIp("192.168.1.51");

      expect(hash1).toBe(hash2);
      expect(hash1).not.toBe(hash3);
      expect(hash1).not.toContain("192.168.1.50");
    });
  });

  describe("Deterministic Rule Evaluator", () => {
    const baseContext: VisitorContext = {
      deviceType: "mobile",
      os: "iOS",
      browser: "Safari",
      country: "ID",
      city: "Jakarta",
      language: "id",
      ipHash: "hash-123",
      userAgent: "...",
      referrer: null,
    };

    it("should match by OS condition", () => {
      const rules: RoutingRule[] = [
        {
          id: "rule-ios",
          qrCodeId: "qr-1",
          userId: "user-1",
          priority: 1,
          conditionType: "os",
          conditionValue: "ios",
          destinationUrl: "https://apps.apple.com/app/scanflow",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const result = evaluateRoutingRules(baseContext, rules, "https://scanflow.app/default");
      expect(result.destinationUrl).toBe("https://apps.apple.com/app/scanflow");
      expect(result.matchedRuleId).toBe("rule-ios");
    });

    it("should prioritize lower priority number (higher rank)", () => {
      const rules: RoutingRule[] = [
        {
          id: "rule-country-id",
          qrCodeId: "qr-1",
          userId: "user-1",
          priority: 2,
          conditionType: "country",
          conditionValue: "id",
          destinationUrl: "https://id.scanflow.app",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "rule-device-mobile",
          qrCodeId: "qr-1",
          userId: "user-1",
          priority: 1,
          conditionType: "device",
          conditionValue: "mobile",
          destinationUrl: "https://m.scanflow.app",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const result = evaluateRoutingRules(baseContext, rules, "https://scanflow.app/default");
      expect(result.destinationUrl).toBe("https://m.scanflow.app");
      expect(result.matchedRuleId).toBe("rule-device-mobile");
    });

    it("should ignore inactive rules", () => {
      const rules: RoutingRule[] = [
        {
          id: "rule-disabled",
          qrCodeId: "qr-1",
          userId: "user-1",
          priority: 1,
          conditionType: "os",
          conditionValue: "ios",
          destinationUrl: "https://inactive.com",
          isActive: false,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
        {
          id: "rule-country",
          qrCodeId: "qr-1",
          userId: "user-1",
          priority: 2,
          conditionType: "country",
          conditionValue: "id",
          destinationUrl: "https://id.scanflow.app",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const result = evaluateRoutingRules(baseContext, rules, "https://scanflow.app/default");
      expect(result.destinationUrl).toBe("https://id.scanflow.app");
      expect(result.matchedRuleId).toBe("rule-country");
    });

    it("should match language prefix", () => {
      const context = { ...baseContext, language: "id-ID" };
      const rules: RoutingRule[] = [
        {
          id: "rule-lang",
          qrCodeId: "qr-1",
          userId: "user-1",
          priority: 1,
          conditionType: "language",
          conditionValue: "id",
          destinationUrl: "https://scanflow.app/id",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const result = evaluateRoutingRules(context, rules, "https://scanflow.app/default");
      expect(result.destinationUrl).toBe("https://scanflow.app/id");
      expect(result.matchedRuleId).toBe("rule-lang");
    });

    it("should fallback when no rules match", () => {
      const context = {
        ...baseContext,
        os: "Windows" as const,
        deviceType: "desktop" as const,
        country: "GB",
        language: "en",
      };

      const rules: RoutingRule[] = [
        {
          id: "rule-ios",
          qrCodeId: "qr-1",
          userId: "user-1",
          priority: 1,
          conditionType: "os",
          conditionValue: "ios",
          destinationUrl: "https://apple.com",
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ];

      const result = evaluateRoutingRules(context, rules, "https://scanflow.app/fallback");
      expect(result.destinationUrl).toBe("https://scanflow.app/fallback");
      expect(result.matchedRuleId).toBeNull();
    });
  });
});
