import Image from 'next/image'

interface ReceiptFooterProps {
  receivedBy: string
  receivedDate: Date
  remarks?: string
  qrCodeUrl: string
  address: string
  contactNumbers: string[]
  website: string
}

export function ReceiptFooter({
  receivedBy,
  receivedDate,
  remarks,
  qrCodeUrl,
  address,
  contactNumbers,
  website,
}: ReceiptFooterProps) {
  return (
    <div className="p-4 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <div className="flex gap-8 mb-4">
            <div>
              <span className="text-sm font-medium">Admission Fees</span>
              <div className="mt-1 h-6 w-6 border rounded-md flex items-center justify-center">✓</div>
            </div>
            <div>
              <span className="text-sm font-medium">Student License</span>
              <div className="mt-1 h-6 w-6 border rounded-md flex items-center justify-center">✓</div>
            </div>
          </div>
          {remarks && (
            <div className="space-y-1">
              <span className="text-sm font-medium">Remarks</span>
              <p className="text-sm text-gray-600">{remarks}</p>
            </div>
          )}
        </div>
        <div className="space-y-2">
          <div className="space-y-1">
            <span className="text-sm font-medium">RECEIVED BY</span>
            <p className="text-sm">{receivedBy}</p>
          </div>
          <div className="space-y-1">
            <span className="text-sm font-medium">RECEIVED DATE</span>
            <p className="text-sm">
              {receivedDate.toLocaleDateString('en-US', {
                day: 'numeric',
                month: 'short',
                year: 'numeric',
              })}
            </p>
          </div>
        </div>
      </div>

      <div className="flex justify-between items-end pt-4 border-t">
        <div className="text-xs text-gray-600 space-y-1">
          <p>{address}</p>
          <p>{contactNumbers.join(', ')}</p>
          <p>{website}</p>
        </div>
        <div className="w-24 h-24 relative">
          <Image
            src={qrCodeUrl}
            alt="QR Code"
            fill
            className="object-contain"
          />
        </div>
      </div>
    </div>
  )
} 