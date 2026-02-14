CREATE TYPE "public"."value_type" AS ENUM('PERCENTAGE', 'FLAT_FEE');--> statement-breakpoint
CREATE TABLE "promotion_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(255) NOT NULL,
	"external_id" varchar(255) NOT NULL,
	"stripe_coupon_id" varchar(255),
	"provider" "payment_provider" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"discount_type" "value_type" NOT NULL,
	"discount_value" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"commission_type" "value_type" DEFAULT 'PERCENTAGE' NOT NULL,
	"commission_value" numeric(10, 2) NOT NULL,
	"total_sales" integer DEFAULT 0 NOT NULL,
	"total_revenue_generated" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"affiliate_id" uuid,
	"is_seen_by_affiliate" boolean DEFAULT false NOT NULL,
	"organization_id" text NOT NULL,
	"deleted_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "promotion_codes" ADD CONSTRAINT "promotion_codes_affiliate_id_affiliate_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."affiliate"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promotion_codes" ADD CONSTRAINT "promotion_codes_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "promotion_codes_external_id_idx" ON "promotion_codes" USING btree ("external_id");--> statement-breakpoint
CREATE INDEX "promotion_codes_organization_id_idx" ON "promotion_codes" USING btree ("organization_id");--> statement-breakpoint
CREATE UNIQUE INDEX "promo_org_unique_idx" ON "promotion_codes" USING btree ("external_id","organization_id");