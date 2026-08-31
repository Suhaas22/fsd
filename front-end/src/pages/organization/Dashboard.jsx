import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  BookOpen,
  DollarSign,
  TrendingUp,
  ArrowRight,
  Check,
  X,
  Plus,
  Sparkles,
  ChevronRight,
  ShieldCheck,
  Mail,
  Send,
  RotateCcw
} from 'lucide-react';
import OrgLayout from '../../components/organization/OrgLayout';
import { useOrg } from '../../context/OrgContext';
import { useToast } from '../../components/common/Toast';

export default function OrgDashboard() {
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { courses, enrollments, instructorRequests, stats, updateInvitationStatus, info } = useOrg();

  const handleResendMail = (email) => {
    addToast(`Resent invitation request email to ${email}!`, 'info');
  };

  const handleWithdrawInvitation = (id, name) => {
    updateInvitationStatus(id, 'Declined', 'Invitation withdrawn by organization');
    addToast(`Withdrew recruitment invitation for ${name}`, 'error');
  };

  const handleMarkAccepted = (id, name) => {
    updateInvitationStatus(id, 'Accepted', 'Accepted by educator • Onboarded');
    addToast(`${name} confirmed and accepted faculty invitation!`, 'success');
  };

  const pendingInvitations = instructorRequests.filter(r => r.status.includes('Pending') || r.status === 'Invite Sent');

  return (
    <OrgLayout
      breadcrumbs={[{ label: 'Dashboard' }]}
      actions={
        <div className="flex items-center gap-2">
          <Link
            to="/courses/create"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>Create Course</span>
          </Link>
          <Link
            to="/instructor-requests"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold transition-all border border-outline-variant"
          >
            <Send className="w-4 h-4 text-primary" />
            <span>Send Request</span>
          </Link>
        </div>
      }
    >
      <div className="space-y-8">
        
        {/* Top Hero Banner with Real Dynamic KPIs */}
        <section className="bg-gradient-to-r from-[#0F172A] via-[#1E293B] to-[#312E81] text-white rounded-3xl p-6 md:p-8 shadow-elevation-2 relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 relative z-10">
            <div>
              <span className="text-xs font-bold text-[#C7D2FE] uppercase tracking-wider">Enterprise Overview</span>
              <h1 className="text-2xl md:text-3xl font-extrabold mt-1 tracking-tight">
                {info.name || 'NexusPay Academy'} Administration
              </h1>
              <p className="text-xs text-slate-300 mt-1 max-w-xl">
                Institutional telemetry across faculty authoring, learner enrollments, and tuition gateway settlements.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Link
                to="/reports"
                className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white font-semibold text-xs transition-colors border border-white/20 flex items-center gap-2"
              >
                <span>Executive Reports</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-white/15">
            <Link to="/instructors" className="bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-2xl p-4 transition-all group">
              <span className="text-[10px] text-white/70 uppercase font-bold tracking-wider block">Faculty Members</span>
              <p className="text-2xl md:text-3xl font-black mt-1 group-hover:scale-105 transition-transform">{stats.totalInstructors}</p>
              <span className="text-[10px] text-emerald-300 font-semibold mt-1 flex items-center gap-1">
                <Check className="w-3 h-3" /> Accredited
              </span>
            </Link>

            <Link to="/learners" className="bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-2xl p-4 transition-all group">
              <span className="text-[10px] text-white/70 uppercase font-bold tracking-wider block">Active Learners</span>
              <p className="text-2xl md:text-3xl font-black mt-1 group-hover:scale-105 transition-transform">{stats.totalLearners}</p>
              <span className="text-[10px] text-emerald-300 font-semibold mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +12% this month
              </span>
            </Link>

            <Link to="/courses" className="bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-2xl p-4 transition-all group">
              <span className="text-[10px] text-white/70 uppercase font-bold tracking-wider block">Course Tracks</span>
              <p className="text-2xl md:text-3xl font-black mt-1 group-hover:scale-105 transition-transform">{stats.activeCourses}</p>
              <span className="text-[10px] text-[#C7D2FE] font-semibold mt-1 flex items-center gap-1">
                <BookOpen className="w-3 h-3" /> Published
              </span>
            </Link>

            <Link to="/payments" className="bg-white/10 hover:bg-white/15 backdrop-blur-md rounded-2xl p-4 transition-all group">
              <span className="text-[10px] text-white/70 uppercase font-bold tracking-wider block">Gross Revenue YTD</span>
              <p className="text-2xl md:text-3xl font-black mt-1 group-hover:scale-105 transition-transform">${stats.annualRevenue.toLocaleString()}</p>
              <span className="text-[10px] text-emerald-300 font-semibold mt-1 flex items-center gap-1">
                <TrendingUp className="w-3 h-3" /> +18.4% monthly
              </span>
            </Link>
          </div>
        </section>

        {/* Two-Column Grid: Recent Enrollments & Revenue Overview Graph */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left: Recent Enrollments Table (7 cols) */}
          <div className="lg:col-span-7 bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-elevation-1">
            <div className="flex items-center justify-between pb-4 border-b border-outline-variant mb-4">
              <div>
                <h2 className="text-base font-bold text-on-surface">Recent Course Enrollments</h2>
                <p className="text-xs text-on-surface-variant">{enrollments.length} Total active course seats</p>
              </div>
              <Link to="/enrollments" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
                <span>View All</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-outline uppercase text-[10px] tracking-wider border-b border-outline-variant/60">
                    <th className="pb-3 font-bold">Learner</th>
                    <th className="pb-3 font-bold">Course Track</th>
                    <th className="pb-3 font-bold">Date</th>
                    <th className="pb-3 font-bold text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant/40">
                  {enrollments.slice(0, 5).map((enr) => (
                    <tr key={enr.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-3">
                        <div className="flex items-center gap-2.5">
                          <img src={enr.learnerAvatar} alt={enr.learnerName} className="w-7 h-7 rounded-full object-cover" />
                          <span className="font-bold text-on-surface">{enr.learnerName}</span>
                        </div>
                      </td>
                      <td className="py-3 text-on-surface-variant font-medium max-w-[180px] truncate">{enr.courseTitle}</td>
                      <td className="py-3 text-outline text-[11px]">{enr.enrolledDate}</td>
                      <td className="py-3 text-right">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          enr.status === 'Completed' ? 'bg-blue-100 text-blue-900' :
                          enr.status === 'Active' ? 'bg-emerald-100 text-emerald-800' : 'bg-gray-100 text-gray-800'
                        }`}>
                          {enr.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Right: Revenue Overview Interactive Line Graph (5 cols) */}
          <div className="lg:col-span-5 bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-elevation-1 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant mb-4">
                <div>
                  <h2 className="text-base font-bold text-on-surface">Revenue Overview</h2>
                  <p className="text-xs text-on-surface-variant">Monthly settlement progression</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    +18.4%
                  </span>
                  <div className="flex items-center p-0.5 rounded-lg bg-surface-container-low border border-outline-variant text-[10px] font-bold">
                    <span className="px-2 py-0.5 rounded-md bg-primary text-white">6M</span>
                    <span className="px-2 py-0.5 text-outline hover:text-on-surface cursor-pointer">1Y</span>
                  </div>
                </div>
              </div>

              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
                <div>
                  <span className="text-[10px] text-outline uppercase font-bold tracking-wider block">Monthly Net Inflow</span>
                  <p className="text-2xl font-black text-on-surface">${stats.monthlyRevenue.toLocaleString()}</p>
                </div>
                <div className="flex items-center gap-3 text-[11px] font-semibold text-outline">
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-primary"></span>
                    <span className="text-on-surface font-medium">Direct Sales (66%)</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="w-2.5 h-2.5 rounded-full bg-secondary"></span>
                    <span className="text-on-surface font-medium">Enterprise (26%)</span>
                  </span>
                </div>
              </div>

              <div className="relative flex gap-3 h-44 pt-1">
                <div className="flex flex-col justify-between text-[10px] font-semibold text-outline pb-5 select-none text-right w-8">
                  <span>$45k</span>
                  <span>$30k</span>
                  <span>$15k</span>
                  <span>$0</span>
                </div>

                <div className="flex-1 flex flex-col justify-between relative">
                  <svg viewBox="0 0 460 130" className="w-full h-36 overflow-visible" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="revAreaGradDash" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.28" />
                        <stop offset="80%" stopColor="#4F46E5" stopOpacity="0.04" />
                        <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.00" />
                      </linearGradient>
                    </defs>

                    <line x1="0" y1="5" x2="460" y2="5" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.8" />
                    <line x1="0" y1="45" x2="460" y2="45" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.8" />
                    <line x1="0" y1="85" x2="460" y2="85" stroke="#E2E8F0" strokeWidth="1" strokeDasharray="3 3" strokeOpacity="0.8" />
                    <line x1="0" y1="125" x2="460" y2="125" stroke="#CBD5E1" strokeWidth="1" strokeOpacity="0.9" />

                    <path
                      d="M 15,108 C 75,98 120,88 175,76 C 230,64 285,48 340,36 C 390,26 425,18 450,10 L 450,125 L 15,125 Z"
                      fill="url(#revAreaGradDash)"
                    />

                    <path
                      d="M 15,108 C 75,98 120,88 175,76 C 230,64 285,48 340,36 C 390,26 425,18 450,10"
                      fill="none"
                      stroke="#4F46E5"
                      strokeWidth="3.5"
                      strokeLinecap="round"
                    />

                    {[
                      { cx: 15, cy: 108, val: "$18.2k" },
                      { cx: 102, cy: 92, val: "$23.5k" },
                      { cx: 189, cy: 74, val: "$28.9k" },
                      { cx: 276, cy: 50, val: "$34.1k" },
                      { cx: 363, cy: 30, val: "$38.4k" },
                      { cx: 450, cy: 10, val: `$${Math.round(stats.monthlyRevenue / 1000)}k` }
                    ].map((pt, i) => (
                      <g key={i} className="group cursor-pointer">
                        <circle cx={pt.cx} cy={pt.cy} r="4.5" fill="#FFFFFF" stroke="#4F46E5" strokeWidth="3" className="transition-transform group-hover:scale-150" />
                        <g className="opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                          <rect x={pt.cx - 24} y={pt.cy - 28} width="48" height="18" rx="4" fill="#0F172A" />
                          <text x={pt.cx} y={pt.cy - 16} fill="#FFFFFF" fontSize="9" fontWeight="700" textAnchor="middle">{pt.val}</text>
                        </g>
                      </g>
                    ))}
                  </svg>

                  <div className="flex justify-between text-[10px] font-bold text-outline uppercase tracking-wider pt-1 px-1">
                    <span>May</span>
                    <span>Jun</span>
                    <span>Jul</span>
                    <span>Aug</span>
                    <span>Sep</span>
                    <span>Oct</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-outline-variant/60 mt-4 flex items-center justify-between">
              <div>
                <span className="text-[10px] text-outline uppercase font-bold tracking-wider">Total Net Settlement YTD</span>
                <p className="text-xl font-black text-primary">${stats.annualRevenue.toLocaleString()}</p>
              </div>
              <Link
                to="/payments"
                className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface transition-colors flex items-center gap-1"
              >
                <span>View Payments</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

        </div>

        {/* Outbound Faculty Invitations Sent by Organization */}
        <section className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-elevation-1">
          <div className="flex items-center justify-between pb-4 border-b border-outline-variant mb-6">
            <div>
              <h2 className="text-base font-bold text-on-surface flex items-center gap-2">
                <GraduationCap className="w-5 h-5 text-primary" />
                <span>Faculty Course Teaching Requests</span>
                <span className="px-2 py-0.5 rounded-md bg-amber-100 text-amber-900 text-xs font-bold">
                  {pendingInvitations.length} Awaiting Acceptance
                </span>
              </h2>
              <p className="text-xs text-on-surface-variant">Requests sent by mail to existing college faculty to teach specific courses</p>
            </div>
            <Link to="/instructor-requests" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              <span>Manage All Teaching Requests</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {pendingInvitations.slice(0, 3).map((inv) => (
              <div key={inv.id} className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant/80 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-3 mb-3">
                    <img src={inv.avatar} alt={inv.name} className="w-12 h-12 rounded-2xl object-cover" />
                    <div>
                      <h3 className="font-bold text-sm text-on-surface">{inv.name}</h3>
                      <p className="text-[11px] text-outline">{inv.email}</p>
                      <span className="inline-block text-[10px] font-bold text-primary mt-0.5">{inv.specialization}</span>
                    </div>
                  </div>

                  <div className="p-2.5 rounded-xl bg-blue-50/80 border border-blue-200/60 mb-2">
                    <span className="text-[10px] font-bold text-blue-900 flex items-center gap-1">
                      <Mail className="w-3 h-3 text-primary" />
                      <span>Sent request by mail</span>
                    </span>
                    <p className="text-[11px] text-blue-950 font-medium line-clamp-2 mt-0.5">
                      {inv.description}
                    </p>
                  </div>

                  <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                    {inv.bio}
                  </p>
                </div>

                <div className="pt-3 border-t border-outline-variant/60 flex items-center justify-between gap-2">
                  <button
                    title="Resend teaching request email"
                    onClick={() => handleResendMail(inv.email)}
                    className="p-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary border border-outline-variant transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <Link
                    to={`/instructor-requests/${inv.id}`}
                    className="flex-1 py-2 px-3 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold text-center transition-colors border border-outline-variant/60"
                  >
                    View Request Details
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>
    </OrgLayout>
  );
}
