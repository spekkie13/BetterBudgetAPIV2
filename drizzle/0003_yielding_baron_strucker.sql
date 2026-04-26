CREATE TABLE "recurring_rules" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"amount_cents" bigint NOT NULL,
	"day_of_month" integer,
	"active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
DROP TABLE "closing_runs" CASCADE;--> statement-breakpoint
DROP TABLE "periods" CASCADE;--> statement-breakpoint
DROP TABLE "recurring_rule" CASCADE;--> statement-breakpoint
DROP TABLE "team_settings" CASCADE;--> statement-breakpoint
ALTER TABLE "recurring_rules" ADD CONSTRAINT "recurring_rules_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_rules" ADD CONSTRAINT "recurring_rules_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "ux_rule_team_name" ON "recurring_rules" USING btree ("team_id","name");--> statement-breakpoint
CREATE INDEX "ix_rule_team" ON "recurring_rules" USING btree ("team_id");