import { dateLabel } from '../../../utils/adminDisplay';
import React, { useState } from 'react';
import {
  Building2,
  GraduationCap,
  Clock,
  Mail,
  Check,
  X,
  AlertCircle,
  Loader2,
  Inbox,
  History,
  Copy,
} from 'lucide-react';
import { useInstructor } from '../../../hooks/useInstructor';

const isPending = (s) => /pending|sent/i.test(s || '');
const fmt = (d) => (d ? dateLabel(d) : '');

function StatusPill({ status }) {
  const tone = isPending(status)
    ? 'bg-amber-50 text-amber-800 border-amber-200'
    : /accept|approv/i.test(status)
      ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
      : 'bg-slate-100 text-slate-600 border-slate-200';
  return (
    <span
      className={`px-2 py-0.5 rounded-full border text-[10px] font-bold whitespace-nowrap ${tone}`}
    >
      {status}
    </span>
  );
}

export function ConnectUniversity({ embedded = false }) {
  const {
    instructor,
    isAffiliated,
    invitations = [],
    pendingOrgInvitations = [],
    actionLoading,
    acceptOrgInvitation,
    declineOrgInvitation,
  } = useInstructor();

  const [notice, setNotice] = useState(null);
  const [confirmDecline, setConfirmDecline] = useState(null);
  const [copied, setCopied] = useState(false);

  const act = async (fn, success) => {
    setNotice(null);
    try {
      await fn();
      setNotice({ type: 'success', text: success });
    } catch (err) {
      setNotice({ type: 'error', text: err.message || 'Something went wrong' });
    }
  };

  const handleCopyEmail = () => {
    if (instructor?.email) {
      navigator.clipboard.writeText(instructor.email);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Only show organization association history (not course assignments)
  const orgHistory = invitations
    .filter(
      (i) =>
        !isPending(i.status) &&
        (i.type === 'org-invitation' ||
          !i.courseId ||
          i.courseTitle === 'General Course Assignment')
    )
    .sort((a, b) =>
      String(b.updatedAt || b.createdAt).localeCompare(
        String(a.updatedAt || a.createdAt)
      )
    );

  if (isAffiliated) return null;

  return (
    <div className={`space-y-6 ${embedded ? '' : 'max-w-4xl mx-auto py-2'}`}>
      {!embedded && (
        <header className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-full bg-amber-50 text-amber-800 border border-amber-200 text-xs font-bold">
              Affiliation Required
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Organization Faculty Association
          </h1>
          <p className="text-sm text-slate-500 leading-relaxed max-w-2xl">
            You must be associated with an institution before you can access
            instructor tools and receive course assignments. Institutions
            initiate invitations directly to faculty instructors.
          </p>
        </header>
      )}

      {notice && (
        <div
          className={`p-3.5 rounded-xl border text-xs font-semibold flex items-start gap-2.5 ${
            notice.type === 'success'
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          {notice.type === 'success' ? (
            <Check className="w-4 h-4 shrink-0 text-emerald-600" />
          ) : (
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
          )}
          <span>{notice.text}</span>
        </div>
      )}

      {/* ── Pending Faculty Invitations ── */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <Inbox className="w-4 h-4 text-[#0056D2]" />
            <span>Incoming Organization Invitations</span>
            <span className="px-2 py-0.5 rounded-full bg-blue-50 text-[#0056D2] border border-blue-200/80 text-xs font-bold">
              {pendingOrgInvitations.length}
            </span>
          </h2>
        </div>

        {pendingOrgInvitations.length === 0 ? (
          <div className="bg-white border-2 border-dashed border-slate-200 rounded-3xl p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0056D2] flex items-center justify-center mx-auto">
              <Building2 className="w-7 h-7" />
            </div>
            <div className="max-w-md mx-auto space-y-1.5">
              <h3 className="text-base font-bold text-slate-900">
                Awaiting Organization Invitation
              </h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                Organizations invite instructors directly to join their teaching
                faculty. When an institution invites you, their invitation will
                appear here for you to accept.
              </p>
            </div>

            {/* Helper to share email */}
            {instructor?.email && (
              <div className="pt-2">
                <div className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs">
                  <span className="text-slate-500 font-medium">
                    Your registered email:
                  </span>
                  <span className="font-bold text-slate-800">
                    {instructor.email}
                  </span>
                  <button
                    type="button"
                    onClick={handleCopyEmail}
                    className="p-1 hover:bg-slate-200 rounded-md text-slate-600 transition-colors"
                    title="Copy email"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {copied && (
                    <span className="text-[10px] text-emerald-600 font-bold">
                      Copied!
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="space-y-3">
            {pendingOrgInvitations.map((inv) => (
              <div
                key={inv.id}
                className="bg-white border border-blue-200 hover:border-blue-400 rounded-2xl p-5 shadow-xs space-y-4 transition-all"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-200/60 flex items-center justify-center text-[#0056D2] shrink-0 font-extrabold text-lg">
                      <Building2 className="w-6 h-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">
                          {inv.organizationName}
                        </h3>
                        <StatusPill status="Pending Response" />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Invited on {inv.submittedDate || fmt(inv.createdAt)}
                      </p>
                    </div>
                  </div>
                </div>

                {inv.description && (
                  <p className="text-xs text-slate-700 bg-slate-50/80 rounded-xl p-3 border border-slate-100 leading-relaxed">
                    “{inv.description}”
                  </p>
                )}

                {inv.proposedTerms && (
                  <div className="text-xs text-slate-600 bg-blue-50/50 rounded-xl p-2.5 border border-blue-100 flex items-center gap-2">
                    <span className="font-bold text-[#0056D2]">
                      Proposed Terms:
                    </span>
                    <span>{inv.proposedTerms}</span>
                  </div>
                )}

                {confirmDecline === inv.id ? (
                  <div className="flex items-center justify-between gap-3 p-3 rounded-xl bg-rose-50 border border-rose-200">
                    <p className="text-xs font-semibold text-rose-900">
                      Decline this faculty invitation?
                    </p>
                    <div className="flex gap-2">
                      <button
                        type="button"
                        onClick={() => setConfirmDecline(null)}
                        className="px-3 py-1.5 rounded-lg bg-white border border-slate-200 text-xs font-semibold text-slate-700 hover:bg-slate-50"
                      >
                        Keep
                      </button>
                      <button
                        type="button"
                        disabled={actionLoading}
                        onClick={() => {
                          setConfirmDecline(null);
                          act(
                            () => declineOrgInvitation(inv.id),
                            'Faculty invitation declined.'
                          );
                        }}
                        className="px-3 py-1.5 rounded-lg bg-rose-600 text-white text-xs font-bold hover:bg-rose-700"
                      >
                        Decline
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex justify-end gap-2.5 pt-1">
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() => setConfirmDecline(inv.id)}
                      className="px-4 py-2 rounded-xl border border-rose-200 text-rose-700 hover:bg-rose-50 text-xs font-bold flex items-center gap-1.5 transition-colors"
                    >
                      <X className="w-4 h-4" /> Decline
                    </button>
                    <button
                      type="button"
                      disabled={actionLoading}
                      onClick={() =>
                        act(
                          () => acceptOrgInvitation(inv.id),
                          `You joined ${inv.organizationName}! Your faculty tools and courses are now unlocked.`
                        )
                      }
                      className="px-5 py-2 rounded-xl bg-[#0056D2] hover:bg-[#00419E] text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors"
                    >
                      {actionLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Check className="w-4 h-4" />
                      )}
                      Accept & Join Faculty
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </section>

      {/* ── Organization Association History ── */}
      {orgHistory.length > 0 && (
        <section className="space-y-3 pt-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <History className="w-4 h-4 text-slate-400" />
            <span>Invitation History</span>
          </h2>
          <div className="bg-white border border-slate-200 rounded-2xl divide-y divide-slate-100 overflow-hidden shadow-2xs">
            {orgHistory.map((r) => (
              <div
                key={r.id}
                className="px-4 py-3 flex items-center justify-between gap-3 text-xs"
              >
                <div className="min-w-0">
                  <p className="font-semibold text-slate-900 truncate">
                    {r.organizationName} — Faculty Invitation
                  </p>
                  <p className="text-slate-400 text-[11px]">
                    {fmt(r.respondedAt || r.updatedAt || r.createdAt)}
                  </p>
                </div>
                <StatusPill status={r.status} />
              </div>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

export default ConnectUniversity;
