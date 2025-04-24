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
          src="/logo.png"
          alt="IDUISN Logo"
          width={80}
          height={80}
          className="object-contain"
        />
        <div className="text-navy-900 font-semibold">
          <h1 className="text-xl">IDUISN</h1>
          <p className="text-sm">International Digital School</p>
        </div>
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