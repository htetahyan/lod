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
    const { id, status, paymentMethod, paymentDate, paymentReceiptUrl } = await request.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    const updateData: any = {
      status
    };

    if (status === 'paid') {
      if (!paymentMethod || !paymentDate) {
        return NextResponse.json(
          { error: 'Payment method and date are required for paid status' },
          { status: 400 }
        );
      }
      
      updateData.paymentMethod = paymentMethod as (typeof paymentMethodEnum.enumValues)[number];
      updateData.paymentDate = new Date(paymentDate);
      updateData.paymentReceiptUrl = paymentReceiptUrl || null;
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