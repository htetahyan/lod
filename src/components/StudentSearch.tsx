'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

interface StudentSearchProps {
  onStudentFound: (student: any, installments: any[]) => void;
}

export function StudentSearch({ onStudentFound }: StudentSearchProps) {
  const [studentName, setStudentName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSearch = async () => {
    if (!studentName && !contactNumber) {
      toast.error("Please provide either student name or contact number");
      return;
    }

    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (studentName) {
        params.append('studentName', studentName);
      }
      if (contactNumber) {
        params.append('contactNumber', contactNumber);
      }

      const response = await fetch(`/api/installment?${params.toString()}`);
      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      onStudentFound(data.data.student, data.data.installments);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to find student");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>Search Student</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="studentName">Student Name</Label>
          <Input
            id="studentName"
            value={studentName}
            onChange={(e) => setStudentName(e.target.value)}
            placeholder="Enter student name"
            autoComplete="off"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="contactNumber">Contact Number</Label>
          <Input
            id="contactNumber"
            value={contactNumber}
            onChange={(e) => setContactNumber(e.target.value)}
            placeholder="Enter contact number"
            autoComplete="off"
          />
        </div>

        <Button
          className="w-full"
          onClick={handleSearch}
          disabled={isLoading}
        >
          {isLoading ? "Searching..." : "Search"}
        </Button>
      </CardContent>
    </Card>
  );
} 