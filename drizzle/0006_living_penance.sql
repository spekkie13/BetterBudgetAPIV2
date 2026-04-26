ALTER TABLE "txn" ADD COLUMN "import_hash" varchar(64);--> statement-breakpoint
CREATE UNIQUE INDEX "ux_txn_import_hash" ON "txn" USING btree ("import_hash");