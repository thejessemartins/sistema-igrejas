CREATE TABLE "visitor_visits" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"visitor_id" uuid NOT NULL,
	"event_id" uuid,
	"visited_at" timestamp DEFAULT now() NOT NULL,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "visitors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"phone" text,
	"email" text,
	"invited_by_member_id" uuid,
	"invited_by_text" text,
	"first_visit_at" timestamp DEFAULT now() NOT NULL,
	"follow_up_status" text DEFAULT 'novo' NOT NULL,
	"responsible_user_id" text,
	"notes" text,
	"converted_member_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "visitor_visits" ADD CONSTRAINT "visitor_visits_visitor_id_visitors_id_fk" FOREIGN KEY ("visitor_id") REFERENCES "public"."visitors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_invited_by_member_id_members_id_fk" FOREIGN KEY ("invited_by_member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_responsible_user_id_user_id_fk" FOREIGN KEY ("responsible_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "visitors" ADD CONSTRAINT "visitors_converted_member_id_members_id_fk" FOREIGN KEY ("converted_member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "visitors_full_name_idx" ON "visitors" USING btree ("full_name");--> statement-breakpoint
CREATE INDEX "visitors_follow_up_status_idx" ON "visitors" USING btree ("follow_up_status");--> statement-breakpoint
CREATE INDEX "visitors_first_visit_at_idx" ON "visitors" USING btree ("first_visit_at");