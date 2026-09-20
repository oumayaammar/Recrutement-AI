'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Legacy route — redirect to canonical /recruiter/offers/new
export default function LegacyNouvelleOffrePage() {
  const router = useRouter();
  useEffect(() => {
    router?.replace('/recruiter/offers/new');
  }, [router]);
  return null;
}
