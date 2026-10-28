import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  children,
  ...props
}) {
  const baseStyles =
    'inline-flex items-center justify-center font-semibold transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none rounded-xl active:scale-[0.98] select-none';

  const variants = {
    primary:
      'bg-[#0056D2] text-white hover:bg-[#00419E] focus:ring-[#0056D2]/40 shadow-xs hover:shadow-sm border border-transparent',
    secondary:
      'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50 hover:border-slate-300 focus:ring-slate-200 shadow-xs',
    outline:
      'border border-slate-300 text-slate-700 bg-transparent hover:bg-slate-50 hover:border-slate-400 focus:ring-slate-200',
    ghost:
      'text-slate-600 bg-transparent hover:bg-slate-100 hover:text-slate-900 focus:ring-slate-200 border border-transparent',
    danger:
      'bg-rose-600 text-white hover:bg-rose-700 focus:ring-rose-600/40 shadow-xs border border-transparent',
    link: 'text-[#0056D2] hover:text-[#00419E] underline-offset-4 hover:underline p-0 h-auto bg-transparent border-none font-medium',
  };

  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 py-2 text-sm',
    lg: 'h-12 px-6 text-base',
    icon: 'h-10 w-10 p-0',
  };

  return (
    <button
      className={cn(baseStyles, variants[variant], sizes[size], className)}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          <span>Loading...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}

export default Button;
