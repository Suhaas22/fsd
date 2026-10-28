import React from 'react';
import { cn } from '../../utils/cn';

export const DataTable = ({
  columns,
  data = [],
  onRowClick,
  emptyMessage = 'No data available',
  className = '',
}) => {
  return (
    <div
      className={cn(
        'overflow-x-auto rounded-2xl border border-slate-200/80 bg-white shadow-2xs',
        className
      )}
    >
      <table className="w-full text-left border-collapse">
        <thead>
          <tr className="bg-slate-50/80 border-b border-slate-100 text-[11px] uppercase tracking-wider text-slate-500 font-bold">
            {columns.map((col, idx) => (
              <th key={idx} className="px-5 py-3.5 whitespace-nowrap">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white">
          {data.map((row, rowIndex) => (
            <tr
              key={rowIndex}
              onClick={() => onRowClick && onRowClick(row)}
              className={cn(
                'hover:bg-slate-50/80 transition-colors',
                onRowClick && 'cursor-pointer'
              )}
            >
              {columns.map((col, colIndex) => (
                <td
                  key={colIndex}
                  className="px-5 py-3.5 whitespace-nowrap text-sm text-slate-700"
                >
                  {col.cell ? col.cell(row) : row[col.accessor]}
                </td>
              ))}
            </tr>
          ))}
          {data.length === 0 && (
            <tr>
              <td
                colSpan={columns.length}
                className="px-6 py-12 text-center text-slate-400 text-sm"
              >
                {emptyMessage}
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default DataTable;
