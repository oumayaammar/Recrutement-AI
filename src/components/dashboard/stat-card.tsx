'use client';
import React from 'react';

interface StatCardProps {
  label: string;
  value: number | string;
  icon: React.ReactNode;
  iconBg: string;
  trend?: string;
  trendUp?: boolean;
  loading?: boolean;
  href?: string;
}

export default function StatCard({
  label,
  value,
  icon,
  iconBg,
  trend,
  trendUp,
  loading,
  href,
}: StatCardProps) {
  const inner = (
    <div className="bg-card border border-border rounded-xl p-5 flex flex-col gap-3 hover:shadow-sm transition-shadow group">
      <div className="flex items-center justify-between">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${iconBg}`}>
          {icon}
        </div>
        {trend && (
          <span
            className={`text-xs font-semibold px-2 py-0.5 rounded-full border ${
              trendUp
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :'bg-muted text-muted-foreground border-border'
            }`}
          >
            {trend}
          </span>
        )}
      </div>
      <div>
        <p className="text-2xl font-bold text-foreground tabular-nums">
          {loading ? (
            <span className="inline-block w-12 h-7 bg-muted rounded animate-pulse" />
          ) : (
            value
          )}
        </p>
        <p className="text-xs font-medium text-muted-foreground mt-0.5">{label}</p>
      </div>
    </div>
  );

  if (href) {
    return (
      <a href={href} className="block">
        {inner}
      </a>
    );
  }

  return inner;
}
