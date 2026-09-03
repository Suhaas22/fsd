import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  Clock,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Search,
  Filter,
  ChevronDown,
  User,
  Building2,
  RefreshCw,
  TrendingUp,
  ArrowUpDown,
  Plus,
} from 'lucide-react';
import { StatusBadge } from '../../components/admin/StatusBadge';
import { Pagination } from '../../components/admin/Pagination';
import { DisputeDetailDrawer } from '../../components/admin/DisputeDetailDrawer';
import { api } from '../../utils/api';

const PAGE_SIZE = 8;

const PRIORITY_COLORS = {
  High: 'bg-rose-100 text-rose-700 border-rose-200',
  Medium: 'bg-amber-100 text-amber-700 border-amber-200',
  Low: 'bg-emerald-100 text-emerald-700 border-emerald-200',
};

const TYPE_COLORS = {
  'Course Content': 'bg-blue-50 text-blue-700',
  Payment: 'bg-violet-50 text-violet-700',
  Certificate: 'bg-emerald-50 text-emerald-700',
  'Course Status': 'bg-amber-50 text-amber-700',
  'Instructor Conduct': 'bg-orange-50 text-orange-700',
};

function StatCard({ label, value, icon: Icon, color, subColor, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className={`group bg-white rounded-2xl border p-5 flex items-center gap-4 w-full text-left transition-all duration-200 hover:shadow-md hover:-translate-y-0.5 ${
        active
          ? 'border-indigo-300 shadow-md ring-1 ring-indigo-200'
          : 'border-slate-200 shadow-sm'
      }`}
    >
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon className="w-6 h-6" />
      </div>
      <div>
        <div className={`text-3xl font-extrabold ${subColor}`}>{value}</div>
        <div className="text-sm text-slate-500 font-medium mt-0.5">{label}</div>
      </div>
    </button>
  );
}

function FilterSelect({ value, onChange, options, placeholder }) {
  return (
    <div className="relative">
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="appearance-none bg-white border border-slate-200 rounded-xl px-4 py-2.5 pr-9 text-sm font-medium text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 cursor-pointer"
      >
        <option value="">{placeholder}</option>
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
      <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
    </div>
  );
}

