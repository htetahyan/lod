'use client';

import { StudentSearch } from '@/components/StudentSearch';
import { Button } from '@/components/ui/button';
import { UserPlus } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function Home() {
  const router = useRouter();

  return (
    <main className="min-h-screen p-8 bg-background">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="flex flex-col items-center space-y-4">
          <h1 className="text-3xl font-bold text-center text-foreground">
            Student Fee Management
          </h1>
          <p className="text-muted-foreground text-center">
            Search for a student or create a new student record
          </p>
        </div>

        <div className="space-y-6">
          <StudentSearch />
          
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t" />
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>

          <Button 
            onClick={() => router.push('/new')}
            variant="outline"
            className="w-full"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            Register New Student
          </Button>
        </div>
      </div>
    </main>
  );
}
