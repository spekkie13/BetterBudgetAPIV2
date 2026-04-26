-- Safe create/extend for category_type
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'category_type' AND n.nspname = 'public'
  ) THEN
CREATE TYPE "category_type" AS ENUM ('expense','income','transfer');
ELSE
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'category_type' AND e.enumlabel = 'expense'
    ) THEN ALTER TYPE "category_type" ADD VALUE 'expense'; END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'category_type' AND e.enumlabel = 'income'
    ) THEN ALTER TYPE "category_type" ADD VALUE 'income'; END IF;
    IF NOT EXISTS (
      SELECT 1 FROM pg_enum e JOIN pg_type t ON t.oid = e.enumtypid
      WHERE t.typname = 'category_type' AND e.enumlabel = 'transfer'
    ) THEN ALTER TYPE "category_type" ADD VALUE 'transfer'; END IF;
END IF;
END$$;

-- Safe create/extend for currency_code
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_type t
    JOIN pg_namespace n ON n.oid = t.typnamespace
    WHERE t.typname = 'currency_code' AND n.nspname = 'public'
  ) THEN
CREATE TYPE "currency_code" AS ENUM ('USD','EUR','GBP','JPY','CAD','AUD','NZD');
ELSE
    -- Add any missing labels here if you ever extend the enum in the future.
END IF;
END$$;
CREATE TABLE "account" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" varchar(50) NOT NULL,
	"currency" "currency_code" DEFAULT 'EUR' NOT NULL,
	"is_archived" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "budget" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"category_id" integer NOT NULL,
	"period_month" date NOT NULL,
	"amount_cents" bigint NOT NULL,
	"rollover" boolean DEFAULT false NOT NULL
);
--> statement-breakpoint
CREATE TABLE "category" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"name" varchar(255) NOT NULL,
	"type" "category_type" DEFAULT 'expense' NOT NULL,
	"color" varchar(32) NOT NULL,
	"icon" varchar(64) NOT NULL,
	"parent_id" integer
);
--> statement-breakpoint
CREATE TABLE "membership" (
	"user_id" integer NOT NULL,
	"team_id" integer NOT NULL,
	"role" varchar(50) DEFAULT 'member' NOT NULL,
	"joined_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "membership_user_id_team_id_pk" PRIMARY KEY("user_id","team_id")
);
--> statement-breakpoint
CREATE TABLE "recurring_rule" (
	"id" serial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"account_id" integer NOT NULL,
	"template_category_id" integer,
	"template_payee" varchar(255),
	"template_memo" text,
	"template_amount_cents" bigint NOT NULL,
	"rrule" text NOT NULL,
	"next_run_at" timestamp with time zone NOT NULL,
	"last_run_at" timestamp with time zone,
	"is_active" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "team" (
	"id" serial PRIMARY KEY NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "txn_split" (
	"id" serial PRIMARY KEY NOT NULL,
	"txn_id" bigint NOT NULL,
	"category_id" integer NOT NULL,
	"amount_cents" bigint NOT NULL
);
--> statement-breakpoint
CREATE TABLE "txn" (
	"id" bigserial PRIMARY KEY NOT NULL,
	"team_id" integer NOT NULL,
	"account_id" integer NOT NULL,
	"amount_cents" bigint NOT NULL,
	"currency" "currency_code" NOT NULL,
	"posted_at" timestamp with time zone NOT NULL,
	"payee" varchar(255),
	"memo" text,
	"category_id" integer,
	"is_transfer" boolean DEFAULT false NOT NULL,
	"transfer_group_id" bigint,
	"created_by" integer,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	"deleted_at" timestamp with time zone
);
--> statement-breakpoint
CREATE TABLE "user_setting" (
	"user_id" integer PRIMARY KEY NOT NULL,
	"theme" varchar(20) DEFAULT 'system',
	"text_size" varchar(10) DEFAULT 'M',
	"preferences" jsonb
);
--> statement-breakpoint
CREATE TABLE "app_user" (
	"id" serial PRIMARY KEY NOT NULL,
	"email" varchar(255) NOT NULL,
	"username" varchar(255) NOT NULL,
	"name" varchar(255) NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "app_user_email_unique" UNIQUE("email"),
	CONSTRAINT "app_user_username_unique" UNIQUE("username")
);
--> statement-breakpoint
ALTER TABLE "account" ADD CONSTRAINT "account_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget" ADD CONSTRAINT "budget_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "budget" ADD CONSTRAINT "budget_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category" ADD CONSTRAINT "category_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "category" ADD CONSTRAINT "category_parent_id_category_id_fk" FOREIGN KEY ("parent_id") REFERENCES "public"."category"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership" ADD CONSTRAINT "membership_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "membership" ADD CONSTRAINT "membership_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_rule" ADD CONSTRAINT "recurring_rule_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_rule" ADD CONSTRAINT "recurring_rule_account_id_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."account"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "recurring_rule" ADD CONSTRAINT "recurring_rule_template_category_id_category_id_fk" FOREIGN KEY ("template_category_id") REFERENCES "public"."category"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "txn_split" ADD CONSTRAINT "txn_split_txn_id_txn_id_fk" FOREIGN KEY ("txn_id") REFERENCES "public"."txn"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "txn_split" ADD CONSTRAINT "txn_split_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "txn" ADD CONSTRAINT "txn_team_id_team_id_fk" FOREIGN KEY ("team_id") REFERENCES "public"."team"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "txn" ADD CONSTRAINT "txn_account_id_account_id_fk" FOREIGN KEY ("account_id") REFERENCES "public"."account"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "txn" ADD CONSTRAINT "txn_category_id_category_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."category"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "txn" ADD CONSTRAINT "txn_created_by_app_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."app_user"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_setting" ADD CONSTRAINT "user_setting_user_id_app_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."app_user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
CREATE UNIQUE INDEX "ux_account_team_name" ON "account" USING btree ("team_id","name");--> statement-breakpoint
CREATE INDEX "ix_account_team" ON "account" USING btree ("team_id");--> statement-breakpoint
CREATE UNIQUE INDEX "ux_budget_team_cat_month" ON "budget" USING btree ("team_id","category_id","period_month");--> statement-breakpoint
CREATE INDEX "ix_budget_team_month" ON "budget" USING btree ("team_id","period_month");--> statement-breakpoint
CREATE INDEX "ix_split_txn" ON "txn_split" USING btree ("txn_id");--> statement-breakpoint
CREATE INDEX "ix_txn_team_posted" ON "txn" USING btree ("team_id","posted_at");--> statement-breakpoint
CREATE INDEX "ix_txn_team_category" ON "txn" USING btree ("team_id","category_id");--> statement-breakpoint
CREATE INDEX "ix_txn_team_account" ON "txn" USING btree ("team_id","account_id");--> statement-breakpoint
CREATE INDEX "ix_txn_transfer_group" ON "txn" USING btree ("transfer_group_id");
