# ScanFlow: Dynamic Routing, Redirect Engine & Scan Journey Spec

## 1. Overview & Objectives

This specification covers the implementation of **Features 4, 5, 6, 7, and 8** of ScanFlow Analytics:
1. **Dynamic QR Routing**: Deterministic, condition-based rule evaluator (Device, OS, Country, Language, Time Window).
2. **QR Redirect Engine (`GET /r/:code`)**: High-performance HTTP redirect handler with status enforcement (Active, Paused, Archived), visitor context parsing, and session persistence.
3. **Scan Tracking & Ingestion**: Capturing scan events, visitor device/OS/browser, geo-location, and anonymized IP hash.
4. **Visitor Sessions**: Tracking multi-step session lifecycles, duration, event counts, and conversion status.
5. **Scan Journey (Standout Feature)**: Chronological event timeline (`QR_SCAN` -> `PAGE_VIEW` -> `BUTTON_CLICK` -> `CONVERSION`) and an interactive visual visitor path explorer in the dashboard.

---

## 2. Database Schema (`lib/db/schema.ts`)

### `routing_rules` Table
```typescript
export const routingRules = pgTable("routing_rules", {
  id: text("id").primaryKey(),
  qrCodeId: text("qr_code_id")
    .notNull()
    .references(() => qrCodes.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  priority: integer("priority").default(1).notNull(), // Lower number = evaluated first
  conditionType: text("condition_type").notNull(), // 'device', 'os', 'country', 'language', 'time_window'
  conditionValue: text("condition_value").notNull(), // e.g. 'ios', 'android', 'US', 'id', '{"start":"09:00","end":"17:00"}'
  destinationUrl: text("destination_url").notNull(),
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
```

### `sessions` Table
```typescript
export const sessions = pgTable("sessions", {
  id: text("id").primaryKey(),
  qrCodeId: text("qr_code_id")
    .notNull()
    .references(() => qrCodes.id, { onDelete: "cascade" }),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  campaignId: text("campaign_id").references(() => campaigns.id, { onDelete: "set null" }),
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
```

### `session_events` Table
```typescript
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
  eventType: text("event_type").notNull(), // 'QR_SCAN', 'PAGE_VIEW', 'BUTTON_CLICK', 'LINK_CLICK', 'FORM_SUBMIT', 'CONVERSION', 'EXTERNAL_REDIRECT'
  eventData: jsonb("event_data").$type<Record<string, unknown>>(),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});
```

---

## 3. Dynamic Routing Engine (`lib/routing/engine.ts`)

### Visitor Context Extraction
- **Device & OS Parsing**: Zero-dependency parser matching User-Agent headers to categorize:
  - Device: `mobile` | `tablet` | `desktop` | `bot`
  - OS: `iOS` | `Android` | `macOS` | `Windows` | `Linux` | `Other`
  - Browser: `Chrome` | `Safari` | `Firefox` | `Edge` | `Other`
- **Location Detection**: Evaluates headers in priority order:
  - `x-vercel-ip-country`, `cf-ipcountry`, `x-country-code`, `x-geoip-country`
- **Language Detection**: Parses `accept-language` header (e.g. `id-ID,id;q=0.9,en-US;q=0.8` -> primary `id`).
- **IP Anonymization**: Produces one-way SHA-256 hash `sha256(ip + salt)`.

### Deterministic Rule Evaluator
Given visitor context $V$ and active routing rules $R$ sorted by `priority ASC`:
1. Iterate rules in ascending priority order.
2. Check condition matching:
   - `device`: case-insensitive match on $V.deviceType$ (e.g. `mobile`).
   - `os`: case-insensitive match on $V.os$ (e.g. `ios`, `android`).
   - `country`: case-insensitive match on $V.country$ (e.g. `US`, `ID`).
   - `language`: prefix match on $V.language$ (e.g. `id` matches `id-ID`).
   - `time_window`: parses JSON `{ start: "HH:mm", end: "HH:mm", days?: [0..6] }` against server/UTC time.
3. First matching rule wins and returns `{ destinationUrl, ruleId: rule.id }`.
4. If no rule matches, fallback to default `qrCode.destinationUrl` with `ruleId: null`.

---

## 4. QR Redirect Engine (`app/r/[code]/route.ts`)

1. **Lookup**: Query `qrCodes` where `slug === code`.
2. **Status Gate**:
   - If not found: Render sleek 404 / "QR Not Found" UI.
   - If `status === 'paused'`: Render "QR Code Paused" status page.
   - If `status === 'archived'`: Render "QR Code Archived" status page.
