import { pgTable, text, timestamp, boolean, integer, jsonb } from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

// ---------------------------------------------------------------------------
// Better Auth Core Tables
// ---------------------------------------------------------------------------

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").default(false).notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// ---------------------------------------------------------------------------
// Application Tables (Multi-Tenant Data Isolation by userId)
// ---------------------------------------------------------------------------

export const campaigns = pgTable("campaigns", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").default("active").notNull(), // active, paused, archived
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const qrCodes = pgTable("qr_codes", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  campaignId: text("campaign_id").references(() => campaigns.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  slug: text("slug").notNull().unique(),
  destinationUrl: text("destination_url").notNull(),
  status: text("status").default("active").notNull(), // active, paused, archived
  foregroundColor: text("foreground_color").default("#000000").notNull(),
  backgroundColor: text("background_color").default("#ffffff").notNull(),
  scanCount: integer("scan_count").default(0).notNull(),
  metadata: jsonb("metadata").$type<Record<string, unknown>>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const routingRules = pgTable("routing_rules", {
  id: text("id").primaryKey(),
  qrCodeId: text("qr_code_id")
    .notNull()
    .references(() => qrCodes.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  priority: integer("priority").default(1).notNull(), // Lower number = higher priority
  conditionType: text("condition_type").notNull(), // 'device', 'os', 'country', 'language', 'time_window'
  conditionValue: text("condition_value").notNull(), // e.g. 'ios', 'android', 'US', 'id', '{"start":"09:00","end":"17:00"}'
  destinationUrl: text("destination_url").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const experiments = pgTable("experiments", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  qrCodeId: text("qr_code_id")
    .notNull()
    .references(() => qrCodes.id, { onDelete: "cascade" }),
  campaignId: text("campaign_id").references(() => campaigns.id, { onDelete: "set null" }),
  name: text("name").notNull(),
  description: text("description"),
  status: text("status").default("draft").notNull(), // 'draft', 'active', 'paused', 'ended'
  trafficAllocation: integer("traffic_allocation").default(100).notNull(), // % of total traffic in test (1-100)
  winnerVariantId: text("winner_variant_id"),
  startedAt: timestamp("started_at"),
  endedAt: timestamp("ended_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const experimentVariants = pgTable("experiment_variants", {
  id: text("id").primaryKey(),
  experimentId: text("experiment_id")
    .notNull()
    .references(() => experiments.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  destinationUrl: text("destination_url").notNull(),
  trafficWeight: integer("traffic_weight").default(50).notNull(),
  isControl: boolean("is_control").default(false).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  qrCodeId: text("qr_code_id")
    .notNull()
    .references(() => qrCodes.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  campaignId: text("campaign_id").references(() => campaigns.id, { onDelete: "set null" }),
  experimentId: text("experiment_id").references(() => experiments.id, { onDelete: "set null" }),
  experimentVariantId: text("experiment_variant_id").references(() => experimentVariants.id, { onDelete: "set null" }),
  ipHash: text("ip_hash").notNull(), // SHA-256 anonymized hash
  userAgent: text("user_agent"),
  deviceType: text("device_type").notNull(), // 'mobile', 'tablet', 'desktop', 'bot', 'other'
  os: text("os").notNull(), // 'iOS', 'Android', 'macOS', 'Windows', 'Linux', 'Other'
  browser: text("browser").notNull(), // 'Chrome', 'Safari', 'Firefox', 'Edge', 'Other'
  country: text("country").default("Unknown").notNull(), // ISO Alpha-2 e.g. 'US', 'ID'
  city: text("city"),
  referrer: text("referrer"),
  matchedRuleId: text("matched_rule_id").references(() => routingRules.id, { onDelete: "set null" }),
  initialDestination: text("initial_destination").notNull(),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  endedAt: timestamp("ended_at").defaultNow().notNull(),
  durationSeconds: integer("duration_seconds").default(0).notNull(),
  eventsCount: integer("events_count").default(1).notNull(),
  converted: boolean("converted").default(false).notNull(),
  conversionEvent: text("conversion_event"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const sessionEvents = pgTable("session_events", {
  id: text("id").primaryKey(),
  sessionId: text("session_id")
    .notNull()
    .references(() => sessions.id, { onDelete: "cascade" }),
  qrCodeId: text("qr_code_id")
    .notNull()
    .references(() => qrCodes.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  experimentId: text("experiment_id").references(() => experiments.id, { onDelete: "set null" }),
  experimentVariantId: text("experiment_variant_id").references(() => experimentVariants.id, { onDelete: "set null" }),
  eventType: text("event_type").notNull(), // 'QR_SCAN', 'PAGE_VIEW', 'BUTTON_CLICK', 'LINK_CLICK', 'FORM_SUBMIT', 'CONVERSION', 'EXTERNAL_REDIRECT'
  eventData: jsonb("event_data").$type<Record<string, unknown>>(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

export const conversionGoals = pgTable("conversion_goals", {
  id: text("id").primaryKey(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  name: text("name").notNull(),
  description: text("description"),
  eventType: text("event_type").notNull(), // 'BUTTON_CLICK', 'LINK_CLICK', 'FORM_SUBMIT', 'PAGE_VIEW', 'CONVERSION'
  targetPattern: text("target_pattern"),
  qrCodeId: text("qr_code_id").references(() => qrCodes.id, { onDelete: "set null" }),
  campaignId: text("campaign_id").references(() => campaigns.id, { onDelete: "set null" }),
  monetaryValue: integer("monetary_value").default(0).notNull(), // in cents (e.g. $15.00 -> 1500)
  currency: text("currency").default("USD").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// ---------------------------------------------------------------------------
// Relations
// ---------------------------------------------------------------------------

export const userRelations = relations(user, ({ many }) => ({
  sessions: many(session),
  accounts: many(account),
  campaigns: many(campaigns),
  qrCodes: many(qrCodes),
  routingRules: many(routingRules),
  visitorSessions: many(sessions),
  sessionEvents: many(sessionEvents),
  conversionGoals: many(conversionGoals),
  experiments: many(experiments),
  experimentVariants: many(experimentVariants),
}));

export const sessionRelations = relations(session, ({ one }) => ({
  user: one(user, {
    fields: [session.userId],
    references: [user.id],
  }),
}));

export const accountRelations = relations(account, ({ one }) => ({
  user: one(user, {
    fields: [account.userId],
    references: [user.id],
  }),
}));

export const campaignsRelations = relations(campaigns, ({ one, many }) => ({
  user: one(user, {
    fields: [campaigns.userId],
    references: [user.id],
  }),
  qrCodes: many(qrCodes),
  sessions: many(sessions),
  conversionGoals: many(conversionGoals),
  experiments: many(experiments),
}));

export const qrCodesRelations = relations(qrCodes, ({ one, many }) => ({
  user: one(user, {
    fields: [qrCodes.userId],
    references: [user.id],
  }),
  campaign: one(campaigns, {
    fields: [qrCodes.campaignId],
    references: [campaigns.id],
  }),
  routingRules: many(routingRules),
  sessions: many(sessions),
  sessionEvents: many(sessionEvents),
  conversionGoals: many(conversionGoals),
  experiments: many(experiments),
}));

export const routingRulesRelations = relations(routingRules, ({ one }) => ({
  qrCode: one(qrCodes, {
    fields: [routingRules.qrCodeId],
    references: [qrCodes.id],
  }),
  user: one(user, {
    fields: [routingRules.userId],
    references: [user.id],
  }),
}));

export const experimentsRelations = relations(experiments, ({ one, many }) => ({
  user: one(user, {
    fields: [experiments.userId],
    references: [user.id],
  }),
  qrCode: one(qrCodes, {
    fields: [experiments.qrCodeId],
    references: [qrCodes.id],
  }),
  campaign: one(campaigns, {
    fields: [experiments.campaignId],
    references: [campaigns.id],
  }),
  winnerVariant: one(experimentVariants, {
    fields: [experiments.winnerVariantId],
    references: [experimentVariants.id],
  }),
  variants: many(experimentVariants),
  sessions: many(sessions),
  sessionEvents: many(sessionEvents),
}));

export const experimentVariantsRelations = relations(experimentVariants, ({ one, many }) => ({
  experiment: one(experiments, {
    fields: [experimentVariants.experimentId],
    references: [experiments.id],
  }),
  user: one(user, {
    fields: [experimentVariants.userId],
    references: [user.id],
  }),
  sessions: many(sessions),
  sessionEvents: many(sessionEvents),
}));

export const sessionsRelations = relations(sessions, ({ one, many }) => ({
  qrCode: one(qrCodes, {
    fields: [sessions.qrCodeId],
    references: [qrCodes.id],
  }),
  user: one(user, {
    fields: [sessions.userId],
    references: [user.id],
  }),
  campaign: one(campaigns, {
    fields: [sessions.campaignId],
    references: [campaigns.id],
  }),
  matchedRule: one(routingRules, {
    fields: [sessions.matchedRuleId],
    references: [routingRules.id],
  }),
  experiment: one(experiments, {
    fields: [sessions.experimentId],
    references: [experiments.id],
  }),
  experimentVariant: one(experimentVariants, {
    fields: [sessions.experimentVariantId],
    references: [experimentVariants.id],
  }),
  events: many(sessionEvents),
}));

export const sessionEventsRelations = relations(sessionEvents, ({ one }) => ({
  session: one(sessions, {
    fields: [sessionEvents.sessionId],
    references: [sessions.id],
  }),
  qrCode: one(qrCodes, {
    fields: [sessionEvents.qrCodeId],
    references: [qrCodes.id],
  }),
  user: one(user, {
    fields: [sessionEvents.userId],
    references: [user.id],
  }),
  experiment: one(experiments, {
    fields: [sessionEvents.experimentId],
    references: [experiments.id],
  }),
  experimentVariant: one(experimentVariants, {
    fields: [sessionEvents.experimentVariantId],
    references: [experimentVariants.id],
  }),
}));

export const conversionGoalsRelations = relations(conversionGoals, ({ one }) => ({
  user: one(user, {
    fields: [conversionGoals.userId],
    references: [user.id],
  }),
  qrCode: one(qrCodes, {
    fields: [conversionGoals.qrCodeId],
    references: [qrCodes.id],
  }),
  campaign: one(campaigns, {
    fields: [conversionGoals.campaignId],
    references: [campaigns.id],
  }),
}));

export type User = typeof user.$inferSelect;
export type NewUser = typeof user.$inferInsert;
export type Session = typeof session.$inferSelect;
export type Account = typeof account.$inferSelect;
export type QRCode = typeof qrCodes.$inferSelect;
export type NewQRCode = typeof qrCodes.$inferInsert;
export type Campaign = typeof campaigns.$inferSelect;
export type NewCampaign = typeof campaigns.$inferInsert;
export type RoutingRule = typeof routingRules.$inferSelect;
export type NewRoutingRule = typeof routingRules.$inferInsert;
export type VisitorSession = typeof sessions.$inferSelect;
export type NewVisitorSession = typeof sessions.$inferInsert;
export type SessionEvent = typeof sessionEvents.$inferSelect;
export type NewSessionEvent = typeof sessionEvents.$inferInsert;
export type ConversionGoal = typeof conversionGoals.$inferSelect;
export type NewConversionGoal = typeof conversionGoals.$inferInsert;
export type Experiment = typeof experiments.$inferSelect;
export type NewExperiment = typeof experiments.$inferInsert;
export type ExperimentVariant = typeof experimentVariants.$inferSelect;
export type NewExperimentVariant = typeof experimentVariants.$inferInsert;


