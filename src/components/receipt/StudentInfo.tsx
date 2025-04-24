interface StudentInfoProps {
  studentName: string
  campus: string
  year: string | number
  academicYear: string
  phone: string
  email: string
}

export function StudentInfo({
  studentName,
  campus,
  year,
  academicYear,
  phone,
  email,
}: StudentInfoProps) {
  return (
    <div className="grid grid-cols-2 gap-4 p-4 border-t border-b">
      <InfoField label="STUDENT NAME" value={studentName} />
      <InfoField label="CAMPUS" value={campus} />
      <InfoField label="YEAR" value={year} />
      <InfoField label="ACADEMIC YEAR" value={academicYear} />
      <InfoField label="PHONE" value={phone} />
      <InfoField label="EMAIL" value={email} />
    </div>
  )
}

interface InfoFieldProps {
  label: string
  value: string | number
}

function InfoField({ label, value }: InfoFieldProps) {
  return (
    <div className="space-y-1">
      <dt className="text-sm font-medium text-gray-600">{label}</dt>
      <dd className="text-sm text-gray-900">{value}</dd>
    </div>
  )
} 