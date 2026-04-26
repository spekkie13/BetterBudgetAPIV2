CREATE TABLE "period" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"status" "period_status" DEFAULT 'open' NOT NULL,
	"period_start_type" "period_start" DEFAULT 'calendar_month' NOT NULL,
	"closing_status" "closing_status",
	"closed_at" timestamp with time zone,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "result" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"period_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"budgeted_cents" bigint DEFAULT 0 NOT NULL,
	"actual_cents" bigint DEFAULT 0 NOT NULL,
	"carryover_cents" bigint DEFAULT 0 NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "txn" ALTER COLUMN "currency" SET DATA TYPE varchar;--> statement-breakpoint
ALTER TABLE "period" ADD CONSTRAINT "period_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "result" ADD CONSTRAINT "result_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "result" ADD CONSTRAINT "result_period_id_period_id_fk" FOREIGN KEY ("period_id") REFERENCES "public"."period"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "result" ADD CONSTRAINT "result_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "ux_period_team_start" ON "period" USING btree ("team_id","start_date");--> statement-breakpoint
CREATE INDEX "ix_period_team_status" ON "period" USING btree ("team_id","status");--> statement-breakpoint
CREATE UNIQUE INDEX "ux_result_period_category" ON "result" USING btree ("period_id","category_id");--> statement-breakpoint
CREATE INDEX "ix_result_team_period" ON "result" USING btree ("team_id","period_id");