3. **Evaluation**:
   - Fetch active `routingRules` for the QR code.
   - Run `evaluateRoutingRules(visitorContext, rules, qrCode.destinationUrl)`.
4. **Session & Ingestion**:
   - Check `sf_sid` cookie or generate new session ID `nanoid()`.
   - Asynchronously insert/upsert `sessions` record and append initial `session_events` with `eventType: 'QR_SCAN'`.
   - Increment `qrCodes.scanCount`.
5. **Response**:
   - Set HTTP cookie `sf_sid` (`HttpOnly`, `SameSite=Lax`, `Path=/`, `MaxAge=30 days`).
   - Return HTTP `307 Temporary Redirect` to resolved destination URL.

---

## 5. Event Ingestion API (`app/api/track/route.ts`)

Accepts downstream journey events from client sites or demo flows:
- **Endpoint**: `POST /api/track`
- **Payload**:
  ```json
  {
    "sessionId": "sess_123",
    "qrSlug": "summer-menu",
    "eventType": "BUTTON_CLICK",
    "eventData": { "buttonId": "order-now", "page": "/menu" }
  }
  ```
- **Processing**:
  - Validates `sessionId` and looks up corresponding session and QR owner.
  - Inserts event into `session_events`.
  - If `eventType === 'CONVERSION'`, updates `sessions.converted = true` and `sessions.conversionEvent = eventData.name || 'default'`.
  - Recalculates `durationSeconds = now - startedAt` and increments `eventsCount`.

---

## 6. Scan Journey Dashboard UI (`app/dashboard/journeys/page.tsx`)

### Journeys Table Component (`components/journeys/journeys-table.tsx`)
- Displays list of visitor sessions with:
  - Session ID with copy button
  - QR Code name & slug badge
  - Device / OS / Browser with visual icons (Apple, Android, Windows, Chrome, Safari)
  - Geo badge with Country Code flag / name
  - Timestamp (relative & exact hover)
  - Events count badge (e.g. "4 steps")
  - Conversion status badge (🟢 Converted / ⚪ Drop-off)
  - Action button: "View Journey"

### Visual Journey Timeline Drawer/Modal (`components/journeys/journey-detail-sheet.tsx`)
- Interactive step-by-step vertical timeline:
  - **Step 1: QR Scan** (`QR_SCAN`)
    - Scanned at `10:42:03`
    - Device: iPhone 15 Pro, iOS 18, Safari
    - Location: Jakarta, Indonesia (ID)
    - Dynamic Routing: Matched Rule #1 `iOS -> App Store`
    - Directed to destination URL
  - **Step 2: Landing Page View** (`PAGE_VIEW`)
    - Opened at `10:42:06` (+3s)
    - Page: `/menu/summer-special`
  - **Step 3: Interaction** (`BUTTON_CLICK`)
    - Clicked at `10:42:45` (+39s)
    - Target: `Order Bowl Special - $14.50`
  - **Step 4: Conversion Goal** (`CONVERSION`)
    - Converted at `10:43:12` (+27s)
    - Goal: `Checkout Complete`
    - Total Journey Duration: `1m 9s`

---

## 7. Routing Rules Management Dialog (`components/qr/routing-rules-dialog.tsx`)

- Allows users to configure priority rules per QR code:
  - Add Rule: Select Condition (Device, OS, Country, Language), enter match value, enter custom destination URL.
  - Reorder rules / set priority.
  - Toggle rule active/paused.
  - Delete rule.
  - API endpoints: `GET /api/qr-codes/:id/rules`, `POST /api/qr-codes/:id/rules`, `PUT /api/qr-codes/:id/rules/:ruleId`, `DELETE /api/qr-codes/:id/rules/:ruleId`.

---

## 8. Verification & Testing Plan

1. **Unit Tests**:
   - `tests/unit/routing-engine.test.ts`: Test device, OS, country, language, time matching and priority ordering.
   - `tests/unit/redirect.test.ts`: Test `/r/[code]` route handler for active, paused, archived, rule matching, and cookie setting.
   - `tests/unit/track-api.test.ts`: Test `/api/track` event ingestion, session duration calculation, and conversion flagging.
   - `tests/unit/journeys-components.test.tsx`: Test Journeys Table, filter toggles, and Journey Visual Timeline rendering.
2. **End-to-End Flow Verification**:
   - Create QR Code with iOS routing rule -> simulate scan -> verify redirect to iOS URL -> send subsequent journey events -> open Scan Journey in dashboard -> verify visual step-by-step timeline.
