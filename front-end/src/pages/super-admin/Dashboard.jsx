import React, { useState, useEffect } from 'react';
import { ShieldCheck, Users, Building2, BookOpen, GraduationCap, Server, Activity, Plus, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

export default function SuperAdminDashboard() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.superAdmin.getAnalytics()
      .then((res) => {
        setData(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Super Admin Dashboard fetch error:', err);
        setError(err.message);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-indigo-600 border-t-transparent"></div>
      </div>
    );
  }

  const stats = data?.stats || {};
  const systemHealth = data?.systemHealth || { status: 'Optimal', uptime: '99.98%', activeDatabase: 'JSON DB Simulation Engine', version: '2.4.0' };
  const rolesBreakdown = data?.rolesBreakdown || { superAdmins: 1, admins: 2, organizations: 3, instructors: 5, students: 6 };
  const auditLogs = data?.auditLogs || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto p-4 md:p-8">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold mb-3">
              <ShieldCheck className="w-4 h-4 text-indigo-400" />
              <span>Platform Hierarchy: Level 1 • Super Admin</span>
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight">Super Admin Master Control</h1>
            <p className="text-slate-300 text-sm mt-1">
              Highest-level platform governance managing Operational Admins, Organizations, Faculty, and Learners.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              to="/super-admin/admins"
              className="inline-flex items-center gap-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Manage Admins</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-5">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Super Admins</span>
            <ShieldCheck className="w-5 h-5 text-indigo-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{rolesBreakdown.superAdmins}</h3>
          <p className="text-[11px] text-slate-500 mt-1">System Governance</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Admins</span>
            <Users className="w-5 h-5 text-blue-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{rolesBreakdown.admins}</h3>
          <p className="text-[11px] text-slate-500 mt-1">Operational Managers</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Organizations</span>
            <Building2 className="w-5 h-5 text-purple-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{rolesBreakdown.organizations}</h3>
          <p className="text-[11px] text-slate-500 mt-1">Institutional Clients</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Instructors</span>
            <BookOpen className="w-5 h-5 text-emerald-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{rolesBreakdown.instructors}</h3>
          <p className="text-[11px] text-slate-500 mt-1">Teaching Faculty</p>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Learners</span>
            <GraduationCap className="w-5 h-5 text-amber-600" />
          </div>
          <h3 className="text-2xl font-bold text-slate-900">{rolesBreakdown.students}</h3>
          <p className="text-[11px] text-slate-500 mt-1">Active Students</p>
        </div>
      </div>

      {/* System Health & Hierarchy Oversight */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* System Health Status */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-1">
          <div className="flex items-center gap-2 text-slate-900 font-bold mb-4">
            <Server className="w-5 h-5 text-indigo-600" />
            <span>Platform Core Health</span>
          </div>

          <div className="space-y-4">
            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-medium text-slate-600">Engine Status</span>
              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                {systemHealth.status}
              </span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-medium text-slate-600">Platform Uptime</span>
              <span className="text-xs font-bold text-slate-900">{systemHealth.uptime}</span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-medium text-slate-600">Database Engine</span>
              <span className="text-xs font-bold text-indigo-600">{systemHealth.activeDatabase}</span>
            </div>

            <div className="flex justify-between items-center p-3 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-xs font-medium text-slate-600">Gross Revenue</span>
              <span className="text-xs font-bold text-emerald-600">{stats.totalRevenue || '$42,580.00'}</span>
            </div>
          </div>
        </div>

        {/* Security & System Audit Logs */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2 text-slate-900 font-bold">
              <Activity className="w-5 h-5 text-indigo-600" />
              <span>Platform Audit & Security Logs</span>
            </div>
            <span className="text-xs font-medium text-slate-400">Live JSON DB Feed</span>
          </div>

          <div className="divide-y divide-slate-100">
            {auditLogs.map((log) => (
              <div key={log.id} className="py-3.5 flex items-center justify-between text-xs">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-indigo-50 text-indigo-600 flex items-center justify-center font-bold shrink-0">
                    <CheckCircle className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="font-semibold text-slate-800">{log.action}</p>
                    <p className="text-slate-400 text-[11px]">By {log.user}</p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-slate-400 text-[11px] block">{log.timestamp}</span>
                  <span className="inline-block px-2 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                    {log.status}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
