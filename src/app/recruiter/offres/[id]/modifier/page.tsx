'use client';
import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

// Legacy route — redirect to canonical /recruiter/offers/[id]/edit
export default function LegacyModifierOffrePage() {
  const router = useRouter();
  const params = useParams();
  useEffect(() => {
    router?.replace(`/recruiter/offers/${params?.id}/edit`);
  }, [router, params?.id]);
  return null;
}
