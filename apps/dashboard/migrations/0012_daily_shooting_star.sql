ALTER TABLE "purchase" ADD COLUMN "provider" text DEFAULT 'polar' NOT NULL;--> statement-breakpoint
ALTER TABLE "purchase" ADD COLUMN "provider_order_id" text;--> statement-breakpoint
ALTER TABLE "subscription" ADD COLUMN "provider" text;