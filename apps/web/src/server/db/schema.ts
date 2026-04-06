import type {
  Altersklasse,
  AnsitzStatus,
  BergungsStatus,
  EinrichtungTyp,
  EinrichtungZustand,
  Geschlecht,
  NotificationChannel,
  ProtokollStatus,
  Role,
  Wildart
} from "@hege/domain";
import {
  boolean,
  doublePrecision,
  index,
  integer,
  pgTable,
  text,
  timestamp,
  uniqueIndex
} from "drizzle-orm/pg-core";

export const users = pgTable(
  "users",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    phone: text("phone").notNull(),
    email: text("email").notNull(),
    username: text("username").notNull(),
    passwordHash: text("password_hash").notNull()
  },
  (table) => [
    uniqueIndex("users_email_unique").on(table.email),
    uniqueIndex("users_username_unique").on(table.username)
  ]
);

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

export const fallwildVorgaenge = pgTable(
  "fallwild_vorgaenge",
  {
    id: text("id").primaryKey(),
    revierId: text("revier_id")
      .notNull()
      .references(() => reviere.id),
    reportedByMembershipId: text("reported_by_membership_id")
      .notNull()
      .references(() => memberships.id),
    recordedAt: timestamp("recorded_at", { withTimezone: true, mode: "string" }).notNull(),
    locationLat: doublePrecision("location_lat").notNull(),
    locationLng: doublePrecision("location_lng").notNull(),
    locationLabel: text("location_label"),
    wildart: text("wildart").$type<Wildart>().notNull(),
    geschlecht: text("geschlecht").$type<Geschlecht>().notNull(),
    altersklasse: text("altersklasse").$type<Altersklasse>().notNull(),
    bergungsStatus: text("bergungs_status").$type<BergungsStatus>().notNull(),
    gemeinde: text("gemeinde").notNull(),
    strasse: text("strasse"),
    note: text("note")
  },
  (table) => [
    index("fallwild_vorgaenge_revier_idx").on(table.revierId),
    index("fallwild_vorgaenge_recorded_at_idx").on(table.recordedAt),
    index("fallwild_vorgaenge_reported_by_idx").on(table.reportedByMembershipId)
  ]
);

export const mediaAssets = pgTable(
  "media_assets",
  {
    id: text("id").primaryKey(),
    revierId: text("revier_id")
      .notNull()
      .references(() => reviere.id),
    entityType: text("entity_type").$type<"fallwild">().notNull(),
    entityId: text("entity_id").notNull(),
    uploadedByMembershipId: text("uploaded_by_membership_id")
      .notNull()
      .references(() => memberships.id),
    title: text("title").notNull(),
    objectKey: text("object_key").notNull(),
    fileName: text("file_name").notNull(),
    contentType: text("content_type").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull()
  },
  (table) => [
    index("media_assets_revier_idx").on(table.revierId),
    index("media_assets_entity_idx").on(table.entityType, table.entityId),
    index("media_assets_uploaded_by_idx").on(table.uploadedByMembershipId)
  ]
);

export const notifications = pgTable(
  "notifications",
  {
    id: text("id").primaryKey(),
    revierId: text("revier_id")
      .notNull()
      .references(() => reviere.id),
    channel: text("channel").$type<NotificationChannel>().notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull()
  },
  (table) => [
    index("notifications_revier_idx").on(table.revierId),
    index("notifications_created_at_idx").on(table.createdAt)
  ]
);

export const reviereinrichtungen = pgTable(
  "reviereinrichtungen",
  {
    id: text("id").primaryKey(),
    revierId: text("revier_id")
      .notNull()
      .references(() => reviere.id),
    type: text("type").$type<EinrichtungTyp>().notNull(),
    name: text("name").notNull(),
    status: text("status").$type<EinrichtungZustand>().notNull(),
    locationLat: doublePrecision("location_lat").notNull(),
    locationLng: doublePrecision("location_lng").notNull(),
    locationLabel: text("location_label"),
    beschreibung: text("beschreibung")
  },
  (table) => [
    index("reviereinrichtungen_revier_idx").on(table.revierId),
    index("reviereinrichtungen_status_idx").on(table.status)
  ]
);

export const reviereinrichtungKontrollen = pgTable(
  "reviereinrichtung_kontrollen",
  {
    id: text("id").primaryKey(),
    einrichtungId: text("einrichtung_id")
      .notNull()
      .references(() => reviereinrichtungen.id),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull(),
    createdByMembershipId: text("created_by_membership_id")
      .notNull()
      .references(() => memberships.id),
    zustand: text("zustand").$type<EinrichtungZustand>().notNull(),
    note: text("note")
  },
  (table) => [
    index("reviereinrichtung_kontrollen_einrichtung_idx").on(table.einrichtungId),
    index("reviereinrichtung_kontrollen_created_at_idx").on(table.createdAt)
  ]
);

