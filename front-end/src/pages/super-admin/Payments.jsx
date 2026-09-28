import React, { useState, useEffect, useMemo } from 'react';
import {
  CreditCard,
  TrendingUp,
  Download,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertCircle,
  ArrowUpRight,
  ShieldCheck,
  Building2,
  Percent,
  Coins,
  RefreshCw,
  ExternalLink,
  ChevronDown,
  Eye,
  FileText,
  X,
  Copy,
  Check,
} from 'lucide-react';
import api from '../../services/api';

export default function SuperAdminPayments() {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Filters state
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [typeFilter, setTypeFilter] = useState('All');
  const [methodFilter, setMethodFilter] = useState('All');

  // Modal inspection
  const [selectedTx, setSelectedTx] = useState(null);
  const [copiedId, setCopiedId] = useState(null);

  const fetchTransactions = async () => {
    try {
      setLoading(true);
      const data = await api.superAdmin.getTransactions();
      const list = Array.isArray(data) ? data : data?.items || [];
      setTransactions(list);
    } catch (err) {
      console.error('Failed to fetch payments:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, []);

  // Helper normalization for transactions
  const normalizedTransactions = useMemo(() => {
    return transactions.map((t, idx) => {
      const gross = Number(t.amount) || 0;
      const orgShare = Math.round(gross * 0.85 * 100) / 100;
      const superAdminShare = Math.round(gross * 0.15 * 100) / 100;
      const payerName = t.payerName || t.payer || 'Student Learner';
      const payerEmail = t.payerEmail || t.user || (payerName ? `${payerName.toLowerCase().replace(/\s+/g, '.')}@nexuspay.edu` : 'learner@nexuspay.edu');
      const courseTitle = t.courseTitle || t.course || 'Advanced Enterprise Architecture & Payment Systems';
      const status = t.status || (t.type === 'Payout' ? 'Pending' : 'Completed');
      const type = t.type || 'Payment';
      const method = t.paymentMethod || t.method || 'NexusPay Enterprise Billing';
      const date = t.date || (t.createdAt ? new Date(t.createdAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent');

      return {
        ...t,
        id: t.id || `TXN-${100000 + idx}`,
        gross,
        orgShare,
        superAdminShare,
        payerName,
        payerEmail,
        courseTitle,
        status,
        type,
        method,
        date,
      };
    });
  }, [transactions]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return normalizedTransactions.filter((tx) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        !term ||
        tx.id.toLowerCase().includes(term) ||
        tx.payerName.toLowerCase().includes(term) ||
        tx.payerEmail.toLowerCase().includes(term) ||
        tx.courseTitle.toLowerCase().includes(term);

      const matchesStatus =
        statusFilter === 'All' ||
        tx.status.toLowerCase() === statusFilter.toLowerCase();

      const matchesType =
        typeFilter === 'All' ||
        tx.type.toLowerCase() === typeFilter.toLowerCase();

      const matchesMethod =
        methodFilter === 'All' ||
        tx.method.toLowerCase().includes(methodFilter.toLowerCase());

      return matchesSearch && matchesStatus && matchesType && matchesMethod;
    });
  }, [normalizedTransactions, searchTerm, statusFilter, typeFilter, methodFilter]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalGross = normalizedTransactions.reduce((acc, t) => acc + t.gross, 0);
    const orgTotal = Math.round(totalGross * 0.85);
    const platformTotal = Math.round(totalGross * 0.15);
    const completedCount = normalizedTransactions.filter((t) => ['completed', 'paid'].includes(t.status.toLowerCase())).length;
    const successRate = normalizedTransactions.length > 0 ? ((completedCount / normalizedTransactions.length) * 100).toFixed(1) : 100;
    const avgTx = normalizedTransactions.length > 0 ? (totalGross / normalizedTransactions.length).toFixed(2) : 0;

    return {
      totalGross: totalGross.toLocaleString('en-US', { minimumFractionDigits: 2 }),
      orgTotal: orgTotal.toLocaleString('en-US', { minimumFractionDigits: 2 }),
      platformTotal: platformTotal.toLocaleString('en-US', { minimumFractionDigits: 2 }),
      txCount: normalizedTransactions.length,
      successRate,
      avgTx,
    };
  }, [normalizedTransactions]);

  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handleExportCSV = () => {
    const headers = ['Transaction ID', 'Payer Name', 'Payer Email', 'Course / Service', 'Gross Amount', 'Org Share (85%)', 'Platform Fee (15%)', 'Method', 'Type', 'Status', 'Timestamp'];
    const rows = filteredTransactions.map((tx) => [
      tx.id,
      `"${tx.payerName}"`,
      tx.payerEmail,
      `"${tx.courseTitle}"`,
      tx.gross,
      tx.orgShare,
      tx.superAdminShare,
      `"${tx.method}"`,
      tx.type,
      tx.status,
      `"${tx.date}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nexuspay_superadmin_ledger_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Coursera-style Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-[#0056D2] text-white flex items-center justify-center font-black shadow-xs">
              <CreditCard className="w-4 h-4 text-white" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Payments & Revenue</h1>
            <span className="px-2.5 py-0.5 rounded-full bg-blue-50 text-[#0056D2] text-[10px] font-bold border border-blue-200">
              {normalizedTransactions.length} Transactions
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Central platform ledger auditing enrolled learner course fees, organization disbursals (85%), and platform margin (15%).
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={fetchTransactions}
            className="inline-flex items-center gap-1.5 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-xl border border-slate-200 transition-all cursor-pointer shadow-2xs"
            title="Sync Ledger"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#0056D2]' : 'text-slate-500'}`} />
            <span>Sync</span>
          </button>

          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 bg-[#0056D2] hover:bg-[#00419e] text-white text-xs font-semibold px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
        </div>
      </div>

      {/* KPI Cards Strip (Clean Coursera Cards, Subtle 85/15) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Gross Volume */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Gross Transaction Volume</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900">₹{metrics.totalGross}</h3>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Cumulative across all enrollments</p>
        </div>

        {/* 85% Organization Share */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Organization Disbursals</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">
                85%
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900">₹{metrics.orgTotal}</h3>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Disbursed to partner organizations</p>
        </div>

        {/* 15% Platform Take */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Platform Margin</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">
                15%
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900">₹{metrics.platformTotal}</h3>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Platform tech & governance margin</p>
        </div>

        {/* Total Count & Success Rate */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Ledger Health</span>
            <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <h3 className="text-2xl font-black text-slate-900">{metrics.txCount}</h3>
            <span className="text-xs text-slate-500 font-semibold">Records</span>
          </div>
          <div className="flex items-center gap-2 mt-2 text-xs font-semibold text-emerald-600">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>{metrics.successRate}% Success SLA</span>
            <span className="text-slate-300">•</span>
            <span className="text-slate-500">Avg ₹{metrics.avgTx}</span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search by ID (TXN-...), student name, email, or course..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50/80 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
          />
          {searchTerm && (
            <button
              onClick={() => setSearchTerm('')}
              className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Dropdowns */}
        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="All">All Statuses</option>
              <option value="Completed">Completed</option>
              <option value="Paid">Paid</option>
              <option value="Pending">Pending</option>
              <option value="Refunded">Refunded</option>
            </select>
          </div>

          {/* Type Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500">Type:</span>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Payment">Payment</option>
              <option value="Payout">Payout</option>
              <option value="Refund">Refund</option>
            </select>
          </div>

          {/* Gateway Filter */}
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500">Method:</span>
            <select
              value={methodFilter}
              onChange={(e) => setMethodFilter(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="All">All Gateways</option>
              <option value="Visa">Visa</option>
              <option value="Mastercard">Mastercard</option>
              <option value="NexusPay">NexusPay Billing</option>
              <option value="Bank">Bank Deposit</option>
              <option value="PayPal">PayPal</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Ledger Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-indigo-600 border-t-transparent shadow-md"></div>
            <p className="text-xs font-semibold text-slate-500">Querying platform payment records & clearing telemetry...</p>
          </div>
        ) : filteredTransactions.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No payment transactions found matching the specified filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="py-3.5 px-4">Transaction Reference</th>
                  <th className="py-3.5 px-4">Payer / Student</th>
                  <th className="py-3.5 px-4">Course Item</th>
                  <th className="py-3.5 px-4 text-right">Gross Amount</th>
                  <th className="py-3.5 px-4 text-right">Org Share (85%)</th>
                  <th className="py-3.5 px-4 text-right">Super Admin (15%)</th>
                  <th className="py-3.5 px-4">Method</th>
                  <th className="py-3.5 px-4">Status</th>
                  <th className="py-3.5 px-4 text-right">Audit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredTransactions.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/80 transition-colors group">
                    {/* ID & Date */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className="font-mono font-bold text-slate-900 text-[11px] group-hover:text-indigo-600 transition-colors">
                          {tx.id}
                        </span>
                        <button
                          onClick={() => handleCopyId(tx.id)}
                          className="text-slate-400 hover:text-slate-600 p-0.5 rounded cursor-pointer"
                          title="Copy Transaction Ref"
                        >
                          {copiedId === tx.id ? (
                            <Check className="w-3 h-3 text-emerald-600" />
                          ) : (
                            <Copy className="w-3 h-3" />
                          )}
                        </button>
                      </div>
                      <span className="text-[10px] text-slate-400 block mt-0.5">{tx.date}</span>
                    </td>

                    {/* Payer */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-indigo-500 to-purple-600 text-white font-bold text-[10px] flex items-center justify-center shrink-0 shadow-xs">
                          {tx.payerName.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 text-xs leading-tight">{tx.payerName}</p>
                          <p className="text-[10px] text-slate-400 leading-none mt-0.5 truncate max-w-[140px]">{tx.payerEmail}</p>
                        </div>
                      </div>
                    </td>

                    {/* Course Title */}
                    <td className="py-3.5 px-4">
                      <span className="font-semibold text-slate-800 line-clamp-1 max-w-[200px]" title={tx.courseTitle}>
                        {tx.courseTitle}
                      </span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider font-semibold">
                        {tx.type}
                      </span>
                    </td>

                    {/* Gross */}
                    <td className="py-3.5 px-4 text-right">
                      <span className="font-bold text-slate-900 text-xs">
                        ₹{tx.gross.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </td>

                    {/* 85% Org Share */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1 justify-end font-bold text-indigo-700 bg-indigo-50/70 border border-indigo-200/60 px-2 py-0.5 rounded-lg text-xs">
                        <span>₹{tx.orgShare.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </td>

                    {/* 15% Platform Take */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="inline-flex items-center gap-1 justify-end font-bold text-purple-700 bg-purple-50/70 border border-purple-200/60 px-2 py-0.5 rounded-lg text-xs">
                        <span>₹{tx.superAdminShare.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                      </div>
                    </td>

                    {/* Method */}
                    <td className="py-3.5 px-4">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-slate-100 text-slate-700 font-semibold text-[10px]">
                        <CreditCard className="w-3 h-3 text-slate-500" />
                        <span>{tx.method}</span>
                      </span>
                    </td>

                    {/* Status */}
                    <td className="py-3.5 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                          ['completed', 'paid'].includes(tx.status.toLowerCase())
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200/60'
                            : tx.status.toLowerCase() === 'refunded'
                            ? 'bg-rose-50 text-rose-700 border border-rose-200/60'
                            : 'bg-amber-50 text-amber-800 border border-amber-200/60'
                        }`}
                      >
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            ['completed', 'paid'].includes(tx.status.toLowerCase())
                              ? 'bg-emerald-500'
                              : tx.status.toLowerCase() === 'refunded'
                              ? 'bg-rose-500'
                              : 'bg-amber-500'
                          }`}
                        ></span>
                        <span>{tx.status}</span>
                      </span>
                    </td>

                    {/* Action */}
                    <td className="py-3.5 px-4 text-right">
                      <button
                        onClick={() => setSelectedTx(tx)}
                        className="p-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-500 hover:text-indigo-600 transition-colors cursor-pointer"
                        title="View Settlement Audit"
                      >
                        <Eye className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Transaction Settlement Audit Breakdown Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-5 border border-slate-200">
            {/* Modal Header */}
            <div className="flex items-start justify-between">
              <div>
                <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[10px] font-bold mb-1 border border-purple-200/60">
                  <ShieldCheck className="w-3 h-3 text-purple-600" />
                  <span>Clearing Audit Reference</span>
                </div>
                <h2 className="text-xl font-black text-slate-900">Settlement Breakdown</h2>
                <p className="text-xs font-mono text-slate-500 mt-0.5">{selectedTx.id}</p>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Split Visualization */}
            <div className="p-4 rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-950 text-white space-y-3 shadow-inner">
              <div className="flex items-center justify-between text-xs text-slate-300">
                <span>Contractual Revenue Split</span>
                <span className="font-bold text-white">85% / 15% Platform Standard</span>
              </div>
              <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden flex">
                <div className="bg-indigo-500 h-full w-[85%]" title="Organization Share (85%)"></div>
                <div className="bg-purple-500 h-full w-[15%]" title="Super Admin Fee (15%)"></div>
              </div>
              <div className="flex justify-between items-center text-xs pt-1">
                <span className="flex items-center gap-1.5 text-indigo-300 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                  Org Payout: ₹{selectedTx.orgShare.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
                <span className="flex items-center gap-1.5 text-purple-300 font-semibold">
                  <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                  Super Admin: ₹{selectedTx.superAdminShare.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {/* Detailed Transaction Info */}
            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Customer / Payer:</span>
                <span className="font-bold text-slate-900">{selectedTx.payerName} ({selectedTx.payerEmail})</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Enrolled Course:</span>
                <span className="font-bold text-slate-900 max-w-[260px] text-right truncate">{selectedTx.courseTitle}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Gross Amount Charged:</span>
                <span className="font-black text-slate-900 text-sm">₹{selectedTx.gross.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Payment Gateway:</span>
                <span className="font-semibold text-slate-800">{selectedTx.method}</span>
              </div>
              <div className="flex justify-between py-2 border-b border-slate-100">
                <span className="text-slate-500 font-medium">Settlement Status:</span>
                <span className="font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full text-[11px]">
                  {selectedTx.status}
                </span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-slate-500 font-medium">Ledger Timestamp:</span>
                <span className="font-mono text-slate-600 text-[11px]">{selectedTx.date}</span>
              </div>
            </div>

            {/* Modal Actions */}
            <div className="pt-2">
              <button
                onClick={() => setSelectedTx(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 transition-colors shadow-sm cursor-pointer"
              >
                Close Audit View
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
