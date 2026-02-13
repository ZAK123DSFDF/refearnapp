DROP INDEX "organization_stripe_account_org_id_created_at_idx";--> statement-breakpoint
DROP INDEX "organization_stripe_account_created_at_idx";--> statement-breakpoint
/* 
    Unfortunately in current drizzle-kit version we can't automatically get name for primary key.
    We are working on making it available!

    Meanwhile you can:
        1. Check pk name in your database, by running
            SELECT constraint_name FROM information_schema.table_constraints
            WHERE table_schema = 'public'
                AND table_name = 'organization_stripe_account'
                AND constraint_type = 'PRIMARY KEY';
        2. Uncomment code below and paste pk name manually
        
    Hope to release this update as soon as possible
*/

-- ALTER TABLE "organization_stripe_account" DROP CONSTRAINT "<constraint_name>";--> statement-breakpoint
ALTER TABLE "organization_stripe_account" ADD CONSTRAINT "organization_stripe_account_stripe_account_id_org_id_pk" PRIMARY KEY("stripe_account_id","org_id");--> statement-breakpoint
CREATE INDEX "organization_stripe_account_org_id_idx" ON "organization_stripe_account" USING btree ("org_id");