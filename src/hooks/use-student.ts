import { useQuery } from '@tanstack/react-query';

interface Student {
  id: number;
  studentName: string;
  dateOfBirth: string;
  yearLevel: string;
  academicYear: string;
  schoolLocation: string;
  contactNumber: string;
}

interface Installment {
  id: number;
  studentId: number;
  installmentNumber: number;
  amount: number;
  status: string;
  paymentDate: string | null;
  paymentReceiptUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface StudentData {
  student: Student;
  installments: Installment[];
}

export function useStudent(studentId: string) {
  return useQuery<StudentData>({
    queryKey: ['student', studentId],
    queryFn: async () => {
      const response = await fetch(`/api/students/${studentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch student data');
      }
      return response.json();
    },
  });
} 