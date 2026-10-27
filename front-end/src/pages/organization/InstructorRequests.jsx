import {dateLabel} from '../../utils/adminDisplay';
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
  Sparkles,
  X,
  UserSearch,
  AlertCircle,
  Loader2,
  UserCheck,
  GraduationCap,
  ArrowRight,
  Inbox,
  UserPlus,
} from 'lucide-react';
import OrgLayout from '../../components/organization/OrgLayout';
import HumanAvatar from '../../components/common/HumanAvatar';
import { useOrg } from '../../context/useOrg';
import { useToast } from '../../components/common/Toast';
import { api } from '../../services/api';

const isPending = (s) => /pending|sent/i.test(s || '');
const fmt = (d) => (d ? dateLabel(d) : '');

function StatusPill({ status }) {
  const tone = isPending(status)
    ? 'bg-amber-100 text-amber-900'
    : /accept|approv/i.test(status)
    ? 'bg-emerald-100 text-emerald-800'
    : 'bg-slate-100 text-slate-700';
  return <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold whitespace-nowrap ${tone}`}>{status}</span>;
}

function matches(req, q) {
  const s = q.trim().toLowerCase();
  return !s || [req.name, req.email, req.courseTitle, req.specialization].some((v) => v?.toLowerCase().includes(s));
}

export default function InstructorRequests() {
  const { addToast } = useToast();
  const {
    instructorRequests,
    joinRequests,
    sendCourseTeachingRequest,
    decideJoinRequest,
    resendInvitation,
    refreshData,
    info: organization,
  } = useOrg();
  const [filter, setFilter] = useState('All');
  const [tab, setTab] = useState('invitations');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState(null);
  const [rejecting, setRejecting] = useState(null);
  const [rejectNote, setRejectNote] = useState('');

  // ── Invite-by-email form state ─────────────────────────────────────────────
  const [emailInput, setEmailInput] = useState('');
  const [lookupState, setLookupState] = useState('idle'); // 'idle' | 'loading' | 'found' | 'not_found' | 'sending' | 'sent'
  const [foundInstructor, setFoundInstructor] = useState(null);
  const [lookupError, setLookupError] = useState('');

  const filteredRequests = instructorRequests.filter(req => {
    const matchesFilter = filter === 'All' ||
      (filter === 'Pending' && req.status.includes('Pending')) ||
      (filter === 'Accepted' && req.status.includes('Accepted')) ||
      (filter === 'Declined' && req.status.includes('Declined'));
    const matchesSearch = [req.name, req.email, req.courseTitle, req.specialization]
      .some((value) => String(value || '').toLowerCase().includes(search.toLowerCase()));

    return matchesFilter && matchesSearch;
  });

  const run = async (id, fn, success) => {
    setBusyId(id);
    try {
      await fn();
      addToast(success, 'success');
    } catch (err) {
      addToast(err.message || 'Action failed', 'error');
    } finally {
      setBusyId(null);
    }
  };

  const pendingCount = instructorRequests.filter(r => r.status.includes('Pending')).length;
  const acceptedCount = instructorRequests.filter(r => r.status.includes('Accepted')).length;
  const declinedCount = instructorRequests.filter(r => r.status.includes('Declined')).length;
  const pendingJoin = joinRequests.filter((request) => isPending(request.status)).length;
  const pendingInv = instructorRequests.filter((request) => isPending(request.status)).length;
  const filtered = (tab === 'join' ? joinRequests : instructorRequests).filter((request) => {
    const matchesFilter = filter === 'All' ||
      (filter === 'Pending' && isPending(request.status)) ||
      (filter === 'Resolved' && !isPending(request.status));
    return matchesFilter && matches(request, search);
  });

  const handleResendMail = (requestId) =>
    run(requestId, () => resendInvitation(requestId), 'Teaching request email resent');

  // ── Instructor email lookup ────────────────────────────────────────────────
  const handleEmailLookup = async (e) => {
    e.preventDefault();
    const trimmedEmail = emailInput.trim().toLowerCase();
    if (!trimmedEmail) return;

    setLookupState('loading');
    setFoundInstructor(null);
    setLookupError('');

    try {
      // Fetch all instructors and search by email client-side
      const result = await api.instructors.list({ limit: 1000 });
      const list = Array.isArray(result)
        ? result
        : result?.items || result?.data || [];

      const match = list.find(
        (inst) => inst.email?.toLowerCase().trim() === trimmedEmail
      );

      if (match) {
        setFoundInstructor(match);
        setLookupState('found');
      } else {
        setLookupState('not_found');
        setLookupError(`No instructor with email "${emailInput.trim()}" was found in the platform.`);
      }
    } catch (err) {
      setLookupState('not_found');
      setLookupError('Could not connect to the server. Please try again.');
    }
  };

  // ── Send invitation request ────────────────────────────────────────────────
  const handleSendRequest = async () => {
    if (!foundInstructor) return;
    if (foundInstructor.organizationId && foundInstructor.organizationId !== organization?.id) {
      addToast(
        `${foundInstructor.name} is already affiliated with ${foundInstructor.organizationName || 'another organization'} and cannot receive invitations.`,
        'error'
      );
      return;
    }
    setLookupState('sending');

    try {
      await sendCourseTeachingRequest({
        instructorId: foundInstructor.id,
        courseTitle: undefined,
        courseId: undefined,
        message: `You have been invited to join the faculty of ${organization?.name || 'our institution'}. Please review the invitation in your dashboard.`,
      });

      await refreshData();
      setLookupState('sent');
      addToast(
        `Faculty invitation successfully sent to ${foundInstructor.name} (${foundInstructor.email})!`,
        'success'
      );

      // Reset form after 3 seconds
      setTimeout(() => {
        setLookupState('idle');
        setEmailInput('');
        setFoundInstructor(null);
      }, 3000);
    } catch (err) {
      setLookupState('found'); // revert to found state on error
      addToast(
        err?.message || 'Failed to send the invitation. Please try again.',
        'error'
      );
    }
  };

  const resetLookup = () => {
    setLookupState('idle');
    setEmailInput('');
    setFoundInstructor(null);
    setLookupError('');
  };


  return (
    <OrgLayout
      breadcrumbs={[{ label: 'Instructor invitations' }]}
    >
      <div className="space-y-6">

        {/* ── Invite Instructor by Email Panel ─────────────────────────────── */}
        <div className="bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-900 border border-emerald-800/50 rounded-3xl p-6 shadow-xl relative overflow-hidden">
            {/* Ambient glow */}
            <div className="absolute -right-16 -top-16 w-60 h-60 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
            <div className="absolute -left-16 -bottom-16 w-48 h-48 rounded-full bg-blue-500/10 blur-2xl pointer-events-none" />

            <div className="relative z-10">
              <div className="flex items-start justify-between mb-5">
                <div>
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 text-[11px] font-bold mb-2">
                    <UserSearch className="w-3.5 h-3.5" />
                    <span>Faculty Outreach • Email Lookup</span>
                  </div>
                  <h2 className="text-lg font-extrabold text-white">Invite an Instructor by Email</h2>
                  <p className="text-slate-400 text-xs mt-0.5 max-w-lg">
                    Enter the instructor's registered email address. We'll verify they exist on the platform, then dispatch a formal teaching invitation to their dashboard.
                  </p>
                </div>
                <button
                  onClick={resetLookup}
                  title="Clear form"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Email Input Form */}
              <form onSubmit={handleEmailLookup} className="flex items-center gap-3">
                <div className="relative flex-1">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    id="invite-instructor-email"
                    type="email"
                    placeholder="e.g. professor@university.edu"
                    value={emailInput}
                    onChange={(e) => { setEmailInput(e.target.value); setLookupState('idle'); setFoundInstructor(null); setLookupError(''); }}
                    className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-slate-500 text-sm font-medium focus:outline-none focus:border-emerald-400 focus:bg-white/15 transition-all"
                    disabled={lookupState === 'loading' || lookupState === 'sending'}
                  />
                </div>
                <button
                  type="submit"
                  disabled={!emailInput.trim() || lookupState === 'loading' || lookupState === 'sending'}
                  className="px-5 py-3 rounded-xl bg-emerald-500 hover:bg-emerald-400 disabled:bg-emerald-900 disabled:text-emerald-700 text-white font-bold text-sm transition-all flex items-center gap-2 whitespace-nowrap"
                >
                  {lookupState === 'loading' ? (
                    <><Loader2 className="w-4 h-4 animate-spin" /><span>Searching...</span></>
                  ) : (
                    <><Search className="w-4 h-4" /><span>Check Instructor</span></>
                  )}
                </button>
              </form>

              {/* Result: Instructor Found */}
              {lookupState === 'found' && foundInstructor && (
                <div className="mt-5 bg-white/8 border border-emerald-500/40 rounded-2xl p-5 animate-in fade-in duration-200">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="relative">
                        <HumanAvatar name={foundInstructor.name} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-emerald-400/50"/>
                        <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-900 flex items-center justify-center">
                          <UserCheck className="w-2.5 h-2.5 text-white" />
                        </div>
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                            <CheckCircle2 className="w-3 h-3" />
                            Instructor Found
                          </span>
                          {foundInstructor.organizationId ? (
                            foundInstructor.organizationId === organization?.id ? (
                              <span className="px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 text-[10px] font-bold border border-blue-500/30">
                                In Your Faculty
                              </span>
                            ) : (
                              <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-300 text-[10px] font-bold border border-rose-500/30">
                                Affiliated with {foundInstructor.organizationName || 'Another Org'}
                              </span>
                            )
                          ) : (
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-[10px] font-bold border border-emerald-500/30">
                              Available to Invite
                            </span>
                          )}
                        </div>
                        <h3 className="text-white font-extrabold text-base mt-0.5">{foundInstructor.name}</h3>
                        <p className="text-slate-400 text-xs flex items-center gap-1.5 mt-0.5">
                          <Mail className="w-3 h-3 text-emerald-400" />
                          <span>{foundInstructor.email}</span>
                        </p>
                        <p className="text-slate-500 text-[11px] mt-0.5 flex items-center gap-1">
                          <GraduationCap className="w-3 h-3" />
                          <span>{foundInstructor.specialization || 'General Educator'}</span>
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end sm:self-auto">
                      <button
                        onClick={resetLookup}
                        className="px-4 py-2.5 rounded-xl border border-white/20 text-slate-400 hover:text-white hover:bg-white/10 text-xs font-semibold transition-all"
                      >
                        Cancel
                      </button>
                      {foundInstructor.organizationId ? (
                        <button
                          disabled
                          className="px-5 py-2.5 rounded-xl bg-slate-700/80 text-slate-400 font-bold text-xs cursor-not-allowed flex items-center gap-2 border border-slate-600"
                        >
                          <span>{foundInstructor.organizationId === organization?.id ? 'Already In Faculty' : 'Cannot Invite (Affiliated)'}</span>
                        </button>
                      ) : (
                        <button
                          onClick={handleSendRequest}
                          className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-xs shadow-md transition-all flex items-center gap-2"
                        >
                          <Send className="w-3.5 h-3.5" />
                          <span>Send Faculty Invitation</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Result: Sending */}
              {lookupState === 'sending' && (
                <div className="mt-5 bg-blue-900/30 border border-blue-500/40 rounded-2xl p-5 flex items-center gap-4 animate-in fade-in duration-200">
                  <Loader2 className="w-6 h-6 text-blue-400 animate-spin shrink-0" />
                  <div>
                    <p className="text-white font-bold text-sm">Dispatching Teaching Invitation…</p>
                    <p className="text-blue-300 text-xs mt-0.5">Creating a formal request and notifying the instructor's dashboard.</p>
                  </div>
                </div>
              )}

              {/* Result: Sent successfully */}
              {lookupState === 'sent' && (
                <div className="mt-5 bg-emerald-900/30 border border-emerald-500/40 rounded-2xl p-5 flex items-center gap-4 animate-in fade-in duration-200">
                  <div className="w-10 h-10 rounded-full bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center shrink-0">
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-white font-extrabold text-sm">Invitation Dispatched Successfully!</p>
                    <p className="text-emerald-300 text-xs mt-0.5">
                      {foundInstructor?.name || 'The instructor'} will see the request in their dashboard. Closing form…
                    </p>
                  </div>
                </div>
              )}

              {/* Result: Not Found */}
              {lookupState === 'not_found' && (
                <div className="mt-5 bg-red-900/30 border border-red-500/40 rounded-2xl p-4 flex items-start gap-3 animate-in fade-in duration-200">
                  <AlertCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  <div className="flex-1">
                    <p className="text-white font-bold text-sm">Instructor Does Not Exist</p>
                    <p className="text-red-300 text-xs mt-0.5">{lookupError}</p>
                    <p className="text-slate-400 text-[11px] mt-1.5">
                      Make sure the instructor is registered on the platform. They can sign up at the platform's registration page as an "Instructor".
                    </p>
                  </div>
                  <button
                    onClick={resetLookup}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors shrink-0"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              )}
            </div>
          </div>

        {/* Header & Status Metrics */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-on-surface">Teaching Requests</h1>
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

        <div className="flex border-b border-outline-variant gap-6">
          {[
            ['join', 'Join requests', pendingJoin, UserPlus],
            ['invitations', 'Invitations sent', pendingInv, Mail],
          ].map(([id, label, count, Icon]) => (
            <button
              key={id}
              onClick={() => setTab(id)}
              className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 -mb-px ${
                tab === id ? 'border-primary text-primary' : 'border-transparent text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <Icon className="w-4 h-4" /> {label}
              {count > 0 && <span className="px-2 py-0.5 rounded-full text-[10px] bg-amber-100 text-amber-900 font-bold">{count} pending</span>}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            {['Pending', 'Resolved', 'All'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-4 py-2 rounded-xl text-xs font-bold ${
                  filter === f ? 'bg-primary text-white' : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
                }`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Search by name, email or course"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary"
            />
          </div>
        </div>

        {filtered.length === 0 ? (
          <div className="bg-surface-container-lowest border border-dashed border-outline-variant rounded-3xl p-10 text-center">
            <Inbox className="w-8 h-8 text-outline mx-auto mb-2" />
            <p className="text-sm font-bold text-on-surface">
              {tab === 'join' ? 'No join requests' : 'No invitations'} {filter !== 'All' ? `(${filter.toLowerCase()})` : ''}
            </p>
            <p className="text-xs text-on-surface-variant mt-1">
              {tab === 'join'
                ? 'When an instructor asks to join your organization, it will show up here for approval.'
                : 'Invite an instructor to teach one of your courses from Assign Courses.'}
            </p>
          </div>
        ) : tab === 'join' ? (
          <div className="space-y-3">
            {filtered.map((r) => (
              <div key={r.id} className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <HumanAvatar name={r.name} size="md" />
                    <div>
                      <p className="font-bold text-sm text-on-surface">{r.name}</p>
                      <p className="text-[11px] text-outline">
                        {r.email}
                        {r.specialization ? ` • ${r.specialization}` : ''}
                      </p>
                      <p className="text-[11px] text-outline">Requested {fmt(r.createdAt)}</p>
                    </div>
                  </div>
                  <StatusPill status={r.status} />
                </div>
                {r.description && <p className="text-xs text-on-surface bg-surface-container-low rounded-xl p-3">“{r.description}”</p>}
                {r.orgNotes && <p className="text-[11px] text-outline">Your note: {r.orgNotes}</p>}

                {isPending(r.status) &&
                  (rejecting === r.id ? (
                    <div className="space-y-2 p-3 rounded-xl bg-rose-50 border border-rose-200">
                      <textarea
                        value={rejectNote}
                        onChange={(e) => setRejectNote(e.target.value)}
                        maxLength={500}
                        placeholder="Optional reason shared with the instructor"
                        className="w-full text-xs rounded-lg border border-rose-200 px-3 py-2 bg-white resize-none"
                        rows={2}
                      />
                      <div className="flex justify-end gap-2">
                        <button onClick={() => setRejecting(null)} className="px-3 py-1.5 rounded-lg bg-white border text-xs font-semibold">
                          Cancel
                        </button>
                        <button
                          disabled={busyId === r.id}
                          onClick={() =>
                            run(r.id, async () => {
                              await decideJoinRequest(r.id, 'reject', rejectNote.trim() || undefined);
                              setRejecting(null);
                              setRejectNote('');
                            }, `Rejected ${r.name}'s request`)
                          }
                          className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold disabled:opacity-50"
                        >
                          Reject request
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex justify-end gap-2">
                      <button
                        disabled={busyId === r.id}
                        onClick={() => setRejecting(r.id)}
                        className="px-4 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold flex items-center gap-1.5"
                      >
                        <X className="w-4 h-4" /> Reject
                      </button>
                      <button
                        disabled={busyId === r.id}
                        onClick={() => run(r.id, () => decideJoinRequest(r.id, 'approve'), `${r.name} is now an instructor in your organization`)}
                        className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold flex items-center gap-1.5 disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" /> Approve
                      </button>
                    </div>
                  ))}
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-outline uppercase text-[10px] tracking-wider border-b border-outline-variant">
                  <th className="pb-3 font-bold">College Faculty Member</th>
                  <th className="pb-3 font-bold">Requested Course to Teach</th>
                  <th className="pb-3 font-bold">Professor's Choice</th>
                  <th className="pb-3 font-bold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {filteredRequests.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-16 text-center">
                      <div className="flex flex-col items-center gap-3">
                        <div className="w-12 h-12 rounded-2xl bg-surface-container flex items-center justify-center">
                          <BookOpen className="w-6 h-6 text-outline" />
                        </div>
                        <p className="text-sm font-bold text-on-surface">No instructor invitations</p>
                        <p className="text-xs text-on-surface-variant max-w-xs">
                          {search || filter !== 'All'
                            ? 'Try adjusting your search or filter.'
                            : 'Use "Invite Instructor by Email" above to send your first invitation.'}
                        </p>
                      </div>
                    </td>
                  </tr>
                ) : (
                  filteredRequests.map((req) => {
                    const isPending = req.status.includes('Pending');
                    const isAccepted = req.status.includes('Accepted');
                    const isDeclined = req.status.includes('Declined');

                    return (
                      <tr key={req.id} className="hover:bg-surface-container-low/50 transition-colors">

                        {/* Faculty Member */}
                        <td className="py-4">
                          <div className="flex items-center gap-3">
                            <HumanAvatar name={req.name} className="w-10 h-10 rounded-2xl object-cover"/>
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
                            {req.specialization || 'General Academic Domain'}
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
                        </td>

                        {/* Actions: View Details and Resend Mail (No Accept/Decline here, as that is the instructor's choice) */}
                        <td className="py-4 text-right">
                          <div className="flex items-center justify-end gap-2">

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
                  })
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </OrgLayout>
  );
}
