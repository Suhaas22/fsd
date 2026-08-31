import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Layers,
  Search,
  UserPlus
} from 'lucide-react';
import OrgLayout from '../../components/organization/OrgLayout';
import { useOrg } from '../../context/OrgContext';
import { LinearProgressBar } from '../../components/common/ProgressBar';

export default function Enrollments() {
  const { enrollments } = useOrg();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');

  const filteredEnrollments = enrollments.filter(e => {
    const matchesStatus = statusFilter === 'All' || e.status === statusFilter;
    const matchesSearch = e.learnerName.toLowerCase().includes(search.toLowerCase()) ||
                          e.courseTitle.toLowerCase().includes(search.toLowerCase()) ||
                          e.id.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <OrgLayout
      breadcrumbs={[{ label: 'Enrollments' }]}
      actions={
        <Link
          to="/assign-courses"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold shadow-sm transition-all"
        >
          <UserPlus className="w-4 h-4" />
          <span>Assign Courses</span>
        </Link>
      }
    >
      <div className="space-y-6">
        
        {/* Header & Stats */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-on-surface">Course Enrollments & Progress</h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Live tracking of {enrollments.length} active course seats and student completion progression.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-800 text-xs font-bold border border-emerald-200">
              Active: {enrollments.filter(e => e.status === 'Active').length}
            </span>
            <span className="px-3 py-1.5 rounded-xl bg-blue-50 text-blue-900 text-xs font-bold border border-blue-200">
              Completed: {enrollments.filter(e => e.status === 'Completed').length}
            </span>
          </div>
        </div>

        {/* Filter Pills & Search */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-4 shadow-elevation-1 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {['All', 'Active', 'Completed', 'Dropped'].map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors ${
                  statusFilter === tab
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search enrollment ID, student..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary text-on-surface font-medium"
            />
          </div>
        </div>

        {/* Enrollments Table */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-elevation-1 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-outline uppercase text-[10px] tracking-wider border-b border-outline-variant">
                  <th className="pb-3 font-bold">Enrollment ID</th>
                  <th className="pb-3 font-bold">Learner</th>
                  <th className="pb-3 font-bold">Enrolled Course</th>
                  <th className="pb-3 font-bold">Enrolled Date</th>
                  <th className="pb-3 font-bold">Progress</th>
                  <th className="pb-3 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {filteredEnrollments.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-12 text-center text-outline">
                      No enrollments found matching your query.
                    </td>
                  </tr>
                ) : (
                  filteredEnrollments.map((enr) => (
                    <tr key={enr.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-4 font-mono font-bold text-primary">{enr.id}</td>
                      <td className="py-4">
                        <div className="flex items-center gap-2.5">
                          <img src={enr.learnerAvatar} alt={enr.learnerName} className="w-8 h-8 rounded-full object-cover" />
                          <span className="font-bold text-on-surface">{enr.learnerName}</span>
                        </div>
                      </td>
                      <td className="py-4 font-medium text-on-surface-variant max-w-[240px] truncate">{enr.courseTitle}</td>
                      <td className="py-4 text-outline">{enr.enrolledDate}</td>
                      <td className="py-4 w-40">
                        <LinearProgressBar progress={enr.progress} showLabel={true} height="h-2" />
                      </td>
                      <td className="py-4 text-right">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          enr.status === 'Completed' ? 'bg-blue-100 text-blue-900' :
                          enr.status === 'Active' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {enr.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </OrgLayout>
  );
}
