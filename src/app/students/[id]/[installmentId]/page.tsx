import { notFound } from 'next/navigation'
import { db } from '@/lib/db'
import { students, installments } from '@/lib/schema'
import { eq, asc } from 'drizzle-orm'
import { ReceiptHeader } from '@/components/receipt/ReceiptHeader'
import { StudentInfo } from '@/components/receipt/StudentInfo'
import { PaymentDetails } from '@/components/receipt/PaymentDetails'
import { InstallmentsGrid } from '@/components/receipt/InstallmentsGrid'
import { ReceiptFooter } from '@/components/receipt/ReceiptFooter'

interface PageProps {
  params: Promise<{
    id: string
    installmentId: string
  }>
}

export default async function ReceiptPage({ params }: PageProps) {
  const { id, installmentId } = await params
  const student = await db.query.students.findFirst({
    where: eq(students.id, parseInt(id)),
  })

  const installment = await db.query.installments.findFirst({
    where: eq(installments.id, parseInt(installmentId)),
  })

  if (!student || !installment) {
    notFound()
  }

  // Redirect to 404 if the installment is not explicitly in 'paid' status
  // This ensures rejected or any other status cannot access receipt
  if (installment.status.toLowerCase() !== 'paid') {
    notFound()
  }

  // Get all installments for this student
  const allInstallments = await db.query.installments.findMany({
    where: eq(installments.studentId, student.id),
    orderBy: (installments, { asc }) => [asc(installments.installmentNumber)],
  })

  // Filter to only include installments that are in 'paid' status for the grid
  const installmentsList = Array.from({ length: 7 }, (_, i) => {
    const foundInstallment = allInstallments.find((inst) => inst.installmentNumber === i + 1);
    return {
      number: i + 1,
      amount: foundInstallment?.status?.toLowerCase() === 'paid' ? foundInstallment.amount : null,
    };
  });

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
        receivedBy="Khin Htet Htet Naing"
        receivedDate={installment.paymentDate || installment.createdAt}
        remarks={installment.note || undefined}
        qrCodeUrl="/qr-code.svg"
        address="No.483, Aye Yeik Thor Condo 9C, Aye Yeik Thor 2nd Street, Sayasan Quarter, Bahan Tsp, Yangon, Myanmar"
        contactNumbers={[
          '09 79 3333 555',
          '09 881 555 660',
          '09 881 555 770',
          '09 881 555 880',
          '09 881 555 990',
        ]}
        website="www.edusn.co.uk"
      />
    </div>
  )
} 