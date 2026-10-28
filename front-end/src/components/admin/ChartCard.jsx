import React from 'react';
import { cn } from '../../utils/cn';

export const ChartCard = ({
  title,
  description,
  children,
  action,
  className = '',
}) => {
  return (
    <div
      className={cn(
        'bg-white p-6 rounded-2xl border border-slate-200/80 shadow-xs flex flex-col h-full',
        className,
      )}
    >
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-base font-bold text-slate-900 leading-snug">
            {title}
          </h3>
          {description && (
            <p className="text-xs text-slate-500 mt-0.5">{description}</p>
          )}
        </div>
        {action && <div>{action}</div>}
      </div>
      <div className="flex-1 w-full min-h-[300px]">{children}</div>
    </div>
  );
};

export default ChartCard;
