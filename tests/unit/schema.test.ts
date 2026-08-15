import { describe, it, expect } from "vitest";
import {
  routingRules,
  sessions,
  sessionEvents,
  conversionGoals,
  experiments,
  experimentVariants,
  experimentsRelations,
  experimentVariantsRelations,
  sessionsRelations,
  sessionEventsRelations,
  userRelations,
  campaignsRelations,
  qrCodesRelations,
} from "@/lib/db/schema";

describe("Database Schema - Routing, Sessions, and A/B Testing Experiments", () => {
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

  it("should export sessions table with required columns including experiment tracking", () => {
    expect(sessions).toBeDefined();
    expect(sessions.id).toBeDefined();
    expect(sessions.qrCodeId).toBeDefined();
    expect(sessions.userId).toBeDefined();
    expect(sessions.campaignId).toBeDefined();
    expect(sessions.experimentId).toBeDefined();
    expect(sessions.experimentVariantId).toBeDefined();
    expect(sessions.ipHash).toBeDefined();
    expect(sessions.deviceType).toBeDefined();
    expect(sessions.os).toBeDefined();
    expect(sessions.browser).toBeDefined();
    expect(sessions.country).toBeDefined();
    expect(sessions.durationSeconds).toBeDefined();
    expect(sessions.eventsCount).toBeDefined();
    expect(sessions.converted).toBeDefined();
  });

  it("should export sessionEvents table with required columns including experiment tracking", () => {
    expect(sessionEvents).toBeDefined();
    expect(sessionEvents.id).toBeDefined();
    expect(sessionEvents.sessionId).toBeDefined();
    expect(sessionEvents.qrCodeId).toBeDefined();
    expect(sessionEvents.userId).toBeDefined();
    expect(sessionEvents.experimentId).toBeDefined();
    expect(sessionEvents.experimentVariantId).toBeDefined();
    expect(sessionEvents.eventType).toBeDefined();
    expect(sessionEvents.eventData).toBeDefined();
  });

  it("should export conversionGoals table with required columns", () => {
    expect(conversionGoals).toBeDefined();
    expect(conversionGoals.id).toBeDefined();
    expect(conversionGoals.userId).toBeDefined();
    expect(conversionGoals.name).toBeDefined();
    expect(conversionGoals.description).toBeDefined();
    expect(conversionGoals.eventType).toBeDefined();
    expect(conversionGoals.targetPattern).toBeDefined();
    expect(conversionGoals.qrCodeId).toBeDefined();
    expect(conversionGoals.campaignId).toBeDefined();
    expect(conversionGoals.monetaryValue).toBeDefined();
    expect(conversionGoals.currency).toBeDefined();
    expect(conversionGoals.isActive).toBeDefined();
    expect(conversionGoals.createdAt).toBeDefined();
    expect(conversionGoals.updatedAt).toBeDefined();
  });

  it("should export experiments table with required columns", () => {
    expect(experiments).toBeDefined();
    expect(experiments.id).toBeDefined();
    expect(experiments.userId).toBeDefined();
    expect(experiments.qrCodeId).toBeDefined();
    expect(experiments.campaignId).toBeDefined();
    expect(experiments.name).toBeDefined();
    expect(experiments.description).toBeDefined();
    expect(experiments.status).toBeDefined();
    expect(experiments.trafficAllocation).toBeDefined();
    expect(experiments.winnerVariantId).toBeDefined();
    expect(experiments.startedAt).toBeDefined();
    expect(experiments.endedAt).toBeDefined();
    expect(experiments.createdAt).toBeDefined();
    expect(experiments.updatedAt).toBeDefined();
  });

  it("should export experimentVariants table with required columns", () => {
    expect(experimentVariants).toBeDefined();
    expect(experimentVariants.id).toBeDefined();
    expect(experimentVariants.experimentId).toBeDefined();
    expect(experimentVariants.userId).toBeDefined();
    expect(experimentVariants.name).toBeDefined();
    expect(experimentVariants.destinationUrl).toBeDefined();
    expect(experimentVariants.trafficWeight).toBeDefined();
    expect(experimentVariants.isControl).toBeDefined();
    expect(experimentVariants.createdAt).toBeDefined();
    expect(experimentVariants.updatedAt).toBeDefined();
  });

  it("should export relations for experiments and experimentVariants", () => {
    expect(experimentsRelations).toBeDefined();
    expect(experimentVariantsRelations).toBeDefined();
    expect(sessionsRelations).toBeDefined();
    expect(sessionEventsRelations).toBeDefined();
    expect(userRelations).toBeDefined();
    expect(campaignsRelations).toBeDefined();
    expect(qrCodesRelations).toBeDefined();
  });
});

