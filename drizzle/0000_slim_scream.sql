CREATE TABLE "installments" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_id" serial NOT NULL,
	"installment_number" serial NOT NULL,
	"amount" bigint NOT NULL,
	"status" varchar(20) DEFAULT 'pending' NOT NULL,
	"payment_date" timestamp,
	"payment_receipt_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "students" (
	"id" serial PRIMARY KEY NOT NULL,
	"student_name" text NOT NULL,
	"date_of_birth" timestamp NOT NULL,
	"father_name" text,
	"mother_name" text,
	"guardian_name" text,
	"contact_number" varchar(20) NOT NULL,
	"email" varchar(255) NOT NULL,
	"academic_year" varchar(9) NOT NULL,
	"is_new_student" boolean NOT NULL,
	"year_level" varchar(50) NOT NULL,
	"school_location" varchar(100) NOT NULL,
	"deposit_receipt_url" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "installments" ADD CONSTRAINT "installments_student_id_students_id_fk" FOREIGN KEY ("student_id") REFERENCES "public"."students"("id") ON DELETE no action ON UPDATE no action;