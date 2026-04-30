ALTER TABLE "fallwild_vorgaenge" ADD COLUMN "location_accuracy_meters" double precision;--> statement-breakpoint
ALTER TABLE "fallwild_vorgaenge" ADD COLUMN "location_source" text;--> statement-breakpoint
ALTER TABLE "fallwild_vorgaenge" ADD COLUMN "address_label" text;--> statement-breakpoint
ALTER TABLE "fallwild_vorgaenge" ADD COLUMN "google_place_id" text;--> statement-breakpoint
ALTER TABLE "fallwild_vorgaenge" ADD COLUMN "road_name" text;--> statement-breakpoint
ALTER TABLE "fallwild_vorgaenge" ADD COLUMN "road_kilometer" text;--> statement-breakpoint
ALTER TABLE "fallwild_vorgaenge" ADD COLUMN "road_kilometer_source" text;--> statement-breakpoint
ALTER TABLE "fallwild_vorgaenge" ADD COLUMN "road_place_id" text;