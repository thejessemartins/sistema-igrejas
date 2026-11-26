CREATE TABLE "prayer_commitments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"prayer_request_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"prayed_day" date NOT NULL,
	"prayed_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "prayer_commitments_unique" UNIQUE("prayer_request_id","user_id","prayed_day")
);
--> statement-breakpoint
CREATE TABLE "prayer_requests" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"author_user_id" text,
	"author_member_id" uuid,
	"author_text" text,
	"title" text NOT NULL,
	"body" text NOT NULL,
	"visibility" text DEFAULT 'publico' NOT NULL,
	"is_anonymous" boolean DEFAULT false NOT NULL,
	"status" text DEFAULT 'ativo' NOT NULL,
	"answered_notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "prayer_commitments" ADD CONSTRAINT "prayer_commitments_prayer_request_id_prayer_requests_id_fk" FOREIGN KEY ("prayer_request_id") REFERENCES "public"."prayer_requests"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_commitments" ADD CONSTRAINT "prayer_commitments_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_requests" ADD CONSTRAINT "prayer_requests_author_user_id_user_id_fk" FOREIGN KEY ("author_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "prayer_requests" ADD CONSTRAINT "prayer_requests_author_member_id_members_id_fk" FOREIGN KEY ("author_member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;