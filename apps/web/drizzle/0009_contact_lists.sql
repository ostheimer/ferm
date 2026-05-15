CREATE TABLE "contact_lists" (
	"id" text PRIMARY KEY NOT NULL,
	"revier_id" text NOT NULL,
	"title" text NOT NULL,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
CREATE TABLE "contact_entries" (
	"id" text PRIMARY KEY NOT NULL,
	"list_id" text NOT NULL,
	"revier_id" text NOT NULL,
	"membership_id" text,
	"name" text,
	"phone" text,
	"revier" text,
	"funktion" text,
	"note" text,
	"position" integer DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"updated_at" timestamp with time zone NOT NULL
);
--> statement-breakpoint
ALTER TABLE "contact_lists" ADD CONSTRAINT "contact_lists_revier_id_reviere_id_fk" FOREIGN KEY ("revier_id") REFERENCES "public"."reviere"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_entries" ADD CONSTRAINT "contact_entries_list_id_contact_lists_id_fk" FOREIGN KEY ("list_id") REFERENCES "public"."contact_lists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_entries" ADD CONSTRAINT "contact_entries_revier_id_reviere_id_fk" FOREIGN KEY ("revier_id") REFERENCES "public"."reviere"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "contact_entries" ADD CONSTRAINT "contact_entries_membership_id_memberships_id_fk" FOREIGN KEY ("membership_id") REFERENCES "public"."memberships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "contact_lists_revier_idx" ON "contact_lists" USING btree ("revier_id");--> statement-breakpoint
CREATE INDEX "contact_lists_position_idx" ON "contact_lists" USING btree ("revier_id","position");--> statement-breakpoint
CREATE INDEX "contact_entries_list_idx" ON "contact_entries" USING btree ("list_id");--> statement-breakpoint
CREATE INDEX "contact_entries_revier_idx" ON "contact_entries" USING btree ("revier_id");--> statement-breakpoint
CREATE INDEX "contact_entries_membership_idx" ON "contact_entries" USING btree ("membership_id");--> statement-breakpoint
CREATE INDEX "contact_entries_position_idx" ON "contact_entries" USING btree ("list_id","position");--> statement-breakpoint
CREATE UNIQUE INDEX "contact_entries_list_membership_unique" ON "contact_entries" USING btree ("list_id","membership_id");
