import React from 'react';
import clsx from 'clsx';

export const StatusBadge = ({ status, className }) => {
  const getStatusStyles = (status) => {
    const s = status?.toLowerCase() || '';
    
    if (['active', 'verified', 'published', 'successful', 'completed', 'valid'].includes(s)) {
      return 'bg-emerald-100 text-emerald-700 border-emerald-200';
    }
    if (['pending', 'pending approval', 'draft'].includes(s)) {
      return 'bg-amber-100 text-amber-700 border-amber-200';
    }
    if (['suspended', 'rejected', 'failed', 'revoked'].includes(s)) {
      return 'bg-rose-100 text-rose-700 border-rose-200';
    }
    if (['refunded', 'archived', 'dropped'].includes(s)) {
      return 'bg-slate-100 text-slate-700 border-slate-200';
    }
    
    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <span className={clsx(
      "px-2.5 py-1 text-xs font-semibold rounded-full border",
      getStatusStyles(status),
      className
    )}>
      {status}
    </span>
  );
};
