CREATE TABLE "pastoral_appointments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"pastor_user_id" text NOT NULL,
	"member_id" uuid,
	"person_name" text NOT NULL,
	"phone" text,
	"reason_category" text NOT NULL,
	"starts_at" timestamp NOT NULL,
	"ends_at" timestamp NOT NULL,
	"place_text" text,
	"status" text DEFAULT 'solicitado' NOT NULL,
	"cancel_reason" text,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "pastoral_notes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"appointment_id" uuid NOT NULL,
	"pastor_user_id" text NOT NULL,
	"body" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "pastoral_notes_appointment_id_unique" UNIQUE("appointment_id")
);
--> statement-breakpoint
CREATE TABLE "journey_stages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"position" integer NOT NULL,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "member_journey" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" uuid NOT NULL,
	"stage_id" uuid NOT NULL,
	"entered_at" timestamp DEFAULT now() NOT NULL,
	"completed_at" timestamp,
	"responsible_user_id" text,
	"notes" text
);
--> statement-breakpoint
CREATE TABLE "course_attendance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"lesson_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"status" text DEFAULT 'presente' NOT NULL,
	CONSTRAINT "course_attendance_lesson_member_unique" UNIQUE("lesson_id","member_id")
);
--> statement-breakpoint
CREATE TABLE "course_enrollments" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"enrolled_at" timestamp DEFAULT now() NOT NULL,
	"status" text DEFAULT 'ativo' NOT NULL,
	"completion_notes" text,
	CONSTRAINT "course_enrollments_course_member_unique" UNIQUE("course_id","member_id")
);
--> statement-breakpoint
CREATE TABLE "course_lessons" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"course_id" uuid NOT NULL,
	"lesson_date" date NOT NULL,
	"title" text NOT NULL,
	"summary" text,
	"material_path" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "courses" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"description" text,
	"kind" text NOT NULL,
	"teacher_member_id" uuid,
	"starts_at" date NOT NULL,
	"ends_at" date,
	"weekday" integer DEFAULT 0 NOT NULL,
	"meeting_time" text,
	"room_text" text,
	"capacity" integer,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "kids_checkins" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"child_id" uuid NOT NULL,
	"checked_in_at" timestamp DEFAULT now() NOT NULL,
	"checked_in_by" text,
	"pickup_code" text NOT NULL,
	"checked_out_at" timestamp,
	"checked_out_by" text,
	"picked_up_by_guardian_id" uuid,
	"room_text" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "kids_children" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"birth_date" date,
	"allergies_or_restrictions" text,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "kids_guardians" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"child_id" uuid NOT NULL,
	"guardian_member_id" uuid,
	"guardian_name" text NOT NULL,
	"guardian_phone" text,
	"relation" text NOT NULL,
	"is_authorized_pickup" boolean DEFAULT true NOT NULL
);
--> statement-breakpoint
CREATE TABLE "worship_setlist_items" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"setlist_id" uuid NOT NULL,
	"song_id" uuid NOT NULL,
	"position" integer NOT NULL,
	"musical_key_override" text,
	"notes" text,
	CONSTRAINT "worship_setlist_items_pos_unique" UNIQUE("setlist_id","position"),
	CONSTRAINT "worship_setlist_items_song_unique" UNIQUE("setlist_id","song_id")
);
--> statement-breakpoint
CREATE TABLE "worship_setlists" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"event_id" uuid NOT NULL,
	"ministry_id" uuid,
	"title" text NOT NULL,
	"notes" text,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "worship_setlists_event_id_unique" UNIQUE("event_id")
);
--> statement-breakpoint
CREATE TABLE "worship_songs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"title" text NOT NULL,
	"author_text" text,
	"musical_key" text,
	"tempo_bpm" integer,
	"theme_tags" text,
	"lyrics_text" text,
	"chord_sheet_path" text,
	"link_note" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "user_preferences" (
	"user_id" text PRIMARY KEY NOT NULL,
	"font_size_scale" text DEFAULT 'padrao' NOT NULL,
	"reduce_motion" boolean DEFAULT false NOT NULL,
	"high_contrast_text" boolean DEFAULT false NOT NULL,
	"simplified_lists" boolean DEFAULT false NOT NULL,
	"locale" text DEFAULT 'pt-BR' NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "message_thread_participants" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"thread_id" uuid NOT NULL,
	"user_id" text NOT NULL,
	"last_read_at" timestamp,
	"left_at" timestamp,
	CONSTRAINT "message_thread_participants_unique" UNIQUE("thread_id","user_id")
);
--> statement-breakpoint
CREATE TABLE "message_threads" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"subject" text NOT NULL,
	"kind" text DEFAULT 'direta' NOT NULL,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "messages" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"thread_id" uuid NOT NULL,
	"sender_user_id" text NOT NULL,
	"body" text NOT NULL,
	"attachment_path" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"edited_at" timestamp,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "pastoral_appointments" ADD CONSTRAINT "pastoral_appointments_pastor_user_id_user_id_fk" FOREIGN KEY ("pastor_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pastoral_appointments" ADD CONSTRAINT "pastoral_appointments_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pastoral_appointments" ADD CONSTRAINT "pastoral_appointments_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pastoral_notes" ADD CONSTRAINT "pastoral_notes_appointment_id_pastoral_appointments_id_fk" FOREIGN KEY ("appointment_id") REFERENCES "public"."pastoral_appointments"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "pastoral_notes" ADD CONSTRAINT "pastoral_notes_pastor_user_id_user_id_fk" FOREIGN KEY ("pastor_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_journey" ADD CONSTRAINT "member_journey_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_journey" ADD CONSTRAINT "member_journey_stage_id_journey_stages_id_fk" FOREIGN KEY ("stage_id") REFERENCES "public"."journey_stages"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_journey" ADD CONSTRAINT "member_journey_responsible_user_id_user_id_fk" FOREIGN KEY ("responsible_user_id") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_attendance" ADD CONSTRAINT "course_attendance_lesson_id_course_lessons_id_fk" FOREIGN KEY ("lesson_id") REFERENCES "public"."course_lessons"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_attendance" ADD CONSTRAINT "course_attendance_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_enrollments" ADD CONSTRAINT "course_enrollments_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "course_lessons" ADD CONSTRAINT "course_lessons_course_id_courses_id_fk" FOREIGN KEY ("course_id") REFERENCES "public"."courses"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "courses" ADD CONSTRAINT "courses_teacher_member_id_members_id_fk" FOREIGN KEY ("teacher_member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kids_checkins" ADD CONSTRAINT "kids_checkins_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kids_checkins" ADD CONSTRAINT "kids_checkins_child_id_kids_children_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."kids_children"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kids_checkins" ADD CONSTRAINT "kids_checkins_checked_in_by_user_id_fk" FOREIGN KEY ("checked_in_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kids_checkins" ADD CONSTRAINT "kids_checkins_checked_out_by_user_id_fk" FOREIGN KEY ("checked_out_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kids_checkins" ADD CONSTRAINT "kids_checkins_picked_up_by_guardian_id_kids_guardians_id_fk" FOREIGN KEY ("picked_up_by_guardian_id") REFERENCES "public"."kids_guardians"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kids_guardians" ADD CONSTRAINT "kids_guardians_child_id_kids_children_id_fk" FOREIGN KEY ("child_id") REFERENCES "public"."kids_children"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "kids_guardians" ADD CONSTRAINT "kids_guardians_guardian_member_id_members_id_fk" FOREIGN KEY ("guardian_member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worship_setlist_items" ADD CONSTRAINT "worship_setlist_items_setlist_id_worship_setlists_id_fk" FOREIGN KEY ("setlist_id") REFERENCES "public"."worship_setlists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worship_setlist_items" ADD CONSTRAINT "worship_setlist_items_song_id_worship_songs_id_fk" FOREIGN KEY ("song_id") REFERENCES "public"."worship_songs"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worship_setlists" ADD CONSTRAINT "worship_setlists_event_id_events_id_fk" FOREIGN KEY ("event_id") REFERENCES "public"."events"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worship_setlists" ADD CONSTRAINT "worship_setlists_ministry_id_ministries_id_fk" FOREIGN KEY ("ministry_id") REFERENCES "public"."ministries"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "worship_setlists" ADD CONSTRAINT "worship_setlists_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "user_preferences" ADD CONSTRAINT "user_preferences_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_thread_participants" ADD CONSTRAINT "message_thread_participants_thread_id_message_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."message_threads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_thread_participants" ADD CONSTRAINT "message_thread_participants_user_id_user_id_fk" FOREIGN KEY ("user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "message_threads" ADD CONSTRAINT "message_threads_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_thread_id_message_threads_id_fk" FOREIGN KEY ("thread_id") REFERENCES "public"."message_threads"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "messages" ADD CONSTRAINT "messages_sender_user_id_user_id_fk" FOREIGN KEY ("sender_user_id") REFERENCES "public"."user"("id") ON DELETE cascade ON UPDATE no action;