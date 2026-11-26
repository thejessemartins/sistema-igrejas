CREATE TABLE "budget_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"year" integer NOT NULL,
	"month" integer NOT NULL,
	"category_id" uuid NOT NULL,
	"planned_in_cents" integer DEFAULT 0 NOT NULL,
	"planned_out_cents" integer DEFAULT 0 NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "budget_items_unique" UNIQUE("year","month","category_id")
);
--> statement-breakpoint
ALTER TABLE "budget_items" ADD CONSTRAINT "budget_items_category_id_financial_categories_id_fk" FOREIGN KEY ("category_id") REFERENCES "public"."financial_categories"("id") ON DELETE cascade ON UPDATE no action;