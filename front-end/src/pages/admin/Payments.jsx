import React, { useState, useEffect } from 'react';
import { DollarSign, CreditCard, CheckCircle, Clock } from 'lucide-react';
import { StatCard } from '../../components/admin/StatCard';
import { DataTable } from '../../components/admin/DataTable';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { api } from '../../utils/api';

export const Payments = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/transactions')
      .then(data => {
        setTransactions(data || []);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching payments:', err);
        setLoading(false);
      });
  }, []);

  const totalRevenue = transactions
    .filter(t => t.status === 'Successful')
    .reduce((sum, t) => sum + (t.amount || 0), 0);

  const successfulCount = transactions.filter(t => t.status === 'Successful').length;
  const failedCount = transactions.filter(t => t.status === 'Failed').length;
  const refundedCount = transactions.filter(t => t.status === 'Refunded').length;

  const columns = [
    { header: 'Transaction ID', accessor: 'id' },
    { header: 'User', accessor: 'user' },
    { header: 'Course', accessor: 'course' },
    { header: 'Amount', cell: (row) => `$${row.amount}` },
    { header: 'Gateway', accessor: 'paymentGateway' },
    { header: 'Date', cell: (row) => row.date ? new Date(row.date).toLocaleDateString() : 'N/A' },
    { header: 'Status', cell: (row) => <StatusBadge status={row.status} /> },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Payments & Transactions</h1>
          <p className="text-slate-500">Live overview of platform payments and transaction settlements.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Gross Volume" value={`$${totalRevenue.toFixed(2)}`} icon={DollarSign} color="primary" />
        <StatCard title="Successful Txns" value={successfulCount.toString()} icon={CheckCircle} color="success" />
        <StatCard title="Failed Txns" value={failedCount.toString()} icon={Clock} color="danger" />
        <StatCard title="Refunds Processed" value={refundedCount.toString()} icon={CreditCard} color="warning" />
      </div>

      <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 bg-slate-50/50">
          <h3 className="text-lg font-bold text-slate-800">Recent Payment Records</h3>
        </div>
        {loading ? (
          <div className="p-12 text-center text-slate-500">Loading payments...</div>
        ) : (
          <DataTable columns={columns} data={transactions} />
        )}
      </div>
    </div>
  );
};
