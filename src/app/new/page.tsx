'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { YEAR_LEVELS, SCHOOL_LOCATIONS, CAMPUSES, ACADEMIC_YEARS } from "@/lib/constants";
import { ArrowLeft } from "lucide-react";

const validationSchema = Yup.object({
  studentName: Yup.string().required('Student name is required'),
  dateOfBirth: Yup.date().required('Date of birth is required'),
  yearLevel: Yup.string().required('Year level is required'),
  academicYear: Yup.string().required('Academic year is required'),
  schoolLocation: Yup.string().required('School location is required'),
  campus: Yup.string().required('Campus is required'),
  contactNumber: Yup.string().required('Contact number is required'),
});

export default function NewStudentPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const formik = useFormik({
    initialValues: {
      studentName: '',
      dateOfBirth: '',
      yearLevel: '',
      academicYear: '',
      schoolLocation: '',
      campus: '',
      contactNumber: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      setIsSubmitting(true);
      try {
        const response = await fetch('/api/students', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        });

        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Failed to create student');
        }

        toast.success('Student registered successfully');
        router.push(`/students/${data.student.id}`);
      } catch (error) {
        toast.error(error instanceof Error ? error.message : 'Failed to register student');
      } finally {
        setIsSubmitting(false);
      }
    },
  });

  return (
    <main className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      <div className="max-w-4xl mx-auto p-8">
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="text-muted-foreground hover:text-foreground flex items-center gap-2 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            Back
          </button>
        </div>
        
        <div className="space-y-6">
          <div>
            <h1 className="text-4xl font-bold tracking-tight">Register New Student</h1>
            <p className="text-muted-foreground mt-2">Fill in the student details to create a new registration.</p>
          </div>

          <form onSubmit={formik.handleSubmit}>
            <Card className="border-none shadow-lg bg-card/50 backdrop-blur-sm">
              <CardContent className="p-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Personal Information Section */}
                  <div className="space-y-6">
                    <div className="border-b pb-2">
                      <h2 className="text-lg font-semibold">Personal Information</h2>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="studentName" className="text-sm font-medium">Student Name</Label>
                        <Input
                          id="studentName"
                          {...formik.getFieldProps('studentName')}
                          className={`h-11 transition-all ${formik.errors.studentName && formik.touched.studentName ? 'border-destructive' : 'hover:border-primary'}`}
                          placeholder="Enter full name"
                        />
                        {formik.touched.studentName && formik.errors.studentName && (
                          <p className="text-sm text-destructive">{formik.errors.studentName}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="dateOfBirth" className="text-sm font-medium">Date of Birth</Label>
                        <Input
                          id="dateOfBirth"
                          type="date"
                          {...formik.getFieldProps('dateOfBirth')}
                          className={`h-11 transition-all ${formik.errors.dateOfBirth && formik.touched.dateOfBirth ? 'border-destructive' : 'hover:border-primary'}`}
                        />
                        {formik.touched.dateOfBirth && formik.errors.dateOfBirth && (
                          <p className="text-sm text-destructive">{formik.errors.dateOfBirth}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="contactNumber" className="text-sm font-medium">Contact Number</Label>
                        <Input
                          id="contactNumber"
                          {...formik.getFieldProps('contactNumber')}
                          className={`h-11 transition-all ${formik.errors.contactNumber && formik.touched.contactNumber ? 'border-destructive' : 'hover:border-primary'}`}
                          placeholder="Enter contact number"
                        />
                        {formik.touched.contactNumber && formik.errors.contactNumber && (
                          <p className="text-sm text-destructive">{formik.errors.contactNumber}</p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Academic Information Section */}
                  <div className="space-y-6">
                    <div className="border-b pb-2">
                      <h2 className="text-lg font-semibold">Academic Information</h2>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="academicYear" className="text-sm font-medium">Academic Year</Label>
                        <Select
                          name="academicYear"
                          value={formik.values.academicYear}
                          onValueChange={(value) => formik.setFieldValue('academicYear', value)}
                        >
                          <SelectTrigger id="academicYear" className={`h-11 transition-all ${formik.errors.academicYear && formik.touched.academicYear ? 'border-destructive' : 'hover:border-primary'}`}>
                            <SelectValue placeholder="Select academic year" />
                          </SelectTrigger>
                          <SelectContent>
                            {ACADEMIC_YEARS.map((year) => (
                              <SelectItem key={year.value} value={year.value}>
                                {year.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {formik.touched.academicYear && formik.errors.academicYear && (
                          <p className="text-sm text-destructive">{formik.errors.academicYear}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="yearLevel" className="text-sm font-medium">Year Level</Label>
                        <Select
                          name="yearLevel"
                          value={formik.values.yearLevel}
                          onValueChange={(value) => formik.setFieldValue('yearLevel', value)}
                        >
                          <SelectTrigger id="yearLevel" className={`h-11 transition-all ${formik.errors.yearLevel && formik.touched.yearLevel ? 'border-destructive' : 'hover:border-primary'}`}>
                            <SelectValue placeholder="Select year level" />
                          </SelectTrigger>
                          <SelectContent>
                            {YEAR_LEVELS.map((level) => (
                              <SelectItem key={level.value} value={level.value}>
                                {level.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {formik.touched.yearLevel && formik.errors.yearLevel && (
                          <p className="text-sm text-destructive">{formik.errors.yearLevel}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="schoolLocation" className="text-sm font-medium">School Location</Label>
                        <Select
                          name="schoolLocation"
                          value={formik.values.schoolLocation}
                          onValueChange={(value) => formik.setFieldValue('schoolLocation', value)}
                        >
                          <SelectTrigger id="schoolLocation" className={`h-11 transition-all ${formik.errors.schoolLocation && formik.touched.schoolLocation ? 'border-destructive' : 'hover:border-primary'}`}>
                            <SelectValue placeholder="Select location" />
                          </SelectTrigger>
                          <SelectContent>
                            {SCHOOL_LOCATIONS.map((location) => (
                              <SelectItem key={location.value} value={location.value}>
                                {location.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {formik.touched.schoolLocation && formik.errors.schoolLocation && (
                          <p className="text-sm text-destructive">{formik.errors.schoolLocation}</p>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label htmlFor="campus" className="text-sm font-medium">Campus</Label>
                        <Select
                          name="campus"
                          value={formik.values.campus}
                          onValueChange={(value) => formik.setFieldValue('campus', value)}
                        >
                          <SelectTrigger id="campus" className={`h-11 transition-all ${formik.errors.campus && formik.touched.campus ? 'border-destructive' : 'hover:border-primary'}`}>
                            <SelectValue placeholder="Select campus" />
                          </SelectTrigger>
                          <SelectContent>
                            {CAMPUSES.map((campus) => (
                              <SelectItem key={campus.value} value={campus.value}>
                                {campus.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {formik.touched.campus && formik.errors.campus && (
                          <p className="text-sm text-destructive">{formik.errors.campus}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-8 flex justify-end">
                  <Button
                    type="submit"
                    disabled={isSubmitting || !formik.isValid}
                    className="w-full md:w-auto min-w-[200px] h-11"
                  >
                    {isSubmitting ? 'Registering...' : 'Complete Registration'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          </form>
        </div>
      </div>
    </main>
  );
} 