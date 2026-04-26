ALTER TABLE "app_user" ADD COLUMN "supabase_uid" varchar(128) NOT NULL;--> statement-breakpoint
ALTER TABLE "app_user" ADD CONSTRAINT "app_user_supabase_uid_unique" UNIQUE("supabase_uid");