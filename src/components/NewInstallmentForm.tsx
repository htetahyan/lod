'use client';

import { useFormik } from 'formik';
import * as Yup from 'yup';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { toast } from "sonner";
import { useState } from "react";
import { UploadButton } from "@/utils/uploadthing";
import { Upload } from "lucide-react";
import { useCreateInstallment } from "@/hooks/use-installments";
import { useQueryClient } from '@tanstack/react-query';
import Image from 'next/image';
import { cn } from "@/lib/utils";

interface NewInstallmentFormProps {
  studentId: number;
  onSuccess?: () => void;
  onError?: (error: Error) => void;
}

interface FormValues {
  amount: string;
  isOneTimePayment: boolean;
  installmentNumber: string;
  paymentReceiptUrl: string;
  paymentMethod: 'cash' | 'bank';
  bankName: string;
}

const validationSchema = Yup.object({
  amount: Yup.number()
    .required('Amount is required')
    .positive('Amount must be positive')
    .integer('Amount must be a whole number'),
  isOneTimePayment: Yup.boolean().required('Payment type is required'),
  installmentNumber: Yup.number()
    .when('isOneTimePayment', {
      is: false,
      then: (schema) => schema.required('Installment number is required'),
      otherwise: (schema) => schema.notRequired(),
    }),
  paymentReceiptUrl: Yup.string().required('Payment proof is required'),
  paymentMethod: Yup.string().oneOf(['cash', 'bank']).required('Payment method is required'),
  bankName: Yup.string().when('paymentMethod', {
    is: 'bank',
    then: (schema) => schema.required('Bank name is required'),
    otherwise: (schema) => schema.notRequired(),
  }),
});

export function NewInstallmentForm({ studentId, onSuccess, onError }: NewInstallmentFormProps) {
  const [isUploading, setIsUploading] = useState(false);
  const { mutate: createInstallment, isPending } = useCreateInstallment();
  const queryClient = useQueryClient();

  const formik = useFormik<FormValues>({
    initialValues: {
      amount: '',
      isOneTimePayment: true,
      installmentNumber: '',
      paymentReceiptUrl: '',
      paymentMethod: 'cash',
      bankName: '',
    },
    validationSchema,
    onSubmit: async (values) => {
      try {
        createInstallment({
          studentId,
          amount: Number(values.amount),
          isOneTimePayment: values.isOneTimePayment,
          installmentNumber: values.isOneTimePayment ? null : Number(values.installmentNumber),
          paymentReceiptUrl: values.paymentReceiptUrl,
          paymentMethod: values.paymentMethod,
          bankName: values.paymentMethod === 'bank' ? values.bankName : null,
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

          {!formik.values.isOneTimePayment && (
            <div className="space-y-2">
              <Label htmlFor="installmentNumber">Installment Number</Label>
              <Select
                value={formik.values.installmentNumber}
                onValueChange={(value) => formik.setFieldValue('installmentNumber', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select installment number" />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7].map((num) => (
                    <SelectItem key={num} value={num.toString()}>
                      {num}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.touched.installmentNumber && formik.errors.installmentNumber && (
                <div className="text-sm text-red-500">{formik.errors.installmentNumber}</div>
              )}
            </div>
          )}

          <div className="space-y-3">
            <Label>Payment Method</Label>
            <RadioGroup
              value={formik.values.paymentMethod}
              onValueChange={(value: 'cash' | 'bank') =>
                formik.setFieldValue('paymentMethod', value)
              }
              className="flex space-x-4"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="cash" id="cash" />
                <Label htmlFor="cash">Cash</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="bank" id="bank" />
                <Label htmlFor="bank">Bank</Label>
              </div>
            </RadioGroup>
          </div>

          {formik.values.paymentMethod === 'bank' && (
            <div className="space-y-2">
              <Label htmlFor="bankName">Bank Name</Label>
              <Select
                value={formik.values.bankName}
                onValueChange={(value) => formik.setFieldValue('bankName', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select bank" />
                </SelectTrigger>
                <SelectContent>
                  {['AYA', 'KBZ', 'CB', 'UAB', 'AGD', 'MAB'].map((bank) => (
                    <SelectItem key={bank} value={bank}>
                      {bank}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formik.touched.bankName && formik.errors.bankName && (
                <div className="text-sm text-red-500">{formik.errors.bankName}</div>
              )}
            </div>
          )}

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