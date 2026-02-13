ALTER TABLE "organization_stripe_account" ALTER COLUMN "stripe_account_id" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "organization_stripe_account" DROP COLUMN "id";