import React from 'react';
import { cn } from '../../utils/cn';

export const EmptyState = ({
  title,
  description,
  icon: Icon,
  action,
  className = '',
}) => {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center py-16 px-4 text-center',
        className,
      )}
    >
      {Icon && (
        <div className="w-14 h-14 bg-slate-100 text-slate-400 rounded-2xl flex items-center justify-center mb-4">
          <Icon className="w-7 h-7" />
        </div>
      )}
      <h3 className="text-base font-bold text-slate-800 mb-1.5">{title}</h3>
      {description && (
        <p className="text-slate-500 max-w-md mx-auto mb-6 text-sm">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  );
};

export default EmptyState;
