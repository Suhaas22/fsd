import React from 'react';
import { AlertCircle } from 'lucide-react';
import { cn } from '../../utils/cn';

export const ErrorState = ({
  message = 'An error occurred',
  onRetry,
  className = '',
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className
      )}
    >
      <div className="w-14 h-14 bg-rose-50 text-rose-500 rounded-2xl flex items-center justify-center mb-4 border border-rose-100">
        <AlertCircle className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-slate-800 mb-1.5">
        Something went wrong
      </h3>
      <p className="text-slate-500 max-w-md mx-auto mb-6 text-sm">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-[#0056D2] text-white rounded-xl text-sm font-semibold hover:bg-[#00419E] transition-colors shadow-xs"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

export default ErrorState;
