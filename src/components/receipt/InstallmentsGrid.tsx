interface Installment {
  number: number
  amount: number | null
}

interface InstallmentsGridProps {
  installments: Installment[]
  currentInstallment: number
}

export function InstallmentsGrid({
  installments,
  currentInstallment,
}: InstallmentsGridProps) {
  return (
    <div className="p-4 border-b">
      <h3 className="text-sm font-medium text-gray-600 mb-3">INSTALLMENTS</h3>
      <div className="grid grid-cols-2 gap-4">
        {installments.map((installment) => (
          <div
            key={installment.number}
            className={`p-3 rounded-lg ${
              installment.number === currentInstallment
                ? 'bg-blue-50 border border-blue-200'
                : 'bg-gray-50'
            }`}
          >
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">
                {installment.number}
                {installment.number === 1
                  ? 'st'
                  : installment.number === 2
                  ? 'nd'
                  : installment.number === 3
                  ? 'rd'
                  : 'th'}{' '}
                Install
              </span>
              <span className="text-sm">
                {installment.amount
                  ? new Intl.NumberFormat('en-US').format(installment.amount)
                  : '-'}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
} 