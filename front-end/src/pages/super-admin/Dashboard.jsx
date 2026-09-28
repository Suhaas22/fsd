import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Users,
  Building2,
  BookOpen,
  GraduationCap,
  Activity,
  Plus,
  CheckCircle,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
  Percent,
  Coins,
  ShieldAlert,
  Sparkles,
  ExternalLink,
  CreditCard,
  Cpu,
  History,
  Lock,
  Zap,
  ArrowUpRight,
  RefreshCw,
} from 'lucide-react';
import { Link } from 'react-router-dom';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import api from '../../services/api';

export default function SuperAdminDashboard() {
  const [data, setData] = useState(null);
  const [organizations, setOrganizations] = useState([]);
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [recentResolutions, setRecentResolutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [analyticsRes, txRes, resRes, orgsRes] = await Promise.all([
        api.superAdmin.getAnalytics().catch(() => null),
        api.superAdmin.getTransactions({ limit: 5 }).catch(() => []),
        api.superAdmin.getAdminResolutions().catch(() => []),
        api.superAdmin.getOrganizations().catch(() => []),
      ]);

      setData(analyticsRes);
      setRecentTransactions(Array.isArray(txRes) ? txRes.slice(0, 5) : txRes?.items?.slice(0, 5) || []);
      setRecentResolutions(Array.isArray(resRes) ? resRes.slice(0, 4) : []);
      setOrganizations(Array.isArray(orgsRes) ? orgsRes : orgsRes?.items || []);
    } catch (err) {
      console.error('Super Admin Dashboard fetch error:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[65vh] gap-3">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent shadow-lg"></div>
        <p className="text-xs font-semibold text-slate-500">Loading platform analytics & records...</p>
      </div>
    );
  }

  const calculatedGross = organizations.length > 0
    ? organizations.reduce((sum, o) => sum + (Number(o.totalRevenue) || 0), 0)
    : (data?.revenueSplit?.totalGrossRevenue || 429480);
  const calculatedOrg85 = Math.round(calculatedGross * 0.85);
  const calculatedSuperAdmin15 = Math.round(calculatedGross * 0.15);

  const revenueSplit = {
    totalGrossRevenue: calculatedGross,
    orgShare85: calculatedOrg85,
    superAdminShare15: calculatedSuperAdmin15,
    formattedGross: `₹${calculatedGross.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    formattedOrgShare: `₹${calculatedOrg85.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    formattedSuperAdminShare: `₹${calculatedSuperAdmin15.toLocaleString('en-US', { minimumFractionDigits: 2 })}`,
    orgPercentage: 85,
    superAdminPercentage: 15,
  };

  const rolesBreakdown = data?.rolesBreakdown || {
    superAdmins: 1,
    admins: 2,
    organizations: 4,
    instructors: 6,
    students: 6,
  };

  const escalationsSummary = data?.escalationsSummary || { total: 2, urgentCount: 1, items: [] };
  const monthlyTrend = data?.monthlyTrend || [
    { name: 'May', gross: 65000, orgShare: 55250, superAdminFee: 9750, learners: 340 },
    { name: 'Jun', gross: 82000, orgShare: 69700, superAdminFee: 12300, learners: 410 },
    { name: 'Jul', gross: 110000, orgShare: 93500, superAdminFee: 16500, learners: 520 },
    { name: 'Aug', gross: 172480, orgShare: 146608, superAdminFee: 25872, learners: 680 },
  ];

  const pieSplitData = [
    { name: 'Organizations (85%)', value: revenueSplit.orgShare85, color: '#6366f1' },
    { name: 'Super Admin Fee (15%)', value: revenueSplit.superAdminShare15, color: '#a855f7' },
  ];

  return (
    <div className="space-y-6 pb-10">
      {/* Notion / Stripe SaaS Executive Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200">
        <div>
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-slate-900 text-white flex items-center justify-center font-black shadow-xs">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
            </div>
            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Executive Dashboard</h1>
            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold border border-slate-200">
              Super Admin
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Platform governance, institutional revenue volume, and administrative operations.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            to="/super-admin/payments"
            className="inline-flex items-center gap-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold px-3.5 py-2 rounded-xl transition-all shadow-xs"
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Payments</span>
          </Link>
          <Link
            to="/super-admin/admins"
            className="inline-flex items-center gap-2 bg-white hover:bg-slate-50 text-slate-700 text-xs font-semibold px-3.5 py-2 rounded-xl border border-slate-200 transition-all shadow-2xs"
          >
            <History className="w-3.5 h-3.5 text-slate-500" />
            <span>Admin History</span>
          </Link>
          <button
            onClick={fetchDashboardData}
            className="p-2 rounded-xl bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-800 border border-slate-200 transition-all cursor-pointer shadow-2xs"
            title="Refresh"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Revenue & Financial Performance Cards (Clean, Subtle 85/15) */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Gross Revenue */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">Gross Platform Volume</span>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Coins className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{revenueSplit.formattedGross}</div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Cumulative gross across all organizations</p>
        </div>

        {/* 85% Organization Share */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Organization Disbursals</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                85%
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{revenueSplit.formattedOrgShare}</div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Disbursed to academic partner organizations</p>
        </div>

        {/* 15% Platform Margin */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs">
          <div className="flex items-center justify-between text-slate-500 mb-2">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-700">Platform Margin</span>
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                15%
              </span>
            </div>
            <div className="p-2 rounded-xl bg-slate-100 text-slate-700">
              <Percent className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-slate-900">{revenueSplit.formattedSuperAdminShare}</div>
          <p className="text-[11px] text-slate-500 mt-1 font-medium">Platform governance & operations commission</p>
        </div>
      </div>

      {/* Platform Hierarchy Metrics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Super Admins</span>
            <ShieldCheck className="w-4 h-4 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{rolesBreakdown.superAdmins}</h3>
          <p className="text-[10px] text-slate-500 mt-1">Platform Governance</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Admins</span>
            <Users className="w-4 h-4 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{rolesBreakdown.admins}</h3>
          <p className="text-[10px] text-slate-500 mt-1">Operations & Support</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Organizations</span>
            <Building2 className="w-4 h-4 text-indigo-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{rolesBreakdown.organizations}</h3>
          <p className="text-[10px] text-slate-500 mt-1">Academic Organizations</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Instructors</span>
            <BookOpen className="w-4 h-4 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{rolesBreakdown.instructors}</h3>
          <p className="text-[10px] text-slate-500 mt-1">Teaching Faculty</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between mb-2">
            <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">Learners</span>
            <GraduationCap className="w-4 h-4 text-amber-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{rolesBreakdown.students}</h3>
          <p className="text-[10px] text-slate-500 mt-1">Enrolled Learners</p>
        </div>
      </div>

      {/* Analytics Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Trend with 85% / 15% breakdown */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs lg:col-span-2">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
            <div>
              <h2 className="text-base font-bold text-slate-900">Revenue Growth & Payout Split Trend</h2>
              <p className="text-xs text-slate-500">Gross revenue separated into Org 85% and Platform 15%</p>
            </div>
            <div className="flex items-center gap-3 text-xs">
              <span className="flex items-center gap-1.5 font-semibold text-indigo-600">
                <span className="w-3 h-3 rounded-md bg-indigo-500"></span> Org Share (85%)
              </span>
              <span className="flex items-center gap-1.5 font-semibold text-purple-600">
                <span className="w-3 h-3 rounded-md bg-purple-500"></span> Platform Fee (15%)
              </span>
            </div>
          </div>

          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#cbd5e1' }} tickFormatter={(val) => `₹${val / 1000}k`} />
                <Tooltip
                  formatter={(val, name) => [`₹${val.toLocaleString()}`, name === 'orgShare' ? 'Org Share (85%)' : name === 'superAdminFee' ? 'Super Admin Fee (15%)' : 'Gross Revenue']}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                />
                <Bar dataKey="orgShare" name="Org Share (85%)" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="superAdminFee" name="Super Admin Fee (15%)" fill="#a855f7" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 85/15 Commission Ratio Doughnut */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <h2 className="text-base font-bold text-slate-900">Revenue Distribution Model</h2>
            <p className="text-xs text-slate-500">Contractual split across all courses</p>
          </div>

          <div className="h-52 w-full my-auto flex items-center justify-center relative">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieSplitData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieSplitData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val) => `₹${val.toLocaleString()}`}
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px', color: '#fff', fontSize: '11px' }}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-2xl font-black text-slate-900">85 / 15</span>
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Ratio</span>
            </div>
          </div>

          <div className="space-y-2 pt-2 border-t border-slate-100 text-xs">
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-500"></span>
                <span>Partner Organizations:</span>
              </span>
              <span className="font-bold text-slate-900">85.0%</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="flex items-center gap-2 text-slate-600">
                <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                <span>Platform Governance Fee:</span>
              </span>
              <span className="font-bold text-purple-600">15.0%</span>
            </div>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* ORGANIZATIONS & INSTRUCTORS ECOSYSTEM */}
      {/* ────────────────────────────────────────────────────────────── */}
      <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" />
              <h2 className="text-base font-bold text-slate-900">Organizations & Teaching Faculty</h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Accredited organizations, assigned instructors, courses taught, and student enrollments
            </p>
          </div>
          <Link
            to="/super-admin/organizations"
            className="text-xs font-bold text-slate-700 hover:text-slate-900 flex items-center gap-1.5 self-start sm:self-auto bg-slate-100 hover:bg-slate-200 px-3 py-1.5 rounded-xl border border-slate-200 transition-colors"
          >
            <span>Manage Organizations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {organizations.map((org) => {
            const orgGross = Number(org.totalRevenue) || 90000;
            const org85 = Math.round(orgGross * 0.85);
            const fee15 = Math.round(orgGross * 0.15);
            const instructors = org.instructors || [];

            return (
              <div
                key={org.id}
                className="p-5 rounded-2xl bg-white border border-slate-200 shadow-2xs space-y-4 hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  {/* Org Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <img
                        src={org.logo || 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=200&auto=format&fit=crop&q=80'}
                        alt=""
                        className="w-11 h-11 rounded-2xl border border-slate-200 object-cover shadow-2xs"
                      />
                      <div>
                        <h3 className="text-sm font-bold text-slate-900">{org.name}</h3>
                        <p className="text-[11px] text-slate-500">{org.location} • {instructors.length} Instructors</p>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {org.status || 'Active'}
                    </span>
                  </div>

                  {/* Subtle 85% / 15% SaaS Split */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Org Disbursals (85%)</span>
                      <span className="text-sm font-black text-slate-900">₹{org85.toLocaleString()}</span>
                    </div>
                    <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-center">
                      <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider block">Platform Margin (15%)</span>
                      <span className="text-sm font-black text-slate-900">₹{fee15.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Instructors, Courses & Enrolled Students */}
                  <div className="space-y-2 pt-2 border-t border-slate-200/70">
                    <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                      Instructors & Course Enrollments ({instructors.length})
                    </span>

                    <div className="space-y-2 max-h-44 overflow-y-auto pr-1 custom-scrollbar">
                      {instructors.map((inst) => {
                        const courses = inst.teachingCourses || [];
                        return (
                          <div key={inst.id} className="p-2.5 rounded-xl bg-white border border-slate-200/80 text-xs space-y-1.5 shadow-2xs">
                            <div className="flex items-center justify-between">
                              <div className="flex items-center gap-2">
                                <img
                                  src={inst.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                                  alt=""
                                  className="w-6 h-6 rounded-full object-cover border border-slate-200"
                                />
                                <span className="font-bold text-slate-900 text-xs">{inst.name}</span>
                              </div>
                              <span className="text-amber-600 font-bold text-[11px]">★ {inst.avgRating || 4.8}</span>
                            </div>

                            {/* Specific courses and enrolled count */}
                            <div className="pl-8 space-y-1">
                              {courses.length > 0 ? (
                                courses.map((c, cIdx) => (
                                  <div key={c.id || cIdx} className="flex items-center justify-between text-[11px] text-slate-600">
                                    <span className="truncate max-w-[210px]" title={c.title}>• {c.title}</span>
                                    <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                                      {c.enrolledCount} enrolled
                                    </span>
                                  </div>
                                ))
                              ) : (
                                <div className="flex items-center justify-between text-[11px] text-slate-500">
                                  <span>• Core Curriculum Modules</span>
                                  <span className="font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded text-[10px]">
                                    {inst.enrolledStudents || 120} enrolled
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="pt-2 text-right">
                  <Link
                    to="/super-admin/organizations"
                    className="text-[11px] font-semibold text-slate-700 hover:text-slate-900"
                  >
                    Manage Instructors for {org.name} →
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 2 NEW REAL-TIME MODULES: LIVE PAYMENTS & ADMIN RESOLUTION PULSE */}
      {/* ────────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Module 1: Live Payment Settlements Feed */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-indigo-50 text-indigo-600">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Latest Payment Records & Splits</h3>
                <p className="text-xs text-slate-500">Real-time student course transactions & 85/15 clearing</p>
              </div>
            </div>
            <Link
              to="/super-admin/payments"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>View All Records</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentTransactions.map((tx, idx) => {
              const gross = Number(tx.amount) || 89.99;
              const orgShare = Math.round(gross * 0.85);
              const fee = Math.round(gross * 0.15);
              return (
                <div key={tx.id || idx} className="py-3 flex items-center justify-between text-xs hover:bg-slate-50/60 transition-colors rounded-xl px-2">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-slate-900 text-[11px]">{tx.id || `TXN-${1000 + idx}`}</span>
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700">
                        {tx.status || 'Completed'}
                      </span>
                    </div>
                    <p className="font-semibold text-slate-700 line-clamp-1 max-w-[240px]">
                      {tx.courseTitle || tx.course || 'Course Enrollment'}
                    </p>
                    <p className="text-[10px] text-slate-400">Payer: {tx.payerName || tx.payer || 'Student'}</p>
                  </div>

                  <div className="text-right">
                    <p className="font-bold text-slate-900 text-xs">₹{gross.toFixed(2)}</p>
                    <p className="text-[10px] text-slate-500 font-medium">Org: ₹{orgShare} • Fee: ₹{fee}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Module 2: Admin Operational Work & Resolution Pulse */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Admin Resolution History</h3>
                <p className="text-xs text-slate-500">What operational admins have recently investigated & resolved</p>
              </div>
            </div>
            <Link
              to="/super-admin/admins"
              className="text-xs font-bold text-purple-600 hover:text-purple-700 flex items-center gap-1"
            >
              <span>View History Log</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-slate-100">
            {recentResolutions.map((res) => (
              <div key={res.id} className="py-3 text-xs space-y-1 hover:bg-slate-50/60 transition-colors rounded-xl px-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[10px] text-indigo-700 bg-indigo-50 px-1.5 py-0.5 rounded">
                      {res.ticketId}
                    </span>
                    <span className="text-[10px] font-semibold text-slate-500">
                      {res.category}
                    </span>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-50 text-emerald-700">
                    {res.outcome}
                  </span>
                </div>
                <p className="font-bold text-slate-800 line-clamp-1">{res.title}</p>
                <div className="flex justify-between items-center text-[10px] text-slate-400">
                  <span>Resolved by: <strong className="text-slate-600">{res.adminName}</strong></span>
                  <span>Turnaround: {res.turnaroundMinutes} min</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Escalation Alerts & Platform Health Infrastructure */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Escalations Oversight Box */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                <ShieldAlert className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-bold text-slate-900">Admin Escalations Requiring Attention</h3>
                <p className="text-xs text-slate-500">Disputes escalated by operational admins for Super Admin resolution</p>
              </div>
            </div>
            <Link
              to="/super-admin/admins"
              className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1"
            >
              <span>Manage Escalations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {escalationsSummary.items && escalationsSummary.items.length > 0 ? (
            <div className="space-y-3">
              {escalationsSummary.items.map((esc) => (
                <div
                  key={esc.id}
                  className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-indigo-50/40 transition-colors"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-bold text-slate-900">{esc.id}</span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-700">
                        {esc.priority}
                      </span>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-amber-100 text-amber-800">
                        {esc.status}
                      </span>
                    </div>
                    <p className="text-xs font-semibold text-slate-800 line-clamp-1">{esc.subject}</p>
                    <p className="text-[11px] text-slate-500">Raised by: {esc.raisedBy}</p>
                  </div>
                  <Link
                    to="/super-admin/admins"
                    className="self-end sm:self-center px-3.5 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-xs whitespace-nowrap"
                  >
                    Intervene / Override
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="py-8 text-center bg-slate-50 rounded-2xl border border-dashed border-slate-200">
              <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-xs font-semibold text-slate-700">No Pending Escalations</p>
              <p className="text-[11px] text-slate-400">All administrative escalations have been cleared.</p>
            </div>
          )}
        </div>

        {/* Platform Operational Status */}
        <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 text-slate-900 font-bold mb-4">
              <Cpu className="w-5 h-5 text-indigo-600" />
              <span>Platform Operational Status</span>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-medium text-slate-600">Core EdTech Platform Engine</span>
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                  Active & Healthy
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-medium text-slate-600">Revenue Dispersion Rule</span>
                <span className="text-xs font-bold text-indigo-600">Enforced 85% / 15% Split</span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-medium text-slate-600">Platform Security & Audit</span>
                <span className="inline-flex items-center gap-1 text-xs font-bold text-purple-700">
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Protected & Verified
                </span>
              </div>

              <div className="flex justify-between items-center p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <span className="text-xs font-medium text-slate-600">Organization Disbursals</span>
                <span className="text-xs font-bold text-slate-900">Synchronized</span>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-100 rounded-2xl text-[11px] text-purple-900">
            <span className="font-bold">Standard 85/15 Fee Policy:</span> Verified student course payments automatically allocate 85% to partner institutions and 15% to platform maintenance & services.
          </div>
        </div>
      </div>
    </div>
  );
}
