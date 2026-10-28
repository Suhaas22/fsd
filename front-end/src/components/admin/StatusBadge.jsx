import React from 'react';
import { cn } from '../../utils/cn';

export const StatusBadge = ({ status, className }) => {
  const getStatusStyles = (status) => {
    const s = status?.toLowerCase() || '';

    if (
      [
        'active',
        'verified',
        'published',
        'successful',
        'completed',
        'resolved',
        'valid',
        'approved',
      ].includes(s)
    ) {
      return 'bg-emerald-50 text-emerald-700 border-emerald-200';
    }
    if (
      [
        'pending',
        'pending verification',
        'pending approval',
        'draft',
        'in review',
        'under review',
      ].includes(s)
    ) {
      return 'bg-amber-50 text-amber-700 border-amber-200';
    }
    if (
      ['suspended', 'rejected', 'failed', 'revoked', 'disputed'].includes(s)
    ) {
      return 'bg-rose-50 text-rose-700 border-rose-200';
    }
    if (['archived', 'dropped', 'inactive'].includes(s)) {
      return 'bg-slate-100 text-slate-700 border-slate-200';
    }

    return 'bg-slate-100 text-slate-700 border-slate-200';
  };

  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 text-xs font-semibold rounded-full border transition-colors',
        getStatusStyles(status),
        className,
      )}
    >
      {status || 'Unknown'}
    </span>
  );
};

export default StatusBadge;