export const reviereinrichtungWartungen = pgTable(
  "reviereinrichtung_wartungen",
  {
    id: text("id").primaryKey(),
    einrichtungId: text("einrichtung_id")
      .notNull()
      .references(() => reviereinrichtungen.id),
    dueAt: timestamp("due_at", { withTimezone: true, mode: "string" }).notNull(),
    status: text("status").$type<"offen" | "erledigt">().notNull(),
    title: text("title").notNull(),
    note: text("note")
  },
  (table) => [
    index("reviereinrichtung_wartungen_einrichtung_idx").on(table.einrichtungId),
    index("reviereinrichtung_wartungen_due_at_idx").on(table.dueAt)
  ]
);

export const sitzungen = pgTable(
  "sitzungen",
  {
    id: text("id").primaryKey(),
    revierId: text("revier_id")
      .notNull()
      .references(() => reviere.id),
    title: text("title").notNull(),
    scheduledAt: timestamp("scheduled_at", { withTimezone: true, mode: "string" }).notNull(),
    locationLabel: text("location_label").notNull(),
    status: text("status").$type<ProtokollStatus>().notNull()
  },
  (table) => [
    index("sitzungen_revier_idx").on(table.revierId),
    index("sitzungen_status_idx").on(table.status),
    index("sitzungen_scheduled_at_idx").on(table.scheduledAt)
  ]
);

export const sitzungTeilnehmer = pgTable(
  "sitzung_teilnehmer",
  {
    id: text("id").primaryKey(),
    sitzungId: text("sitzung_id")
      .notNull()
      .references(() => sitzungen.id),
    membershipId: text("membership_id")
      .notNull()
      .references(() => memberships.id),
    anwesend: boolean("anwesend").notNull()
  },
  (table) => [
    index("sitzung_teilnehmer_sitzung_idx").on(table.sitzungId),
    index("sitzung_teilnehmer_membership_idx").on(table.membershipId)
  ]
);

export const protokollVersionen = pgTable(
  "protokoll_versionen",
  {
    id: text("id").primaryKey(),
    sitzungId: text("sitzung_id")
      .notNull()
      .references(() => sitzungen.id),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull(),
    createdByMembershipId: text("created_by_membership_id")
      .notNull()
      .references(() => memberships.id),
    summary: text("summary").notNull(),
    agendaText: text("agenda_text").notNull()
  },
  (table) => [
    index("protokoll_versionen_sitzung_idx").on(table.sitzungId),
    index("protokoll_versionen_created_at_idx").on(table.createdAt)
  ]
);

export const protokollBeschluesse = pgTable(
  "beschluesse",
  {
    id: text("id").primaryKey(),
    versionId: text("version_id")
      .notNull()
      .references(() => protokollVersionen.id),
    title: text("title").notNull(),
    decision: text("decision").notNull(),
    owner: text("owner"),
    dueAt: timestamp("due_at", { withTimezone: true, mode: "string" })
  },
  (table) => [
    index("beschluesse_version_idx").on(table.versionId),
    index("beschluesse_due_at_idx").on(table.dueAt)
  ]
);

export const dokumente = pgTable(
  "dokumente",
  {
    id: text("id").primaryKey(),
    sitzungId: text("sitzung_id").references(() => sitzungen.id),
    versionId: text("version_id").references(() => protokollVersionen.id),
    kind: text("kind").$type<"published-protocol" | "attachment">().notNull(),
    title: text("title").notNull(),
    fileName: text("file_name").notNull(),
    contentType: text("content_type").notNull(),
    createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull()
  },
  (table) => [
    index("dokumente_sitzung_idx").on(table.sitzungId),
    index("dokumente_version_idx").on(table.versionId),
    index("dokumente_kind_idx").on(table.kind)
  ]
);

export type UserRecord = typeof users.$inferSelect;
export type RevierRecord = typeof reviere.$inferSelect;
export type MembershipRecord = typeof memberships.$inferSelect;
export type AnsitzSessionRecord = typeof ansitzSessions.$inferSelect;
export type FallwildVorgangRecord = typeof fallwildVorgaenge.$inferSelect;
export type MediaAssetRecord = typeof mediaAssets.$inferSelect;
export type NotificationRecord = typeof notifications.$inferSelect;
export type ReviereinrichtungRecord = typeof reviereinrichtungen.$inferSelect;
export type ReviereinrichtungKontrolleRecord = typeof reviereinrichtungKontrollen.$inferSelect;
export type ReviereinrichtungWartungRecord = typeof reviereinrichtungWartungen.$inferSelect;
export type SitzungRecord = typeof sitzungen.$inferSelect;
export type SitzungTeilnehmerRecord = typeof sitzungTeilnehmer.$inferSelect;
export type ProtokollVersionRecord = typeof protokollVersionen.$inferSelect;
export type ProtokollBeschlussRecord = typeof protokollBeschluesse.$inferSelect;
export type DokumentRecord = typeof dokumente.$inferSelect;
