import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { db } from '@/lib/db';
import { installments, students, paymentMethodEnum } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET() {
  try {
    // Get all installments with student information
    const allInstallments = await db
      .select({
        id: installments.id,
        studentId: installments.studentId,
        studentName: students.studentName,
        receiptUrl: installments.paymentReceiptUrl,
        amount: installments.amount,
        status: installments.status,
        paymentDate: installments.paymentDate,
        installmentNumber: installments.installmentNumber,
        createdAt: installments.createdAt,
        note: installments.note,
        paymentMethod: installments.paymentMethod,
        bankName: installments.bankName,
      })
      .from(installments)
      .leftJoin(students, eq(installments.studentId, students.id))
      .orderBy(installments.createdAt);

    // Format dates to ISO strings
    const formattedInstallments = allInstallments.map(installment => ({
      ...installment,
      createdAt: installment.createdAt.toISOString(),
      paymentDate: installment.paymentDate?.toISOString() ?? null,
    }));

    return NextResponse.json(formattedInstallments);
  } catch (error) {
    console.error('Error fetching installments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch installments' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const { id, status, note, paymentDate } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Get current installment to preserve student-provided payment information
    const currentInstallment = await db
      .select()
      .from(installments)
      .where(eq(installments.id, id))
      .limit(1);

    if (!currentInstallment || currentInstallment.length === 0) {
      return NextResponse.json(
        { error: 'Installment not found' },
        { status: 404 }
      );
    }

    const updateData: any = {
      status,
      updatedAt: new Date()
    };

    if (note) {
      updateData.note = note;
    }

    if (status === 'paid') {
      updateData.paymentDate = new Date(paymentDate || new Date());
      // Payment method and bank name are kept as is from the student's submission
    } else if (status === 'rejected') {
      // For rejected status, keep the payment information for record-keeping
      // but set payment date to null
      updateData.paymentDate = null;
    }

    const result = await db
      .update(installments)
      .set(updateData)
      .where(eq(installments.id, id))
      .returning();

    return NextResponse.json(result[0]);
  } catch (error) {
    console.error('Error updating installment:', error);
    return NextResponse.json(
      { error: 'Failed to update installment' },
      { status: 500 }
    );
  }
} 