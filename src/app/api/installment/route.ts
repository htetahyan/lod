import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { students, installments } from '@/lib/schema';
import { eq, and } from 'drizzle-orm';

export const GET = async (req: Request) => {
  try {
    const { searchParams } = new URL(req.url);
    const studentName = searchParams.get('studentName');
    const dateOfBirth = searchParams.get('dateOfBirth');

    if (!studentName || !dateOfBirth) {
      return NextResponse.json(
        {
          success: false,
          error: 'Student name and date of birth are required',
        },
        { status: 400 }
      );
    }

    // Find student and their installments
    const student = await db
      .select()
      .from(students)
      .where(
        and(
          eq(students.studentName, studentName),
          eq(students.dateOfBirth, new Date(dateOfBirth))
        )
      );

    if (student.length === 0) {
      return NextResponse.json(
        {
          success: false,
          error: 'Student not found',
        },
        { status: 404 }
      );
    }

    // Get student's installments
    const studentInstallments = await db
      .select()
      .from(installments)
      .where(eq(installments.studentId, student[0].id));

    return NextResponse.json({
      success: true,
      data: {
        student: student[0],
        installments: studentInstallments,
      },
    });
  } catch (error) {
    console.error('Error fetching student:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to fetch student information',
      },
      { status: 500 }
    );
  }
};

export const POST = async (req: Request) => {
  try {
    const data = await req.json();
    const { studentId, amount, isOneTimePayment, paymentReceiptUrl } = data;

    if (!studentId || amount === undefined || isOneTimePayment === undefined || !paymentReceiptUrl) {
      return NextResponse.json(
        {
          success: false,
          error: 'Missing required fields',
        },
        { status: 400 }
      );
    }

    // Create installment record
    const [installment] = await db.insert(installments).values({
      studentId,
      installmentNumber: isOneTimePayment ? 0 : 1, // 0 for one-time payment, 1 for first installment
      amount,
      status: 'pending',
      paymentReceiptUrl,
      createdAt: new Date(),
      updatedAt: new Date(),
      paymentDate: null, // Explicitly set to null since it's not paid yet
    }).returning();

    return NextResponse.json({
      success: true,
      data: {
        installment: {
          ...installment,
          createdAt: installment.createdAt.toISOString(),
          updatedAt: installment.updatedAt.toISOString(),
          paymentDate: null,
        },
      },
    });
  } catch (error) {
    console.error('Error processing installment:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to process installment request',
      },
      { status: 500 }
    );
  }
};