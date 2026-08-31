import React from 'react';

export const ChartCard = ({ title, children }) => {
  return (
    <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col h-full">
      <h3 className="text-lg font-bold text-slate-800 mb-6">{title}</h3>
      <div className="flex-1 w-full min-h-[300px]">
        {children}
      </div>
    </div>
  );
};
