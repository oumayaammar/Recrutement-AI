'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Legacy admin page — redirect to new admin dashboard
export default function AdminLegacyPage() {
  const router = useRouter();
  useEffect(() => {
    router?.replace('/admin/dashboard');
  }, [router]);
  return null;
}
