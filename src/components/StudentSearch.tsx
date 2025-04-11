'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export interface Student {
  id: number;
  studentName: string;
  dateOfBirth: string;
  yearLevel: string;
  academicYear: string;
}

export function StudentSearch() {
  const router = useRouter();
  const [studentName, setStudentName] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    try {
      const response = await fetch(`/api/installment?studentName=${encodeURIComponent(studentName)}&dateOfBirth=${encodeURIComponent(dateOfBirth)}`);
      const data = await response.json();
      
      if (data.success) {
        router.push(`/students/${data.data.student.id}`);
      } else {
        toast.error(data.error || 'Student not found');
      }
    } catch {
      toast.error('Failed to search for student');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full">
      <CardContent className="pt-6">
        <form onSubmit={handleSearch} className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label htmlFor="studentName" className="text-sm font-medium">
                Student Name
              </label>
              <Input
                id="studentName"
                name="studentName"
                placeholder="Enter student name"
                value={studentName}
                onChange={(e) => setStudentName(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <label htmlFor="dateOfBirth" className="text-sm font-medium">
                Date of Birth
              </label>
              <Input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
              />
            </div>
          </div>
          <Button
            type="submit"
            disabled={isLoading || (!studentName && !dateOfBirth)}
            className="w-full"
          >
            {isLoading ? 'Searching...' : 'Search Student'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 