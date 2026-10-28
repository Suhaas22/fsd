import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft,
  RotateCcw,
  GraduationCap,
  Check,
  X,
  Mail,
} from 'lucide-react';
import OrgLayout from '../../components/organization/OrgLayout';
import HumanAvatar from '../../components/common/HumanAvatar';
import { useOrg } from '../../context/useOrg';
import { useToast } from '../../components/common/Toast';

const isPending = (s) => /pending|sent/i.test(s || '');
const fmt = (d) =>
  d
    ? new Date(d).toLocaleString('en-IN', {
        dateStyle: 'medium',
        timeStyle: 'short',
      })
    : '—';

export default function InstructorRequestDetails() {
  const { id } = useParams();
  const { addToast } = useToast();
  const {
    instructorRequests,
    joinRequests,
    isLoading,
    decideJoinRequest,
    resendInvitation,
    withdrawInvitation,
  } = useOrg();
  const [busy, setBusy] = useState(false);

  const request = [...joinRequests, ...instructorRequests].find(
    (r) => r.id === id
  );
  const isJoin = request?.type === 'join';

  const run = async (fn, success) => {
    setBusy(true);
    try {
      await fn();
      addToast(success, 'success');
    } catch (err) {
      addToast(err.message || 'Action failed', 'error');
    } finally {
      setBusy(false);
    }
  };

  if (!request) {
    return (
      <OrgLayout
        breadcrumbs={[
          { label: 'Instructor Requests', path: '/org/instructor-requests' },
        ]}
      >
        <div className="max-w-md mx-auto text-center py-16">
          <p className="text-sm font-bold text-on-surface">
            {isLoading ? 'Loading…' : 'Request not found'}
          </p>
          <Link
            to="/org/instructor-requests"
            className="text-xs font-bold text-primary hover:underline mt-2 inline-block"
          >
            Back to instructor requests
          </Link>
        </div>
      </OrgLayout>
    );
  }

  const rows = isJoin
    ? [
        ['Type', 'Join request (sent by instructor)'],
        ['Requested', fmt(request.createdAt)],
        ['Decided', request.decidedAt ? fmt(request.decidedAt) : null],
        ['Your note', request.orgNotes],
      ]
    : [
        ['Type', 'Teaching invitation (sent by you)'],
        ['Course', request.courseTitle],
        ['Terms', request.proposedTerms],
        ['Sent', fmt(request.createdAt)],
        [
          'Last reminder',
          request.lastReminderAt ? fmt(request.lastReminderAt) : null,
        ],
        ['Responded', request.respondedAt ? fmt(request.respondedAt) : null],
      ];

  return (
    <OrgLayout
      breadcrumbs={[
        { label: 'Teaching Assignments', path: '/org/instructor-requests' },
        { label: request.name },
      ]}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <Link
          to="/org/instructor-requests"
          className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline"
        >
          <ChevronLeft className="w-4 h-4" /> Back to instructor requests
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-8 bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center gap-4 pb-5 border-b border-outline-variant">
              <HumanAvatar name={request.name} size="lg" />
              <div>
                <h1 className="text-xl font-bold text-on-surface">
                  {request.name}
                </h1>
                <p className="text-xs text-outline">{request.email}</p>
                {request.specialization && (
                  <p className="text-xs text-primary font-bold">
                    {request.specialization}
                  </p>
                )}
              </div>
            </div>

            {/* Outreach Banner */}
            <div className="mt-6 p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 space-y-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-xl bg-primary text-white flex items-center justify-center">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                  Teaching Request Notification
                </span>
              </div>
              <p className="text-xs text-indigo-900 leading-relaxed pl-9">
                {request.description}
              </p>
              <div className="pl-9 flex flex-wrap gap-4 text-[11px] text-indigo-800 pt-1 font-medium">
                <span>
                  Professor Email: <strong>{request.email}</strong>
                </span>
                <span>
                  Tracking: <strong>{request.trackingStatus}</strong>
                </span>
              </div>
            </div>

            {/* Course Assignment Details */}
            <div className="py-6 border-b border-outline-variant space-y-4">
              <h2 className="text-xs font-bold text-outline uppercase tracking-wider">
                Course Assignment Specification
              </h2>
              <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/60 space-y-2">
                <h3 className="text-sm font-bold text-on-surface">
                  {request.courseTitle || request.sampleSyllabus}
                </h3>
                <p className="text-xs text-on-surface-variant leading-relaxed">
                  {request.sampleSyllabus}
                </p>
                {request.proposedTerms && (
                  <p className="text-xs font-semibold text-emerald-700 pt-1">
                    {request.proposedTerms}
                  </p>
                )}
              </div>
            </div>

            {/* Faculty Bio */}
            <div className="pt-6 space-y-2">
              <h2 className="text-xs font-bold text-outline uppercase tracking-wider">
                College Faculty Profile
              </h2>
              <p className="text-xs text-on-surface leading-relaxed">
                {request.bio}
              </p>
            </div>

            <dl className="divide-y divide-outline-variant/40 text-sm">
              {rows
                .filter(([, v]) => v)
                .map(([k, v]) => (
                  <div key={k} className="flex justify-between gap-4 py-2.5">
                    <dt className="text-outline">{k}</dt>
                    <dd className="font-semibold text-on-surface text-right">
                      {v}
                    </dd>
                  </div>
                ))}
            </dl>
            {request.description && (
              <div>
                <p className="text-[10px] font-bold uppercase tracking-wider text-outline mb-1">
                  {isJoin ? 'Message from instructor' : 'Your message'}
                </p>
                <p className="text-xs text-on-surface bg-surface-container-low rounded-xl p-3">
                  {request.description}
                </p>
              </div>
            )}
          </div>

          <div className="lg:col-span-4 bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 space-y-4">
            <div>
              <p className="text-[10px] text-outline uppercase font-bold tracking-wider">
                Status
              </p>
              <p className="font-bold text-on-surface mt-1">{request.status}</p>
            </div>

            {isPending(request.status) && isJoin && (
              <div className="flex gap-2">
                <button
                  disabled={busy}
                  onClick={() =>
                    run(
                      () => decideJoinRequest(request.id, 'reject'),
                      'Request rejected'
                    )
                  }
                  className="flex-1 py-2.5 rounded-xl border border-rose-200 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <X className="w-4 h-4" /> Reject
                </button>
                <button
                  disabled={busy}
                  onClick={() =>
                    run(
                      () => decideJoinRequest(request.id, 'approve'),
                      `${request.name} joined your organization`
                    )
                  }
                  className="flex-1 py-2.5 rounded-xl bg-primary text-white text-xs font-bold flex items-center justify-center gap-1.5"
                >
                  <Check className="w-4 h-4" /> Approve
                </button>
              </div>
            )}

            {isPending(request.status) && !isJoin && (
              <div className="space-y-2">
                <button
                  disabled={busy}
                  onClick={() =>
                    window.confirm('Withdraw this invitation?') &&
                    run(
                      () => withdrawInvitation(request.id),
                      'Invitation withdrawn'
                    )
                  }
                  className="w-full py-2.5 rounded-xl border border-rose-200 text-rose-700 font-bold text-xs"
                >
                  Withdraw invitation
                </button>
              </div>
            )}

            {request.instructorId && (
              <Link
                to={`/org/instructors/${request.instructorId}`}
                className="w-full py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white font-bold text-xs flex items-center justify-center gap-2"
              >
                <GraduationCap className="w-4 h-4" /> View instructor profile
              </Link>
            )}
          </div>
        </div>
      </div>
    </OrgLayout>
  );
}
