import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Users,
  Search,
  Download,
  Mail,
  Award,
  BookOpen,
  ChevronRight,
  UserCheck,
  CheckCircle2,
  XCircle,
  Clock3
} from 'lucide-react';
import OrgLayout from '../../components/organization/OrgLayout';
import { useOrg } from '../../context/OrgContext';
import { useToast } from '../../components/common/Toast';
import { exportToCSV } from '../../utils/csvDownload';
import api from '../../services/api';

export default function Learners() {
  const { learners: contextLearners, refreshData } = useOrg();
  const { addToast } = useToast();
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('All');
  const [pendingRequests, setPendingRequests] = useState([]);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchJoinRequests = async () => {
    try {
      const res = await api.organization.getStudentRequests();
      setPendingRequests(Array.isArray(res) ? res : []);
    } catch (e) {
      console.error('Failed to fetch student join requests:', e);
    }
  };

  useEffect(() => {
    fetchJoinRequests();
  }, []);

  const handleRespond = async (learnerId, action) => {
    try {
      setActionLoading(true);
      await api.organization.respondStudentRequest(learnerId, action);
      addToast(
        action === 'approve' ? 'Approved learner as official Student!' : 'Declined membership request.',
        action === 'approve' ? 'success' : 'info'
      );
      await fetchJoinRequests();
      if (refreshData) refreshData();
    } catch (err) {
      addToast('Action failed: ' + err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const filteredLearners = contextLearners.filter(l => {
    const matchesFilter = filter === 'All' || l.learnerType.includes(filter);
    const matchesSearch = l.name.toLowerCase().includes(search.toLowerCase()) ||
                          l.email.toLowerCase().includes(search.toLowerCase()) ||
                          l.university.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleExportCSV = () => {
    const headers = ['Learner ID', 'Name', 'Email', 'University', 'Cohort Type', 'Enrolled Courses', 'Average Progress (%)', 'Certificates'];
    const rows = filteredLearners.map(l => [
      l.id,
      l.name,
      l.email,
      l.university,
      l.learnerType,
      l.enrolledCourses,
      l.overallProgress,
      l.certificatesEarned
    ]);

    exportToCSV('learners_roster.csv', headers, rows);
    addToast('Downloaded learners roster CSV file!', 'success');
  };

  return (
    <OrgLayout
      breadcrumbs={[{ label: 'Learners & Student Roster' }]}
      actions={
        <button
          onClick={handleExportCSV}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold transition-all border border-outline-variant"
        >
          <Download className="w-4 h-4 text-primary" />
          <span>Export Student CSV</span>
        </button>
      }
    >
      <div className="space-y-6 max-w-[1560px] mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant pb-5">
          <div>
            <h1 className="text-xl md:text-2xl font-extrabold text-on-surface">Institutional Student & Learner Roster</h1>
            <p className="text-xs text-outline mt-1">Review student enrollments, academic progress, and membership join requests</p>
          </div>
        </div>

        {/* PENDING MEMBERSHIP REQUESTS BANNER */}
        {pendingRequests.length > 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-3xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
              <Clock3 className="w-4 h-4 text-amber-600" />
              <span>Pending Learner Student Join Requests ({pendingRequests.length})</span>
            </div>
            <p className="text-xs text-amber-800">
              The following independent learners have requested to join your institution as official students.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {pendingRequests.map((req) => (
                <div key={req.id} className="bg-white border border-amber-200 rounded-2xl p-4 flex items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <img src={req.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"} alt="" className="w-10 h-10 rounded-full object-cover" />
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{req.name}</h4>
                      <p className="text-[11px] text-slate-500">{req.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      disabled={actionLoading}
                      onClick={() => handleRespond(req.id, 'approve')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-xs transition-all"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      <span>Approve</span>
                    </button>
                    <button
                      disabled={actionLoading}
                      onClick={() => handleRespond(req.id, 'reject')}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      <span>Decline</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Filter Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search learners by name or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-surface-container-lowest border border-outline-variant rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary focus:outline-none"
            />
          </div>

          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {['All', 'Student', 'Learner', 'Graduate'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all ${
                  filter === f
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-surface-container text-on-surface hover:bg-surface-container-high'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        {/* Learner Roster Table */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl overflow-hidden shadow-elevation-1">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-surface-container-low border-b border-outline-variant text-outline font-bold uppercase tracking-wider">
                  <th className="p-4">Student</th>
                  <th className="p-4">Affiliation / Org</th>
                  <th className="p-4">Type</th>
                  <th className="p-4 text-center">Enrolled</th>
                  <th className="p-4 text-center">Progress</th>
                  <th className="p-4 text-center">Certificates</th>
                  <th className="p-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/60">
                {filteredLearners.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="p-8 text-center text-outline">
                      No learners match the selected search criteria.
                    </td>
                  </tr>
                ) : (
                  filteredLearners.map((l) => (
                    <tr key={l.id} className="hover:bg-surface-container/40 transition-colors">
                      <td className="p-4">
                        <div className="flex items-center gap-3">
                          <img src={l.avatar} alt={l.name} className="w-9 h-9 rounded-full object-cover border border-outline-variant" />
                          <div>
                            <span className="font-bold text-on-surface block">{l.name}</span>
                            <span className="text-[11px] text-outline font-mono">{l.email}</span>
                          </div>
                        </div>
                      </td>

                      <td className="p-4 font-semibold text-on-surface">
                        {l.university || 'Independent Learner'}
                      </td>

                      <td className="p-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                          l.learnerType === 'Student' || l.orgMembershipStatus === 'Verified Student'
                            ? 'bg-emerald-100 text-emerald-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}>
                          {l.orgMembershipStatus === 'Verified Student' ? 'Verified Student' : (l.learnerType || 'Learner')}
                        </span>
                      </td>

                      <td className="p-4 text-center font-bold text-on-surface">
                        {l.enrolledCourses || 0} Tracks
                      </td>

                      <td className="p-4 text-center">
                        <span className="font-bold text-emerald-600">{l.overallProgress || 75}%</span>
                      </td>

                      <td className="p-4 text-center font-bold text-amber-600">
                        {l.certificatesCount || l.certificatesEarned || 0}
                      </td>

                      <td className="p-4 text-right">
                        <Link
                          to={`/org/learners/${l.id}`}
                          className="inline-flex items-center gap-1 text-primary hover:underline font-bold text-xs"
                        >
                          <span>View Profile</span>
                          <ChevronRight className="w-3.5 h-3.5" />
                        </Link>
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
