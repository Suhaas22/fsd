import React from 'react';
import { cn } from '../../utils/cn';

export function Badge({
  children,
  variant = 'default',
  size = 'md',
  className = '',
  ...props
}) {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 border-slate-200/80',
    primary: 'bg-blue-50 text-[#0056D2] border-blue-200 font-semibold',
    secondary:
      'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200 font-semibold',
    warning: 'bg-amber-50 text-amber-700 border-amber-200 font-semibold',
    danger: 'bg-rose-50 text-rose-700 border-rose-200 font-semibold',
    tertiary: 'bg-purple-50 text-purple-700 border-purple-200 font-semibold',
    surface: 'bg-slate-50 text-slate-600 border-slate-200 font-medium',
    accent: 'bg-amber-100 text-amber-900 border-amber-300 font-semibold',
    outline: 'bg-transparent text-slate-700 border-slate-300 font-medium',
  };

  const sizeStyles = {
    sm: 'px-2 py-0.5 text-[11px]',
    md: 'px-2.5 py-0.5 text-xs',
    lg: 'px-3 py-1 text-sm',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 rounded-full border transition-colors',
        variantStyles[variant] || variantStyles.default,
        sizeStyles[size] || sizeStyles.md,
        className,
      )}
      {...props}
    >
      {children}
    </span>
  );
}

export default Badge;
