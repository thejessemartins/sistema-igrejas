CREATE TABLE "attendances" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"member_id" uuid,
	"visitor_id" uuid,
	"person_name_snapshot" text NOT NULL,
	"status" text DEFAULT 'presente' NOT NULL,
	"checked_at" timestamp DEFAULT now() NOT NULL,
	"checked_by" text,
	"notes" text,
	CONSTRAINT "attendances_event_member_unique" UNIQUE("event_id","member_id"),
	CONSTRAINT "attendances_event_visitor_unique" UNIQUE("event_id","visitor_id"),
	CONSTRAINT "attendances_exactly_one_person_check" CHECK (("attendances"."member_id" IS NOT NULL AND "attendances"."visitor_id" IS NULL) OR ("attendances"."member_id" IS NULL AND "attendances"."visitor_id" IS NOT NULL))
);
--> statement-breakpoint
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_visitor_id_visitors_id_fk" FOREIGN KEY ("visitor_id") REFERENCES "public"."visitors"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "attendances" ADD CONSTRAINT "attendances_checked_by_user_id_fk" FOREIGN KEY ("checked_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;