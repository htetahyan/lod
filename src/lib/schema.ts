import { bigint, boolean, pgTable, serial, text, timestamp, varchar } from 'drizzle-orm/pg-core';
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

// Installments table - tracks all installment payments
export const installments = pgTable('installments', {
  id: serial('id').primaryKey(),
  studentId: serial('student_id').references(() => students.id),
  installmentNumber: serial('installment_number').notNull(), // 0 for one-time payment, 1-7 for installments
  amount: bigint('amount', { mode: 'number' }).notNull(),
  status: varchar('status', { length: 20 }).notNull().default('pending'), // 'pending', 'paid', 'overdue'
  paymentDate: timestamp('payment_date'),
  paymentReceiptUrl: text('payment_receipt_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Add more tables here as needed 