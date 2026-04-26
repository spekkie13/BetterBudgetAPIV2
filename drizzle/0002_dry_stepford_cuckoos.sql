CREATE TABLE "budget_carryover" (
	"team_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"from_month" date NOT NULL,
	"to_month" date NOT NULL,
	"amount_cents" bigint NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "budget_carryover_team_id_category_id_from_month_pk" PRIMARY KEY("team_id","category_id","from_month")
);
--> statement-breakpoint
ALTER TABLE "budget_carryover" ADD CONSTRAINT "budget_carryover_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget_carryover" ADD CONSTRAINT "budget_carryover_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE cascade ON UPDATE no action;