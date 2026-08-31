import React, { useState, useEffect } from 'react';
import { DataTable } from '../../components/admin/DataTable';
import { SearchBar } from '../../components/admin/SearchBar';
import { FilterBar } from '../../components/admin/FilterBar';
import { Pagination } from '../../components/admin/Pagination';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { api } from '../../utils/api';

export const Transactions = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/transactions', 'admin')
      .then(data => { setTransactions(Array.isArray(data) ? data : []); setLoading(false); })
      .catch(err => { console.error('Error fetching transactions:', err); setTransactions([]); setLoading(false); });
  }, []);

  const columns = [
    { header: 'Transaction ID', accessor: 'id' },
    { header: 'User', accessor: 'user' },
    { header: 'Course', accessor: 'course' },
    { header: 'Amount', cell: (row) => `$${row.amount}` },
    { header: 'Gateway', accessor: 'paymentGateway' },
    { header: 'Date', cell: (row) => new Date(row.date).toLocaleString() },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
  ];

  const statusOptions = [
    { label: 'Successful', value: 'Successful' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Failed', value: 'Failed' },
    { label: 'Refunded', value: 'Refunded' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Transactions</h1>
          <p className="text-slate-500">Detailed view of all transactions.</p>
        </div>
        <button className="bg-white text-slate-700 border border-slate-300 px-4 py-2 rounded-lg hover:bg-slate-50 transition-colors font-medium text-sm">
          Export CSV
        </button>
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <SearchBar placeholder="Search by Transaction ID or User..." value={searchTerm} onChange={setSearchTerm} />
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <FilterBar 
              options={statusOptions} 
              value={statusFilter} 
              onChange={setStatusFilter} 
              placeholder="All Statuses" 
            />
          </div>
        </div>

        <DataTable 
          columns={columns} 
          data={transactions} 
        />
        
        <Pagination currentPage={page} totalPages={1} onPageChange={setPage} />
      </div>
    </div>
  );
};
