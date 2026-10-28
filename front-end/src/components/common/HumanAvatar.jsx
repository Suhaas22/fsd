import React from 'react';
const sizes = {
  xs: 'w-6 h-6 text-[9px]',
  sm: 'w-8 h-8 text-[10px]',
  md: 'w-10 h-10 text-xs',
  lg: 'w-12 h-12 text-sm',
  xl: 'w-16 h-16 text-lg',
  '2xl': 'w-20 h-20 text-xl',
  '3xl': 'w-24 h-24 text-2xl',
};
export default function HumanAvatar({ name, size = 'md', className = '' }) {
  const initials =
    String(name || '')
      .trim()
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((n) => n[0])
      .join('')
      .toUpperCase() || '·';
  return (
    <span
      title={name || 'Account'}
      aria-hidden="true"
      className={`inline-flex items-center justify-center shrink-0 rounded-xl bg-[#edf3e5] text-[#5b784a] border border-[#dce6d0] font-medium ${sizes[size] || sizes.md} ${className}`}
    >
      {initials}
    </span>
  );
}
