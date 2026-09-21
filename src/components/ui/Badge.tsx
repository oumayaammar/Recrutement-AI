import React from 'react';

type BadgeVariant =
  | 'publiee' |'brouillon' |'cloturee' |'archivee' |'suggeree' |'recue' |'preselectionnee' |'entretien' |'acceptee' |'refusee' |'default' |'primary' |'accent';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  dot?: boolean;
}

const variantClasses: Record<BadgeVariant, string> = {
  publiee: 'bg-green-100 text-green-800 border-green-200',
  brouillon: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  cloturee: 'bg-red-100 text-red-800 border-red-200',
  archivee: 'bg-slate-100 text-slate-600 border-slate-200',
  suggeree: 'bg-violet-100 text-violet-800 border-violet-200',
  recue: 'bg-blue-100 text-blue-800 border-blue-200',
  preselectionnee: 'bg-yellow-100 text-yellow-800 border-yellow-200',
  entretien: 'bg-orange-100 text-orange-800 border-orange-200',
  acceptee: 'bg-green-100 text-green-800 border-green-200',
  refusee: 'bg-red-100 text-red-800 border-red-200',
  default: 'bg-slate-100 text-slate-700 border-slate-200',
  primary: 'bg-blue-100 text-blue-800 border-blue-200',
  accent: 'bg-violet-100 text-violet-800 border-violet-200',
};

const dotClasses: Record<BadgeVariant, string> = {
  publiee: 'bg-green-500',
  brouillon: 'bg-yellow-500',
  cloturee: 'bg-red-500',
  archivee: 'bg-slate-400',
  suggeree: 'bg-violet-500',
  recue: 'bg-blue-500',
  preselectionnee: 'bg-yellow-500',
  entretien: 'bg-orange-500',
  acceptee: 'bg-green-500',
  refusee: 'bg-red-500',
  default: 'bg-slate-400',
  primary: 'bg-blue-500',
  accent: 'bg-violet-500',
};

export default function Badge({ variant = 'default', children, className = '', dot = false }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-600 border ${variantClasses[variant]} ${className}`}
    >
      {dot && (
        <span className={`w-1.5 h-1.5 rounded-full flex-shrink-0 ${dotClasses[variant]}`} />
      )}
      {children}
    </span>
  );
}