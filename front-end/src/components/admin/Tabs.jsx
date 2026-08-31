import React from 'react';
import clsx from 'clsx';

export const Tabs = ({ tabs, activeTab, onChange }) => {
  return (
    <div className="border-b border-slate-200 overflow-x-auto scrollbar-none">
      <nav className="-mb-px flex space-x-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => onChange(tab.id)}
            className={clsx(
              "whitespace-nowrap py-4 px-1 border-b-2 font-medium text-sm transition-colors",
              activeTab === tab.id
                ? "border-primary text-primary"
                : "border-transparent text-slate-500 hover:text-slate-700 hover:border-slate-300"
            )}
          >
            {tab.label}
          </button>
        ))}
      </nav>
    </div>
  );
};
