CREATE TYPE "public"."account_type" AS ENUM('ORGANIZATION', 'AFFILIATE');--> statement-breakpoint
CREATE TYPE "public"."affiliate_invoice_reason" AS ENUM('subscription_create', 'subscription_update', 'one_time', 'refund', 'manual_adjustment', 'placeholder_from_charge', 'trial_start');--> statement-breakpoint
CREATE TYPE "public"."attribution_model" AS ENUM('FIRST_CLICK', 'LAST_CLICK');--> statement-breakpoint
CREATE TYPE "public"."billing_interval" AS ENUM('MONTHLY', 'YEARLY');--> statement-breakpoint
CREATE TYPE "public"."currency" AS ENUM('USD', 'EUR', 'GBP', 'CAD', 'AUD');--> statement-breakpoint
CREATE TYPE "public"."dns_status" AS ENUM('Pending', 'Verified', 'Failed');--> statement-breakpoint
CREATE TYPE "public"."domain_type" AS ENUM('DEFAULT', 'CUSTOM_DOMAIN', 'CUSTOM_SUBDOMAIN');--> statement-breakpoint
CREATE TYPE "public"."payment_provider" AS ENUM('stripe', 'paddle');--> statement-breakpoint
CREATE TYPE "public"."payout_provider" AS ENUM('paypal', 'wise', 'payoneer');--> statement-breakpoint
CREATE TYPE "public"."plan" AS ENUM('FREE', 'PRO', 'ULTIMATE');--> statement-breakpoint
CREATE TYPE "public"."provider" AS ENUM('credentials', 'google');--> statement-breakpoint
CREATE TYPE "public"."purchase_reason" AS ENUM('UPGRADE_NO_BILL', 'UPGRADE_PRORATED', 'DOWNGRADE_NO_BILL', 'DOWNGRADE_IMMEDIATE', 'CONVERT_TO_ONE_TIME');--> statement-breakpoint
CREATE TYPE "public"."purchase_tier" AS ENUM('PRO', 'ULTIMATE');--> statement-breakpoint
CREATE TYPE "public"."referral_param_enum" AS ENUM('ref', 'via', 'aff');--> statement-breakpoint
CREATE TYPE "public"."role" AS ENUM('OWNER', 'ADMIN', 'TEAM');--> statement-breakpoint
CREATE TYPE "public"."support_type" AS ENUM('FEEDBACK', 'SUPPORT');--> statement-breakpoint
CREATE TYPE "public"."value_type" AS ENUM('PERCENTAGE', 'FLAT_FEE');--> statement-breakpoint
CREATE TABLE "account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" uuid NOT NULL,
	"provider" "provider" NOT NULL,
	"provider_account_id" text NOT NULL,
	"email_verified" timestamp,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "affiliate" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"type" "account_type" DEFAULT 'AFFILIATE' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"organization_id" text NOT NULL,
	CONSTRAINT "affiliate_org_email_unique" UNIQUE("organization_id","email")
);
--> statement-breakpoint
CREATE TABLE "affiliate_account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"affiliate_id" uuid NOT NULL,
	"provider" "provider" NOT NULL,
	"provider_account_id" text NOT NULL,
	"email_verified" timestamp,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "affiliate_click" (
	"id" text PRIMARY KEY NOT NULL,
	"affiliate_link_id" text NOT NULL,
	"click_count" integer DEFAULT 1,
	"referrer" text DEFAULT 'unknown' NOT NULL,
	"device_type" text,
	"browser" text,
	"os" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "affiliate_invoice" (
	"id" text PRIMARY KEY NOT NULL,
	"payment_provider" "payment_provider" NOT NULL,
	"transaction_id" text,
	"subscription_id" text,
	"customer_id" text NOT NULL,
	"amount" numeric(10, 2) NOT NULL,
	"currency" "currency" NOT NULL,
	"raw_amount" numeric(10, 2) DEFAULT '0',
	"raw_currency" text DEFAULT 'USD',
	"commission" numeric(10, 2) NOT NULL,
	"paid_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"affiliate_link_id" text,
	"unpaid_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
	"reason" "affiliate_invoice_reason" DEFAULT 'one_time' NOT NULL,
	"refunded_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "affiliate_link" (
	"id" text PRIMARY KEY NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"affiliate_id" uuid NOT NULL,
	"organization_id" text NOT NULL
);
--> statement-breakpoint
CREATE TABLE "affiliate_payout_method" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"affiliate_id" uuid NOT NULL,
	"provider" "payout_provider" NOT NULL,
	"account_identifier" text NOT NULL,
	"is_default" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "exchange_rate" (
	"base_currency" text NOT NULL,
	"target_currency" text NOT NULL,
	"rate" text NOT NULL,
	"fetched_at" timestamp NOT NULL,
	CONSTRAINT "exchange_rate_base_currency_target_currency_pk" PRIMARY KEY("base_currency","target_currency")
);
--> statement-breakpoint
CREATE TABLE "invitation" (
	"id" text PRIMARY KEY NOT NULL,
	"email" text NOT NULL,
	"organization_id" text NOT NULL,
	"title" text,
	"body" text,
	"token" text NOT NULL,
	"accepted" boolean DEFAULT false NOT NULL,
	"expires_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "invitation_token_unique" UNIQUE("token")
);
--> statement-breakpoint
CREATE TABLE "organization" (
	"id" text PRIMARY KEY NOT NULL,
	"name" text NOT NULL,
	"website_name" text NOT NULL,
	"logo_url" text,
	"open_graph_url" text,
	"description" text,
	"user_id" uuid NOT NULL,
	"referral_param" "referral_param_enum" DEFAULT 'ref',
	"cookie_lifetime_value" integer DEFAULT 30,
	"cookie_lifetime_unit" text DEFAULT 'day',
	"commission_type" text DEFAULT 'percentage',
	"commission_value" numeric(10, 2) DEFAULT '0.00',
	"commission_duration_value" integer DEFAULT 1,
	"commission_duration_unit" text DEFAULT 'day',
	"attribution_model" "attribution_model" DEFAULT 'LAST_CLICK' NOT NULL,
	"currency" "currency" DEFAULT 'USD' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_auth_customization" (
	"id" text PRIMARY KEY NOT NULL,
	"auth" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_dashboard_customization" (
	"id" text PRIMARY KEY NOT NULL,
	"dashboard" jsonb,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_paddle_account" (
	"webhook_public_key" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "organization_stripe_account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"stripe_account_id" text NOT NULL,
	"org_id" text NOT NULL,
	"email" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payout_reference" (
	"ref_id" varchar(12) PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"affiliate_id" uuid NOT NULL,
	"is_unpaid" boolean DEFAULT false NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "payout_reference_periods" (
	"ref_id" varchar(12) NOT NULL,
	"month" integer NOT NULL,
	"year" integer NOT NULL,
	CONSTRAINT "payout_reference_periods_ref_id_month_year_pk" PRIMARY KEY("ref_id","month","year")
);
--> statement-breakpoint
CREATE TABLE "promotion_codes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" varchar(255) NOT NULL,
	"external_id" varchar(255) NOT NULL,
	"stripe_coupon_id" varchar(255),
	"provider" "provider" NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"discount_type" "value_type" NOT NULL,
	"discount_value" numeric(10, 2) NOT NULL,
	"currency" varchar(3) DEFAULT 'USD' NOT NULL,
	"commission_type" "value_type" DEFAULT 'PERCENTAGE' NOT NULL,
	"commission_value" numeric(10, 2) NOT NULL,
	"total_sales" integer DEFAULT 0 NOT NULL,
	"total_revenue_generated" numeric(15, 2) DEFAULT '0.00' NOT NULL,
	"affiliate_id" uuid,
	"organization_id" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "promotion_codes_external_id_unique" UNIQUE("external_id")
);
--> statement-breakpoint
CREATE TABLE "purchase" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"tier" "purchase_tier" NOT NULL,
	"price" numeric(10, 2) NOT NULL,
	"currency" text DEFAULT 'USD',
	"price_id" text,
	"is_active" boolean DEFAULT true,
	"reason" "purchase_reason",
	"created_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscription" (
	"id" text PRIMARY KEY NOT NULL,
	"user_id" uuid NOT NULL,
	"plan" "plan" DEFAULT 'FREE' NOT NULL,
	"billing_interval" "billing_interval",
	"currency" text DEFAULT 'USD',
	"price" numeric(10, 2),
	"price_id" text,
	"expires_at" timestamp with time zone,
	"subscription_change_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "subscription_expiration" (
	"id" text PRIMARY KEY NOT NULL,
	"subscription_id" text NOT NULL,
	"expiration_date" timestamp NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "subscription_expiration_subscription_id_unique" UNIQUE("subscription_id")
);
--> statement-breakpoint
CREATE TABLE "support_message" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"type" "support_type" NOT NULL,
	"subject" text NOT NULL,
	"message" text NOT NULL,
	"org_id" text,
	"is_team" boolean DEFAULT false NOT NULL,
	"email" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"role" "role" DEFAULT 'TEAM' NOT NULL,
	"type" "account_type" DEFAULT 'ORGANIZATION' NOT NULL,
	"organization_id" text NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "org_team_email_unique" UNIQUE("organization_id","email")
);
--> statement-breakpoint
CREATE TABLE "team_account" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"team_id" uuid NOT NULL,
	"provider" "provider" NOT NULL,
	"provider_account_id" text NOT NULL,
	"email_verified" timestamp,
	"password" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "user" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"email" text NOT NULL,
	"role" "role" DEFAULT 'OWNER' NOT NULL,
	"type" "account_type" DEFAULT 'ORGANIZATION' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "user_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "website_domain" (
	"id" text PRIMARY KEY NOT NULL,
	"org_id" text NOT NULL,
	"domain_name" text NOT NULL,
	"type" "domain_type" DEFAULT 'DEFAULT' NOT NULL,
	"is_primary" boolean DEFAULT false NOT NULL,
	"is_active" boolean DEFAULT false NOT NULL,
	"is_redirect" boolean DEFAULT false NOT NULL,
	"is_verified" boolean DEFAULT false NOT NULL,
	"dns_status" "dns_status" DEFAULT 'Pending' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "website_domain_domain_name_unique" UNIQUE("domain_name")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate" ADD CONSTRAINT "affiliate_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_account" ADD CONSTRAINT "affiliate_account_affiliate_id_affiliate_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."affiliate"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_click" ADD CONSTRAINT "affiliate_click_affiliate_link_id_affiliate_link_id_fk" FOREIGN KEY ("affiliate_link_id") REFERENCES "public"."affiliate_link"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_invoice" ADD CONSTRAINT "affiliate_invoice_affiliate_link_id_affiliate_link_id_fk" FOREIGN KEY ("affiliate_link_id") REFERENCES "public"."affiliate_link"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_link" ADD CONSTRAINT "affiliate_link_affiliate_id_affiliate_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."affiliate"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_link" ADD CONSTRAINT "affiliate_link_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "affiliate_payout_method" ADD CONSTRAINT "affiliate_payout_method_affiliate_id_affiliate_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."affiliate"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization" ADD CONSTRAINT "organization_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_auth_customization" ADD CONSTRAINT "organization_auth_customization_id_organization_id_fk" FOREIGN KEY ("id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_dashboard_customization" ADD CONSTRAINT "organization_dashboard_customization_id_organization_id_fk" FOREIGN KEY ("id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_paddle_account" ADD CONSTRAINT "organization_paddle_account_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "organization_stripe_account" ADD CONSTRAINT "organization_stripe_account_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payout_reference" ADD CONSTRAINT "payout_reference_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payout_reference" ADD CONSTRAINT "payout_reference_affiliate_id_affiliate_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."affiliate"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "payout_reference_periods" ADD CONSTRAINT "payout_reference_periods_ref_id_payout_reference_ref_id_fk" FOREIGN KEY ("ref_id") REFERENCES "public"."payout_reference"("ref_id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promotion_codes" ADD CONSTRAINT "promotion_codes_affiliate_id_affiliate_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "public"."affiliate"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "promotion_codes" ADD CONSTRAINT "promotion_codes_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "purchase" ADD CONSTRAINT "purchase_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "subscription" ADD CONSTRAINT "subscription_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "support_message" ADD CONSTRAINT "support_message_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team" ADD CONSTRAINT "team_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_account" ADD CONSTRAINT "team_account_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "website_domain" ADD CONSTRAINT "website_domain_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "public"."organization"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "account_user_id_created_at_idx" ON "account" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "account_created_at_idx" ON "account" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "affiliate_email_created_at_idx" ON "affiliate" USING btree ("email","created_at");--> statement-breakpoint
CREATE INDEX "affiliate_name_created_at_idx" ON "affiliate" USING btree ("name","created_at");--> statement-breakpoint
CREATE INDEX "affiliate_created_at_idx" ON "affiliate" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "affiliate_account_affiliate_id_created_at_idx" ON "affiliate_account" USING btree ("affiliate_id","created_at");--> statement-breakpoint
CREATE INDEX "affiliate_account_created_at_idx" ON "affiliate_account" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "affiliate_click_affiliate_link_id_created_at_idx" ON "affiliate_click" USING btree ("affiliate_link_id","created_at");--> statement-breakpoint
CREATE INDEX "affiliate_click_created_at_idx" ON "affiliate_click" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "affiliate_invoice_affiliate_link_id_created_at_idx" ON "affiliate_invoice" USING btree ("affiliate_link_id","created_at");--> statement-breakpoint
CREATE INDEX "affiliate_invoice_transaction_id_idx" ON "affiliate_invoice" USING btree ("transaction_id");--> statement-breakpoint
CREATE INDEX "affiliate_invoice_created_at_idx" ON "affiliate_invoice" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "affiliate_link_affiliate_id_created_at_idx" ON "affiliate_link" USING btree ("affiliate_id","created_at");--> statement-breakpoint
CREATE INDEX "affiliate_link_organization_id_created_at_idx" ON "affiliate_link" USING btree ("organization_id","created_at");--> statement-breakpoint
CREATE INDEX "affiliate_link_created_at_idx" ON "affiliate_link" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "affiliate_payout_method_affiliate_id_created_at_idx" ON "affiliate_payout_method" USING btree ("affiliate_id","created_at");--> statement-breakpoint
CREATE INDEX "affiliate_payout_method_created_at_idx" ON "affiliate_payout_method" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "invitation_created_at_idx" ON "invitation" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "organization_user_id_created_at_idx" ON "organization" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "organization_created_at_idx" ON "organization" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "organization_auth_customization_created_at_idx" ON "organization_auth_customization" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "organization_dashboard_customization_created_at_idx" ON "organization_dashboard_customization" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "organization_paddle_account_org_id_created_at_idx" ON "organization_paddle_account" USING btree ("org_id","created_at");--> statement-breakpoint
CREATE INDEX "organization_paddle_account_created_at_idx" ON "organization_paddle_account" USING btree ("created_at");--> statement-breakpoint
CREATE UNIQUE INDEX "stripe_org_unique_idx" ON "organization_stripe_account" USING btree ("stripe_account_id","org_id");--> statement-breakpoint
CREATE INDEX "payout_reference_org_id_created_at_idx" ON "payout_reference" USING btree ("org_id","created_at");--> statement-breakpoint
CREATE INDEX "payout_reference_affiliate_id_created_at_idx" ON "payout_reference" USING btree ("affiliate_id","created_at");--> statement-breakpoint
CREATE INDEX "payout_reference_created_at_idx" ON "payout_reference" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "promotion_codes_external_id_idx" ON "promotion_codes" USING btree ("external_id");--> statement-breakpoint
CREATE INDEX "promotion_codes_organization_id_idx" ON "promotion_codes" USING btree ("organization_id");--> statement-breakpoint
CREATE INDEX "purchase_user_id_created_at_idx" ON "purchase" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "purchase_created_at_idx" ON "purchase" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "subscription_user_id_created_at_idx" ON "subscription" USING btree ("user_id","created_at");--> statement-breakpoint
CREATE INDEX "subscription_created_at_idx" ON "subscription" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "subscription_expiration_created_at_idx" ON "subscription_expiration" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "support_message_type_created_at_idx" ON "support_message" USING btree ("type","created_at");--> statement-breakpoint
CREATE INDEX "support_message_org_id_created_at_idx" ON "support_message" USING btree ("org_id","created_at");--> statement-breakpoint
CREATE INDEX "team_email_created_at_idx" ON "team" USING btree ("email","created_at");--> statement-breakpoint
CREATE INDEX "team_name_created_at_idx" ON "team" USING btree ("name","created_at");--> statement-breakpoint
CREATE INDEX "team_created_at_idx" ON "team" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "team_account_team_id_created_at_idx" ON "team_account" USING btree ("team_id","created_at");--> statement-breakpoint
CREATE INDEX "team_account_created_at_idx" ON "team_account" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "user_created_at_idx" ON "user" USING btree ("created_at");--> statement-breakpoint
CREATE INDEX "website_domain_org_id_created_at_idx" ON "website_domain" USING btree ("org_id","created_at");--> statement-breakpoint
CREATE INDEX "website_domain_created_at_idx" ON "website_domain" USING btree ("created_at");