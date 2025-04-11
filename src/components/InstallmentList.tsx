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
import { format } from 'date-fns';
import { Eye } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogTrigger,
} from "@/components/ui/dialog";
import Image from 'next/image';

interface Installment {
  id: number;
  installmentNumber: number;
  amount: number;
  status: string;
  paymentDate: string | null;
  paymentReceiptUrl: string | null;
  createdAt: string;
  updatedAt: string;
}

interface InstallmentListProps {
  installments: Installment[];
}

export function InstallmentList({ installments }: InstallmentListProps) {
  const getStatusColor = (status: string): string => {
    switch (status.toLowerCase()) {
      case 'paid':
        return 'bg-green-500/10 text-green-500 hover:bg-green-500/20';
      case 'pending':
        return 'bg-yellow-500/10 text-yellow-500 hover:bg-yellow-500/20';
      case 'overdue':
        return 'bg-red-500/10 text-red-500 hover:bg-red-500/20';
      default:
        return 'bg-gray-500/10 text-gray-500 hover:bg-gray-500/20';
    }
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
            <TableHead>Receipt</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {installments.map((installment) => (
            <TableRow key={installment.id}>
              <TableCell>{installment.installmentNumber}</TableCell>
              <TableCell>{installment.amount.toLocaleString()} MMK</TableCell>
              <TableCell>
                <Badge className={getStatusColor(installment.status)}>
                  {installment.status}
                </Badge>
              </TableCell>
              <TableCell>
                {installment.paymentDate
                  ? format(new Date(installment.paymentDate), 'MMM d, yyyy')
                  : '-'}
              </TableCell>
              <TableCell>
                {installment.paymentReceiptUrl ? (
                  <Dialog>
                    <DialogTrigger asChild>
                      <button className="inline-flex items-center justify-center rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 hover:bg-accent hover:text-accent-foreground h-10 w-10">
                        <Eye className="h-4 w-4" />
                      </button>
                    </DialogTrigger>
                    <DialogContent className="max-w-[90vw] max-h-[90vh] w-[800px] h-[600px]">
                      <div className="relative w-full h-full">
                        <Image
                          src={installment.paymentReceiptUrl}
                          alt={`Payment receipt for installment ${installment.installmentNumber}`}
                          fill
                          className="object-contain"
                          sizes="(max-width: 800px) 100vw, 800px"
                        />
                      </div>
                    </DialogContent>
                  </Dialog>
                ) : (
                  '-'
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  );
} 