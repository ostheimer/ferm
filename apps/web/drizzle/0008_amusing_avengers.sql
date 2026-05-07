CREATE TABLE "member_invitations" (
	"id" text PRIMARY KEY NOT NULL,
	"revier_id" text NOT NULL,
	"invited_by_membership_id" text NOT NULL,
	"first_name" text NOT NULL,
	"last_name" text NOT NULL,
	"email" text,
	"phone" text,
	"role" text NOT NULL,
	"jagdzeichen" text NOT NULL,
	"code_hash" text NOT NULL,
	"token_hash" text NOT NULL,
	"status" text NOT NULL,
	"created_at" timestamp with time zone NOT NULL,
	"expires_at" timestamp with time zone NOT NULL,
	"accepted_at" timestamp with time zone,
	"accepted_by_user_id" text,
	"revoked_at" timestamp with time zone,
	"mail_sent_at" timestamp with time zone
);
--> statement-breakpoint
ALTER TABLE "member_invitations" ADD CONSTRAINT "member_invitations_revier_id_reviere_id_fk" FOREIGN KEY ("revier_id") REFERENCES "public"."reviere"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_invitations" ADD CONSTRAINT "member_invitations_invited_by_membership_id_memberships_id_fk" FOREIGN KEY ("invited_by_membership_id") REFERENCES "public"."memberships"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_invitations" ADD CONSTRAINT "member_invitations_accepted_by_user_id_users_id_fk" FOREIGN KEY ("accepted_by_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "member_invitations_code_hash_unique" ON "member_invitations" USING btree ("code_hash");--> statement-breakpoint
CREATE UNIQUE INDEX "member_invitations_token_hash_unique" ON "member_invitations" USING btree ("token_hash");--> statement-breakpoint
CREATE INDEX "member_invitations_revier_idx" ON "member_invitations" USING btree ("revier_id");--> statement-breakpoint
CREATE INDEX "member_invitations_status_idx" ON "member_invitations" USING btree ("status");--> statement-breakpoint
CREATE INDEX "member_invitations_expires_at_idx" ON "member_invitations" USING btree ("expires_at");