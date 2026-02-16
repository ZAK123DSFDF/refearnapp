-- Create the enum type first
DO $$ BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'duration_unit') THEN
CREATE TYPE "public"."duration_unit" AS ENUM('day', 'week', 'month', 'year');
END IF;
END $$;

-- Add the columns to the existing table
ALTER TABLE "promotion_codes"
    ADD COLUMN IF NOT EXISTS "commission_duration_value" integer DEFAULT 1 NOT NULL,
    ADD COLUMN IF NOT EXISTS "commission_duration_unit" "duration_unit" DEFAULT 'month' NOT NULL;