import { NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { students } from '@/lib/schema';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Create new student
    const [newStudent] = await db.insert(students).values({
      studentName: body.studentName,
      dateOfBirth: new Date(body.dateOfBirth),
      yearLevel: body.yearLevel,
      academicYear: body.academicYear,
      schoolLocation: body.schoolLocation,
      campus: body.campus,
      contactNumber: body.contactNumber,
      isNewStudent: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      fatherName: null,
      motherName: null,
      guardianName: null,
    }).returning();

    return NextResponse.json({
      success: true,
      student: newStudent,
    });
  } catch (error) {
    console.error('Error creating student:', error);
    return NextResponse.json(
      {
        success: false,
        message: 'Failed to create student',
      },
      { status: 500 }
    );
  }
} 