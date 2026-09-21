'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

// Legacy page — redirect to new canonical route
export default function LegacyJobOffersCandidatPage() {
  const router = useRouter();
  useEffect(() => {
    router?.replace('/candidate/offers');
  }, [router]);
  return null;
}