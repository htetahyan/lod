interface PaymentDetailsProps {
  totalAmount: number
  paymentMethod: string
  bankName: string
}

export function PaymentDetails({
  totalAmount,
  paymentMethod,
  bankName,
}: PaymentDetailsProps) {
  const formattedAmount = new Intl.NumberFormat('en-US').format(totalAmount)

  return (
    <div className="grid grid-cols-3 gap-4 p-4 border-b">
      <div className="space-y-1">
        <dt className="text-sm font-medium text-gray-600">TOTAL AMOUNT</dt>
        <dd className="text-sm font-semibold text-gray-900">{formattedAmount}</dd>
      </div>
      <div className="space-y-1">
        <dt className="text-sm font-medium text-gray-600">CASH/BANK</dt>
        <dd className="text-sm text-gray-900">{paymentMethod}</dd>
      </div>
      <div className="space-y-1">
        <dt className="text-sm font-medium text-gray-600">BANK NAME</dt>
        <dd className="text-sm text-gray-900">{bankName}</dd>
      </div>
    </div>
  )
} 