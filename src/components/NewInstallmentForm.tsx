'use client';

import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { UploadButton } from "@/utils/uploadthing";
import { toast } from "sonner";
import { useState } from "react";
import { Upload } from "lucide-react";
import { useCreateInstallment } from "@/hooks/use-installments";
import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';

interface NewInstallmentFormProps {
  studentId: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface FormValues {
  amount: string;
  isOneTimePayment: boolean;
  paymentReceiptUrl: string;
}

const validationSchema = Yup.object({
  amount: Yup.number()
    .required('Amount is required')
    .positive('Amount must be positive')
    .integer('Amount must be a whole number'),
  isOneTimePayment: Yup.boolean().required('Payment type is required'),
  paymentReceiptUrl: Yup.string().required('Payment proof is required'),
});

export function NewInstallmentForm({ studentId, onSuccess, onError }: NewInstallmentFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { mutate: createInstallment, isPending } = useCreateInstallment();
  const queryClient = useQueryClient();

  const formik = useFormik<FormValues>({
    initialValues: {
      amount: '',
      isOneTimePayment: true,
      paymentReceiptUrl: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        createInstallment({
          studentId,
          amount: Number(values.amount),
          isOneTimePayment: values.isOneTimePayment,
          paymentReceiptUrl: values.paymentReceiptUrl,
        }, {
          onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: ['student', studentId.toString()] });
            formik.resetForm();
            onSuccess?.();
          },
          onError: (error: Error) => {
            onError?.(error);
          },
        });
      } catch (error) {
        onError?.(error instanceof Error ? error : new Error('An unexpected error occurred'));
      }
    },
  });

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>New Installment</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={formik.handleSubmit} className="space-y-6">
          <div className="space-y-3">
            <Label>Payment Type</Label>
            <RadioGroup
              defaultValue={formik.values.isOneTimePayment.toString()}
              onValueChange={(value: string) =>
                formik.setFieldValue('isOneTimePayment', value === 'true')
              }
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="true" id="one-time" />
                <Label htmlFor="one-time">One-Time Payment</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="false" id="installment" />
                <Label htmlFor="installment">Installment</Label>
              </div>
            </RadioGroup>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount">Amount (MMK)</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                Ks
              </span>
              <Input
                id="amount"
                name="amount"
                type="number"
                min="0"
                step="1"
                placeholder="Enter amount in Kyats"
                value={formik.values.amount}
                onChange={formik.handleChange}
                className={cn(
                  "pl-10",
                  formik.touched.amount && formik.errors.amount && "border-destructive"
                )}
              />
            </div>
            {formik.touched.amount && formik.errors.amount && (
              <p className="text-sm text-destructive">{formik.errors.amount}</p>
            )}
            {formik.values.amount && !formik.errors.amount && (
              <p className="text-sm text-muted-foreground mt-1">
                {Number(formik.values.amount).toLocaleString()} MMK
              </p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Payment Proof</Label>
            {!formik.values.paymentReceiptUrl ? (
              <div className="mt-2">
                <div className="flex flex-col items-center justify-center gap-2 p-4 border-2 border-dashed rounded-lg bg-muted/50">
                  <UploadButton
                    endpoint="paymentProof"
                    onUploadBegin={() => {
                      setIsUploading(true);
                      toast.info('Uploading payment proof...');
                    }}
                    onClientUploadComplete={(res) => {
                      setIsUploading(false);
                      if (res && res.length > 0) {
                        formik.setFieldValue('paymentReceiptUrl', res[0].url);
                        toast.success('Payment proof uploaded successfully!');
                      }
                    }}
                    onUploadError={(error: Error) => {
                      setIsUploading(false);
                      toast.error(`Upload failed: ${error.message}`);
                    }}
                    className="ut-button:bg-primary ut-button:ut-uploading:bg-primary/80 ut-button:ut-ready:bg-primary/90 ut-label:text-gray-700 dark:ut-label:text-gray-300 ut-allowed-content:text-gray-600 dark:ut-allowed-content:text-gray-400"
                    appearance={{
                      button: "bg-primary text-primary-foreground hover:bg-primary/90 h-10 px-4 py-2 rounded-md",
                      container: "w-full",
                      allowedContent: "hidden",
                    }}
                  />
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Upload className="h-4 w-4" />
                    <span>Click to upload payment proof</span>
                  </div>
                  <div className="text-xs text-muted-foreground">
                    PNG, JPG up to 4MB
                  </div>
                </div>
              </div>
            ) : (
              <div className="mt-2 space-y-2">
                <div className="relative w-full h-48">
                  <Image
                    src={formik.values.paymentReceiptUrl}
                    alt="Payment receipt preview"
                    fill
                    className="object-contain"
                    sizes="(max-width: 768px) 100vw, 768px"
                  />
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => formik.setFieldValue('paymentReceiptUrl', '')}
                  className="w-full"
                >
                  Remove Image
                </Button>
              </div>
            )}
          </div>

          <Button
            type="submit"
            disabled={isPending || !formik.isValid || !formik.values.amount || !formik.values.paymentReceiptUrl || isUploading}
            className="w-full"
          >
            {isPending ? "Creating..." : isUploading ? "Uploading..." : "Create Installment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
} 