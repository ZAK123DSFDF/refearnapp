DROP INDEX "organization_stripe_account_org_id_idx";--> statement-breakpoint
ALTER TABLE "organization_stripe_account" DROP CONSTRAINT "organization_stripe_account_stripe_account_id_org_id_pk";--> statement-breakpoint
ALTER TABLE "organization_stripe_account" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "stripe_org_unique_idx" ON "organization_stripe_account" USING btree ("stripe_account_id","org_id");