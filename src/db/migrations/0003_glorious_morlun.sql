CREATE TABLE "cell_meeting_attendance" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cell_meeting_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"status" text DEFAULT 'presente' NOT NULL,
	CONSTRAINT "cell_meeting_attendance_unique" UNIQUE("cell_meeting_id","member_id")
);
--> statement-breakpoint
CREATE TABLE "cell_meetings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cell_id" uuid NOT NULL,
	"meeting_date" date NOT NULL,
	"topic" text NOT NULL,
	"notes" text,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "cell_members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cell_id" uuid NOT NULL,
	"member_id" uuid NOT NULL,
	"joined_at" date NOT NULL,
	"left_at" date
);
--> statement-breakpoint
CREATE TABLE "cells" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"leader_member_id" uuid NOT NULL,
	"co_leader_member_id" uuid,
	"weekday" integer NOT NULL,
	"meeting_time" text NOT NULL,
	"address_street" text,
	"address_district" text,
	"address_city" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "cell_meeting_attendance" ADD CONSTRAINT "cell_meeting_attendance_cell_meeting_id_cell_meetings_id_fk" FOREIGN KEY ("cell_meeting_id") REFERENCES "public"."cell_meetings"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cell_meeting_attendance" ADD CONSTRAINT "cell_meeting_attendance_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cell_meetings" ADD CONSTRAINT "cell_meetings_cell_id_cells_id_fk" FOREIGN KEY ("cell_id") REFERENCES "public"."cells"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cell_meetings" ADD CONSTRAINT "cell_meetings_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cell_members" ADD CONSTRAINT "cell_members_cell_id_cells_id_fk" FOREIGN KEY ("cell_id") REFERENCES "public"."cells"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cell_members" ADD CONSTRAINT "cell_members_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cells" ADD CONSTRAINT "cells_leader_member_id_members_id_fk" FOREIGN KEY ("leader_member_id") REFERENCES "public"."members"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "cells" ADD CONSTRAINT "cells_co_leader_member_id_members_id_fk" FOREIGN KEY ("co_leader_member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;