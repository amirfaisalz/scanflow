import { describe, it, expect } from "vitest";
import { routingRules, sessions, sessionEvents } from "@/lib/db/schema";

describe("Database Schema - Routing and Sessions", () => {
  it("should export routingRules table with required columns", () => {
    expect(routingRules).toBeDefined();
    expect(routingRules.id).toBeDefined();
    expect(routingRules.qrCodeId).toBeDefined();
    expect(routingRules.userId).toBeDefined();
    expect(routingRules.priority).toBeDefined();
    expect(routingRules.conditionType).toBeDefined();
    expect(routingRules.conditionValue).toBeDefined();
    expect(routingRules.destinationUrl).toBeDefined();
    expect(routingRules.isActive).toBeDefined();
  });

  it("should export sessions table with required columns", () => {
    expect(sessions).toBeDefined();
    expect(sessions.id).toBeDefined();
    expect(sessions.qrCodeId).toBeDefined();
    expect(sessions.userId).toBeDefined();
    expect(sessions.ipHash).toBeDefined();
    expect(sessions.deviceType).toBeDefined();
    expect(sessions.os).toBeDefined();
    expect(sessions.browser).toBeDefined();
    expect(sessions.country).toBeDefined();
    expect(sessions.durationSeconds).toBeDefined();
    expect(sessions.eventsCount).toBeDefined();
    expect(sessions.converted).toBeDefined();
  });

  it("should export sessionEvents table with required columns", () => {
    expect(sessionEvents).toBeDefined();
    expect(sessionEvents.id).toBeDefined();
    expect(sessionEvents.sessionId).toBeDefined();
    expect(sessionEvents.qrCodeId).toBeDefined();
    expect(sessionEvents.userId).toBeDefined();
    expect(sessionEvents.eventType).toBeDefined();
    expect(sessionEvents.eventData).toBeDefined();
  });
});