export const Disputes = () => {
  const [disputes, setDisputes] = useState([]);
  const [stats, setStats] = useState({ total: 0, pending: 0, resolved: 0, rejected: 0, inProgress: 0 });
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('');
  const [raisedByFilter, setRaisedByFilter] = useState('');
  const [page, setPage] = useState(1);
  const [sortField, setSortField] = useState('date');
  const [sortDir, setSortDir] = useState('desc');

  const [selectedDispute, setSelectedDispute] = useState(null);

  const fetchDisputes = useCallback(async () => {
    try {
      const data = await api.get('/disputes', 'admin');
      const list = Array.isArray(data) ? data : (data?.items || []);
      setDisputes(list);
      // compute stats client-side — /disputes/stats doesn't exist
      setStats({
        total:      list.length,
        pending:    list.filter(d => d.status === 'Pending').length,
        resolved:   list.filter(d => d.status === 'Resolved').length,
        rejected:   list.filter(d => d.status === 'Rejected').length,
        inProgress: list.filter(d => d.status === 'In Progress').length,
      });
    } catch (err) {
      console.error('Error fetching disputes:', err);
      setDisputes([]);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDisputes();
  }, [fetchDisputes]);

  const handleDisputeUpdated = useCallback((updated) => {
    setDisputes((prev) => {
      const next = prev.map((d) => (d.id === updated.id ? updated : d));
      // recompute stats from updated list
      setStats({
        total:      next.length,
        pending:    next.filter(d => d.status === 'Pending').length,
        resolved:   next.filter(d => d.status === 'Resolved').length,
        rejected:   next.filter(d => d.status === 'Rejected').length,
        inProgress: next.filter(d => d.status === 'In Progress').length,
      });
      return next;
    });
    setSelectedDispute(updated);
  }, []);

  const handleSort = (field) => {
    if (sortField === field) setSortDir((d) => (d === 'asc' ? 'desc' : 'asc'));
    else { setSortField(field); setSortDir('asc'); }
    setPage(1);
  };

  const filtered = useMemo(() => {
    let list = disputes.filter((d) => {
      const q = searchTerm.toLowerCase();
      const matchSearch = !q || [d.id, d.subject, d.raisedBy, d.organization, d.type, d.course]
        .some((v) => v?.toLowerCase().includes(q));
      const matchStatus = !statusFilter || d.status === statusFilter;
      const matchType = !typeFilter || d.type === typeFilter;
      const matchPriority = !priorityFilter || d.priority === priorityFilter;
      const matchRaisedBy = !raisedByFilter || d.raisedByType === raisedByFilter;
      return matchSearch && matchStatus && matchType && matchPriority && matchRaisedBy;
    });

    list = [...list].sort((a, b) => {
      let aVal = a[sortField] ?? '';
      let bVal = b[sortField] ?? '';
      if (sortField === 'date' || sortField === 'createdAt') {
        aVal = new Date(a.createdAt || a.date || 0).getTime();
        bVal = new Date(b.createdAt || b.date || 0).getTime();
      } else if (typeof aVal === 'string' && typeof bVal === 'string') {
        return sortDir === 'asc' 
          ? aVal.localeCompare(bVal, undefined, { sensitivity: 'base' })
          : bVal.localeCompare(aVal, undefined, { sensitivity: 'base' });
      }
      if (aVal < bVal) return sortDir === 'asc' ? -1 : 1;
      if (aVal > bVal) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

    return list;
  }, [disputes, searchTerm, statusFilter, typeFilter, priorityFilter, raisedByFilter, sortField, sortDir]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const hasFilters = searchTerm || statusFilter || typeFilter || priorityFilter || raisedByFilter;

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setTypeFilter('');
    setPriorityFilter('');
    setRaisedByFilter('');
    setPage(1);
  };

  const SortIcon = ({ field }) => (
    <ArrowUpDown
      className={`w-3.5 h-3.5 inline ml-1 transition-colors ${sortField === field ? 'text-indigo-500' : 'text-slate-300'}`}
    />
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
            <ShieldAlert className="w-7 h-7 text-indigo-500" />
            Dispute Resolution
          </h1>
          <p className="text-slate-500 mt-0.5">
            Review, investigate, and resolve disputes raised by learners and organizations.
          </p>
        </div>
        <button
          onClick={fetchDisputes}
          className="flex items-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-sm font-medium text-slate-600 hover:bg-slate-50 hover:border-slate-300 transition-all shadow-sm"
        >
          <RefreshCw className="w-4 h-4" />
          Refresh
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        <StatCard
          label="Total Disputes"
          value={loading ? '—' : stats.total}
          icon={ShieldAlert}
          color="bg-indigo-100 text-indigo-600"
          subColor="text-indigo-700"
          onClick={() => { setStatusFilter(''); setPage(1); }}
          active={!statusFilter}
        />
        <StatCard
          label="Pending"
          value={loading ? '—' : stats.pending}
          icon={Clock}
          color="bg-amber-100 text-amber-600"
          subColor="text-amber-700"
          onClick={() => { setStatusFilter('Pending'); setPage(1); }}
          active={statusFilter === 'Pending'}
        />
        <StatCard
          label="Resolved"
          value={loading ? '—' : stats.resolved}
          icon={CheckCircle}
          color="bg-emerald-100 text-emerald-600"
          subColor="text-emerald-700"
          onClick={() => { setStatusFilter('Resolved'); setPage(1); }}
          active={statusFilter === 'Resolved'}
        />
        <StatCard
          label="Rejected"
          value={loading ? '—' : stats.rejected}
          icon={XCircle}
          color="bg-rose-100 text-rose-600"
          subColor="text-rose-700"
          onClick={() => { setStatusFilter('Rejected'); setPage(1); }}
          active={statusFilter === 'Rejected'}
        />
      </div>

      {/* Table Card */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        {/* Toolbar */}
        <div className="p-4 border-b border-slate-200 bg-slate-50/50">
          <div className="flex flex-col lg:flex-row gap-3 items-start lg:items-center">
            {/* Search */}
            <div className="relative flex-1 min-w-0">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
                placeholder="Search disputes by ID, subject, user, organization..."
                className="w-full pl-9 pr-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200 focus:border-indigo-400 bg-white"
              />
            </div>

            {/* Filters */}
            <div className="flex items-center gap-2 flex-wrap">
              <FilterSelect
                value={raisedByFilter}
                onChange={(v) => { setRaisedByFilter(v); setPage(1); }}
                options={[
                  { label: 'Learner', value: 'Learner' },
                  { label: 'Organization', value: 'Organization' },
                ]}
                placeholder="All Types"
              />
              <FilterSelect
                value={typeFilter}
                onChange={(v) => { setTypeFilter(v); setPage(1); }}
                options={[
                  { label: 'Course Content', value: 'Course Content' },
                  { label: 'Payment', value: 'Payment' },
                  { label: 'Certificate', value: 'Certificate' },
                  { label: 'Course Status', value: 'Course Status' },
                  { label: 'Instructor Conduct', value: 'Instructor Conduct' },
                ]}
                placeholder="All Categories"
              />
              <FilterSelect
                value={priorityFilter}
                onChange={(v) => { setPriorityFilter(v); setPage(1); }}
                options={[
                  { label: 'High', value: 'High' },
                  { label: 'Medium', value: 'Medium' },
                  { label: 'Low', value: 'Low' },
                ]}
                placeholder="All Priorities"
              />
              <FilterSelect
                value={statusFilter}
                onChange={(v) => { setStatusFilter(v); setPage(1); }}
                options={[
                  { label: 'Pending', value: 'Pending' },
                  { label: 'Resolved', value: 'Resolved' },
                  { label: 'Rejected', value: 'Rejected' },
                  { label: 'In Progress', value: 'In Progress' },
                ]}
                placeholder="All Statuses"
              />
              {hasFilters && (
                <button
                  onClick={clearFilters}
                  className="px-3 py-2.5 text-sm text-rose-600 hover:text-rose-700 font-medium hover:bg-rose-50 rounded-xl transition-colors"
                >
                  Clear filters
                </button>
              )}
            </div>
          </div>

          {/* Result count */}
          <div className="flex items-center gap-2 mt-3">
            <span className="text-xs text-slate-500">
              Showing <span className="font-semibold text-slate-700">{filtered.length}</span> dispute{filtered.length !== 1 ? 's' : ''}
              {hasFilters && ' (filtered)'}
            </span>
            {stats.pending > 0 && (
              <span className="ml-auto text-xs bg-amber-100 text-amber-700 border border-amber-200 px-2.5 py-1 rounded-full font-semibold flex items-center gap-1">
                <AlertTriangle className="w-3 h-3" />
                {stats.pending} awaiting review
              </span>
            )}
          </div>
        </div>

        {/* Table */}
        {loading ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3">
            <div className="w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin" />
            <p className="text-slate-500 text-sm font-medium">Loading disputes...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="p-16 flex flex-col items-center justify-center gap-3 text-center">
            <div className="w-16 h-16 bg-slate-100 rounded-2xl flex items-center justify-center">
              <ShieldAlert className="w-8 h-8 text-slate-300" />
            </div>
            <div>
              <p className="text-slate-700 font-semibold">No disputes found</p>
              <p className="text-slate-400 text-sm mt-1">
                {hasFilters ? 'Try adjusting your search or filters.' : 'All disputes will appear here.'}
              </p>
            </div>
            {hasFilters && (
              <button onClick={clearFilters} className="text-indigo-600 text-sm font-medium hover:underline">
                Clear all filters
              </button>
            )}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/30">
                  {[
                    { label: 'Dispute ID', field: 'id' },
                    { label: 'Raised By', field: 'raisedBy' },
                    { label: 'Subject & Category', field: 'subject' },
                    { label: 'Priority', field: 'priority' },
                    { label: 'Date', field: 'createdAt' },
                    { label: 'Status', field: 'status' },
                    { label: 'Actions', field: null },
                  ].map(({ label, field }) => (
                    <th
                      key={label}
                      onClick={() => field && handleSort(field)}
                      className={`px-5 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider text-left whitespace-nowrap ${field ? 'cursor-pointer select-none hover:text-slate-700' : ''}`}
                    >
                      {label}
                      {field && <SortIcon field={field} />}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {paginated.map((row) => (
                  <tr
                    key={row.id}
                    onClick={() => setSelectedDispute(row)}
                    className="hover:bg-indigo-50/40 transition-colors cursor-pointer group"
                  >
                    {/* ID */}
                    <td className="px-5 py-4">
                      <span className="text-xs font-mono font-semibold text-slate-500 bg-slate-100 group-hover:bg-indigo-100 group-hover:text-indigo-700 px-2 py-1 rounded transition-colors">
                        {row.id}
                      </span>
                    </td>

                    {/* Raised By */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-2">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
                            row.raisedByType === 'Organization'
                              ? 'bg-purple-100 text-purple-600'
                              : 'bg-blue-100 text-blue-600'
                          }`}
                        >
                          {row.raisedByType === 'Organization'
                            ? <Building2 className="w-4 h-4" />
                            : <User className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-800 text-sm">{row.raisedBy}</div>
                          <div className="text-xs text-slate-400">{row.raisedByType}</div>
                        </div>
                      </div>
                    </td>

                    {/* Subject */}
                    <td className="px-5 py-4 max-w-xs">
                      <div className="font-semibold text-slate-800 text-sm truncate">{row.subject}</div>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${TYPE_COLORS[row.type] || 'bg-slate-100 text-slate-600'}`}>
                          {row.type}
                        </span>
                        <span className="text-xs text-slate-400 truncate">{row.course}</span>
                      </div>
                    </td>

                    {/* Priority */}
                    <td className="px-5 py-4">
                      <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${PRIORITY_COLORS[row.priority] || 'bg-slate-100 text-slate-600 border-slate-200'}`}>
                        {row.priority}
                      </span>
                    </td>

                    {/* Date */}
                    <td className="px-5 py-4 text-sm text-slate-500 whitespace-nowrap">
                      {new Date(row.createdAt || row.date).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      })}
                    </td>

                    {/* Status */}
                    <td className="px-5 py-4">
                      <StatusBadge status={row.status} />
                    </td>

                    {/* Actions */}
                    <td className="px-5 py-4" onClick={(e) => e.stopPropagation()}>
                      {row.status === 'Pending' ? (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => setSelectedDispute(row)}
                            className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 rounded-lg border border-emerald-200 transition-colors"
                          >
                            Resolve
                          </button>
                          <button
                            onClick={() => setSelectedDispute(row)}
                            className="px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 rounded-lg border border-rose-200 transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => setSelectedDispute(row)}
                          className="px-3 py-1.5 text-xs font-semibold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 rounded-lg border border-indigo-200 transition-colors"
                        >
                          View Details
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination */}
        {!loading && filtered.length > 0 && (
          <Pagination currentPage={page} totalPages={totalPages} onPageChange={setPage} />
        )}
      </div>

      {/* Detail Drawer */}
      {selectedDispute && (
        <DisputeDetailDrawer
          dispute={selectedDispute}
          onClose={() => setSelectedDispute(null)}
          onUpdated={handleDisputeUpdated}
        />
      )}
    </div>
  );
};
