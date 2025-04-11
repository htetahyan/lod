'use client';

import { useQuery } from '@tanstack/react-query';
import { Card, CardHeader, CardContent, CardTitle } from "@/components/ui/card";
import { format } from 'date-fns';
import { InstallmentList } from '@/components/InstallmentList';
import { NewInstallmentForm } from '@/components/NewInstallmentForm';
import { StudentSkeleton } from '@/components/StudentSkeleton';
import { useParams } from 'next/navigation';

export default function StudentPageClient() {
  const { id } = useParams();
  const studentId = id as string;
  const { data, isLoading, error } = useQuery({
    queryKey: ['student', studentId],
    queryFn: async () => {
      const response = await fetch(`/api/students/${studentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch student data');
      }
      return response.json();
    },
  });

  if (isLoading) {
    return <StudentSkeleton />;
  }

  if (error) {
    return (
      <div className="p-4 text-red-500">
        Error loading student data: {error.message}
      </div>
    );
  }

  if (!data) {
    return (
      <div className="p-4 text-gray-500">
        Student not found
      </div>
    );
  }

  const { student, installments } = data;

  return (
    <div className="min-h-screen p-6">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Student Information - Left Side */}
          <div className="lg:col-span-1">
            <Card className="sticky top-6">
              <CardHeader>
                <CardTitle className="text-xl font-bold">{student.studentName}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(student.dateOfBirth), 'MMM d, yyyy')}
                </p>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Year Level</p>
                  <p className="text-sm">{student.yearLevel}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Academic Year</p>
                  <p className="text-sm">{student.academicYear}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">School Location</p>
                  <p className="text-sm">{student.schoolLocation}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm font-medium text-muted-foreground">Contact Number</p>
                  <p className="text-sm">{student.contactNumber}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Installments - Right Side */}
          <div className="lg:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>New Installment</CardTitle>
              </CardHeader>
              <CardContent>
                <NewInstallmentForm studentId={student.id} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Installment History</CardTitle>
              </CardHeader>
              <CardContent>
                <InstallmentList installments={installments} />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
} 