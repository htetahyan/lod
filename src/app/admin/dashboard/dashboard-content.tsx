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
import { format, isValid, parseISO } from 'date-fns';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,

  DialogFooter,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Skeleton } from "@/components/ui/skeleton";
import { Textarea } from "@/components/ui/textarea";
import { Receipt } from "lucide-react";
import Link from "next/link";

interface Installment {
  id: number;
  studentId: number;
  studentName: string;
  amount: number;
  status: string;
  receiptUrl: string | null;
  paymentDate: string | null;
  installmentNumber: number | null;
  paymentReceiptUrl: string | null;
  createdAt: string;
  note: string | null;
  paymentMethod: string | null;
  bankName: string | null;
}

export function DashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [installments, setInstallments] = useState<Installment[]>([]);
  const [filteredInstallments, setFilteredInstallments] = useState<Installment[]>([]);
  const [searchTerm, setSearchTerm] = useState(searchParams.get('search') || '');
  const [statusFilter, setStatusFilter] = useState(searchParams.get('status') || 'all');
  const [currentPage, setCurrentPage] = useState(Number(searchParams.get('page')) || 1);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInstallment, setSelectedInstallment] = useState<number | null>(null);
  const [note, setNote] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [actionType, setActionType] = useState<'approve' | 'reject' | null>(null);
  const [isActionsMenuOpen, setIsActionsMenuOpen] = useState(false);
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
      const today = new Date().toISOString();
      
      const updateData = {
        id,
        status: newStatus, 
        note,
        paymentDate: newStatus === 'paid' ? today : null,
      };

      const response = await fetch('/api/admin/installments', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updateData),
      });

      if (response.ok) {
        toast.success('Status updated successfully');
        fetchInstallments(); // Refresh the list
        setIsDialogOpen(false);
        setNote('');
        setSelectedInstallment(null);
        setActionType(null);
      } else {
        toast.error('Failed to update status');
      }
    } catch {
      toast.error('Failed to update status');
    }
  };

  const openActionDialog = (id: number, action: 'approve' | 'reject') => {
    setSelectedInstallment(id);
    setActionType(action);
    
    // Find the selected installment
    const installment = installments.find(inst => inst.id === id);
    
    if (installment) {
      // Pre-fill existing values if updating
      setNote(installment.note || '');
    } else {
      // Default values if installment not found
      setNote('');
    }
    
    setIsDialogOpen(true);
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

  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-';
    try {
      const date = parseISO(dateString);
      return isValid(date) ? format(date, 'MMM dd, yyyy - hh:mm a') : '-';
    } catch {
      return '-';
    }
  };

  const openActionsMenu = (id: number) => {
    setSelectedInstallment(id);
    setIsActionsMenuOpen(true);
  };

  return (
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

        <div className="w-full overflow-x-auto">
          <Table className="min-w-full">
            <TableHeader>
              <TableRow>
                <TableHead className="w-[15%]">Student Name</TableHead>
                <TableHead className="w-[8%]">Installment</TableHead>
                <TableHead className="w-[10%]">Amount</TableHead>
                <TableHead className="w-[15%]">Created</TableHead>
                <TableHead className="w-[10%]">Payment Method</TableHead>
                <TableHead className="w-[10%]">Bank</TableHead>
                <TableHead className="w-[10%]">Status</TableHead>
                <TableHead className="w-[12%]">Note</TableHead>
                <TableHead className="w-[10%]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={9}>
                    <div className="space-y-2">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-full" />
                    </div>
                  </TableCell>
                </TableRow>
              ) : Array.isArray(currentInstallments) && currentInstallments.length > 0 ? (
                currentInstallments.map((installment) => (
                  <TableRow key={installment.id}>
                    <TableCell className="whitespace-nowrap overflow-hidden text-ellipsis max-w-[150px]">
                      {installment.studentName}
                    </TableCell>
                    <TableCell className="text-center">
                      {installment.installmentNumber === null ? 'One-Time' : installment.installmentNumber}
                    </TableCell>
                    <TableCell className="text-right">
                      {installment.amount.toLocaleString()} Ks
                    </TableCell>
                    <TableCell className="text-sm">
                      {formatDate(installment.createdAt)}
                    </TableCell>
                    <TableCell>
                      {installment.paymentMethod ? (
                        <Badge variant="outline" className="capitalize">
                          {installment.paymentMethod}
                        </Badge>
                      ) : '-'}
                    </TableCell>
                    <TableCell className="truncate max-w-[100px]">
                      {installment.bankName || '-'}
                    </TableCell>
                    <TableCell>
                      <Badge className={getStatusColor(installment.status)}>
                        {installment.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="truncate max-w-[150px]" title={installment.note || ''}>
                      {installment.note || '-'}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => openActionsMenu(installment.id)}
                        className="w-full"
                      >
                        Actions
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={9} className="text-center py-4">
                    No installments found
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {totalPages > 1 && (
          <div className="mt-4 flex justify-center">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious 
                    onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                    disabled={currentPage === 1}
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
                    disabled={currentPage === totalPages}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>
                {actionType === 'approve' 
                  ? (selectedInstallment && installments.find(i => i.id === selectedInstallment)?.status === 'paid' 
                    ? 'Update Payment' 
                    : 'Approve Payment')
                  : 'Reject Payment'}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <label htmlFor="note" className="text-sm font-medium">
                  Add a note
                </label>
                <Textarea
                  id="note"
                  placeholder="Enter any additional notes..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => {
                  setIsDialogOpen(false);
                  setNote('');
                  setSelectedInstallment(null);
                  setActionType(null);
                }}
              >
                Cancel
              </Button>
              <Button
                onClick={() => {
                  if (selectedInstallment && actionType) {
                    handleStatusChange(
                      selectedInstallment,
                      actionType === 'approve' ? 'paid' : 'rejected'
                    );
                  }
                }}
              >
                {actionType === 'approve' ? 'Approve' : 'Reject'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        <Dialog open={isActionsMenuOpen} onOpenChange={setIsActionsMenuOpen}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Actions</DialogTitle>
            </DialogHeader>
            <div className="grid grid-cols-1 gap-4 py-4">
              <Button
                onClick={() => {
                  setIsActionsMenuOpen(false);
                  openActionDialog(selectedInstallment!, 'approve');
                }}
                className="bg-green-50 text-green-600 hover:bg-green-100"
              >
                {selectedInstallment && 
                 installments.find(i => i.id === selectedInstallment)?.status === 'paid' 
                  ? 'Update Payment' 
                  : 'Approve Payment'}
              </Button>
              
              <Button
                onClick={() => {
                  setIsActionsMenuOpen(false);
                  openActionDialog(selectedInstallment!, 'reject');
                }}
                className="bg-red-50 text-red-600 hover:bg-red-100"
              >
                Reject Payment
              </Button>
              
              {selectedInstallment && installments.find(i => i.id === selectedInstallment)?.status === 'paid' && (
                <Link
                  href={`/students/${installments.find(i => i.id === selectedInstallment)?.studentId}/${selectedInstallment}`}
                  className="flex justify-center items-center gap-2 px-4 py-2 border rounded-md hover:bg-gray-50"
                >
                  <Receipt size={16} />
                  View Receipt
                </Link>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
} 