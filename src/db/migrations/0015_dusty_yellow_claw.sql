CREATE TABLE "ceremonies" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"kind" text NOT NULL,
	"title" text NOT NULL,
	"event_id" uuid,
	"requested_by_text" text,
	"responsible_user_id" text,
	"scheduled_at" timestamp,
	"status" text DEFAULT 'solicitada' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "ceremony_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"ceremony_id" uuid NOT NULL,
	"member_id" uuid,
	"person_name" text NOT NULL,
	"role_in_ceremony" text NOT NULL,
	"birth_date" date,
	"preparation_done" boolean DEFAULT false NOT NULL,
	"notes" text,
	CONSTRAINT "ceremony_participants_unique" UNIQUE("ceremony_id","person_name","role_in_ceremony")
);
--> statement-breakpoint
ALTER TABLE "ceremonies" ADD CONSTRAINT "ceremonies_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ceremonies" ADD CONSTRAINT "ceremonies_responsible_user_id_user_id_fk" FOREIGN KEY ("responsible_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ceremony_participants" ADD CONSTRAINT "ceremony_participants_ceremony_id_ceremonies_id_fk" FOREIGN KEY ("ceremony_id") REFERENCES "public"."ceremonies"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "ceremony_participants" ADD CONSTRAINT "ceremony_participants_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;