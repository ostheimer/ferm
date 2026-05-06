CREATE TABLE "aufgabe_assignees" (
	"id" text PRIMARY KEY NOT NULL,
	"aufgabe_id" text NOT NULL,
	"membership_id" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "aufgaben" (
	"id" text PRIMARY KEY NOT NULL,
	"revier_id" text NOT NULL,
	"created_by_membership_id" text NOT NULL,
	"source_type" text,
	"source_id" text,
	"title" text NOT NULL,
	"description" text,
	"status" text NOT NULL,
	"priority" text NOT NULL,
	"due_at" timestamp with time zone,
	"completed_at" timestamp with time zone,
	"completion_note" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviermeldungen" (
	"id" text PRIMARY KEY NOT NULL,
	"revier_id" text NOT NULL,
	"created_by_membership_id" text NOT NULL,
	"category" text NOT NULL,
	"status" text NOT NULL,
	"occurred_at" timestamp with time zone NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"location_lat" double precision,
	"location_lng" double precision,
	"location_label" text,
	"related_type" text,
	"related_id" text,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "aufgabe_assignees" ADD CONSTRAINT "aufgabe_assignees_aufgabe_id_aufgaben_id_fk" FOREIGN KEY ("aufgabe_id") REFERENCES "public"."aufgaben"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aufgabe_assignees" ADD CONSTRAINT "aufgabe_assignees_membership_id_memberships_id_fk" FOREIGN KEY ("membership_id") REFERENCES "public"."memberships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aufgaben" ADD CONSTRAINT "aufgaben_revier_id_reviere_id_fk" FOREIGN KEY ("revier_id") REFERENCES "public"."reviere"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "aufgaben" ADD CONSTRAINT "aufgaben_created_by_membership_id_memberships_id_fk" FOREIGN KEY ("created_by_membership_id") REFERENCES "public"."memberships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviermeldungen" ADD CONSTRAINT "reviermeldungen_revier_id_reviere_id_fk" FOREIGN KEY ("revier_id") REFERENCES "public"."reviere"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reviermeldungen" ADD CONSTRAINT "reviermeldungen_created_by_membership_id_memberships_id_fk" FOREIGN KEY ("created_by_membership_id") REFERENCES "public"."memberships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "aufgabe_assignees_aufgabe_idx" ON "aufgabe_assignees" USING btree ("aufgabe_id");--> statement-breakpoint
CREATE INDEX "aufgabe_assignees_membership_idx" ON "aufgabe_assignees" USING btree ("membership_id");--> statement-breakpoint
CREATE UNIQUE INDEX "aufgabe_assignees_unique" ON "aufgabe_assignees" USING btree ("aufgabe_id","membership_id");--> statement-breakpoint
CREATE INDEX "aufgaben_revier_idx" ON "aufgaben" USING btree ("revier_id");--> statement-breakpoint
CREATE INDEX "aufgaben_revier_status_idx" ON "aufgaben" USING btree ("revier_id","status");--> statement-breakpoint
CREATE INDEX "aufgaben_due_at_idx" ON "aufgaben" USING btree ("due_at");--> statement-breakpoint
CREATE INDEX "aufgaben_created_by_idx" ON "aufgaben" USING btree ("created_by_membership_id");--> statement-breakpoint
CREATE INDEX "aufgaben_source_idx" ON "aufgaben" USING btree ("source_type","source_id");--> statement-breakpoint
CREATE INDEX "reviermeldungen_revier_idx" ON "reviermeldungen" USING btree ("revier_id");--> statement-breakpoint
CREATE INDEX "reviermeldungen_revier_status_idx" ON "reviermeldungen" USING btree ("revier_id","status");--> statement-breakpoint
CREATE INDEX "reviermeldungen_occurred_at_idx" ON "reviermeldungen" USING btree ("occurred_at");--> statement-breakpoint
CREATE INDEX "reviermeldungen_created_by_idx" ON "reviermeldungen" USING btree ("created_by_membership_id");