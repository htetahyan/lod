import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { students, installments } from '@/lib/schema';
import { eq } from 'drizzle-orm';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const {id} = await params;
    const studentData = await db
      .select()
      .from(students)
      .where(eq(students.id, parseInt(id)));

    if (!studentData.length) {
      return NextResponse.json({ error: 'Student not found' }, { status: 404 });
    }

    const studentInstallments = await db
      .select()
      .from(installments)
      .where(eq(installments.studentId, parseInt(id)));

    // Format the student data
    const formattedStudent = {
      id: studentData[0].id,
      studentName: studentData[0].studentName,
      dateOfBirth: studentData[0].dateOfBirth.toISOString(),
      yearLevel: studentData[0].yearLevel,
      academicYear: studentData[0].academicYear,
      schoolLocation: studentData[0].schoolLocation,
      contactNumber: studentData[0].contactNumber,
    };

    // Format the installments data
    const formattedInstallments = studentInstallments.map(installment => ({
      id: installment.id,
      studentId: installment.studentId,
      installmentNumber: installment.installmentNumber,
      amount: installment.amount,
      status: installment.status,
      paymentDate: installment.paymentDate?.toISOString() ?? null,
      paymentReceiptUrl: installment.paymentReceiptUrl ?? null,
      createdAt: installment.createdAt.toISOString(),
      updatedAt: installment.updatedAt.toISOString(),
    }));

    return NextResponse.json({
      student: formattedStudent,
      installments: formattedInstallments,
    });
  } catch (error) {
    console.error('Error fetching student data:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 