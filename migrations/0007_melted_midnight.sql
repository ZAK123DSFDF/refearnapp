DROP INDEX "stripe_org_unique_idx";--> statement-breakpoint
ALTER TABLE "organization_stripe_account" ALTER COLUMN "stripe_account_id" SET NOT NULL;