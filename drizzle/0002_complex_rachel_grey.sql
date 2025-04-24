CREATE TYPE "public"."installment_type" AS ENUM('one_time', 'monthly');--> statement-breakpoint
ALTER TABLE "installments" ALTER COLUMN "installment_number" SET DATA TYPE integer;--> statement-breakpoint
ALTER TABLE "installments" ALTER COLUMN "installment_number" DROP NOT NULL;--> statement-breakpoint
ALTER TABLE "installments" ADD COLUMN "installment_type" "installment_type";--> statement-breakpoint
ALTER TABLE "students" DROP COLUMN "deposit_receipt_url";