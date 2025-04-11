import dynamic from 'next/dynamic';

const StudentPageClient = dynamic(() => import('@/components/StudentPageClient'), {

  loading: () => <div>Loading...</div>
});

export default function page() {
  return <StudentPageClient />;
} 