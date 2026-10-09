import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, 
  ArrowRight, 
  Clock, 
  BookOpen, 
  Award, 
  Sparkles, 
  Building2,
  CheckCircle2,
  Clock3,
  UserCheck
} from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import CourseCard from '../../components/common/CourseCard';
import Badge from '../../components/common/Badge';
import { LinearProgressBar } from '../../components/common/ProgressBar';
import api from '../../services/api';

export default function Dashboard() {
  const [profile, setProfile] = useState(null);
  const [enrollments, setEnrollments] = useState([]);
  const [allCourses, setAllCourses] = useState([]);
  const [orgsList, setOrgsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showOrgModal, setShowOrgModal] = useState(false);
  const [selectedOrg, setSelectedOrg] = useState(null);
  const [submittingOrg, setSubmittingOrg] = useState(false);

  const fetchProfile = async () => {
    try {
      const p = await api.student.getProfile('lrn-1').catch(() => null);
      if (p) setProfile(p);
    } catch (e) {}
  };

  useEffect(() => {
    Promise.all([
      api.student.getProfile('lrn-1').catch(() => null),
      api.student.getEnrollments('lrn-1').catch(() => []),
      api.courses.list().catch(() => []),
      api.student.getOrganizations().catch(() => []),
    ])
      .then(([p, e, c, o]) => {
        setProfile(p || {
          name: 'Alex Chen',
          streakDays: 14,
          weeklyGoalHours: 10,
          completedHoursThisWeek: 8.5,
          enrolledCourses: 5,
          certificatesEarned: 2,
          orgMembershipStatus: 'Independent Learner',
          university: 'Independent Learner',
        });
        setEnrollments(Array.isArray(e) ? e : []);
        setAllCourses(Array.isArray(c) ? c : (c?.items || []));
        setOrgsList(Array.isArray(o) ? o : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load student dashboard:', err);
        setLoading(false);
      });
  }, []);

  const handleRequestJoinOrg = async () => {
    if (!selectedOrg) return;
    try {
      setSubmittingOrg(true);
      await api.student.joinOrganization(selectedOrg.id, selectedOrg.name, 'lrn-1');
      setShowOrgModal(false);
      await fetchProfile();
    } catch (err) {
      alert('Failed to submit request: ' + err.message);
    } finally {
      setSubmittingOrg(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent"></div>
        </div>
      </PageLayout>
    );
  }

  const activeEnrollment = enrollments.find((enrollment) => enrollment.status !== 'Completed') || enrollments[0];
  const activeCourseData = allCourses.find((course) => course.id === activeEnrollment?.courseId) || allCourses[0];
  const activeCourse = activeCourseData ? {
    ...activeCourseData,
    progress: activeEnrollment?.progress ?? activeCourseData.progress ?? 0,
  } : {
    id: 'crs-1',
    title: 'Advanced Enterprise Architecture & Payment Systems',
    subtitle: 'Master distributed consensus protocols and cloud banking networks.',
    category: 'Cloud Architecture',
    institution: 'Stanford University',
    progress: activeEnrollment?.progress ?? 0,
    currentModule: 'Module 2: Cloud Multi-Region Failover',
    thumbnail: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80',
  };

  const inProgressCourses = allCourses.slice(1, 4);
  const recommendedCourses = allCourses.slice(0, 4);

  const studentName = profile?.name || 'Alex Chen';
  const firstName = studentName.split(' ')[0];
  const membershipStatus = profile?.orgMembershipStatus || (profile?.university && profile?.university !== 'Independent Learner' ? 'Verified Student' : 'Independent Learner');
  const universityName = profile?.requestedOrgName || profile?.university || 'Stanford University';

  return (
    <PageLayout>
      <div className="w-full max-w-[1280px] mx-auto px-4 md:px-8 py-6 space-y-8">
        
        {/* Welcome Section Header */}
        <section className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-outline-variant/60">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-2.5 py-0.5 rounded bg-[#E8EDF5] text-[#0056D2] font-label-md text-xs font-bold uppercase tracking-wider">
                NexusPay Learning
              </span>
              {membershipStatus === 'Verified Student' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-semibold">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Official Student of {universityName}</span>
                </span>
              ) : membershipStatus === 'Pending Organization Approval' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200 text-xs font-semibold">
                  <Clock3 className="w-3.5 h-3.5" />
                  <span>Pending Approval: {universityName}</span>
                </span>
              ) : (
                <button
                  onClick={() => setShowOrgModal(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary border border-primary/20 text-xs font-semibold transition-colors"
                >
                  <Building2 className="w-3.5 h-3.5" />
                  <span>Join an Organization →</span>
                </button>
              )}
            </div>

            <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-on-surface tracking-tight">
              Welcome back, {firstName}!
            </h1>
            <p className="font-body-lg text-sm text-on-surface-variant mt-1">
              Continue where you left off in your professional specialization tracks.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/student/my-learning"
              className="px-4 py-2 rounded-lg border border-outline-variant hover:bg-surface-container text-xs font-bold text-on-surface transition-colors"
            >
              Enrolled Tracks ({enrollments.length || 5})
            </Link>
            <Link
              to="/student/player"
              className="inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-primary hover:bg-primary-container text-white text-xs font-bold shadow-sm transition-all"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Resume Lesson</span>
            </Link>
          </div>
        </section>

        {/* Main Two-Column Layout */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">
          
          {/* Left Column (Primary Content) */}
          <div className="flex-1 w-full space-y-8">
            
            {/* Primary Continue Learning Featured Card (Stitch style) */}
            <section className="bg-surface-container-lowest rounded-xl shadow-ambient hover:shadow-hover border border-outline-variant/80 overflow-hidden flex flex-col sm:flex-row transition-all group">
              <div className="w-full sm:w-72 h-48 sm:h-auto relative shrink-0 overflow-hidden bg-surface-container">
                <img
                  src={activeCourse.thumbnail || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80'}
                  alt={activeCourse.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent flex items-end p-3">
                  <span className="text-white text-[11px] font-bold bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded">
                    {activeCourse.currentModule || 'Module 2 of 4'}
                  </span>
                </div>
              </div>

              <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="font-label-md text-xs font-semibold text-primary uppercase tracking-wider">
                      {activeCourse.category || 'Cloud Architecture'} • {activeCourse.institution || 'Stanford University'}
                    </span>
                    <span className="hidden sm:inline-block font-label-md text-xs bg-surface-container-high px-2 py-0.5 rounded text-on-surface-variant font-medium">
                      In Progress
                    </span>
                  </div>

                  <Link to={`/student/course/${activeCourse.id || 'crs-1'}`}>
                    <h2 className="font-headline-md text-lg md:text-xl font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-2 mb-2">
                      {activeCourse.title}
                    </h2>
                  </Link>

                  <p className="font-body-md text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                    {activeCourse.description || activeCourse.subtitle}
                  </p>
                </div>

                <div>
                  <div className="flex justify-between font-label-md text-xs text-on-surface-variant mb-2 font-medium">
                    <span>Course Progress</span>
                    <span className="text-primary font-bold">{activeCourse.progress ?? 45}%</span>
                  </div>

                  <div className="w-full bg-surface-container-high rounded-full h-2 mb-4 overflow-hidden">
                    <div 
                      className="bg-primary h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${activeCourse.progress ?? 45}%` }}
                    ></div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Link
                      to="/student/player"
                      className="inline-flex items-center gap-2 bg-primary hover:bg-primary-container text-white font-title-md text-xs font-bold px-5 py-2.5 rounded-lg shadow-sm transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Resume Course</span>
                    </Link>

                    <Link
                      to="/student/quiz"
                      className="px-4 py-2.5 rounded-lg border border-outline-variant hover:bg-surface-container text-xs font-bold text-on-surface transition-colors"
                    >
                      Module Quiz
                    </Link>

                    <Link
                      to={`/student/course-progress/${activeCourse.id || 'crs-1'}`}
                      state={{ courseId: activeCourse.id }}
                      className="text-xs font-bold text-primary hover:underline ml-auto flex items-center gap-1"
                    >
                      <span>Syllabus</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </section>

            {/* In Progress Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-headline-md text-lg font-bold text-on-surface">In Progress</h2>
                  <p className="text-xs text-on-surface-variant">Continue your active learning coursework</p>
                </div>
                <Link to="/student/my-learning" className="font-title-md text-xs font-bold text-primary hover:underline">
                  View All Enrolled ({inProgressCourses.length + 1}) →
                </Link>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {inProgressCourses.map((course) => (
                  <CourseCard key={course.id} course={course} variant="in-progress" />
                ))}
              </div>
            </section>

            {/* Recommended For You Section */}
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-headline-md text-lg font-bold text-on-surface">Recommended For You</h2>
                  <p className="text-xs text-on-surface-variant">Curated for financial engineering & distributed systems careers</p>
                </div>
                <Link to="/student/explore" className="font-title-md text-xs font-bold text-primary hover:underline flex items-center gap-1">
                  <span>Explore Catalog</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {recommendedCourses.slice(0, 2).map((course) => (
                  <CourseCard key={course.id} course={course} variant="explore" showBookmark={false} />
                ))}
              </div>
            </section>

          </div>

          {/* Right Column: Stitch Sticky Sidebar (320px) */}
          <aside className="w-full lg:w-80 shrink-0 space-y-6 lg:sticky lg:top-24">
            
            {/* Upcoming Deadlines Widget (Stitch) */}
            <div className="bg-surface-container-lowest rounded-xl shadow-ambient border border-outline-variant/80 p-5">
              <h3 className="font-title-lg text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
                <Clock className="w-4 h-4 text-outline" />
                <span>Upcoming Deadlines</span>
              </h3>

              <ul className="flex flex-col gap-4">
                <li className="flex gap-3 items-start group cursor-pointer">
                  <div className="w-2 h-2 rounded-full bg-red-500 mt-1.5 shrink-0"></div>
                  <div>
                    <h4 className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">
                      Lab Assessment 3: Two-Phase Commit
                    </h4>
                    <p className="text-[11px] font-semibold text-red-600 mt-0.5">Today, 11:59 PM</p>
                    <p className="text-[11px] text-outline mt-0.5">Advanced Architecture</p>
                  </div>
                </li>

                <li className="flex gap-3 items-start group cursor-pointer">
                  <div className="w-2 h-2 rounded-full bg-[#F5C518] mt-1.5 shrink-0"></div>
                  <div>
                    <h4 className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">
                      Peer Review: Consensus Logs
                    </h4>
                    <p className="text-[11px] font-medium text-amber-700 mt-0.5">Tomorrow, 5:00 PM</p>
                    <p className="text-[11px] text-outline mt-0.5">Distributed Systems</p>
                  </div>
                </li>

                <li className="flex gap-3 items-start group cursor-pointer">
                  <div className="w-2 h-2 rounded-full bg-primary mt-1.5 shrink-0"></div>
                  <div>
                    <h4 className="text-xs font-bold text-on-surface group-hover:text-primary transition-colors">
                      Final Certification Exam
                    </h4>
                    <p className="text-[11px] font-medium text-on-surface-variant mt-0.5">In 4 Days</p>
                    <p className="text-[11px] text-outline mt-0.5">Stanford Financial Systems</p>
                  </div>
                </li>
              </ul>
            </div>

            {/* Weekly Goal Progress Widget (Stitch) */}
            <div className="bg-surface-container-lowest rounded-xl shadow-ambient border border-outline-variant/80 p-5">
              <h3 className="font-title-lg text-sm font-bold text-on-surface mb-4 flex items-center gap-2">
                <Award className="w-4 h-4 text-primary" />
                <span>Weekly Goal</span>
              </h3>

              <div className="flex items-center gap-4 mb-4">
                <div className="relative w-14 h-14 flex items-center justify-center shrink-0">
                  <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
                    <path
                      className="text-surface-container-high"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3.5"
                    />
                    <path
                      className="text-primary"
                      d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                      fill="none"
                      stroke="currentColor"
                      strokeDasharray="75, 100"
                      strokeWidth="3.5"
                    />
                  </svg>
                  <span className="absolute text-xs font-bold text-on-surface">3/4</span>
                </div>

                <div>
                  <p className="text-xs font-bold text-on-surface">3 Days Learning</p>
                  <p className="text-[11px] text-outline mt-0.5">1 day left to meet weekly goal</p>
                </div>
              </div>

              <div className="pt-3 border-t border-outline-variant/60 flex items-center justify-between text-xs">
                <span className="text-outline font-medium">Learning Streak:</span>
                <span className="font-bold text-amber-600 flex items-center gap-1">
                  🔥 14 Days Active
                </span>
              </div>
            </div>

            {/* Verified Credentials Quick Summary */}
            <div className="bg-gradient-to-br from-[#002554] to-[#0056D2] text-white rounded-xl p-5 shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-200">Accredited Credentials</span>
                <Award className="w-4 h-4 text-amber-300" />
              </div>
              <h4 className="text-base font-bold leading-tight">
                {profile?.certificatesCount || 2} Verified Certificates Earned
              </h4>
              <p className="text-xs text-blue-100 leading-relaxed">
                Stanford & MIT verified digital credentials ready to share on LinkedIn.
              </p>
              <Link
                to="/student/certificates"
                className="inline-block w-full text-center py-2 rounded-lg bg-white text-[#0056D2] text-xs font-bold hover:bg-blue-50 transition-colors shadow-xs"
              >
                View Credential Ledger →
              </Link>
            </div>

          </aside>

        </div>

      </div>

      {/* JOIN ORGANIZATION MODAL */}
      {showOrgModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Building2 className="w-5 h-5 text-indigo-600" />
                <span>Join an Organization to become a Student</span>
              </div>
              <button onClick={() => setShowOrgModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">✕</button>
            </div>

            <p className="text-xs text-slate-500">
              Select an accredited university or enterprise organization. Submitting a request sends your profile to the Organization Admin for student membership verification.
            </p>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {orgsList.map((org) => (
                <div
                  key={org.id}
                  onClick={() => setSelectedOrg(org)}
                  className={`p-3.5 rounded-2xl border cursor-pointer transition-all ${
                    selectedOrg?.id === org.id
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">{org.name}</h4>
                      <p className="text-[11px] text-slate-500">{org.location} • {org.domain || 'edu'}</p>
                    </div>
                    {selectedOrg?.id === org.id && <CheckCircle2 className="w-5 h-5 text-indigo-600" />}
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowOrgModal(false)}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedOrg || submittingOrg}
                onClick={handleRequestJoinOrg}
                className="px-5 py-2 text-xs font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 rounded-xl shadow-sm transition-all"
              >
                {submittingOrg ? 'Submitting...' : 'Submit Join Request'}
              </button>
            </div>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
