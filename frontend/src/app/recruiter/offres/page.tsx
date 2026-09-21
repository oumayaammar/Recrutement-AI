'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Legacy route — redirect to canonical /recruiter/offers
export default function LegacyOffresPage() {
  const router = useRouter();
  useEffect(() => {
    router?.replace('/recruiter/offers');
  }, [router]);
  return null;
}
