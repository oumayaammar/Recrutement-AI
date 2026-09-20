// 'use client';
// import { useEffect } from 'react';
// import { useRouter } from 'next/navigation';

// // Legacy page — redirect to new canonical route
// export default function LegacyJobOffersRecruteurPage() {
//   const router = useRouter();
//   useEffect(() => {
//     router?.replace('/recruiter/offers');
//   }, [router]);
//   return null;
// }

import React from 'react';
import AppLayout from '@/components/AppLayout';
import JobOffersRecruteurContent from './components/JobOffersRecruteurContent';

export default function JobOffersRecruteurPage() {
  return (
    <AppLayout portal="recruteur">
      <JobOffersRecruteurContent />
    </AppLayout>
  );
}