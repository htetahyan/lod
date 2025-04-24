import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { students, installments } from '@/lib/schema'
import { eq } from 'drizzle-orm'
import { ReceiptHeader } from '@/components/receipt/ReceiptHeader'
import { StudentInfo } from '@/components/receipt/StudentInfo'
import { PaymentDetails } from '@/components/receipt/PaymentDetails'
import { InstallmentsGrid } from '@/components/receipt/InstallmentsGrid'
import { ReceiptFooter } from '@/components/receipt/ReceiptFooter'

interface PageProps {
  params: {
    id: string
    installmentId: string
  }
}

export default async function ReceiptPage({ params }: PageProps) {
  const student = await db.query.students.findFirst({
    where: eq(students.id, parseInt(params.id)),
  })

  const installment = await db.query.installments.findFirst({
    where: eq(installments.id, parseInt(params.installmentId)),
  })

  if (!student || !installment) {
    notFound()
  }

  // Get all installments for this student
  const allInstallments = await db.query.installments.findMany({
    where: eq(installments.studentId, student.id),
    orderBy: (installments, { asc }) => [asc(installments.installmentNumber)],
  })

  const installmentsList = Array.from({ length: 7 }, (_, i) => ({
    number: i + 1,
    amount: allInstallments.find((inst) => inst.installmentNumber === i + 1)?.amount || null,
  }))

  return (
    <div className="max-w-3xl mx-auto bg-white shadow-lg rounded-lg my-8 print:shadow-none">
      <ReceiptHeader date={installment.createdAt} />
      
      <StudentInfo
        studentName={student.studentName}
        campus={student.campus}
        year={student.yearLevel}
        academicYear={student.academicYear}
        phone={student.contactNumber}
        email="student@example.com" // Add email field to schema if needed
      />

      <PaymentDetails
        totalAmount={installment.amount}
        paymentMethod={installment.paymentMethod || 'cash'}
        bankName={installment.bankName || ''}
      />

      <InstallmentsGrid
        installments={installmentsList}
        currentInstallment={installment.installmentNumber || 1}
      />

      <ReceiptFooter
        receivedBy="Admin Name" // Add to schema if needed
        receivedDate={installment.paymentDate || installment.createdAt}
        remarks={installment.note || undefined}
        qrCodeUrl="/qr-code.png" // Add actual QR code generation
        address="No.483, Aye Yeik Thor Condo 9C, Aye Yeik Thor 2nd Street, Sayasan Quarter, Bahan Tsp, Yangon, Myanmar"
        contactNumbers={[
          '09 79 3333 555',
          '09 881 555 660',
          '09 881 555 770',
          '09 881 555 880',
          '09 881 555 990',
        ]}
        website="www.iduisn.co.uk"
      />
    </div>
  )
} 