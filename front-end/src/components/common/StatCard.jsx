import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { cn } from '../../utils/cn';

export const StatCard = ({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  color = 'primary',
  className = '',
}) => {
  const colorMap = {
    primary: 'bg-blue-50 text-[#0056D2] border-blue-100',
    success: 'bg-emerald-50 text-emerald-600 border-emerald-100',
    warning: 'bg-amber-50 text-amber-600 border-amber-100',
    danger: 'bg-rose-50 text-rose-600 border-rose-100',
    purple: 'bg-purple-50 text-purple-600 border-purple-100',
  };

  return (
    <div
      className={cn(
        'bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs hover:shadow-xs transition-all duration-200',
        className,
      )}
    >
      <div className="flex justify-between items-start">
        <div>
          <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1.5">
            {title}
          </p>
          <h3 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            {value}
          </h3>
        </div>
        {Icon && (
          <div
            className={cn(
              'p-3 rounded-xl border flex items-center justify-center',
              colorMap[color] || colorMap.primary,
            )}
          >
            <Icon className="w-5 h-5" />
          </div>
        )}
      </div>

      {trend && (
        <div className="mt-4 flex items-center text-xs font-semibold">
          {trend === 'up' ? (
            <span className="flex items-center text-emerald-600">
              <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" />
              {trendValue}
            </span>
          ) : (
            <span className="flex items-center text-rose-600">
              <ArrowDownRight className="w-3.5 h-3.5 mr-0.5" />
              {trendValue}
            </span>
          )}
          <span className="text-slate-400 ml-1.5 font-normal">
            vs previous period
          </span>
        </div>
      )}
    </div>
  );
};

export default StatCard;
