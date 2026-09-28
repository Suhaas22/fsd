import React, { useState, useEffect } from 'react';
import {
  GraduationCap,
  Users,
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  BookOpen,
  Award,
  CheckCircle,
  XCircle,
  Building2,
  Eye,
  DollarSign,
  CreditCard,
  Percent,
  TrendingUp,
  X,
  ExternalLink,
  ChevronRight,
  Receipt,
  Clock,
  Sparkles,
} from 'lucide-react';
import api from '../../services/api';

export default function SuperAdminLearners() {
  const [learners, setLearners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedOrg, setSelectedOrg] = useState('All');
  const [selectedType, setSelectedType] = useState('All');
  const [selectedLearner, setSelectedLearner] = useState(null);

  // Remove / Unreal Stuff Modal
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [learnerToRemove, setLearnerToRemove] = useState(null);
  const [removeReason, setRemoveReason] = useState('Unreal / Suspicious Platform Activity (Bot / Fake Account)');
  const [removeNotes, setRemoveNotes] = useState('');

  // Add Learner Modal
  const [showAddModal, setShowAddModal] = useState(false);
  const [newLearnerForm, setNewLearnerForm] = useState({
    name: '',
    email: '',
    university: 'Stanford University',
    learnerType: 'Student',
    enrolledCourses: 1,
  });

  const fetchLearners = async () => {
    try {
      setLoading(true);
      const res = await api.superAdmin.getLearners();
      const list = Array.isArray(res) ? res : res?.items || [];
      setLearners(list);
    } catch (err) {
      console.error('Failed to fetch learners:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLearners();
  }, []);

  const handleCreateLearner = async (e) => {
    e.preventDefault();
    try {
      await api.superAdmin.createLearner(newLearnerForm);
      setShowAddModal(false);
      setNewLearnerForm({
        name: '',
        email: '',
        university: 'Stanford University',
        learnerType: 'Student',
        enrolledCourses: 1,
      });
      fetchLearners();
    } catch (err) {
      alert('Error creating learner: ' + err.message);
    }
  };

  const handleToggleStatus = async (learner) => {
    const nextStatus = learner.status === 'Active' ? 'Suspended' : 'Active';
    try {
      await api.superAdmin.updateLearner(learner.id, { status: nextStatus });
      if (selectedLearner && selectedLearner.id === learner.id) {
        setSelectedLearner({ ...selectedLearner, status: nextStatus });
      }
      fetchLearners();
    } catch (err) {
      alert('Error updating learner status: ' + err.message);
    }
  };

  const handleOpenRemove = (learner) => {
    setLearnerToRemove(learner);
    setShowRemoveModal(true);
  };

  const handleConfirmRemove = async (e) => {
    if (e) e.preventDefault();
    if (!learnerToRemove) return;
    try {
      await api.superAdmin.deleteLearner(learnerToRemove.id);
      if (selectedLearner && selectedLearner.id === learnerToRemove.id) {
        setSelectedLearner(null);
      }
      setShowRemoveModal(false);
      setLearnerToRemove(null);
      setRemoveNotes('');
      fetchLearners();
    } catch (err) {
      alert('Error removing learner: ' + err.message);
    }
  };

  // Extract unique organizations for filter
  const organizationsList = ['All', ...new Set(learners.map((l) => l.university).filter(Boolean))];

  const filteredLearners = learners.filter((l) => {
    const matchesSearch =
      l.name?.toLowerCase().includes(search.toLowerCase()) ||
      l.email?.toLowerCase().includes(search.toLowerCase()) ||
      l.university?.toLowerCase().includes(search.toLowerCase());
    const matchesOrg = selectedOrg === 'All' || l.university === selectedOrg;
    const matchesType = selectedType === 'All' || l.learnerType === selectedType;
    return matchesSearch && matchesOrg && matchesType;
  });

  // KPI Calculations directly from JSON data
  const totalLearners = learners.length;
  const studentCount = learners.filter((l) => l.learnerType === 'Student').length;
  const professionalCount = learners.filter((l) => l.learnerType === 'Professional').length;
  const totalRevenueFromLearners = learners.reduce((sum, l) => sum + (Number(l.totalSpent) || 0), 0);
  const totalOrgShare = Math.round(totalRevenueFromLearners * 0.85);
  const totalPlatformShare = Math.round(totalRevenueFromLearners * 0.15);

  return (
    <div className="space-y-6 pb-12">
      {/* Notion-style Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black shadow-xs">
              <GraduationCap className="w-4 h-4 text-indigo-400" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Learners</h1>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
              {totalLearners} Enrolled
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Enrolled student roster, organization affiliations, course fees, and contractual revenue allocation.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="inline-flex items-center gap-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-xl shadow-xs transition-all self-start sm:self-auto cursor-pointer"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>Add Learner</span>
        </button>
      </div>

      {/* KPI Cards Strip (Clean Notion Cards, Subtle 85/15) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Learners</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900">{totalLearners}</h3>
          <p className="text-[11px] text-slate-500 mt-1">
            {studentCount} Students • {professionalCount} Professionals
          </p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">Total Learner Volume</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900">₹{totalRevenueFromLearners.toFixed(2)}</h3>
          <p className="text-[11px] text-slate-500 font-medium mt-1">Gross paid across all enrollments</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Organization Share</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">85%</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900">₹{totalOrgShare.toFixed(2)}</h3>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Disbursed to partner organizations</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Platform Margin</span>
              <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 text-[10px] font-bold border border-slate-200">15%</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <h3 className="text-2xl font-black text-slate-900">₹{totalPlatformShare.toFixed(2)}</h3>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Platform governance fee</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white p-4 rounded-3xl border border-slate-200/90 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search learners by name, email, or university..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-slate-50/80 border border-slate-200 rounded-2xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500">University:</span>
            <select
              value={selectedOrg}
              onChange={(e) => setSelectedOrg(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              {organizationsList.map((org) => (
                <option key={org} value={org}>
                  {org}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-50 px-3 py-1.5 rounded-xl border border-slate-200">
            <span className="text-[11px] font-semibold text-slate-500">Type:</span>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="bg-transparent font-bold text-slate-800 focus:outline-none cursor-pointer"
            >
              <option value="All">All Types</option>
              <option value="Student">Student</option>
              <option value="Professional">Professional</option>
            </select>
          </div>
        </div>
      </div>

      {/* Learners Table */}
      <div className="bg-white rounded-3xl border border-slate-200/90 shadow-xs overflow-hidden">
        {loading ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            Loading platform learner directory & cohort telemetry...
          </div>
        ) : filteredLearners.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No learners found matching the current search criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-slate-500 font-bold uppercase tracking-wider text-[11px]">
                  <th className="p-4">Learner Profile</th>
                  <th className="p-4">University / Organization</th>
                  <th className="p-4">Cohort Type</th>
                  <th className="p-4">Courses Enrolled</th>
                  <th className="p-4">Total Spent</th>
                  <th className="p-4">85% to Org</th>
                  <th className="p-4">15% to Us</th>
                  <th className="p-4">Status</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredLearners.map((l) => {
                  const spent = Number(l.totalSpent) || 0;
                  const orgSplit = Math.round(spent * 0.85 * 100) / 100;
                  const platformSplit = Math.round(spent * 0.15 * 100) / 100;

                  return (
                    <tr
                      key={l.id}
                      onClick={() => setSelectedLearner(l)}
                      className="hover:bg-slate-50/80 transition-colors cursor-pointer group"
                    >
                      <td className="p-4 font-bold text-slate-900 flex items-center gap-3">
                        <img
                          src={l.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                          alt=""
                          className="w-9 h-9 rounded-full border border-slate-200 object-cover"
                        />
                        <div>
                          <span className="block text-xs font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">
                            {l.name}
                          </span>
                          <span className="text-[10px] text-slate-400 font-mono">{l.email}</span>
                        </div>
                      </td>

                      <td className="p-4">
                        <span className="font-semibold text-slate-800 flex items-center gap-1.5">
                          <Building2 className="w-3.5 h-3.5 text-indigo-500" />
                          <span>{l.university || 'Independent Learner'}</span>
                        </span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                            l.learnerType === 'Student'
                              ? 'bg-blue-50 text-blue-700 border border-blue-200'
                              : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                        >
                          {l.learnerType || 'Student'}
                        </span>
                      </td>

                      <td className="p-4 font-semibold text-slate-800">
                        {l.enrolledCourses || 1} courses
                      </td>

                      <td className="p-4 font-bold text-slate-900">
                        ₹{spent.toFixed(2)}
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-indigo-700 bg-indigo-50/70 border border-indigo-200/60 px-2 py-0.5 rounded-lg text-[11px]">
                          ₹{orgSplit.toFixed(2)}
                        </span>
                      </td>

                      <td className="p-4">
                        <span className="font-bold text-purple-700 bg-purple-50/70 border border-purple-200/60 px-2 py-0.5 rounded-lg text-[11px]">
                          ₹{platformSplit.toFixed(2)}
                        </span>
                      </td>

                      <td className="p-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-bold text-[10px] ${
                            l.status === 'Active'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              l.status === 'Active' ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                          ></span>
                          <span>{l.status || 'Active'}</span>
                        </span>
                      </td>

                      <td className="p-4 text-right" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setSelectedLearner(l)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                            title="View Transactions & 85/15 Rule"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleToggleStatus(l)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-amber-600 hover:bg-amber-50 transition-colors cursor-pointer"
                            title={l.status === 'Active' ? 'Suspend Learner' : 'Activate Learner'}
                          >
                            <CheckCircle className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => handleOpenRemove(l)}
                            className="p-1.5 rounded-lg text-slate-500 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                            title="Remove Learner (Unreal stuff, fraud, or violation)"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* DETAILED LEARNER MODAL (UNIVERSITY, ALL TRANSACTIONS & 85/15 RULE) */}
      {/* ────────────────────────────────────────────────────────────── */}
      {selectedLearner && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-2xl w-full shadow-2xl space-y-5 border border-slate-200 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <img
                  src={selectedLearner.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                  alt=""
                  className="w-14 h-14 rounded-2xl border-2 border-indigo-100 object-cover shadow-sm"
                />
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-black text-slate-900">{selectedLearner.name}</h2>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {selectedLearner.id}
                    </span>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        selectedLearner.status === 'Active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {selectedLearner.status || 'Active'}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500">{selectedLearner.email}</p>
                  <p className="text-[11px] font-bold text-slate-800 flex items-center gap-1.5 mt-1">
                    <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                    <span>University / Institution: <strong>{selectedLearner.university}</strong></span>
                  </p>
                </div>
              </div>

              {/* Action Buttons: Suspend, Remove, Close */}
              <div className="flex items-center gap-2 self-end sm:self-start">
                <button
                  onClick={() => handleToggleStatus(selectedLearner)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    selectedLearner.status === 'Active'
                      ? 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200'
                      : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                  }`}
                  title={selectedLearner.status === 'Active' ? 'Suspend Learner' : 'Activate Learner'}
                >
                  {selectedLearner.status === 'Active' ? 'Suspend Access' : 'Activate Access'}
                </button>

                <button
                  onClick={() => handleOpenRemove(selectedLearner)}
                  className="px-3 py-1.5 rounded-xl text-xs font-bold bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200 transition-all flex items-center gap-1.5 cursor-pointer"
                  title="Remove Learner (Unreal stuff / fraud)"
                >
                  <Trash2 className="w-3.5 h-3.5 text-rose-600" />
                  <span>Remove</span>
                </button>

                <button
                  onClick={() => setSelectedLearner(null)}
                  className="p-1.5 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Subtle 85% / 15% Contractual Split Card */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-slate-600 font-medium">Revenue Split Allocation</span>
                <span className="font-bold text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded text-[10px]">
                  85% Org / 15% Platform
                </span>
              </div>

              {/* Progress bar */}
              <div className="h-2 w-full bg-slate-200 rounded-full overflow-hidden flex">
                <div className="bg-slate-700 h-full w-[85%]" title="85% to Organization"></div>
                <div className="bg-indigo-500 h-full w-[15%]" title="15% to Platform"></div>
              </div>

              <div className="grid grid-cols-3 gap-2 pt-1 text-center text-xs">
                <div className="p-2 rounded-lg bg-white border border-slate-200">
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">Total Paid</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    ₹{Number(selectedLearner.financials?.totalSpent || selectedLearner.totalSpent || 0).toFixed(2)}
                  </p>
                </div>

                <div className="p-2 rounded-lg bg-white border border-slate-200">
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">85% to {selectedLearner.university}</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    ₹{Number(selectedLearner.financials?.orgShare85 || ((Number(selectedLearner.totalSpent) || 0) * 0.85)).toFixed(2)}
                  </p>
                </div>

                <div className="p-2 rounded-lg bg-white border border-slate-200">
                  <p className="text-[10px] text-slate-500 uppercase font-semibold">15% Platform Margin</p>
                  <p className="text-sm font-bold text-slate-900 mt-0.5">
                    ₹{Number(selectedLearner.financials?.superAdminShare15 || ((Number(selectedLearner.totalSpent) || 0) * 0.15)).toFixed(2)}
                  </p>
                </div>
              </div>
            </div>

            {/* Academic Summary Grid */}
            <div className="grid grid-cols-3 gap-3 text-center">
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400">Enrolled Courses</p>
                <p className="text-base font-black text-slate-900 mt-0.5">{selectedLearner.coursesTaken?.length || selectedLearner.enrolledCourses || 1}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400">Completed Tracks</p>
                <p className="text-base font-black text-emerald-600 mt-0.5">{selectedLearner.completedCourses || 0}</p>
              </div>
              <div className="p-3 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] uppercase font-bold text-slate-400">Certificates Earned</p>
                <p className="text-base font-black text-purple-600 mt-0.5">{selectedLearner.certificatesCount || 0}</p>
              </div>
            </div>

            {/* Courses Taken & Institutional Payments Section */}
            {/* Direct fulfillment: "took from this org this course paid this muuch like that" */}
            <div className="space-y-3 pt-2">
              <div className="flex items-center justify-between">
                <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
                  <BookOpen className="w-4 h-4 text-indigo-600" />
                  <span>Enrolled Courses & Institutional Payments</span>
                </h3>
                <span className="text-[11px] text-slate-500 font-semibold">
                  {(selectedLearner.coursesTaken || selectedLearner.transactions || []).length} Courses Found
                </span>
              </div>

              {(selectedLearner.coursesTaken || selectedLearner.transactions || []).length > 0 ? (
                <div className="space-y-2.5">
                  {(selectedLearner.coursesTaken || selectedLearner.transactions || []).map((course, idx) => {
                    const org = course.organizationName || course.university || selectedLearner.university;
                    const amount = Number(course.amountPaid || course.amount || 0);
                    const orgShare = Number(course.orgShare85 || (amount * 0.85));
                    const platformShare = Number(course.superAdminShare15 || (amount * 0.15));

                    return (
                      <div
                        key={course.id || idx}
                        className="p-4 rounded-2xl bg-white border border-slate-200/90 shadow-xs hover:border-indigo-300 transition-all space-y-2.5"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="px-2.5 py-1 rounded-lg bg-indigo-50 border border-indigo-200/70 text-indigo-800 text-xs font-bold flex items-center gap-1.5">
                              <Building2 className="w-3.5 h-3.5 text-indigo-600" />
                              <span>Took from <strong>{org}</strong></span>
                            </span>
                            <span className="text-emerald-700 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md text-[10px] font-bold">
                              {course.status || 'Paid'}
                            </span>
                            <span className="font-mono text-[10px] text-slate-400 bg-slate-50 px-1.5 py-0.5 rounded">
                              {course.id}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-base font-black text-slate-900">
                              Paid ₹{amount.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div>
                          <h4 className="text-xs font-bold text-slate-900 leading-snug">
                            {course.courseTitle}
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-0.5">
                            Enrolled: {course.date} • Method: {course.paymentMethod || course.method || 'Card'}
                          </p>
                        </div>

                        {/* 85% University vs 15% Platform Split Card */}
                        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-100 text-xs">
                          <div className="p-2.5 rounded-xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-between">
                            <span className="text-[11px] text-indigo-800 font-semibold">85% to {org}:</span>
                            <span className="font-bold text-indigo-950">₹{orgShare.toFixed(2)}</span>
                          </div>
                          <div className="p-2.5 rounded-xl bg-purple-50/80 border border-purple-100 flex items-center justify-between">
                            <span className="text-[11px] text-purple-800 font-semibold">15% to Us (Platform Fee):</span>
                            <span className="font-bold text-purple-950">₹{platformShare.toFixed(2)}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200/80 text-center space-y-1">
                  <p className="text-xs font-bold text-slate-700">Course Enrollment Recorded</p>
                  <p className="text-[11px] text-slate-500">
                    Tuition fees: ₹{selectedLearner.totalSpent || 129.99} (85% to {selectedLearner.university}: ₹{((Number(selectedLearner.totalSpent) || 129.99) * 0.85).toFixed(2)} • 15% to Us: ₹{((Number(selectedLearner.totalSpent) || 129.99) * 0.15).toFixed(2)})
                  </p>
                </div>
              )}
            </div>

            {/* Modal Close Button */}
            <div className="pt-2">
              <button
                onClick={() => setSelectedLearner(null)}
                className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold transition-colors cursor-pointer"
              >
                Close Learner Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ────────────────────────────────────────────────────────────── */}
      {/* REMOVE LEARNER MODAL ("UNREAL STUFF", FRAUD, DISHONESTY) */}
      {/* ────────────────────────────────────────────────────────────── */}
      {showRemoveModal && learnerToRemove && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-md w-full shadow-2xl space-y-4 border border-slate-200">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200 text-rose-600 flex items-center justify-center mx-auto">
              <Trash2 className="w-6 h-6" />
            </div>

            <div className="text-center space-y-1.5">
              <h2 className="text-lg font-black text-slate-900">Remove Learner from Platform</h2>
              <p className="text-xs text-slate-500 leading-relaxed">
                Remove <strong className="text-slate-800">{learnerToRemove.name}</strong> ({learnerToRemove.id}) if engaging in unreal platform activity, fake bot profile, or payment fraud.
              </p>
            </div>

            <form onSubmit={handleConfirmRemove} className="space-y-3.5 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Reason for Removal</label>
                <select
                  value={removeReason}
                  onChange={(e) => setRemoveReason(e.target.value)}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold focus:ring-2 focus:ring-rose-500 cursor-pointer"
                >
                  <option value="Unreal / Suspicious Platform Activity (Bot / Fake Account)">Unreal / Suspicious Activity (Bot / Fake Account)</option>
                  <option value="Payment Fraud & Disputed Charges">Payment Fraud & Disputed Charges</option>
                  <option value="Honor Code & Academic Dishonesty Violation">Honor Code & Academic Dishonesty</option>
                  <option value="Spam / Inappropriate Cohort Conduct">Spam / Inappropriate Cohort Conduct</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Administrative Notes (Audit Record)</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Account identified with irregular activity and multiple fake identity flags."
                  value={removeNotes}
                  onChange={(e) => setRemoveNotes(e.target.value)}
                  className="w-full px-3.5 py-2 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-rose-500"
                ></textarea>
              </div>

              <div className="p-3 rounded-2xl bg-rose-50 border border-rose-200/80 text-[11px] text-rose-800 font-medium">
                <strong>Warning:</strong> This will revoke all course enrollments and permanently delete this learner from platform records.
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowRemoveModal(false);
                    setLearnerToRemove(null);
                  }}
                  className="py-2.5 px-4 rounded-xl text-xs font-semibold bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="py-2.5 px-4 rounded-xl text-xs font-bold bg-rose-600 text-white hover:bg-rose-700 shadow-md shadow-rose-600/30 transition-all cursor-pointer"
                >
                  Confirm Removal
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Learner Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <h2 className="text-lg font-black text-slate-900">Add Platform Learner</h2>
            <form onSubmit={handleCreateLearner} className="space-y-3.5 pt-2">
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Maya Lin"
                  value={newLearnerForm.name}
                  onChange={(e) => setNewLearnerForm({ ...newLearnerForm, name: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. maya.lin@stanford.edu"
                  value={newLearnerForm.email}
                  onChange={(e) => setNewLearnerForm({ ...newLearnerForm, email: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Institution</label>
                  <input
                    type="text"
                    required
                    value={newLearnerForm.university}
                    onChange={(e) => setNewLearnerForm({ ...newLearnerForm, university: e.target.value })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="text-xs font-bold text-slate-700 block mb-1">Cohort Type</label>
                  <select
                    value={newLearnerForm.learnerType}
                    onChange={(e) => setNewLearnerForm({ ...newLearnerForm, learnerType: e.target.value })}
                    className="w-full px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-semibold"
                  >
                    <option value="Student">Student</option>
                    <option value="Professional">Professional</option>
                  </select>
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2.5 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl shadow-xs cursor-pointer"
                >
                  Save Learner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
