import React from 'react';
import { cn } from '../../utils/cn';

export const FilterBar = ({
  options = [],
  value,
  onChange,
  placeholder = 'Filter by...',
  className = '',
}) => {
  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className={cn(
        'bg-white border border-slate-200 rounded-xl text-sm px-3.5 py-2 text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0056D2]/20 focus:border-[#0056D2] hover:border-slate-300 transition-all shadow-2xs cursor-pointer',
        className,
      )}
    >
      <option value="">{placeholder}</option>
      {options.map((opt) => (
        <option
          key={opt.value}
          value={opt.value}
        >
          {opt.label}
        </option>
      ))}
    </select>
  );
};

export default FilterBar;
