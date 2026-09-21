'use client';
import React from 'react';
import AppLayout from '@/components/AppLayout';

export default function CandidateLayout({ children }: { children: React.ReactNode }) {
  return <AppLayout portal="candidat">{children}</AppLayout>;
}
