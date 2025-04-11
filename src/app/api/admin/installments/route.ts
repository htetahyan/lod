import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { installments, students } from '@/lib/schema';
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
      })
      .from(installments)
      .leftJoin(students, eq(installments.studentId, students.id))
      .orderBy(installments.createdAt);

    return NextResponse.json(allInstallments);
  } catch (error) {
    console.error('Error fetching installments:', error);
    return NextResponse.json(
      { error: 'Failed to fetch installments' },
      { status: 500 }
    );
  }
}

export async function PATCH(req: Request) {
  try {
    const { id, status } = await req.json();

    if (!id || !status) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Update the installment status and payment date
    const updateData = { status } as { status: string; paymentDate?: Date };
    
    // If status is being changed to paid, set the payment date
    if (status === 'paid') {
      updateData.paymentDate = new Date();
    }

    const updatedInstallment = await db
      .update(installments)
      .set(updateData)
      .where(eq(installments.id, id))
      .returning();

    if (!updatedInstallment.length) {
      return NextResponse.json(
        { error: 'Installment not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(updatedInstallment[0]);
  } catch (error) {
    console.error('Error updating installment:', error);
    return NextResponse.json(
      { error: 'Failed to update installment' },
      { status: 500 }
    );
  }
} 