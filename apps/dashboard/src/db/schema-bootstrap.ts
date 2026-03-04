export const BOOTSTRAP_QUERIES = [
  // --- PHASE 1: TABLES ---
  {
    name: "user",
    sql: `CREATE TABLE IF NOT EXISTS "user" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "name" text NOT NULL,
        "email" text NOT NULL,
        "role" text DEFAULT 'OWNER' NOT NULL,
        "type" text DEFAULT 'ORGANIZATION' NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "user_email_unique" UNIQUE("email")
    );`,
  },
  {
    name: "organization",
    sql: `CREATE TABLE IF NOT EXISTS "organization" (
        "id" text PRIMARY KEY NOT NULL,
        "name" text NOT NULL,
        "website_name" text NOT NULL,
        "support_email" text,
        "logo_url" text,
        "open_graph_url" text,
        "description" text,
        "user_id" uuid NOT NULL,
        "referral_param" text DEFAULT 'ref',
        "cookie_lifetime_value" integer DEFAULT 30,
        "cookie_lifetime_unit" text DEFAULT 'day',
        "commission_type" text DEFAULT 'PERCENTAGE',
        "commission_value" numeric(10, 2) DEFAULT '0.00',
        "commission_duration_value" integer DEFAULT 1,
        "commission_duration_unit" text DEFAULT 'day',
        "attribution_model" text DEFAULT 'LAST_CLICK' NOT NULL,
        "currency" text DEFAULT 'USD' NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
    );`,
  },
  {
    name: "account",
    sql: `CREATE TABLE IF NOT EXISTS "account" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "user_id" uuid NOT NULL,
        "provider" text NOT NULL,
        "provider_account_id" text NOT NULL,
        "email_verified" timestamp,
        "password" text,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
    );`,
  },
  {
    name: "affiliate",
    sql: `CREATE TABLE IF NOT EXISTS "affiliate" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "name" text NOT NULL,
        "email" text NOT NULL,
        "type" text DEFAULT 'AFFILIATE' NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        "organization_id" text NOT NULL,
        CONSTRAINT "affiliate_org_email_unique" UNIQUE("organization_id","email")
    );`,
  },
  {
    name: "affiliate_account",
    sql: `CREATE TABLE IF NOT EXISTS "affiliate_account" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "affiliate_id" uuid NOT NULL,
        "provider" text NOT NULL,
        "provider_account_id" text NOT NULL,
        "email_verified" timestamp,
        "password" text,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
    );`,
  },
  {
    name: "affiliate_link",
    sql: `CREATE TABLE IF NOT EXISTS "affiliate_link" (
        "id" text PRIMARY KEY NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        "affiliate_id" uuid NOT NULL,
        "organization_id" text NOT NULL
    );`,
  },
  {
    name: "affiliate_click",
    sql: `CREATE TABLE IF NOT EXISTS "affiliate_click" (
        "id" text PRIMARY KEY NOT NULL,
        "affiliate_link_id" text NOT NULL,
        "click_count" integer DEFAULT 1,
        "referrer" text DEFAULT 'unknown' NOT NULL,
        "device_type" text,
        "browser" text,
        "os" text,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
    );`,
  },
  {
    name: "affiliate_invoice",
    sql: `CREATE TABLE IF NOT EXISTS "affiliate_invoice" (
        "id" text PRIMARY KEY NOT NULL,
        "payment_provider" text NOT NULL,
        "transaction_id" text,
        "subscription_id" text,
        "customer_id" text NOT NULL,
        "amount" numeric(10, 2) NOT NULL,
        "currency" text NOT NULL,
        "raw_amount" numeric(10, 2) DEFAULT '0',
        "raw_currency" text DEFAULT 'USD',
        "commission" numeric(10, 2) NOT NULL,
        "paid_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
        "affiliate_link_id" text,
        "unpaid_amount" numeric(10, 2) DEFAULT '0' NOT NULL,
        "reason" text DEFAULT 'one_time' NOT NULL,
        "refunded_at" timestamp,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
    );`,
  },
  {
    name: "affiliate_payout_method",
    sql: `CREATE TABLE IF NOT EXISTS "affiliate_payout_method" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "affiliate_id" uuid NOT NULL,
        "provider" text NOT NULL,
        "account_identifier" text NOT NULL,
        "is_default" boolean DEFAULT false NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
    );`,
  },
  {
    name: "exchange_rate",
    sql: `CREATE TABLE IF NOT EXISTS "exchange_rate" (
        "base_currency" text NOT NULL,
        "target_currency" text NOT NULL,
        "rate" text NOT NULL,
        "fetched_at" timestamp NOT NULL,
        CONSTRAINT "exchange_rate_base_currency_target_currency_pk" PRIMARY KEY("base_currency","target_currency")
    );`,
  },
  {
    name: "invitation",
    sql: `CREATE TABLE IF NOT EXISTS "invitation" (
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
    );`,
  },
  {
    name: "organization_auth_customization",
    sql: `CREATE TABLE IF NOT EXISTS "organization_auth_customization" (
        "id" text PRIMARY KEY NOT NULL,
        "auth" jsonb,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
    );`,
  },
  {
    name: "organization_dashboard_customization",
    sql: `CREATE TABLE IF NOT EXISTS "organization_dashboard_customization" (
        "id" text PRIMARY KEY NOT NULL,
        "dashboard" jsonb,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
    );`,
  },
  {
    name: "organization_paddle_account",
    sql: `CREATE TABLE IF NOT EXISTS "organization_paddle_account" (
        "webhook_public_key" text PRIMARY KEY NOT NULL,
        "org_id" text NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
    );`,
  },
  {
    name: "organization_stripe_account",
    sql: `CREATE TABLE IF NOT EXISTS "organization_stripe_account" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "stripe_account_id" text NOT NULL,
        "org_id" text NOT NULL,
        "email" text,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
    );`,
  },
  {
    name: "payout_reference",
    sql: `CREATE TABLE IF NOT EXISTS "payout_reference" (
        "ref_id" varchar(12) PRIMARY KEY NOT NULL,
        "org_id" text NOT NULL,
        "affiliate_id" uuid NOT NULL,
        "is_unpaid" boolean DEFAULT false NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL
    );`,
  },
  {
    name: "payout_reference_periods",
    sql: `CREATE TABLE IF NOT EXISTS "payout_reference_periods" (
        "ref_id" varchar(12) NOT NULL,
        "month" integer NOT NULL,
        "year" integer NOT NULL,
        CONSTRAINT "payout_reference_periods_ref_id_month_year_pk" PRIMARY KEY("ref_id","month","year")
    );`,
  },
  {
    name: "promotion_codes",
    sql: `CREATE TABLE IF NOT EXISTS "promotion_codes" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "code" varchar(255) NOT NULL,
        "external_id" varchar(255) NOT NULL,
        "stripe_coupon_id" varchar(255),
        "provider" text NOT NULL,
        "is_active" boolean DEFAULT true NOT NULL,
        "discount_type" text NOT NULL,
        "discount_value" numeric(10, 2) NOT NULL,
        "currency" varchar(3) DEFAULT 'USD' NOT NULL,
        "commission_type" text DEFAULT 'PERCENTAGE' NOT NULL,
        "commission_value" numeric(10, 2) NOT NULL,
        "commission_duration_value" integer DEFAULT 1 NOT NULL,
        "commission_duration_unit" text DEFAULT 'month' NOT NULL,
        "total_sales" integer DEFAULT 0 NOT NULL,
        "total_revenue_generated" numeric(15, 2) DEFAULT '0.00' NOT NULL,
        "affiliate_id" uuid,
        "is_seen_by_affiliate" boolean DEFAULT false NOT NULL,
        "organization_id" text NOT NULL,
        "deleted_at" timestamp,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
    );`,
  },
  {
    name: "purchase",
    sql: `CREATE TABLE IF NOT EXISTS "purchase" (
        "id" text PRIMARY KEY NOT NULL,
        "user_id" uuid NOT NULL,
        "tier" text NOT NULL,
        "price" numeric(10, 2) NOT NULL,
        "currency" text DEFAULT 'USD',
        "price_id" text,
        "is_active" boolean DEFAULT true,
        "reason" text,
        "created_at" timestamp with time zone DEFAULT now()
    );`,
  },
  {
    name: "referrals",
    sql: `CREATE TABLE IF NOT EXISTS "referrals" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "affiliate_id" uuid,
        "organization_id" text NOT NULL,
        "signup_email" varchar(255),
        "promotion_code_id" uuid,
        "referral_link_id" text,
        "signed_at" timestamp DEFAULT now() NOT NULL,
        "converted_at" timestamp,
        "total_revenue" numeric(15, 2) DEFAULT '0.00',
        "commission_earned" numeric(15, 2) DEFAULT '0.00',
        "is_seen_by_affiliate" boolean DEFAULT false NOT NULL,
        "created_at" timestamp DEFAULT now(),
        "updated_at" timestamp DEFAULT now()
    );`,
  },
  {
    name: "subscription",
    sql: `CREATE TABLE IF NOT EXISTS "subscription" (
        "id" text PRIMARY KEY NOT NULL,
        "user_id" uuid NOT NULL,
        "plan" text DEFAULT 'FREE' NOT NULL,
        "billing_interval" text,
        "currency" text DEFAULT 'USD',
        "price" numeric(10, 2),
        "price_id" text,
        "expires_at" timestamp with time zone,
        "subscription_change_at" timestamp with time zone,
        "created_at" timestamp with time zone DEFAULT now(),
        "updated_at" timestamp with time zone DEFAULT now()
    );`,
  },
  {
    name: "subscription_expiration",
    sql: `CREATE TABLE IF NOT EXISTS "subscription_expiration" (
        "id" text PRIMARY KEY NOT NULL,
        "subscription_id" text NOT NULL,
        "expiration_date" timestamp NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "subscription_expiration_subscription_id_unique" UNIQUE("subscription_id")
    );`,
  },
  {
    name: "support_message",
    sql: `CREATE TABLE IF NOT EXISTS "support_message" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "type" text NOT NULL,
        "subject" text NOT NULL,
        "message" text NOT NULL,
        "org_id" text,
        "is_team" boolean DEFAULT false NOT NULL,
        "email" text,
        "created_at" timestamp DEFAULT now() NOT NULL
    );`,
  },
  {
    name: "system_settings",
    sql: `CREATE TABLE IF NOT EXISTS "system_settings" (
        "id" integer PRIMARY KEY DEFAULT 1 NOT NULL,
        "installed_version" text DEFAULT '0.1.0' NOT NULL,
        "last_updated" timestamp DEFAULT now(),
        "latest_available_version" text
    );`,
  },
  {
    name: "team",
    sql: `CREATE TABLE IF NOT EXISTS "team" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "name" text NOT NULL,
        "email" text NOT NULL,
        "role" text DEFAULT 'TEAM' NOT NULL,
        "type" text DEFAULT 'ORGANIZATION' NOT NULL,
        "organization_id" text NOT NULL,
        "is_active" boolean DEFAULT true NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "org_team_email_unique" UNIQUE("organization_id","email")
    );`,
  },
  {
    name: "team_account",
    sql: `CREATE TABLE IF NOT EXISTS "team_account" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
        "team_id" uuid NOT NULL,
        "provider" text NOT NULL,
        "provider_account_id" text NOT NULL,
        "email_verified" timestamp,
        "password" text,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL
    );`,
  },
  {
    name: "website_domain",
    sql: `CREATE TABLE IF NOT EXISTS "website_domain" (
        "id" text PRIMARY KEY NOT NULL,
        "org_id" text NOT NULL,
        "domain_name" text NOT NULL,
        "type" text DEFAULT 'DEFAULT' NOT NULL,
        "is_primary" boolean DEFAULT false NOT NULL,
        "is_active" boolean DEFAULT false NOT NULL,
        "is_redirect" boolean DEFAULT false NOT NULL,
        "is_verified" boolean DEFAULT false NOT NULL,
        "dns_status" text DEFAULT 'Pending' NOT NULL,
        "created_at" timestamp DEFAULT now() NOT NULL,
        "updated_at" timestamp DEFAULT now() NOT NULL,
        CONSTRAINT "website_domain_domain_name_unique" UNIQUE("domain_name")
    );`,
  },

  // --- PHASE 2: INDEXES & UNIQUE INDEXES ---
  {
    name: "indexes",
    sql: `
      CREATE INDEX IF NOT EXISTS "account_user_id_created_at_idx" ON "account" ("user_id","created_at");
      CREATE INDEX IF NOT EXISTS "account_created_at_idx" ON "account" ("created_at");
      CREATE INDEX IF NOT EXISTS "affiliate_email_created_at_idx" ON "affiliate" ("email","created_at");
      CREATE INDEX IF NOT EXISTS "affiliate_name_created_at_idx" ON "affiliate" ("name","created_at");
      CREATE INDEX IF NOT EXISTS "affiliate_created_at_idx" ON "affiliate" ("created_at");
      CREATE INDEX IF NOT EXISTS "affiliate_account_affiliate_id_created_at_idx" ON "affiliate_account" ("affiliate_id","created_at");
      CREATE INDEX IF NOT EXISTS "affiliate_account_created_at_idx" ON "affiliate_account" ("created_at");
      CREATE INDEX IF NOT EXISTS "affiliate_click_affiliate_link_id_created_at_idx" ON "affiliate_click" ("affiliate_link_id","created_at");
      CREATE INDEX IF NOT EXISTS "affiliate_click_created_at_idx" ON "affiliate_click" ("created_at");
      CREATE INDEX IF NOT EXISTS "affiliate_invoice_affiliate_link_id_created_at_idx" ON "affiliate_invoice" ("affiliate_link_id","created_at");
      CREATE INDEX IF NOT EXISTS "affiliate_invoice_transaction_id_idx" ON "affiliate_invoice" ("transaction_id");
      CREATE INDEX IF NOT EXISTS "affiliate_invoice_created_at_idx" ON "affiliate_invoice" ("created_at");
      CREATE INDEX IF NOT EXISTS "affiliate_link_affiliate_id_created_at_idx" ON "affiliate_link" ("affiliate_id","created_at");
      CREATE INDEX IF NOT EXISTS "affiliate_link_organization_id_created_at_idx" ON "affiliate_link" ("organization_id","created_at");
      CREATE INDEX IF NOT EXISTS "affiliate_link_created_at_idx" ON "affiliate_link" ("created_at");
      CREATE INDEX IF NOT EXISTS "affiliate_payout_method_affiliate_id_created_at_idx" ON "affiliate_payout_method" ("affiliate_id","created_at");
      CREATE INDEX IF NOT EXISTS "affiliate_payout_method_created_at_idx" ON "affiliate_payout_method" ("created_at");
      CREATE INDEX IF NOT EXISTS "invitation_created_at_idx" ON "invitation" ("created_at");
      CREATE INDEX IF NOT EXISTS "organization_user_id_created_at_idx" ON "organization" ("user_id","created_at");
      CREATE INDEX IF NOT EXISTS "organization_created_at_idx" ON "organization" ("created_at");
      CREATE INDEX IF NOT EXISTS "organization_auth_customization_created_at_idx" ON "organization_auth_customization" ("created_at");
      CREATE INDEX IF NOT EXISTS "organization_dashboard_customization_created_at_idx" ON "organization_dashboard_customization" ("created_at");
      CREATE INDEX IF NOT EXISTS "organization_paddle_account_org_id_created_at_idx" ON "organization_paddle_account" ("org_id","created_at");
      CREATE INDEX IF NOT EXISTS "organization_paddle_account_created_at_idx" ON "organization_paddle_account" ("created_at");
      CREATE UNIQUE INDEX IF NOT EXISTS "stripe_org_unique_idx" ON "organization_stripe_account" ("stripe_account_id","org_id");
      CREATE INDEX IF NOT EXISTS "payout_reference_org_id_created_at_idx" ON "payout_reference" ("org_id","created_at");
      CREATE INDEX IF NOT EXISTS "payout_reference_affiliate_id_created_at_idx" ON "payout_reference" ("affiliate_id","created_at");
      CREATE INDEX IF NOT EXISTS "payout_reference_created_at_idx" ON "payout_reference" ("created_at");
      CREATE INDEX IF NOT EXISTS "promotion_codes_external_id_idx" ON "promotion_codes" ("external_id");
      CREATE INDEX IF NOT EXISTS "promotion_codes_organization_id_idx" ON "promotion_codes" ("organization_id");
      CREATE UNIQUE INDEX IF NOT EXISTS "promo_org_unique_idx" ON "promotion_codes" ("external_id","organization_id");
      CREATE INDEX IF NOT EXISTS "purchase_user_id_created_at_idx" ON "purchase" ("user_id","created_at");
      CREATE INDEX IF NOT EXISTS "purchase_created_at_idx" ON "purchase" ("created_at");
      CREATE INDEX IF NOT EXISTS "subscription_user_id_created_at_idx" ON "subscription" ("user_id","created_at");
      CREATE INDEX IF NOT EXISTS "subscription_created_at_idx" ON "subscription" ("created_at");
      CREATE INDEX IF NOT EXISTS "subscription_expiration_created_at_idx" ON "subscription_expiration" ("created_at");
      CREATE INDEX IF NOT EXISTS "support_message_type_created_at_idx" ON "support_message" ("type","created_at");
      CREATE INDEX IF NOT EXISTS "support_message_org_id_created_at_idx" ON "support_message" ("org_id","created_at");
      CREATE INDEX IF NOT EXISTS "team_email_created_at_idx" ON "team" ("email","created_at");
      CREATE INDEX IF NOT EXISTS "team_name_created_at_idx" ON "team" ("name","created_at");
      CREATE INDEX IF NOT EXISTS "team_created_at_idx" ON "team" ("created_at");
      CREATE INDEX IF NOT EXISTS "team_account_team_id_created_at_idx" ON "team_account" ("team_id","created_at");
      CREATE INDEX IF NOT EXISTS "team_account_created_at_idx" ON "team_account" ("created_at");
      CREATE INDEX IF NOT EXISTS "user_created_at_idx" ON "user" ("created_at");
      CREATE INDEX IF NOT EXISTS "website_domain_org_id_created_at_idx" ON "website_domain" ("org_id","created_at");
      CREATE INDEX IF NOT EXISTS "website_domain_created_at_idx" ON "website_domain" ("created_at");
    `,
  },

  // --- PHASE 3: FOREIGN KEYS ---
  {
    name: "foreign_keys",
    sql: `
    DO $$ BEGIN
      -- account -> user
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'account_user_id_user_id_fk') THEN
        ALTER TABLE "account" ADD CONSTRAINT "account_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
      END IF;

      -- affiliate -> organization
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'affiliate_organization_id_organization_id_fk') THEN
        ALTER TABLE "affiliate" ADD CONSTRAINT "affiliate_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE cascade ON UPDATE no action;
      END IF;

      -- affiliate_account -> affiliate
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'affiliate_account_affiliate_id_affiliate_id_fk') THEN
        ALTER TABLE "affiliate_account" ADD CONSTRAINT "affiliate_account_affiliate_id_affiliate_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "affiliate"("id") ON DELETE cascade ON UPDATE no action;
      END IF;

      -- affiliate_click -> affiliate_link
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'affiliate_click_affiliate_link_id_affiliate_link_id_fk') THEN
        ALTER TABLE "affiliate_click" ADD CONSTRAINT "affiliate_click_affiliate_link_id_affiliate_link_id_fk" FOREIGN KEY ("affiliate_link_id") REFERENCES "affiliate_link"("id") ON DELETE cascade ON UPDATE no action;
      END IF;

      -- affiliate_invoice -> affiliate_link
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'affiliate_invoice_affiliate_link_id_affiliate_link_id_fk') THEN
        ALTER TABLE "affiliate_invoice" ADD CONSTRAINT "affiliate_invoice_affiliate_link_id_affiliate_link_id_fk" FOREIGN KEY ("affiliate_link_id") REFERENCES "affiliate_link"("id") ON DELETE cascade ON UPDATE no action;
      END IF;

      -- affiliate_link -> affiliate
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'affiliate_link_affiliate_id_affiliate_id_fk') THEN
        ALTER TABLE "affiliate_link" ADD CONSTRAINT "affiliate_link_affiliate_id_affiliate_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "affiliate"("id") ON DELETE cascade ON UPDATE no action;
      END IF;

      -- affiliate_link -> organization
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'affiliate_link_organization_id_organization_id_fk') THEN
        ALTER TABLE "affiliate_link" ADD CONSTRAINT "affiliate_link_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE cascade ON UPDATE no action;
      END IF;

      -- affiliate_payout_method -> affiliate
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'affiliate_payout_method_affiliate_id_affiliate_id_fk') THEN
        ALTER TABLE "affiliate_payout_method" ADD CONSTRAINT "affiliate_payout_method_affiliate_id_affiliate_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "affiliate"("id") ON DELETE cascade ON UPDATE no action;
      END IF;

      -- invitation -> organization
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'invitation_organization_id_organization_id_fk') THEN
        ALTER TABLE "invitation" ADD CONSTRAINT "invitation_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE cascade ON UPDATE no action;
      END IF;

      -- organization -> user
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'organization_user_id_user_id_fk') THEN
        ALTER TABLE "organization" ADD CONSTRAINT "organization_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
      END IF;

      -- organization_auth_customization -> organization
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'organization_auth_customization_id_organization_id_fk') THEN
        ALTER TABLE "organization_auth_customization" ADD CONSTRAINT "organization_auth_customization_id_organization_id_fk" FOREIGN KEY ("id") REFERENCES "organization"("id") ON DELETE no action ON UPDATE no action;
      END IF;

      -- organization_dashboard_customization -> organization
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'organization_dashboard_customization_id_organization_id_fk') THEN
        ALTER TABLE "organization_dashboard_customization" ADD CONSTRAINT "organization_dashboard_customization_id_organization_id_fk" FOREIGN KEY ("id") REFERENCES "organization"("id") ON DELETE no action ON UPDATE no action;
      END IF;

      -- organization_paddle_account -> organization
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'organization_paddle_account_org_id_organization_id_fk') THEN
        ALTER TABLE "organization_paddle_account" ADD CONSTRAINT "organization_paddle_account_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "organization"("id") ON DELETE cascade ON UPDATE no action;
      END IF;

      -- organization_stripe_account -> organization
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'organization_stripe_account_org_id_organization_id_fk') THEN
        ALTER TABLE "organization_stripe_account" ADD CONSTRAINT "organization_stripe_account_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "organization"("id") ON DELETE cascade ON UPDATE no action;
      END IF;

      -- payout_reference -> organization
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payout_reference_org_id_organization_id_fk') THEN
        ALTER TABLE "payout_reference" ADD CONSTRAINT "payout_reference_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "organization"("id") ON DELETE cascade ON UPDATE no action;
      END IF;

      -- payout_reference -> affiliate
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payout_reference_affiliate_id_affiliate_id_fk') THEN
        ALTER TABLE "payout_reference" ADD CONSTRAINT "payout_reference_affiliate_id_affiliate_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "affiliate"("id") ON DELETE cascade ON UPDATE no action;
      END IF;

      -- payout_reference_periods -> payout_reference
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'payout_reference_periods_ref_id_payout_reference_ref_id_fk') THEN
        ALTER TABLE "payout_reference_periods" ADD CONSTRAINT "payout_reference_periods_ref_id_payout_reference_ref_id_fk" FOREIGN KEY ("ref_id") REFERENCES "payout_reference"("ref_id") ON DELETE cascade ON UPDATE no action;
      END IF;

      -- promotion_codes -> affiliate
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'promotion_codes_affiliate_id_affiliate_id_fk') THEN
        ALTER TABLE "promotion_codes" ADD CONSTRAINT "promotion_codes_affiliate_id_affiliate_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "affiliate"("id") ON DELETE set null ON UPDATE no action;
      END IF;

      -- promotion_codes -> organization
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'promotion_codes_organization_id_organization_id_fk') THEN
        ALTER TABLE "promotion_codes" ADD CONSTRAINT "promotion_codes_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE cascade ON UPDATE no action;
      END IF;

      -- purchase -> user
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'purchase_user_id_user_id_fk') THEN
        ALTER TABLE "purchase" ADD CONSTRAINT "purchase_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
      END IF;

      -- referrals -> affiliate
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'referrals_affiliate_id_affiliate_id_fk') THEN
        ALTER TABLE "referrals" ADD CONSTRAINT "referrals_affiliate_id_affiliate_id_fk" FOREIGN KEY ("affiliate_id") REFERENCES "affiliate"("id") ON DELETE cascade ON UPDATE no action;
      END IF;

      -- referrals -> promotion_codes
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'referrals_promotion_code_id_promotion_codes_id_fk') THEN
        ALTER TABLE "referrals" ADD CONSTRAINT "referrals_promotion_code_id_promotion_codes_id_fk" FOREIGN KEY ("promotion_code_id") REFERENCES "promotion_codes"("id") ON DELETE no action ON UPDATE no action;
      END IF;

      -- referrals -> affiliate_link
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'referrals_referral_link_id_affiliate_link_id_fk') THEN
        ALTER TABLE "referrals" ADD CONSTRAINT "referrals_referral_link_id_affiliate_link_id_fk" FOREIGN KEY ("referral_link_id") REFERENCES "affiliate_link"("id") ON DELETE no action ON UPDATE no action;
      END IF;

      -- subscription -> user
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'subscription_user_id_user_id_fk') THEN
        ALTER TABLE "subscription" ADD CONSTRAINT "subscription_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "user"("id") ON DELETE cascade ON UPDATE no action;
      END IF;

      -- support_message -> organization
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'support_message_org_id_organization_id_fk') THEN
        ALTER TABLE "support_message" ADD CONSTRAINT "support_message_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "organization"("id") ON DELETE set null ON UPDATE no action;
      END IF;

      -- team -> organization
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'team_organization_id_organization_id_fk') THEN
        ALTER TABLE "team" ADD CONSTRAINT "team_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "organization"("id") ON DELETE cascade ON UPDATE no action;
      END IF;

      -- team_account -> team
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'team_account_team_id_team_id_fk') THEN
        ALTER TABLE "team_account" ADD CONSTRAINT "team_account_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "team"("id") ON DELETE cascade ON UPDATE no action;
      END IF;

      -- website_domain -> organization
      IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'website_domain_org_id_organization_id_fk') THEN
        ALTER TABLE "website_domain" ADD CONSTRAINT "website_domain_org_id_organization_id_fk" FOREIGN KEY ("org_id") REFERENCES "organization"("id") ON DELETE cascade ON UPDATE no action;
      END IF;

    END $$;
  `,
  },
]
