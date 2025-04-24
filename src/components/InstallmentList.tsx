'use client';

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { ExternalLink, Receipt } from "lucide-react";
import Link from "next/link";
import { useParams } from "next/navigation";

interface Installment {
  id: number;
  installmentNumber: number;
  amount: number;
  status: string;
  paymentDate: string | null;
  paymentMethod: 'cash' | 'bank';
  bankName: string | null;
  paymentReceiptUrl?: string | null;
}

interface InstallmentListProps {
  installments: Installment[];
}

export function InstallmentList({ installments }: InstallmentListProps) {
  const { id: studentId } = useParams();
  
  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const formatAmount = (amount: number): string => {
    return new Intl.NumberFormat('en-US').format(amount);
  };

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Installment #</TableHead>
            <TableHead>Amount</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Payment Date</TableHead>
            <TableHead>Payment Method</TableHead>
            <TableHead>Bank Name</TableHead>
            <TableHead>Receipt</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {installments.map((installment) => (
            <TableRow key={installment.id}>
              <TableCell>{installment.installmentNumber}</TableCell>
              <TableCell>{formatAmount(installment.amount)}</TableCell>
              <TableCell>
                <Badge className={getStatusColor(installment.status)}>
                  {installment.status}
                </Badge>
              </TableCell>
              <TableCell>
                {installment.paymentDate
                  ? new Date(installment.paymentDate).toLocaleDateString()
                  : "-"}
              </TableCell>
              <TableCell>
                <Badge variant="outline" className="capitalize">
                  {installment.paymentMethod}
                </Badge>
              </TableCell>
              <TableCell>{installment.bankName || "-"}</TableCell>
              <TableCell>
                {installment.paymentReceiptUrl ? (
                  <a
                    href={installment.paymentReceiptUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1 text-blue-500 hover:text-blue-700"
                  >
                    View <ExternalLink size={16} />
                  </a>
                ) : (
                  "-"
                )}
              </TableCell>
              <TableCell>
                <Link
                  href={`/students/${studentId}/${installment.id}`}
                  className="flex items-center gap-1 text-blue-500 hover:text-blue-700"
                >
                  <Receipt size={16} />
                  View Receipt
                </Link>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
} 