'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { format } from 'date-fns';
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";

interface Installment {
  id: number;
  studentId: number;
  studentName: string;
  amount: number;
  status: string;
  receiptUrl: string | null;
  paymentDate: string | null;
  installmentNumber: number;
  paymentReceiptUrl: string | null;
}

export default function AdminDashboard() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [filteredInstallments, setFilteredInstallments] = useState<Installment[]>([]);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const [isLoading, setIsLoading] = useState(true);
  const itemsPerPage = 10;

  // Update URL when filters change
  useEffect(() => {
    const params = new URLSearchParams();
    if (searchTerm) params.set('search', searchTerm);
    if (statusFilter !== 'all') params.set('status', statusFilter);
    if (currentPage > 1) params.set('page', currentPage.toString());
    
    const newUrl = params.toString() ? `?${params.toString()}` : '/admin/dashboard';
    router.push(newUrl, { scroll: false });
  }, [searchTerm, statusFilter, currentPage, router]);

  useEffect(() => {
    // Check authentication
    const isAuthenticated = localStorage.getItem('adminAuth') === 'true';
    if (!isAuthenticated) {
      router.push('/admin/login');
      return;
    }

    // Fetch installments
    fetchInstallments();
  }, [router]);

  const fetchInstallments = async () => {
    try {
      setIsLoading(true);
      const response = await fetch('/api/admin/installments');
      const data = await response.json();
      // Ensure data is an array
      const installmentsArray = Array.isArray(data) ? data : [];
      setInstallments(installmentsArray);
      setFilteredInstallments(installmentsArray);
    } catch {
      toast.error('Failed to fetch installments');
      // Set empty arrays on error
      setInstallments([]);
      setFilteredInstallments([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Ensure we're working with arrays
    let filtered = Array.isArray(installments) ? [...installments] : [];

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(installment =>
        installment.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        installment.id.toString().includes(searchTerm)
      );
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(installment => installment.status === statusFilter);
    }

    setFilteredInstallments(filtered);
    // Only reset page if filters changed (not on initial load)
    if (searchParams.get('page')) {
      setCurrentPage(1);
    }
  }, [searchTerm, statusFilter, installments, searchParams]);

  const handleStatusChange = async (id: number, newStatus: string) => {
    try {
      const response = await fetch('/api/admin/installments', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status: newStatus }),
      });

      if (response.ok) {
        toast.success('Status updated successfully');
        fetchInstallments(); // Refresh the list
      } else {
        toast.error('Failed to update status');
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-500/10 text-green-500';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500';
      case 'rejected':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-gray-500/10 text-gray-500';
    }
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredInstallments.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentInstallments = filteredInstallments.slice(startIndex, endIndex);

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>Payment Management</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-4">
            <Input
              placeholder="Search by student name or ID..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="max-w-sm"
            />
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border rounded-md px-3"
            >
              <option value="all">All Status</option>
              <option value="pending">Pending</option>
              <option value="paid">Paid</option>
            </select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Student Name</TableHead>
                <TableHead>Installment #</TableHead>
                <TableHead>Amount</TableHead>
                <TableHead>Payment Date</TableHead>
                <TableHead>Receipt</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                // Loading skeleton
                Array.from({ length: 5 }).map((_, index) => (
                  <TableRow key={index}>
                    <TableCell><Skeleton className="h-4 w-[200px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[50px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[100px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[80px]" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-[120px]" /></TableCell>
                  </TableRow>
                ))
              ) : Array.isArray(currentInstallments) && currentInstallments.length > 0 ? (
                currentInstallments.map((installment) => (
                  <TableRow key={installment.id}>
                    <TableCell>{installment.studentName}</TableCell>
                    <TableCell>{installment.installmentNumber}</TableCell>
                    <TableCell>{installment.amount.toLocaleString()} Ks</TableCell>
                    <TableCell>
                      {installment.paymentDate
                        ? format(new Date(installment.paymentDate), 'MMM dd, yyyy')
                        : '-'}
                    </TableCell>
                    <TableCell>
                      {installment.receiptUrl ? (
                        <a 
                          href={installment.receiptUrl} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-primary hover:underline"
                        >
                          View Receipt
                        </a>
                      ) : (
                        '-'
                      )}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(installment.status)}>
                        {installment.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {installment.status === 'pending' && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleStatusChange(installment.id, 'paid')}
                          >
                            Approve
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleStatusChange(installment.id, 'rejected')}
                        >
                          Reject
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-4">
                    No installments found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {!isLoading && totalPages > 1 && (
            <div className="mt-4">
              <Pagination>
                <PaginationContent>
                  <PaginationItem>
                    <PaginationPrevious
                      onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                      className={currentPage === 1 ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                  
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <PaginationItem key={page}>
                      <PaginationLink
                        onClick={() => setCurrentPage(page)}
                        isActive={currentPage === page}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                  
                  <PaginationItem>
                    <PaginationNext
                      onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                      className={currentPage === totalPages ? 'pointer-events-none opacity-50' : ''}
                    />
                  </PaginationItem>
                </PaginationContent>
              </Pagination>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
} 