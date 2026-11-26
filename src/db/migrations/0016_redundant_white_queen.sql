CREATE TABLE "reading_plan_days" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"plan_id" uuid NOT NULL,
	"day_number" integer NOT NULL,
	"bible_reference" text NOT NULL,
	"devotional_title" text NOT NULL,
	"devotional_body" text,
	CONSTRAINT "reading_plan_days_unique" UNIQUE("plan_id","day_number")
);
--> statement-breakpoint
CREATE TABLE "reading_plans" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"duration_days" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "reading_progress" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"user_id" text NOT NULL,
	"member_id" uuid,
	"plan_id" uuid NOT NULL,
	"day_number" integer NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "reading_progress_unique" UNIQUE("user_id","plan_id","day_number")
);
--> statement-breakpoint
ALTER TABLE "reading_plan_days" ADD CONSTRAINT "reading_plan_days_plan_id_reading_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."reading_plans"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_plans" ADD CONSTRAINT "reading_plans_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_progress" ADD CONSTRAINT "reading_progress_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_progress" ADD CONSTRAINT "reading_progress_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reading_progress" ADD CONSTRAINT "reading_progress_plan_id_reading_plans_id_fk" FOREIGN KEY ("plan_id") REFERENCES "public"."reading_plans"("id") ON DELETE cascade ON UPDATE no action;