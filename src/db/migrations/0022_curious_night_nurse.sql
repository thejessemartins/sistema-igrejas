CREATE TABLE "role_permissions" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"role" text NOT NULL,
	"module" text NOT NULL,
	"action" text NOT NULL,
	"allowed" boolean NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "role_permissions_role_mod_act_unique" UNIQUE("role","module","action")
);
