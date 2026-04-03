CREATE TABLE "fallwild_vorgaenge" (
	"id" text PRIMARY KEY NOT NULL,
	"revier_id" text NOT NULL,
	"reported_by_membership_id" text NOT NULL,
	"recorded_at" timestamp with time zone NOT NULL,
	"location_lat" double precision NOT NULL,
	"location_lng" double precision NOT NULL,
	"location_label" text,
	"wildart" text NOT NULL,
	"geschlecht" text NOT NULL,
	"altersklasse" text NOT NULL,
	"bergungs_status" text NOT NULL,
	"gemeinde" text NOT NULL,
	"strasse" text,
	"note" text
);
--> statement-breakpoint
ALTER TABLE "fallwild_vorgaenge" ADD CONSTRAINT "fallwild_vorgaenge_revier_id_reviere_id_fk" FOREIGN KEY ("revier_id") REFERENCES "public"."reviere"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "fallwild_vorgaenge" ADD CONSTRAINT "fallwild_vorgaenge_reported_by_membership_id_memberships_id_fk" FOREIGN KEY ("reported_by_membership_id") REFERENCES "public"."memberships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "fallwild_vorgaenge_revier_idx" ON "fallwild_vorgaenge" USING btree ("revier_id");--> statement-breakpoint
CREATE INDEX "fallwild_vorgaenge_recorded_at_idx" ON "fallwild_vorgaenge" USING btree ("recorded_at");--> statement-breakpoint
CREATE INDEX "fallwild_vorgaenge_reported_by_idx" ON "fallwild_vorgaenge" USING btree ("reported_by_membership_id");