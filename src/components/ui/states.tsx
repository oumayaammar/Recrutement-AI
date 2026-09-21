'use client';
import React from 'react';
import { AlertCircle, RefreshCw, Inbox } from 'lucide-react';

// ─── Loading Skeleton ─────────────────────────────────────────────────────────

interface SkeletonProps {
  rows?: number;
  className?: string;
}

export function TableSkeleton({ rows = 5, className = '' }: SkeletonProps) {
  return (
    <div className={`flex flex-col gap-3 ${className}`}>
      {Array.from({ length: rows }).map((_, i) => (
        <div key={i} className="bg-card border border-border rounded-xl p-5 animate-pulse">
          <div className="h-4 bg-muted rounded w-1/3 mb-2" />
          <div className="h-3 bg-muted rounded w-1/4" />
        </div>
      ))}
    </div>
  );
}

export function CardSkeleton({ className = '' }: { className?: string }) {
  return (
    <div className={`bg-card border border-border rounded-xl p-5 animate-pulse ${className}`}>
      <div className="h-5 bg-muted rounded w-2/3 mb-3" />
      <div className="h-3 bg-muted rounded w-full mb-2" />
      <div className="h-3 bg-muted rounded w-3/4" />
    </div>
  );
}

// ─── Error State ──────────────────────────────────────────────────────────────

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="bg-red-50 border border-red-200 rounded-xl p-6 flex flex-col items-center gap-3 text-center">
      <AlertCircle size={24} className="text-red-500" />
      <p className="text-red-700 text-sm font-medium">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="flex items-center gap-2 text-sm font-semibold text-red-700 hover:text-red-900 transition-colors"
        >
          <RefreshCw size={14} />
          Réessayer
        </button>
      )}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

interface EmptyStateProps {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  action?: React.ReactNode;
}

export function EmptyState({ title, description, icon, action }: EmptyStateProps) {
  return (
    <div className="bg-card border border-border rounded-xl p-12 flex flex-col items-center gap-3 text-center">
      <div className="text-muted-foreground">
        {icon ?? <Inbox size={40} />}
      </div>
      <p className="text-foreground font-semibold">{title}</p>
      {description && <p className="text-muted-foreground text-sm max-w-sm">{description}</p>}
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
