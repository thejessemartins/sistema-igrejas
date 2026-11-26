CREATE TABLE "church_settings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"church_name" text DEFAULT 'Igreja Local' NOT NULL,
	"legal_name" text,
	"cnpj" text,
	"email" text,
	"phone" text,
	"address" text,
	"logo_path" text,
	"default_currency" text DEFAULT 'BRL' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
