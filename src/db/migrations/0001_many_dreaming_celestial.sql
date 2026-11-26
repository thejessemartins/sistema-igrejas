CREATE TABLE "member_family_links" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" uuid NOT NULL,
	"related_member_id" uuid NOT NULL,
	"relation" text NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "member_family_links_pair_unique" UNIQUE("member_id","related_member_id")
);
--> statement-breakpoint
CREATE TABLE "member_history" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"member_id" uuid NOT NULL,
	"field" text NOT NULL,
	"old_value" text,
	"new_value" text,
	"changed_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "members" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"birth_date" date,
	"cpf" text,
	"phone" text,
	"email" text,
	"address_street" text,
	"address_number" text,
	"address_complement" text,
	"address_district" text,
	"address_city" text,
	"address_state" text,
	"address_zip" text,
	"marital_status" text,
	"baptism_date" date,
	"joined_at" date,
	"photo_path" text,
	"status" text DEFAULT 'ativo' NOT NULL,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp,
	CONSTRAINT "members_cpf_unique" UNIQUE("cpf")
);
--> statement-breakpoint
ALTER TABLE "member_family_links" ADD CONSTRAINT "member_family_links_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_family_links" ADD CONSTRAINT "member_family_links_related_member_id_members_id_fk" FOREIGN KEY ("related_member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_history" ADD CONSTRAINT "member_history_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "member_history" ADD CONSTRAINT "member_history_changed_by_user_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "members_full_name_idx" ON "members" USING btree ("full_name");--> statement-breakpoint
CREATE INDEX "members_cpf_idx" ON "members" USING btree ("cpf");--> statement-breakpoint
CREATE INDEX "members_status_idx" ON "members" USING btree ("status");--> statement-breakpoint
CREATE INDEX "members_birth_date_idx" ON "members" USING btree ("birth_date");