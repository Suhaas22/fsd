import React, { forwardRef } from 'react';
import { cn } from '../../utils/cn';

export const Input = forwardRef(
  ({ className, type = 'text', error, ...props }, ref) => {
    return (
      <div className="w-full">
        <input
          type={type}
          className={cn(
            'flex h-10 w-full rounded-xl border border-slate-200 bg-white px-3.5 py-2 text-sm text-slate-800 placeholder:text-slate-400 transition-all focus:outline-none focus:ring-2 focus:ring-[#0056D2]/20 focus:border-[#0056D2] hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50 shadow-2xs',
            error &&
              'border-rose-400 focus:border-rose-500 focus:ring-rose-500/20',
            className
          )}
          ref={ref}
          {...props}
        />
        {error && <p className="mt-1 text-xs text-rose-500">{error}</p>}
      </div>
    );
  },
);

Input.displayName = 'Input';
export default Input;
