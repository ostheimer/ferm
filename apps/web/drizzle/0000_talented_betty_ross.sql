CREATE TABLE "ansitz_sessions" (
	"id" text PRIMARY KEY NOT NULL,
	"revier_id" text NOT NULL,
	"membership_id" text NOT NULL,
	"standort_id" text,
	"standort_name" text NOT NULL,
	"location_lat" double precision NOT NULL,
	"location_lng" double precision NOT NULL,
	"location_label" text,
	"started_at" timestamp with time zone NOT NULL,
	"planned_end_at" timestamp with time zone,
	"ended_at" timestamp with time zone,
	"note" text,
	"status" text NOT NULL,
	"conflict" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "memberships" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" text NOT NULL,
	"revier_id" text NOT NULL,
	"role" text NOT NULL,
	"jagdzeichen" text NOT NULL,
	"push_enabled" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "reviere" (
	"id" text PRIMARY KEY NOT NULL,
	"tenant_key" text NOT NULL,
	"name" text NOT NULL,
	"bundesland" text NOT NULL,
	"bezirk" text NOT NULL,
	"flaeche_hektar" integer NOT NULL,
	"zentrum_lat" double precision NOT NULL,
	"zentrum_lng" double precision NOT NULL,
	"zentrum_label" text
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"email" text NOT NULL
);
--> statement-breakpoint
ALTER TABLE "ansitz_sessions" ADD CONSTRAINT "ansitz_sessions_revier_id_reviere_id_fk" FOREIGN KEY ("revier_id") REFERENCES "public"."reviere"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ansitz_sessions" ADD CONSTRAINT "ansitz_sessions_membership_id_memberships_id_fk" FOREIGN KEY ("membership_id") REFERENCES "public"."memberships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_user_id_users_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "memberships" ADD CONSTRAINT "memberships_revier_id_reviere_id_fk" FOREIGN KEY ("revier_id") REFERENCES "public"."reviere"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "ansitz_sessions_revier_idx" ON "ansitz_sessions" USING btree ("revier_id");--> statement-breakpoint
CREATE INDEX "ansitz_sessions_revier_status_idx" ON "ansitz_sessions" USING btree ("revier_id","status");--> statement-breakpoint
CREATE INDEX "ansitz_sessions_started_at_idx" ON "ansitz_sessions" USING btree ("started_at");--> statement-breakpoint
CREATE INDEX "memberships_revier_idx" ON "memberships" USING btree ("revier_id");--> statement-breakpoint
CREATE INDEX "memberships_user_idx" ON "memberships" USING btree ("user_id");--> statement-breakpoint
CREATE UNIQUE INDEX "reviere_tenant_key_unique" ON "reviere" USING btree ("tenant_key");