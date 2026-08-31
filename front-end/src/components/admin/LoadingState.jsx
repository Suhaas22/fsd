import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState = ({ message = "Loading..." }) => {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4">
      <Loader2 className="w-8 h-8 text-primary animate-spin mb-4" />
      <p className="text-slate-500 font-medium">{message}</p>
    </div>
  );
};
