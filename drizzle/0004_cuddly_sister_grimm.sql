CREATE TYPE "public"."payment_method" AS ENUM('cash', 'bank');--> statement-breakpoint
ALTER TABLE "installments" ADD COLUMN "payment_method" "payment_method";--> statement-breakpoint
ALTER TABLE "installments" ADD COLUMN "bank_name" varchar(100);