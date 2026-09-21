'use client';
import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

// Legacy route — redirect to canonical /recruiter/offers/[id]
export default function LegacyOffrePage() {
  const router = useRouter();
  const params = useParams();
  useEffect(() => {
    router?.replace(`/recruiter/offers/${params?.id}`);
  }, [router, params?.id]);
  return null;
}
