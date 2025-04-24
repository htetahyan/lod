import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Installment {
  id: number;
  studentId: number;
  installmentNumber: number | null;
  amount: number;
  status: string;
  paymentReceiptUrl: string;
  createdAt: string;
  updatedAt: string;
  paymentDate: string | null;
}

interface CreateInstallmentPayload {
  studentId: number;
  amount: number;
  isOneTimePayment: boolean;
  installmentNumber: number | null;
  paymentReceiptUrl: string;
  paymentMethod: 'cash' | 'bank';
  bankName: string | null;
}

interface UpdateInstallmentStatusPayload {
  id: number;
  status: 'pending' | 'paid' | 'overdue';
}

// Fetch installments for a student
export function useStudentInstallments(studentId: number) {
  return useQuery({
    queryKey: ['installments', studentId],
    queryFn: async () => {
      const response = await fetch(`/api/installment?studentId=${studentId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch installments');
      }
      const data = await response.json();
      return data.data.installments as Installment[];
    },
  });
}

// Create a new installment
export function useCreateInstallment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: CreateInstallmentPayload) => {
      const response = await fetch('/api/installment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installments'] });
      toast.success('Installment created successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
}

export function useUpdateInstallmentStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (payload: UpdateInstallmentStatusPayload) => {
      const response = await fetch(`/api/installment/${payload.id}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: payload.status }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error);
      }

      return data.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['installments'] });
      toast.success('Installment status updated successfully');
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });
} 