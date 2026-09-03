import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Mail,
  Send,
  Search,
  Eye,
  Clock,
  CheckCircle2,
  XCircle,
  RotateCcw,
  BookOpen,
  Calendar,
  Sparkles,
  Bell,
  X
} from 'lucide-react';
import OrgLayout from '../../components/organization/OrgLayout';
import { useOrg } from '../../context/OrgContext';
import { useToast } from '../../components/common/Toast';

export default function InstructorRequests() {
  const { addToast } = useToast();
  const { instructorRequests } = useOrg();
  const [filter, setFilter] = useState('All');
  const [search, setSearch] = useState('');

  const filteredRequests = instructorRequests.filter(req => {
    const matchesFilter = filter === 'All' ||
      (filter === 'Pending' && req.status.includes('Pending')) ||
      (filter === 'Accepted' && req.status.includes('Accepted')) ||
      (filter === 'Declined' && req.status.includes('Declined'));

    const matchesSearch = req.name.toLowerCase().includes(search.toLowerCase()) ||
                          (req.courseTitle && req.courseTitle.toLowerCase().includes(search.toLowerCase())) ||
                          req.email.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleResendMail = (email, courseTitle) => {
    addToast(`Resent teaching request outreach to ${email} for "${courseTitle}"!`, 'info');
  };

  const pendingCount = instructorRequests.filter(r => r.status.includes('Pending')).length;
  const acceptedCount = instructorRequests.filter(r => r.status.includes('Accepted')).length;
  const declinedCount = instructorRequests.filter(r => r.status.includes('Declined')).length;

  return (
    <OrgLayout
      breadcrumbs={[{ label: 'Course Teaching Requests' }]}
      actions={
        <Link
          to="/org/assign-courses"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold shadow-sm transition-all"
        >
          <Send className="w-4 h-4" />
          <span>Assign Course & Send Outreach</span>
        </Link>
      }
    >
      <div className="space-y-6">
        
        {/* Header & Status Metrics */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-on-surface">Faculty Course Teaching Requests</h1>
            <p className="text-xs text-on-surface-variant mt-0.5 max-w-2xl">
              All faculty teaching assignment invitations dispatched to professors. When a professor accepts, the curriculum assignment is automatically confirmed.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div className="px-3.5 py-1.5 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs font-bold flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-600" />
              <span>Pending Response: {pendingCount}</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold flex items-center gap-1.5">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>Accepted & Assigned: {acceptedCount}</span>
            </div>
            <div className="px-3.5 py-1.5 rounded-2xl bg-red-50 border border-red-200 text-red-900 text-xs font-bold flex items-center gap-1.5">
              <XCircle className="w-3.5 h-3.5 text-red-600" />
              <span>Declined: {declinedCount}</span>
            </div>
          </div>
        </div>

        {/* Filter Pills & Search */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-4 shadow-elevation-1 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
            {['All', 'Pending', 'Accepted', 'Declined'].map((tab) => (
              <button
                key={tab}
                onClick={() => setFilter(tab)}
                className={`px-4 py-2 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                  filter === tab
                    ? 'bg-primary text-white shadow-xs'
                    : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {tab === 'Pending' ? 'Pending Response' : tab === 'Accepted' ? 'Accepted & Assigned' : tab === 'Declined' ? 'Declined' : 'All Requests'}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search faculty professor, course..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary text-on-surface font-medium"
            />
          </div>
        </div>

        {/* Table of Course Teaching Requests */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-elevation-1 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-outline uppercase text-[10px] tracking-wider border-b border-outline-variant">
                  <th className="pb-3 font-bold">College Faculty Member</th>
                  <th className="pb-3 font-bold">Requested Course to Teach</th>
                  <th className="pb-3 font-bold">College Request Description</th>
                  <th className="pb-3 font-bold">Semester / Term</th>
                  <th className="pb-3 font-bold">Professor's Choice</th>
                  <th className="pb-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {filteredRequests.map((req) => {
                  const isPending = req.status.includes('Pending');
                  const isAccepted = req.status.includes('Accepted');
                  const isDeclined = req.status.includes('Declined');

                  return (
                    <tr key={req.id} className="hover:bg-surface-container-low/50 transition-colors">
                      
                      {/* Faculty Member */}
                      <td className="py-4">
                        <div className="flex items-center gap-3">
                          <img src={req.avatar} alt={req.name} className="w-10 h-10 rounded-2xl object-cover" />
                          <div>
                            <p className="font-bold text-sm text-on-surface">{req.name}</p>
                            <span className="text-[11px] text-outline flex items-center gap-1">
                              <Mail className="w-3 h-3 text-primary" />
                              <span>{req.email}</span>
                            </span>
                          </div>
                        </div>
                      </td>

                      {/* Requested Course */}
                      <td className="py-4 max-w-xs">
                        <span className="font-bold text-primary block leading-snug">
                          {req.courseTitle || req.sampleSyllabus}
                        </span>
                        <span className="text-[10px] text-outline block mt-0.5">
                          {req.creditHours || '4 Credits'} • {req.specialization}
                        </span>
                      </td>

                      {/* College Request Description */}
                      <td className="py-4 max-w-xs">
                        <div className="space-y-1">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-blue-50 text-blue-800 text-[10px] font-bold">
                            <Mail className="w-2.5 h-2.5 text-primary" />
                            <span>Sent request by mail</span>
                          </span>
                          <p className="text-[11px] text-on-surface font-medium line-clamp-2 leading-relaxed">
                            {req.description}
                          </p>
                          <span className="text-[10px] text-outline block">
                            {req.trackingStatus}
                          </span>
                        </div>
                      </td>

                      {/* Semester */}
                      <td className="py-4 whitespace-nowrap font-medium text-on-surface">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5 text-outline" />
                          <span>{req.semester || 'Fall 2026'}</span>
                        </span>
                      </td>

                      {/* Status / Professor's Choice */}
                      <td className="py-4">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${
                          isAccepted ? 'bg-emerald-100 text-emerald-800' :
                          isPending ? 'bg-amber-100 text-amber-900' : 'bg-red-100 text-red-800'
                        }`}>
                          {isAccepted ? 'Accepted & Assigned' : isPending ? 'Pending Professor Choice' : 'Declined by Professor'}
                        </span>
                        {isAccepted && (
                          <span className="text-[9px] text-emerald-700 font-bold block mt-1 flex items-center gap-1">
                            <Bell className="w-2.5 h-2.5" /> College Notified
                          </span>
                        )}
                      </td>

                      {/* Actions: View Details and Resend Mail (No Accept/Decline here, as that is the instructor's choice) */}
                      <td className="py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          {isPending && (
                            <button
                              title="Resend teaching request email to professor"
                              onClick={() => handleResendMail(req.email, req.courseTitle)}
                              className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary border border-outline-variant transition-colors"
                            >
                              <RotateCcw className="w-3.5 h-3.5" />
                            </button>
                          )}
                          <Link
                            to={`/org/instructor-requests/${req.id}`}
                            className="px-3.5 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-bold text-xs inline-flex items-center gap-1.5 transition-colors border border-outline-variant/60"
                          >
                            <Eye className="w-3.5 h-3.5 text-primary" />
                            <span>View Details</span>
                          </Link>
                        </div>
                      </td>

                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </OrgLayout>
  );
}
