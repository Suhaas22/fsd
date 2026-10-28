import React from 'react';
import { Loader2 } from 'lucide-react';
import { cn } from '../../utils/cn';

export const LoadingState = ({ message = 'Loading...', className = '' }) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4',
        className,
      )}
    >
      <Loader2 className="w-8 h-8 text-[#0056D2] animate-spin mb-3" />
      <p className="text-slate-500 font-medium text-sm">{message}</p>
    </div>
  );
};

export default LoadingState;
