CREATE TABLE "dokumente" (
	"id" text PRIMARY KEY NOT NULL,
	"sitzung_id" text,
	"version_id" text,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"file_name" text NOT NULL,
	"content_type" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "notifications" (
	"id" text PRIMARY KEY NOT NULL,
	"revier_id" text NOT NULL,
	"channel" text NOT NULL,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "beschluesse" (
	"id" text PRIMARY KEY NOT NULL,
	"version_id" text NOT NULL,
	"title" text NOT NULL,
	"decision" text NOT NULL,
	"owner" text,
	"due_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "protokoll_versionen" (
	"id" text PRIMARY KEY NOT NULL,
	"sitzung_id" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"created_by_membership_id" text NOT NULL,
	"summary" text NOT NULL,
	"agenda_text" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviereinrichtung_kontrollen" (
	"id" text PRIMARY KEY NOT NULL,
	"einrichtung_id" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"created_by_membership_id" text NOT NULL,
	"zustand" text NOT NULL,
	"note" text
);
--> statement-breakpoint
CREATE TABLE "reviereinrichtung_wartungen" (
	"id" text PRIMARY KEY NOT NULL,
	"einrichtung_id" text NOT NULL,
	"due_at" timestamp with time zone NOT NULL,
	"status" text NOT NULL,
	"title" text NOT NULL,
	"note" text
);
--> statement-breakpoint
CREATE TABLE "reviereinrichtungen" (
	"id" text PRIMARY KEY NOT NULL,
	"revier_id" text NOT NULL,
	"type" text NOT NULL,
	"name" text NOT NULL,
	"status" text NOT NULL,
	"location_lat" double precision NOT NULL,
	"location_lng" double precision NOT NULL,
	"location_label" text,
	"beschreibung" text
);
--> statement-breakpoint
CREATE TABLE "sitzung_teilnehmer" (
	"id" text PRIMARY KEY NOT NULL,
	"sitzung_id" text NOT NULL,
	"membership_id" text NOT NULL,
	"anwesend" boolean NOT NULL
);
--> statement-breakpoint
CREATE TABLE "sitzungen" (
	"id" text PRIMARY KEY NOT NULL,
	"revier_id" text NOT NULL,
	"title" text NOT NULL,
	"scheduled_at" timestamp with time zone NOT NULL,
	"location_label" text NOT NULL,
	"status" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "users" ADD COLUMN "password_hash" text;--> statement-breakpoint
UPDATE "users"
SET "password_hash" = 'scrypt$hege-demo-salt$acdd192be7789843359593f6372f64958e4897039fc8a96546431b3d290dbea27ac99ffcc773d1daf94914082c655425be7be0fb043a7cffe4b503fc00e74a13'
WHERE "password_hash" IS NULL;--> statement-breakpoint
ALTER TABLE "users" ALTER COLUMN "password_hash" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "dokumente" ADD CONSTRAINT "dokumente_sitzung_id_sitzungen_id_fk" FOREIGN KEY ("sitzung_id") REFERENCES "public"."sitzungen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "dokumente" ADD CONSTRAINT "dokumente_version_id_protokoll_versionen_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."protokoll_versionen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "notifications" ADD CONSTRAINT "notifications_revier_id_reviere_id_fk" FOREIGN KEY ("revier_id") REFERENCES "public"."reviere"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "beschluesse" ADD CONSTRAINT "beschluesse_version_id_protokoll_versionen_id_fk" FOREIGN KEY ("version_id") REFERENCES "public"."protokoll_versionen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "protokoll_versionen" ADD CONSTRAINT "protokoll_versionen_sitzung_id_sitzungen_id_fk" FOREIGN KEY ("sitzung_id") REFERENCES "public"."sitzungen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "protokoll_versionen" ADD CONSTRAINT "protokoll_versionen_created_by_membership_id_memberships_id_fk" FOREIGN KEY ("created_by_membership_id") REFERENCES "public"."memberships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviereinrichtung_kontrollen" ADD CONSTRAINT "reviereinrichtung_kontrollen_einrichtung_id_reviereinrichtungen_id_fk" FOREIGN KEY ("einrichtung_id") REFERENCES "public"."reviereinrichtungen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviereinrichtung_kontrollen" ADD CONSTRAINT "reviereinrichtung_kontrollen_created_by_membership_id_memberships_id_fk" FOREIGN KEY ("created_by_membership_id") REFERENCES "public"."memberships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviereinrichtung_wartungen" ADD CONSTRAINT "reviereinrichtung_wartungen_einrichtung_id_reviereinrichtungen_id_fk" FOREIGN KEY ("einrichtung_id") REFERENCES "public"."reviereinrichtungen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviereinrichtungen" ADD CONSTRAINT "reviereinrichtungen_revier_id_reviere_id_fk" FOREIGN KEY ("revier_id") REFERENCES "public"."reviere"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sitzung_teilnehmer" ADD CONSTRAINT "sitzung_teilnehmer_sitzung_id_sitzungen_id_fk" FOREIGN KEY ("sitzung_id") REFERENCES "public"."sitzungen"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sitzung_teilnehmer" ADD CONSTRAINT "sitzung_teilnehmer_membership_id_memberships_id_fk" FOREIGN KEY ("membership_id") REFERENCES "public"."memberships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sitzungen" ADD CONSTRAINT "sitzungen_revier_id_reviere_id_fk" FOREIGN KEY ("revier_id") REFERENCES "public"."reviere"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "dokumente_sitzung_idx" ON "dokumente" USING btree ("sitzung_id");--> statement-breakpoint
CREATE INDEX "dokumente_version_idx" ON "dokumente" USING btree ("version_id");--> statement-breakpoint
CREATE INDEX "dokumente_kind_idx" ON "dokumente" USING btree ("kind");--> statement-breakpoint
CREATE INDEX "notifications_revier_idx" ON "notifications" USING btree ("revier_id");--> statement-breakpoint
CREATE INDEX "notifications_created_at_idx" ON "notifications" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "beschluesse_version_idx" ON "beschluesse" USING btree ("version_id");--> statement-breakpoint
CREATE INDEX "beschluesse_due_at_idx" ON "beschluesse" USING btree ("due_at");--> statement-breakpoint
CREATE INDEX "protokoll_versionen_sitzung_idx" ON "protokoll_versionen" USING btree ("sitzung_id");--> statement-breakpoint
CREATE INDEX "protokoll_versionen_created_at_idx" ON "protokoll_versionen" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "reviereinrichtung_kontrollen_einrichtung_idx" ON "reviereinrichtung_kontrollen" USING btree ("einrichtung_id");--> statement-breakpoint
CREATE INDEX "reviereinrichtung_kontrollen_created_at_idx" ON "reviereinrichtung_kontrollen" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "reviereinrichtung_wartungen_einrichtung_idx" ON "reviereinrichtung_wartungen" USING btree ("einrichtung_id");--> statement-breakpoint
CREATE INDEX "reviereinrichtung_wartungen_due_at_idx" ON "reviereinrichtung_wartungen" USING btree ("due_at");--> statement-breakpoint
CREATE INDEX "reviereinrichtungen_revier_idx" ON "reviereinrichtungen" USING btree ("revier_id");--> statement-breakpoint
CREATE INDEX "reviereinrichtungen_status_idx" ON "reviereinrichtungen" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sitzung_teilnehmer_sitzung_idx" ON "sitzung_teilnehmer" USING btree ("sitzung_id");--> statement-breakpoint
CREATE INDEX "sitzung_teilnehmer_membership_idx" ON "sitzung_teilnehmer" USING btree ("membership_id");--> statement-breakpoint
CREATE INDEX "sitzungen_revier_idx" ON "sitzungen" USING btree ("revier_id");--> statement-breakpoint
CREATE INDEX "sitzungen_status_idx" ON "sitzungen" USING btree ("status");--> statement-breakpoint
CREATE INDEX "sitzungen_scheduled_at_idx" ON "sitzungen" USING btree ("scheduled_at");
