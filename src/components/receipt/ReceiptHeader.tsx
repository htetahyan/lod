import Image from 'next/image'
import { format } from 'date-fns'

interface ReceiptHeaderProps {
  date: Date
}

export function ReceiptHeader({ date }: ReceiptHeaderProps) {
  return (
    <div className="flex items-center justify-between p-4 bg-white">
      <div className="flex items-center gap-2">
        <Image
          src="/sitelogo.svg"
          alt="Company Logo"
          width={120}
          height={40}
          className="object-contain"
        />
       
      </div>
      <div className="space-y-1">
        <h2 className="font-semibold text-lg">Cash Receipt</h2>
        <div className="text-sm">
          <span className="font-medium">DATE</span>
          <span className="ml-2">{format(date, 'd-MMM-yyyy')}</span>
        </div>
      </div>
    </div>
  )
} 