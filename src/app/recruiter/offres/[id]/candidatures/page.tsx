'use client';
import { useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';

// Legacy route — redirect to canonical /recruiter/offers/[id]/candidates
export default function LegacyCandidaturesPage() {
  const router = useRouter();
  const params = useParams();
  useEffect(() => {
    router?.replace(`/recruiter/offers/${params?.id}/candidates`);
  }, [router, params?.id]);
  return null;
}
