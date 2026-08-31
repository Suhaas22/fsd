import React, { useState } from 'react';
import {
  Receipt,
  Search,
  Download,
  CreditCard
} from 'lucide-react';
import OrgLayout from '../../components/organization/OrgLayout';
import { useOrg } from '../../context/OrgContext';
import { useToast } from '../../components/common/Toast';
import { exportToCSV } from '../../utils/csvDownload';

export default function Transactions() {
  const { transactions } = useOrg();
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');

  const filteredTransactions = transactions.filter(t => {
    const matchesFilter = filter === 'All' || t.type === filter || t.status === filter;
    const matchesSearch = t.payer.toLowerCase().includes(search.toLowerCase()) ||
                          t.course.toLowerCase().includes(search.toLowerCase()) ||
                          t.id.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'Payer / Student', 'Course Track', 'Amount ($)', 'Type', 'Payment Method', 'Date', 'Status'];
    const rows = filteredTransactions.map(t => [
      t.id,
      t.payer,
      t.course,
      t.amount,
      t.type,
      t.method,
      t.date,
      t.status
    ]);

    exportToCSV('transactions_ledger.csv', headers, rows);
    addToast('Downloaded transactions ledger CSV file!', 'success');
  };

  return (
    <OrgLayout
      breadcrumbs={[{ label: 'Transactions' }]}
      actions={
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold transition-all border border-outline-variant"
        >
          <Download className="w-4 h-4 text-primary" />
          <span>Export Ledger CSV</span>
        </button>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-on-surface">Institutional Transaction Ledger</h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Auditable record of student payments, royalty disbursements, and settlements.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3.5 py-1.5 rounded-xl bg-surface-container border border-outline-variant text-xs font-bold text-on-surface">
              {transactions.length} Total Records
            </span>
          </div>
        </div>

        {/* Filter Pills & Search */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-4 shadow-elevation-1 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {['All', 'Payment', 'Royalty', 'Completed'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  filter === tab
                    ? 'bg-[#255ea6] text-white shadow-xs'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search transaction ID, student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary text-on-surface font-medium"
            />
          </div>
        </div>

        {/* Transactions Table */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-elevation-1 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-outline uppercase text-[10px] tracking-wider border-b border-outline-variant">
                  <th className="pb-3 font-bold">Transaction ID</th>
                  <th className="pb-3 font-bold">Student / Payer</th>
                  <th className="pb-3 font-bold">Course Track</th>
                  <th className="pb-3 font-bold">Amount</th>
                  <th className="pb-3 font-bold">Method</th>
                  <th className="pb-3 font-bold">Date</th>
                  <th className="pb-3 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {filteredTransactions.map((t) => (
                  <tr key={t.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-4 font-mono font-bold text-primary">{t.id}</td>
                    <td className="py-4 font-bold text-on-surface">{t.payer}</td>
                    <td className="py-4 text-on-surface-variant font-medium max-w-[200px] truncate">{t.course}</td>
                    <td className="py-4 font-bold text-emerald-700">${t.amount}</td>
                    <td className="py-4 text-outline">{t.method}</td>
                    <td className="py-4 text-outline whitespace-nowrap">{t.date}</td>
                    <td className="py-4 text-right">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        t.status === 'Completed' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                      }`}>
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </OrgLayout>
  );
}
