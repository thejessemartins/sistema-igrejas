CREATE TABLE "aid_beneficiaries" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"phone" text,
	"address_district" text,
	"family_size" integer DEFAULT 1 NOT NULL,
	"notes" text,
	"is_member" boolean DEFAULT false NOT NULL,
	"member_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
CREATE TABLE "item_donations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"project_id" uuid NOT NULL,
	"donor_member_id" uuid,
	"donor_text" text,
	"item_description" text NOT NULL,
	"quantity" integer DEFAULT 1 NOT NULL,
	"unit" text DEFAULT 'un' NOT NULL,
	"donated_at" date NOT NULL,
	"delivered_at" date,
	"beneficiary_id" uuid,
	"financial_transaction_id" uuid,
	"created_by" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "social_projects" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"description" text,
	"kind" text NOT NULL,
	"starts_at" date NOT NULL,
	"ends_at" date,
	"goal_cents" integer,
	"responsible_member_id" uuid,
	"status" text DEFAULT 'ativo' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"deleted_at" timestamp
);
--> statement-breakpoint
ALTER TABLE "aid_beneficiaries" ADD CONSTRAINT "aid_beneficiaries_member_id_members_id_fk" FOREIGN KEY ("member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_donations" ADD CONSTRAINT "item_donations_project_id_social_projects_id_fk" FOREIGN KEY ("project_id") REFERENCES "public"."social_projects"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_donations" ADD CONSTRAINT "item_donations_donor_member_id_members_id_fk" FOREIGN KEY ("donor_member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_donations" ADD CONSTRAINT "item_donations_beneficiary_id_aid_beneficiaries_id_fk" FOREIGN KEY ("beneficiary_id") REFERENCES "public"."aid_beneficiaries"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_donations" ADD CONSTRAINT "item_donations_financial_transaction_id_financial_transactions_id_fk" FOREIGN KEY ("financial_transaction_id") REFERENCES "public"."financial_transactions"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "item_donations" ADD CONSTRAINT "item_donations_created_by_user_id_fk" FOREIGN KEY ("created_by") REFERENCES "public"."user"("id") ON DELETE set null ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "social_projects" ADD CONSTRAINT "social_projects_responsible_member_id_members_id_fk" FOREIGN KEY ("responsible_member_id") REFERENCES "public"."members"("id") ON DELETE set null ON UPDATE no action;