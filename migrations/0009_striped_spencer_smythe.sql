ALTER TABLE "organization_stripe_account" ALTER COLUMN "stripe_account_id" SET NOT NULL;--> statement-breakpoint
ALTER TABLE "organization_stripe_account" ADD COLUMN "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL;--> statement-breakpoint
CREATE UNIQUE INDEX "stripe_org_unique_idx" ON "organization_stripe_account" USING btree ("stripe_account_id","org_id");