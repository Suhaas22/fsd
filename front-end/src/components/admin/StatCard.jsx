import React from 'react';
import { ArrowUpRight, ArrowDownRight } from 'lucide-react';
import clsx from 'clsx';

export const StatCard = ({ title, value, icon: Icon, trend, trendValue, color = 'primary' }) => {
  
  const colorMap = {
    primary: 'bg-blue-50 text-blue-600',
    success: 'bg-emerald-50 text-emerald-600',
    warning: 'bg-amber-50 text-amber-600',
    danger: 'bg-rose-50 text-rose-600',
    purple: 'bg-purple-50 text-purple-600'
  };

  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
          <h3 className="text-2xl font-bold text-slate-800">{value}</h3>
        </div>
        <div className={clsx("p-3 rounded-lg", colorMap[color] || colorMap.primary)}>
          <Icon className="w-6 h-6" />
        </div>
      </div>
      
      {trend && (
        <div className="mt-4 flex items-center text-sm font-medium">
          {trend === 'up' ? (
            <span className="flex items-center text-emerald-600">
              <ArrowUpRight className="w-4 h-4 mr-1" />
              {trendValue}
            </span>
          ) : (
            <span className="flex items-center text-rose-600">
              <ArrowDownRight className="w-4 h-4 mr-1" />
              {trendValue}
            </span>
          )}
          <span className="text-slate-500 ml-2">vs last month</span>
        </div>
      )}
    </div>
  );
};
