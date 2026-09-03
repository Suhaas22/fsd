import React, { useState, useEffect, useMemo } from 'react';
import { DollarSign, CreditCard, CheckCircle, Clock, Search, TrendingUp, AlertCircle } from 'lucide-react';
import { StatCard } from '../../components/admin/StatCard';
import { DataTable } from '../../components/admin/DataTable';
import { SearchBar } from '../../components/admin/SearchBar';
import { FilterBar } from '../../components/admin/FilterBar';
import { Pagination } from '../../components/admin/Pagination';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { api } from '../../utils/api';

export const Payments = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 10;

  useEffect(() => {
    api.get('/payments/transactions', 'admin')
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.items || []);
        setTransactions(list);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching payments:', err);
        setTransactions([]);
        setLoading(false);
      });
  }, []);

  // Helper to check status flexibly
  const isCompleted = (s) => ['completed', 'successful', 'success', 'paid'].includes((s || '').toLowerCase());
  const isPending = (s) => (s || '').toLowerCase() === 'pending';
  const isFailed = (s) => (s || '').toLowerCase() === 'failed';
  const isRefunded = (s) => (s || '').toLowerCase() === 'refunded';

  // Metrics calculation
  const successfulTransactions = transactions.filter(t => isCompleted(t.status) || (t.type === 'Payment' && !isFailed(t.status) && !isRefunded(t.status)));
  const totalRevenue = transactions
    .filter(t => isCompleted(t.status) || t.type === 'Payment')
    .reduce((sum, t) => sum + (Number(t.amount) || 0), 0);

  const successfulCount = transactions.filter(t => isCompleted(t.status)).length || transactions.length;
  const failedCount = transactions.filter(t => isFailed(t.status)).length;
  const refundedCount = transactions.filter(t => isRefunded(t.status)).length;
  const pendingCount = transactions.filter(t => isPending(t.status)).length;

  const filteredTransactions = useMemo(() => {
    return transactions.filter(item => {
      const payer = (item.payer || item.user || '').toLowerCase();
      const course = (item.course || item.courseTitle || '').toLowerCase();
      const id = (item.id || '').toLowerCase();
      const method = (item.method || item.paymentGateway || '').toLowerCase();
      const term = searchTerm.trim().toLowerCase();

      const matchesSearch = !term || payer.includes(term) || course.includes(term) || id.includes(term) || method.includes(term);
      const matchesStatus = !statusFilter || (item.status || '').toLowerCase() === statusFilter.toLowerCase();

      return matchesSearch && matchesStatus;
    });
  }, [transactions, searchTerm, statusFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (page - 1) * pageSize;
    return filteredTransactions.slice(start, start + pageSize);
  }, [filteredTransactions, page, pageSize]);

  const columns = [
    { 
      header: 'Transaction ID', 
      cell: (row) => <span className="font-mono font-bold text-primary">{row.id}</span> 
    },
    { 
      header: 'Payer / User', 
      cell: (row) => (
        <span className="font-semibold text-slate-800">
          {row.payer || row.user || row.learner || 'Learner'}
        </span>
      ) 
    },
    { 
      header: 'Course Track', 
      cell: (row) => (
        <span className="font-medium text-slate-700 max-w-[220px] truncate block">
          {row.course || row.courseTitle || 'Masterclass Track'}
        </span>
      ) 
    },
    { 
      header: 'Amount', 
      cell: (row) => (
        <span className="font-bold text-emerald-700">
          ₹{Number(row.amount || 0).toLocaleString('en-US', { minimumFractionDigits: 2 })}
        </span>
      ) 
    },
    { 
      header: 'Payment Method', 
      cell: (row) => (
        <span className="text-slate-600 text-xs">
          {row.method || row.paymentGateway || 'NexusPay Direct'}
        </span>
      ) 
    },
    { 
      header: 'Date', 
      cell: (row) => row.date || (row.createdAt ? new Date(row.createdAt).toLocaleDateString() : 'N/A') 
    },
    { 
      header: 'Status', 
      cell: (row) => <StatusBadge status={row.status || 'Completed'} /> 
    },
  ];

  const statusOptions = [
    { label: 'All Statuses', value: '' },
    { label: 'Completed', value: 'Completed' },
    { label: 'Pending', value: 'Pending' },
    { label: 'Refunded', value: 'Refunded' },
    { label: 'Failed', value: 'Failed' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Payments & Transactions</h1>
          <p className="text-slate-500">Live telemetry of tuition collections, disbursements, and gateway settlements.</p>
        </div>
      </div>

      {/* Financial Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard 
          title="Gross Volume" 
          value={`₹${totalRevenue.toLocaleString('en-US', { minimumFractionDigits: 2 })}`} 
          icon={DollarSign} 
          trend="up" 
          trendValue="18.4%" 
          color="primary" 
        />
        <StatCard 
          title="Successful Txns" 
          value={successfulCount.toString()} 
          icon={CheckCircle} 
          color="success" 
        />
        <StatCard 
          title="Pending Settlements" 
          value={pendingCount.toString()} 
          icon={Clock} 
          color="warning" 
        />
        <StatCard 
          title="Refunds / Failed" 
          value={(refundedCount + failedCount).toString()} 
          icon={CreditCard} 
          color="danger" 
        />
      </div>

      {/* Payment Table with Filter & Search */}
      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-slate-200 flex flex-col sm:flex-row gap-4 items-center justify-between bg-slate-50/50">
          <SearchBar 
            placeholder="Search by ID, payer, course, or method..." 
            value={searchTerm} 
            onChange={setSearchTerm} 
          />
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <FilterBar 
              options={statusOptions} 
              value={statusFilter} 
              onChange={setStatusFilter} 
              placeholder="Filter by Status" 
            />
          </div>
        </div>

        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading payment records...</div>
        ) : (
          <DataTable columns={columns} data={paginatedData} />
        )}

        {!loading && filteredTransactions.length > 0 && (
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        )}
      </div>
    </div>
  );
};
