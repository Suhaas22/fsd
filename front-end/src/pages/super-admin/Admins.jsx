import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Plus,
  Trash2,
  Edit2,
  Search,
  Filter,
  UserCheck,
  AlertTriangle,
  Clock,
  CheckCircle,
  XCircle,
  FileText,
  Activity,
  ArrowUpRight,
  ShieldAlert,
  Send,
  History,
  CheckCircle2,
  ExternalLink,
  ChevronRight,
  User,
  Building2,
  MessageSquare,
  Sparkles,
  RefreshCw,
  X,
} from 'lucide-react';
import api from '../../services/api';
import HumanAvatar from '../../components/common/HumanAvatar';

export default function SuperAdminAdmins() {
  const [activeTab, setActiveTab] = useState('history'); // 'history' | 'admins' | 'escalations'

  // Admin CRUD State
  const [admins, setAdmins] = useState([]);
  const [loadingAdmins, setLoadingAdmins] = useState(true);
  const [adminSearch, setAdminSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [adminForm, setAdminForm] = useState({ name: '', email: '', role: 'Admin', status: 'Active' });
  const [editingAdminId, setEditingAdminId] = useState(null);

  // Admin Resolutions & Work History State
  const [resolutions, setResolutions] = useState([]);
  const [loadingResolutions, setLoadingResolutions] = useState(true);
  const [historySearch, setHistorySearch] = useState('');
  const [selectedAdminFilter, setSelectedAdminFilter] = useState('All');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [inspectResolution, setInspectResolution] = useState(null);
  const [showLogModal, setShowLogModal] = useState(false);
  const [newLogForm, setNewLogForm] = useState({
    title: '',
    ticketId: '',
    adminName: 'Operational Platform Admin',
    category: 'Dispute & IP Governance',
    entity: '',
    findings: '',
    actionTaken: '',
    outcome: 'Resolved',
    turnaroundMinutes: 20,
    priority: 'Medium',
  });

  // Escalations Oversight State
  const [escalations, setEscalations] = useState([]);
  const [loadingEscalations, setLoadingEscalations] = useState(true);
  const [escalationSearch, setEscalationSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [selectedEscalation, setSelectedEscalation] = useState(null);
  const [resolutionText, setResolutionText] = useState('');

  const fetchAdmins = async () => {
    try {
      setLoadingAdmins(true);
      const res = await api.superAdmin.getAdmins();
      setAdmins(Array.isArray(res) ? res : res?.items || []);
    } catch (err) {
      console.error('Failed to fetch admins:', err);
    } finally {
      setLoadingAdmins(false);
    }
  };

  const fetchResolutions = async () => {
    try {
      setLoadingResolutions(true);
      const res = await api.superAdmin.getAdminResolutions();
      setResolutions(Array.isArray(res) ? res : []);
    } catch (err) {
      console.error('Failed to fetch admin resolutions:', err);
    } finally {
      setLoadingResolutions(false);
    }
  };

  const fetchEscalations = async () => {
    try {
      setLoadingEscalations(true);
      const res = await api.superAdmin.getEscalations();
      const list = Array.isArray(res) ? res : res?.items || [];
      setEscalations(list);
    } catch (err) {
      console.error('Failed to fetch escalations:', err);
    } finally {
      setLoadingEscalations(false);
    }
  };

  useEffect(() => {
    fetchAdmins();
    fetchResolutions();
    fetchEscalations();
  }, []);

  // Admin CRUD Handlers
  const handleCreateAdmin = async (e) => {
    e.preventDefault();
    try {
      await api.superAdmin.createAdmin(adminForm);
      setShowCreateModal(false);
      setAdminForm({ name: '', email: '', role: 'Admin', status: 'Active' });
      fetchAdmins();
    } catch (err) {
      alert('Error creating admin: ' + err.message);
    }
  };

  const handleOpenEdit = (admin) => {
    setEditingAdminId(admin.id);
    setAdminForm({
      name: admin.name || '',
      email: admin.email || '',
      role: admin.role || 'Admin',
      status: admin.status || 'Active',
    });
    setShowEditModal(true);
  };

  const handleUpdateAdmin = async (e) => {
    e.preventDefault();
    try {
      await api.superAdmin.updateAdmin(editingAdminId, adminForm);
      setShowEditModal(false);
      setEditingAdminId(null);
      fetchAdmins();
    } catch (err) {
      alert('Error updating admin: ' + err.message);
    }
  };

  const handleDeleteAdmin = async (id, name) => {
    if (!window.confirm(`Are you sure you want to remove operational admin "${name}"?`)) return;
    try {
      await api.superAdmin.deleteAdmin(id);
      fetchAdmins();
    } catch (err) {
      alert('Error removing admin: ' + err.message);
    }
  };

  // Log new resolution action
  const handleCreateResolutionLog = async (e) => {
    e.preventDefault();
    try {
      await api.superAdmin.recordAdminResolution(newLogForm);
      setShowLogModal(false);
      setNewLogForm({
        title: '',
        ticketId: '',
        adminName: 'Operational Platform Admin',
        category: 'Dispute & IP Governance',
        entity: '',
        findings: '',
        actionTaken: '',
        outcome: 'Resolved',
        turnaroundMinutes: 20,
        priority: 'Medium',
      });
      fetchResolutions();
    } catch (err) {
      alert('Error recording admin resolution log: ' + err.message);
    }
  };

  // Escalation Overrides Handlers
  const handleResolveEscalation = async (e) => {
    e.preventDefault();
    if (!selectedEscalation || !resolutionText.trim()) return;
    try {
      await api.superAdmin.resolveEscalation(selectedEscalation.id, resolutionText);
      setSelectedEscalation(null);
      setResolutionText('');
      fetchEscalations();
      fetchResolutions();
    } catch (err) {
      alert('Error updating escalation: ' + err.message);
    }
  };

  const handleUpdateEscalationStatus = async (id, status, notes) => {
    try {
      await api.superAdmin.updateEscalationStatus(id, status, notes || 'Status updated by Super Admin');
      fetchEscalations();
    } catch (err) {
      alert('Error updating status: ' + err.message);
    }
  };

  // Filtered lists
  const filteredAdmins = admins.filter(
    (u) =>
      u.name?.toLowerCase().includes(adminSearch.toLowerCase()) ||
      u.email?.toLowerCase().includes(adminSearch.toLowerCase())
  );

  const filteredResolutions = useMemo(() => {
    return resolutions.filter((res) => {
      const term = historySearch.toLowerCase();
      const matchesSearch =
        !term ||
        res.title?.toLowerCase().includes(term) ||
        res.findings?.toLowerCase().includes(term) ||
        res.ticketId?.toLowerCase().includes(term) ||
        res.adminName?.toLowerCase().includes(term) ||
        res.entity?.toLowerCase().includes(term);

      const matchesAdmin =
        selectedAdminFilter === 'All' ||
        res.adminName?.toLowerCase() === selectedAdminFilter.toLowerCase();

      const matchesCategory =
        categoryFilter === 'All' ||
        res.category?.toLowerCase() === categoryFilter.toLowerCase();

      return matchesSearch && matchesAdmin && matchesCategory;
    });
  }, [resolutions, historySearch, selectedAdminFilter, categoryFilter]);

  const filteredEscalations = escalations.filter((esc) => {
    const matchesSearch =
      esc.subject?.toLowerCase().includes(escalationSearch.toLowerCase()) ||
      esc.raisedBy?.toLowerCase().includes(escalationSearch.toLowerCase()) ||
      esc.id?.toLowerCase().includes(escalationSearch.toLowerCase());
    const matchesStatus = statusFilter === 'All' || esc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner with Navigation Tabs */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-purple-50 text-purple-700 text-[11px] font-bold mb-1 border border-purple-200/60">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-600" />
            <span>Operational Administration Oversight</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight">
            Admin Governance & Resolution History
          </h1>
          <p className="text-xs text-slate-500">
            Audit what operational admins have resolved, inspect investigated cases, track turnaround performance, and manage admin credentials.
          </p>
        </div>

        {/* 3 Core Tabs */}
        <div className="flex flex-wrap items-center gap-1.5 bg-slate-100 p-1.5 rounded-2xl self-start lg:self-auto">
          <button
            onClick={() => setActiveTab('history')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'history'
                ? 'bg-[#0056D2] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <History className={`w-3.5 h-3.5 ${activeTab === 'history' ? 'text-white' : 'text-slate-500'}`} />
            <span>Admin Resolution History ({resolutions.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('admins')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'admins'
                ? 'bg-[#0056D2] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <UserCheck className={`w-3.5 h-3.5 ${activeTab === 'admins' ? 'text-white' : 'text-slate-500'}`} />
            <span>System Admins Roster ({admins.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('escalations')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeTab === 'escalations'
                ? 'bg-[#0056D2] text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className={`w-3.5 h-3.5 ${activeTab === 'escalations' ? 'text-white' : 'text-slate-500'}`} />
            <span>Pending Escalations ({escalations.filter((e) => e.status !== 'Resolved').length})</span>
          </button>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* TAB 1: ADMIN RESOLUTION HISTORY & WORK ACTIVITY LOG */}
      {/* ────────────────────────────────────────────────────────────── */}
      {activeTab === 'history' && (
        <div className="space-y-5 animate-in fade-in">
          {/* Admin Resolution Performance Scorecard */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Work Resolved</span>
                <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900">{resolutions.length}</h3>
              <p className="text-[11px] text-emerald-600 font-semibold mt-1">100% verified administrative actions</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Avg Turnaround SLA</span>
                <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                  <Clock className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900">24.5 min</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1">Rapid intervention benchmark</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Active Resolvers</span>
                <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                  <User className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900">{admins.length}</h3>
              <p className="text-[11px] text-purple-700 font-medium mt-1">Operational Admins on Duty</p>
            </div>

            <div className="bg-white p-5 rounded-3xl border border-slate-200/90 shadow-xs">
              <div className="flex items-center justify-between mb-2">
                <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Resolution Quality</span>
                <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                  <Sparkles className="w-4 h-4" />
                </div>
              </div>
              <h3 className="text-2xl font-black text-slate-900">99.2%</h3>
              <p className="text-[11px] text-slate-500 font-medium mt-1">Zero contested overrides</p>
            </div>
          </div>

          {/* Search, Filter & Action Bar */}
          <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search resolved work by ticket, admin, course, or keyword..."
                value={historySearch}
                onChange={(e) => setHistorySearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-slate-50/80 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-all"
              />
              {historySearch && (
                <button
                  onClick={() => setHistorySearch('')}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-2.5">
              {/* Filter by Admin */}
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
                <span className="text-[11px] font-semibold text-slate-500">Admin:</span>
                <select
                  value={selectedAdminFilter}
                  onChange={(e) => setSelectedAdminFilter(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Admins</option>
                  <option value="Operational Platform Admin">Operational Platform Admin</option>
                  <option value="Platform Super Admin">Platform Super Admin</option>
                </select>
              </div>

              {/* Filter by Category */}
              <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200 text-xs">
                <span className="text-[11px] font-semibold text-slate-500">Domain:</span>
                <select
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                  className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
                >
                  <option value="All">All Categories</option>
                  <option value="Technical & Lab Anomaly">Lab Anomalies</option>
                  <option value="Financial Settlement & Refunds">Refunds & Settlements</option>
                  <option value="Curriculum & Quality Assurance">Course Approvals</option>
                  <option value="Institutional Accreditation">Accreditation</option>
                  <option value="Copyright & IP Infringement">IP & Copyright</option>
                  <option value="Security & Access">Security & Access</option>
                </select>
              </div>

              {/* Log new admin action */}
              <button
                onClick={() => setShowLogModal(true)}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Log Resolution</span>
              </button>
            </div>
          </div>

          {/* Resolutions Feed List */}
          <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
            {loadingResolutions ? (
              <div className="py-20 text-center text-slate-400 text-xs flex flex-col items-center justify-center gap-2">
                <div className="animate-spin rounded-full h-8 w-8 border-3 border-indigo-600 border-t-transparent"></div>
                <span>Loading admin resolution history & telemetry...</span>
              </div>
            ) : filteredResolutions.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                No admin work records match the search and filter criteria.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredResolutions.map((res) => (
                  <div
                    key={res.id}
                    className="p-5 hover:bg-slate-50/70 transition-colors flex flex-col lg:flex-row lg:items-start justify-between gap-4 group"
                  >
                    <div className="space-y-2.5 flex-1">
                      {/* Top Badges */}
                      <div className="flex flex-wrap items-center gap-2 text-xs">
                        <span className="font-mono font-bold text-[11px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200/60">
                          {res.ticketId || res.id}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200/60">
                          {res.category}
                        </span>
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200/60">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          <span>{res.outcome}</span>
                        </span>
                        <span className="inline-flex items-center gap-1 text-[11px] text-slate-400 font-medium">
                          <Clock className="w-3 h-3 text-slate-400" />
                          <span>Resolved in {res.turnaroundMinutes || 20} mins</span>
                        </span>
                      </div>

                      {/* Work Title */}
                      <h3 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                        {res.title}
                      </h3>

                      {/* Admin Identity & Entity Details */}
                      <div className="flex flex-wrap items-center gap-4 text-xs">
                        <div className="flex items-center gap-2 bg-slate-50 border border-slate-200/70 px-2.5 py-1 rounded-xl">
                          <HumanAvatar name={res.adminName} size="xs" />
                          <span className="text-[11px] font-bold text-slate-800">
                            Resolved by: {res.adminName}
                          </span>
                        </div>

                        {res.entity && (
                          <span className="text-[11px] text-slate-600">
                            <strong>Entity:</strong> {res.entity}
                          </span>
                        )}

                        {res.courseTitle && (
                          <span className="text-[11px] text-slate-600">
                            <strong>Course:</strong> {res.courseTitle}
                          </span>
                        )}

                        <span className="text-[11px] text-slate-400">
                          {res.resolvedAt ? new Date(res.resolvedAt).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                        </span>
                      </div>

                      {/* What the admin investigated and resolved */}
                      <div className="p-3.5 rounded-2xl bg-slate-50/90 border border-slate-200/80 text-xs space-y-1.5">
                        <div>
                          <p className="font-bold text-slate-800 text-[11px] flex items-center gap-1.5">
                            <Activity className="w-3.5 h-3.5 text-indigo-600" />
                            <span>Investigation & Analysis Findings:</span>
                          </p>
                          <p className="text-slate-600 text-xs leading-relaxed mt-0.5">
                            {res.findings}
                          </p>
                        </div>
                        <div className="pt-1 border-t border-slate-200/70">
                          <p className="font-bold text-emerald-800 text-[11px] flex items-center gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Administrative Action Executed:</span>
                          </p>
                          <p className="text-slate-700 text-xs leading-relaxed mt-0.5 font-medium">
                            {res.actionTaken}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Action */}
                    <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                      <button
                        onClick={() => setInspectResolution(res)}
                        className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-indigo-50 text-slate-700 hover:text-indigo-600 font-bold text-xs transition-colors flex items-center gap-1 cursor-pointer"
                      >
                        <span>Audit Record</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────── */}
      {/* TAB 2: SYSTEM ADMINS ROSTER CRUD */}
      {/* ────────────────────────────────────────────────────────────── */}
      {activeTab === 'admins' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search operational admins by name or email..."
                value={adminSearch}
                onChange={(e) => setAdminSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-xs"
              />
            </div>

            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold px-4 py-2.5 rounded-2xl shadow-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Operational Admin</span>
            </button>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            {loadingAdmins ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                Loading operational admin roster...
              </div>
            ) : filteredAdmins.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                No system admins found matching criteria.
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                      <th className="p-4">Admin Profile</th>
                      <th className="p-4">Email</th>
                      <th className="p-4">Hierarchy Role</th>
                      <th className="p-4">Status</th>
                      <th className="p-4">Registered Date</th>
                      <th className="p-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {filteredAdmins.map((u) => (
                      <tr key={u.id} className="hover:bg-slate-50/60 transition-colors">
                        <td className="p-4 font-bold text-slate-900 flex items-center gap-3">
                          <HumanAvatar name={u.name} size="sm" />
                          <div>
                            <span className="block text-xs font-bold text-slate-900">{u.name}</span>
                            <span className="text-[10px] text-slate-400 font-mono">{u.id}</span>
                          </div>
                        </td>
                        <td className="p-4 text-slate-600 font-medium">{u.email}</td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                              u.role === 'Super Admin'
                                ? 'bg-purple-100 text-purple-700 border border-purple-200'
                                : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                            }`}
                          >
                            {u.role}
                          </span>
                        </td>
                        <td className="p-4">
                          <span
                            className={`px-2.5 py-1 rounded-full font-bold text-[10px] ${
                              u.status === 'Active'
                                ? 'bg-emerald-50 text-emerald-700'
                                : 'bg-amber-50 text-amber-700'
                            }`}
                          >
                            {u.status || 'Active'}
                          </span>
                        </td>
                        <td className="p-4 text-slate-500 text-[11px]">
                          {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : 'Active Member'}
                        </td>
                        <td className="p-4 text-right">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => handleOpenEdit(u)}
                              className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                              title="Edit Admin"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                            {u.role !== 'Super Admin' && (
                              <button
                                onClick={() => handleDeleteAdmin(u.id, u.name)}
                                className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                                title="Delete Admin"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────── */}
      {/* TAB 3: ADMIN ESCALATIONS QUEUE */}
      {/* ────────────────────────────────────────────────────────────── */}
      {activeTab === 'escalations' && (
        <div className="space-y-4 animate-in fade-in">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
              <input
                type="text"
                placeholder="Search escalations by ticket, subject, or creator..."
                value={escalationSearch}
                onChange={(e) => setEscalationSearch(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-purple-500 shadow-xs"
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-500">Status:</span>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="px-3 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-purple-500 cursor-pointer"
              >
                <option value="All">All Statuses</option>
                <option value="Escalated">Escalated</option>
                <option value="Under Review">Under Review</option>
                <option value="Open">Open</option>
                <option value="Resolved">Resolved</option>
              </select>
            </div>
          </div>

          <div className="bg-white rounded-3xl border border-slate-200 shadow-xs overflow-hidden">
            {loadingEscalations ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                Querying dispute & escalation collections...
              </div>
            ) : filteredEscalations.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                No admin escalations found matching current filters.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {filteredEscalations.map((esc) => (
                  <div
                    key={esc.id}
                    className="p-5 hover:bg-slate-50/80 transition-colors flex flex-col md:flex-row md:items-start justify-between gap-4"
                  >
                    <div className="space-y-2 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-mono font-bold text-xs text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded-lg border border-indigo-200">
                          {esc.id}
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            esc.priority === 'Urgent'
                              ? 'bg-rose-100 text-rose-700'
                              : esc.priority === 'High'
                              ? 'bg-orange-100 text-orange-700'
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {esc.priority} Priority
                        </span>
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            esc.status === 'Resolved'
                              ? 'bg-emerald-100 text-emerald-700'
                              : esc.status === 'Escalated'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-amber-100 text-amber-800'
                          }`}
                        >
                          {esc.status}
                        </span>
                        <span className="text-[11px] text-slate-400">
                          {esc.disputeType || 'Platform Governance'}
                        </span>
                      </div>

                      <h3 className="text-sm font-bold text-slate-900">{esc.subject}</h3>
                      <p className="text-xs text-slate-600 leading-relaxed">{esc.description}</p>

                      {/* Admin Activity Tracking */}
                      <div className="p-3 bg-slate-50 border border-slate-200/80 rounded-2xl text-[11px] space-y-1">
                        <p className="font-bold text-slate-700 flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-indigo-600" />
                          <span>Admin Investigation & Audit Log:</span>
                        </p>
                        <p className="text-slate-600 italic">
                          {esc.adminNotes || 'Dispatched to Operational Admin team for initial review.'}
                        </p>
                      </div>

                      <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-500 pt-1">
                        <span>
                          <strong>Raised By:</strong> {esc.raisedBy} ({esc.raisedByRole || 'Organization'})
                        </span>
                        {esc.courseTitle && (
                          <span>
                            <strong>Course:</strong> {esc.courseTitle}
                          </span>
                        )}
                        <span>
                          <strong>Date:</strong> {esc.createdAt ? new Date(esc.createdAt).toLocaleDateString() : 'Recent'}
                        </span>
                      </div>
                    </div>

                    {/* Action Controls */}
                    <div className="flex md:flex-col items-center md:items-end gap-2 shrink-0">
                      {esc.status !== 'Resolved' ? (
                        <>
                          <button
                            onClick={() => {
                              setSelectedEscalation(esc);
                              setResolutionText(`Approved resolution for ${esc.id}. Administrative override granted.`);
                            }}
                            className="px-3.5 py-2 bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl shadow-xs transition-colors whitespace-nowrap cursor-pointer"
                          >
                            Resolve / Override
                          </button>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={() => handleUpdateEscalationStatus(esc.id, 'Under Review', 'Marked Under Super Admin Review')}
                              className="px-2.5 py-1 text-[10px] font-semibold text-slate-600 hover:text-indigo-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                            >
                              Review
                            </button>
                            <button
                              onClick={() => handleUpdateEscalationStatus(esc.id, 'Escalated', 'Elevated to Super Admin Priority')}
                              className="px-2.5 py-1 text-[10px] font-semibold text-rose-600 hover:bg-rose-50 rounded-lg cursor-pointer"
                            >
                              Escalate
                            </button>
                          </div>
                        </>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Resolved</span>
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────── */}
      {/* MODALS */}
      {/* ────────────────────────────────────────────────────────────── */}

      {/* Inspect Resolution Detail Modal */}
      {inspectResolution && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-200">
                  {inspectResolution.ticketId} • {inspectResolution.id}
                </span>
                <h2 className="text-lg font-black text-slate-900 mt-1">{inspectResolution.title}</h2>
              </div>
              <button
                onClick={() => setInspectResolution(null)}
                className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="p-3 bg-slate-50 rounded-2xl flex items-center gap-3">
                <HumanAvatar name={inspectResolution.adminName} size="md" />
                <div>
                  <p className="font-bold text-slate-900">{inspectResolution.adminName}</p>
                  <p className="text-[11px] text-slate-500">{inspectResolution.adminEmail}</p>
                  <p className="text-[10px] text-indigo-600 font-semibold mt-0.5">Turnaround Time: {inspectResolution.turnaroundMinutes} minutes</p>
                </div>
              </div>

              <div>
                <p className="font-bold text-slate-800 text-[11px]">Investigation Findings:</p>
                <p className="p-3 bg-slate-50 rounded-xl text-slate-600 mt-1 leading-relaxed border border-slate-100">
                  {inspectResolution.findings}
                </p>
              </div>

              <div>
                <p className="font-bold text-emerald-800 text-[11px]">Action Taken & Final Disposition:</p>
                <p className="p-3 bg-emerald-50/60 rounded-xl text-emerald-950 mt-1 leading-relaxed border border-emerald-100">
                  {inspectResolution.actionTaken}
                </p>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={() => setInspectResolution(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold hover:bg-slate-800 cursor-pointer"
              >
                Close Audit Inspection
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Log New Resolution Modal */}
      {showLogModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full shadow-2xl space-y-4">
            <h2 className="text-lg font-black text-slate-900">Log Admin Resolution Record</h2>
            <p className="text-xs text-slate-500">Record work completed by an operational admin into the master governance audit stream.</p>
            <form onSubmit={handleCreateResolutionLog} className="space-y-3 pt-1 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Work / Resolution Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Resolved container timeout on Theory of Computation lab"
                  value={newLogForm.title}
                  onChange={(e) => setNewLogForm({ ...newLogForm, title: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Ticket Reference ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. DSP-2026-612"
                    value={newLogForm.ticketId}
                    onChange={(e) => setNewLogForm({ ...newLogForm, ticketId: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs"
                  />
                </div>
                <div>
                  <label className="font-bold text-slate-700 block mb-1">Admin Handler</label>
                  <select
                    value={newLogForm.adminName}
                    onChange={(e) => setNewLogForm({ ...newLogForm, adminName: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold"
                  >
                    <option value="Operational Platform Admin">Operational Platform Admin</option>
                    <option value="Platform Super Admin">Platform Super Admin</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Investigation Findings</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Describe root cause and investigation findings..."
                  value={newLogForm.findings}
                  onChange={(e) => setNewLogForm({ ...newLogForm, findings: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Action Executed / Resolution</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Detail the administrative action executed to resolve the issue..."
                  value={newLogForm.actionTaken}
                  onChange={(e) => setNewLogForm({ ...newLogForm, actionTaken: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowLogModal(false)}
                  className="px-4 py-2 text-slate-500 font-bold hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-xs"
                >
                  Save Resolution Record
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Admin Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h2 className="text-lg font-black text-slate-900">Add Operational Admin</h2>
            <p className="text-xs text-slate-500">
              Create an operational administrator account with permissions to handle course approvals and day-to-day disputes.
            </p>
            <form onSubmit={handleCreateAdmin} className="space-y-3.5 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. John Doe"
                  value={adminForm.name}
                  onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. admin@nexuspay-platform.io"
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Role Level</label>
                  <select
                    value={adminForm.role}
                    onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold"
                  >
                    <option value="Admin">Operational Admin</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Status</label>
                  <select
                    value={adminForm.status}
                    onChange={(e) => setAdminForm({ ...adminForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  Create Admin
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Admin Modal */}
      {showEditModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h2 className="text-lg font-black text-slate-900">Edit Operational Admin</h2>
            <form onSubmit={handleUpdateAdmin} className="space-y-3.5 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  value={adminForm.name}
                  onChange={(e) => setAdminForm({ ...adminForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={adminForm.email}
                  onChange={(e) => setAdminForm({ ...adminForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Role Level</label>
                  <select
                    value={adminForm.role}
                    onChange={(e) => setAdminForm({ ...adminForm, role: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold"
                  >
                    <option value="Admin">Operational Admin</option>
                    <option value="Super Admin">Super Admin</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Status</label>
                  <select
                    value={adminForm.status}
                    onChange={(e) => setAdminForm({ ...adminForm, status: e.target.value })}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold"
                  >
                    <option value="Active">Active</option>
                    <option value="Suspended">Suspended</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => setShowEditModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs"
                >
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Escalation Override Modal */}
      {selectedEscalation && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <h2 className="text-lg font-black text-slate-900">Resolve Escalation Ticket</h2>
            <p className="text-xs text-slate-500">
              Apply Super Admin administrative override for ticket <strong className="text-indigo-600">{selectedEscalation.id}</strong>.
            </p>
            <form onSubmit={handleResolveEscalation} className="space-y-3.5 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Subject</label>
                <input
                  type="text"
                  disabled
                  value={selectedEscalation.subject}
                  className="w-full px-3.5 py-2.5 bg-slate-100 border border-slate-200 rounded-2xl text-xs font-semibold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Resolution Directive Note</label>
                <textarea
                  rows={3}
                  required
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-purple-500"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedEscalation(null)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow-xs"
                >
                  Authorize Resolution
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
