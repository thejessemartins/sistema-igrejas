CREATE TABLE "sermons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"preacher_text" text,
	"preacher_member_id" uuid,
	"event_id" uuid,
	"preached_at" date NOT NULL,
	"bible_reference" text,
	"series_name" text,
	"summary" text,
	"tags" text,
	"audio_path" text,
	"video_path" text,
	"pdf_path" text,
	"notes_path" text,
	"is_published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "sermons" ADD CONSTRAINT "sermons_preacher_member_id_members_id_fk" FOREIGN KEY ("preacher_member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sermons" ADD CONSTRAINT "sermons_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE set null ON UPDATE no action;