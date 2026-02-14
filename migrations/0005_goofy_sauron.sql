ALTER TABLE "promotion_codes" ADD COLUMN "is_seen_by_affiliate" boolean DEFAULT false NOT NULL;--> statement-breakpoint
ALTER TABLE "promotion_codes" ADD COLUMN "deleted_at" timestamp;