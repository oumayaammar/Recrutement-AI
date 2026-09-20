'use client';
import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: 'sm' | 'md';
}

export default function Toggle({ checked, onChange, label, disabled = false, size = 'md' }: ToggleProps) {
  const trackSize = size === 'sm' ? 'w-8 h-4' : 'w-11 h-6';
  const thumbSize = size === 'sm' ? 'w-3 h-3' : 'w-5 h-5';
  const thumbTranslate = size === 'sm' ? (checked ?'translate-x-4' : 'translate-x-0.5')
    : (checked ? 'translate-x-5' : 'translate-x-0.5');

  return (
    <label className={`inline-flex items-center gap-2 ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => !disabled && onChange(!checked)}
        className={`relative inline-flex ${trackSize} rounded-full transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 ${
          checked ? 'bg-primary' : 'bg-slate-300'
        }`}
      >
        <span
          className={`inline-block ${thumbSize} bg-white rounded-full shadow transform transition-transform duration-200 ${thumbTranslate} self-center`}
        />
      </button>
      {label && <span className="text-sm font-medium text-foreground">{label}</span>}
    </label>
  );
}