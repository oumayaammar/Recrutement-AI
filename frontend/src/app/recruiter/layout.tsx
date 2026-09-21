'use client';
import React from 'react';
import AppLayout from '@/components/AppLayout';

export default function RecruiterLayout({ children }: { children: React.ReactNode }) {
  return <AppLayout portal="recruteur">{children}</AppLayout>;
}
