import type { AnsitzStatus, Role } from "@hege/domain";
import { boolean, doublePrecision, index, integer, pgTable, text, timestamp, uniqueIndex } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  email: text("email").notNull()
});

export const reviere = pgTable(
  "reviere",
  {
    id: text("id").primaryKey(),
    tenantKey: text("tenant_key").notNull(),
    name: text("name").notNull(),
    bundesland: text("bundesland").notNull(),
    bezirk: text("bezirk").notNull(),
    flaecheHektar: integer("flaeche_hektar").notNull(),
    zentrumLat: doublePrecision("zentrum_lat").notNull(),
    zentrumLng: doublePrecision("zentrum_lng").notNull(),
    zentrumLabel: text("zentrum_label")
  },
  (table) => [uniqueIndex("reviere_tenant_key_unique").on(table.tenantKey)]
);

export const memberships = pgTable(
  "memberships",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id),
    revierId: text("revier_id")
      .notNull()
      .references(() => reviere.id),
    role: text("role").$type<Role>().notNull(),
    jagdzeichen: text("jagdzeichen").notNull(),
    pushEnabled: boolean("push_enabled").notNull().default(false)
  },
  (table) => [
    index("memberships_revier_idx").on(table.revierId),
    index("memberships_user_idx").on(table.userId)
  ]
);

export const ansitzSessions = pgTable(
  "ansitz_sessions",
  {
    id: text("id").primaryKey(),
    revierId: text("revier_id")
      .notNull()
      .references(() => reviere.id),
    membershipId: text("membership_id")
      .notNull()
      .references(() => memberships.id),
    standortId: text("standort_id"),
    standortName: text("standort_name").notNull(),
    locationLat: doublePrecision("location_lat").notNull(),
    locationLng: doublePrecision("location_lng").notNull(),
    locationLabel: text("location_label"),
    startedAt: timestamp("started_at", { withTimezone: true, mode: "string" }).notNull(),
    plannedEndAt: timestamp("planned_end_at", { withTimezone: true, mode: "string" }),
    endedAt: timestamp("ended_at", { withTimezone: true, mode: "string" }),
    note: text("note"),
    status: text("status").$type<AnsitzStatus>().notNull(),
    conflict: boolean("conflict").notNull().default(false)
  },
  (table) => [
    index("ansitz_sessions_revier_idx").on(table.revierId),
    index("ansitz_sessions_revier_status_idx").on(table.revierId, table.status),
    index("ansitz_sessions_started_at_idx").on(table.startedAt)
  ]
);

export type UserRecord = typeof users.$inferSelect;
export type RevierRecord = typeof reviere.$inferSelect;
export type MembershipRecord = typeof memberships.$inferSelect;
export type AnsitzSessionRecord = typeof ansitzSessions.$inferSelect;
