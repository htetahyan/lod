import { bigint, boolean, pgEnum, pgTable, serial, text, timestamp, varchar, integer } from 'drizzle-orm/pg-core';
// Students table - contains all student and enrollment information
export const students = pgTable('students', {
  id: serial('id').primaryKey(),
  studentName: text('student_name').notNull(),
  dateOfBirth: timestamp('date_of_birth').notNull(),
  fatherName: text('father_name'),
  motherName: text('mother_name'),
  guardianName: text('guardian_name'),
  contactNumber: varchar('contact_number', { length: 20 }).notNull(),
  // Enrollment fields
  academicYear: varchar('academic_year', { length: 9 }).notNull(), // e.g. "2025-2026"
  isNewStudent: boolean('is_new_student').notNull(),
  yearLevel: varchar('year_level', { length: 50 }).notNull(), // e.g. "Primary Year 1", "IGCSE"
  schoolLocation: varchar('school_location', { length: 100 }).notNull(), // e.g. "Yangon Campus (Kamayut)"
  campus: varchar('campus', { length: 50 }).notNull(), // e.g. "Main Campus"
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});
export const installmentTypeEnum = pgEnum('installment_type', ['one_time', 'monthly']);
export const paymentMethodEnum = pgEnum('payment_method', ['cash', 'bank']);
// Installments table - tracks all installment payments
export const installments = pgTable('installments', {
  id: serial('id').primaryKey(),
  studentId: serial('student_id').references(() => students.id),
  installmentType: installmentTypeEnum('installment_type'),
  installmentNumber: integer('installment_number'), // null for one-time payment, 1-7 for installments
  amount: bigint('amount', { mode: 'number' }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'), // 'pending', 'paid', 'rejected'
  paymentDate: timestamp('payment_date'),
  paymentReceiptUrl: text('payment_receipt_url'),
  note: text('note'),
  paymentMethod: paymentMethodEnum('payment_method'),
  bankName: varchar('bank_name', { length: 100 }),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Add more tables here as needed 