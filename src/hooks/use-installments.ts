import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Installment {
  id: number;
  studentId: number;
  installmentNumber: number;
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
  paymentReceiptUrl: string;
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

  return useMutation<Installment, Error, CreateInstallmentPayload>({
    mutationFn: async (payload) => {
      const response = await fetch('/api/installment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create installment');
      }

      const data = await response.json();
      return data.data.installment as Installment;
    },
    onSuccess: (_data: Installment, variables: CreateInstallmentPayload) => {
      // Invalidate the installments query for this student
      queryClient.invalidateQueries({
        queryKey: ['installments', variables.studentId],
      });
      toast.success('Installment created successfully');
    },
    onError: (error: Error) => {
      toast.error(`Failed to create installment: ${error.message}`);
    },
  });
} 