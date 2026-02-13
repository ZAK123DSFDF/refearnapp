CREATE TYPE "public"."test_status" AS ENUM('PENDING', 'SUCCESS', 'FAILED');--> statement-breakpoint
CREATE TABLE "migration_test" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"status" "test_status" DEFAULT 'PENDING',
	"created_at" timestamp DEFAULT now() NOT NULL
);
