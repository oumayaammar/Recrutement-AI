'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Legacy route — redirect to canonical /recruiter/search
export default function LegacyRecherchePage() {
  const router = useRouter();
  useEffect(() => {
    router?.replace('/recruiter/search');
  }, [router]);
  return null;
}
