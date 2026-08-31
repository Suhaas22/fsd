import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft,
  Mail,
  Send,
  RotateCcw,
  Bell,
  Calendar,
  BookOpen,
  GraduationCap
} from 'lucide-react';
import OrgLayout from '../../components/organization/OrgLayout';
import { useOrg } from '../../context/OrgContext';
import { useToast } from '../../components/common/Toast';

export default function InstructorRequestDetails() {
  const { id } = useParams();
  const { addToast } = useToast();
  const { instructorRequests } = useOrg();

  const request = instructorRequests.find(r => r.id === id) || instructorRequests[0];

  const isAccepted = request?.status?.includes('Accepted');
  const isPending = request?.status?.includes('Pending');

  const handleResendMail = () => {
    addToast(`Resent course teaching request email to ${request.email}!`, 'info');
  };

  return (
    <OrgLayout
      breadcrumbs={[
        { label: 'Course Teaching Requests', path: '/instructor-requests' },
        { label: request.name }
      ]}
    >
      <div className="max-w-5xl mx-auto space-y-6">
        <Link to="/instructor-requests" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Teaching Requests</span>
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <div className="lg:col-span-8 space-y-6">
            
            {/* Header Card */}
            <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 md:p-8 shadow-elevation-1">
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 pb-6 border-b border-outline-variant">
                <img src={request.avatar} alt={request.name} className="w-20 h-20 rounded-3xl object-cover shadow-sm flex-shrink-0" />
                <div className="space-y-1">
                  <div className="flex items-center gap-3">
                    <h1 className="text-xl md:text-2xl font-bold text-on-surface">{request.name}</h1>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      isAccepted ? 'bg-emerald-100 text-emerald-800' :
                      isPending ? 'bg-amber-100 text-amber-900' : 'bg-red-100 text-red-800'
                    }`}>
                      {request.status}
                    </span>
                  </div>
                  <p className="text-xs text-primary font-bold">{request.specialization}</p>
                  <p className="text-xs text-outline">
                    Dispatched on {request.sentDate || request.submittedDate} • Recipient: {request.email}
                  </p>
                </div>
              </div>

              {/* Outreach Banner */}
              <div className="mt-6 p-4 rounded-2xl bg-indigo-50/80 border border-indigo-200/80 space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-primary text-white flex items-center justify-center">
                    <Mail className="w-4 h-4" />
                  </div>
                  <span className="text-xs font-bold text-indigo-950 uppercase tracking-wider">
                    College Teaching Assignment Notification
                  </span>
                </div>
                <p className="text-xs text-indigo-900 leading-relaxed pl-9">
                  {request.description}
                </p>
                <div className="pl-9 flex flex-wrap gap-4 text-[11px] text-indigo-800 pt-1 font-medium">
                  <span>Professor Email: <strong>{request.email}</strong></span>
                  <span>Semester: <strong>{request.semester || 'Fall 2026'}</strong></span>
                  <span>Tracking: <strong>{request.trackingStatus}</strong></span>
                </div>
              </div>

              {/* Course Assignment Details */}
              <div className="py-6 border-b border-outline-variant space-y-4">
                <h2 className="text-xs font-bold text-outline uppercase tracking-wider">Course Assignment Specification</h2>
                <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/60 space-y-2">
                  <h3 className="text-sm font-bold text-on-surface">{request.courseTitle || request.sampleSyllabus}</h3>
                  <p className="text-xs text-on-surface-variant leading-relaxed">
                    {request.sampleSyllabus}
                  </p>
                  <div className="flex items-center gap-4 text-xs font-semibold pt-1">
                    <span className="text-primary">{request.creditHours || '4 Credits'}</span>
                    <span className="text-emerald-700">{request.proposedTerms}</span>
                  </div>
                </div>
              </div>

              {/* Faculty Bio */}
              <div className="pt-6 space-y-2">
                <h2 className="text-xs font-bold text-outline uppercase tracking-wider">College Faculty Profile</h2>
                <p className="text-xs text-on-surface leading-relaxed">{request.bio}</p>
              </div>

            </div>
          </div>

          {/* Right Action Panel */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-elevation-1 space-y-5">
              <h2 className="text-base font-bold text-on-surface pb-3 border-b border-outline-variant">
                Request Status & Actions
              </h2>

              <div className="space-y-2 text-xs">
                <span className="text-[10px] text-outline uppercase font-bold tracking-wider block">Decision Status</span>
                <p className="font-bold text-on-surface bg-surface-container-low p-3 rounded-xl border border-outline-variant/60">
                  {request.status}
                </p>
                <p className="text-[11px] text-outline">
                  {isAccepted
                    ? 'Professor accepted this teaching assignment. The college has been officially notified and the course is scheduled.'
                    : isPending
                    ? 'Awaiting instructor response. The instructor will review and make their choice via their official email link.'
                    : 'Professor declined this teaching request.'}
                </p>
              </div>

              <div className="space-y-2.5 pt-2">
                {isPending && (
                  <button
                    onClick={handleResendMail}
                    className="w-full py-2.5 px-4 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary font-bold text-xs border border-outline-variant flex items-center justify-center gap-2 transition-colors"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Resend Request Notification</span>
                  </button>
                )}

                <Link
                  to={`/instructors/${request.instructorId || 'inst-1'}`}
                  className="w-full py-2.5 px-4 rounded-xl bg-primary hover:bg-primary-container text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors"
                >
                  <GraduationCap className="w-4 h-4" />
                  <span>View Instructor Full Profile</span>
                </Link>
              </div>
            </div>
          </div>
        </div>

      </div>
    </OrgLayout>
  );
}
