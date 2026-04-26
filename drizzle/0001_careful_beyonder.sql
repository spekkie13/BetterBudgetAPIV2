CREATE TYPE "public"."closing_status" AS ENUM('started', 'succeeded', 'failed');--> statement-breakpoint
CREATE TYPE "public"."period_start" AS ENUM('calendar_month', 'anchored_month');--> statement-breakpoint
CREATE TYPE "public"."period_status" AS ENUM('open', 'closing', 'closed');--> statement-breakpoint
CREATE TABLE "closing_runs" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"dedupe_key" text NOT NULL,
	"from_period_key" text NOT NULL,
	"to_period_key" text NOT NULL,
	"status" "closing_status" DEFAULT 'started' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now(),
	"updated_at" timestamp with time zone DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "periods" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"key" text NOT NULL,
	"year" integer NOT NULL,
	"month" integer NOT NULL,
	"start_date" date NOT NULL,
	"end_date" timestamp with time zone NOT NULL,
	"status" "period_status" DEFAULT 'open' NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"period_start" "period_start" DEFAULT 'calendar_month' NOT NULL,
	"anchor_day" integer DEFAULT 1 NOT NULL,
	"anchor_timezone" varchar DEFAULT 'Europe/Amsterdam' NOT NULL
);
--> statement-breakpoint
ALTER TABLE "closing_runs" ADD CONSTRAINT "closing_runs_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "periods" ADD CONSTRAINT "periods_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "team_settings" ADD CONSTRAINT "team_settings_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "ux_closing_runs_dedupe" ON "closing_runs" USING btree ("dedupe_key");--> statement-breakpoint
CREATE UNIQUE INDEX "ux_periods_team_key" ON "periods" USING btree ("team_id","key");