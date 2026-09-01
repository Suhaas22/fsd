import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, 
  ArrowRight, 
  Clock, 
  Flame, 
  BookOpen, 
  Award, 
  Sparkles, 
  ChevronRight,
  Target,
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

  const activeCourse = allCourses[0] || {
    id: 'crs-1',
    title: 'Advanced Enterprise Architecture & Payment Systems',
    subtitle: 'Master distributed consensus protocols and cloud banking networks.',
    category: 'Cloud Architecture',
    institution: 'Stanford University',
    progress: 72,
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
      <div className="w-full max-w-[1560px] mx-auto px-4 md:px-8 lg:px-12 py-6 space-y-8">
        
        {/* Welcome Banner */}
        <section className="w-full bg-gradient-to-r from-[#0B1E36] via-[#163B66] to-[#1E4E8C] text-white rounded-3xl p-6 md:p-8 lg:p-10 shadow-elevation-2 relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-12 -translate-y-12 w-96 h-96 bg-white/5 rounded-full blur-3xl pointer-events-none"></div>
          <div className="absolute bottom-0 left-1/3 transform w-80 h-80 bg-blue-400/5 rounded-full blur-2xl pointer-events-none"></div>

          <div className="relative z-10 max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-3.5">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-bold text-primary-fixed border border-white/20 shadow-xs">
                <Sparkles className="w-3.5 h-3.5 text-tertiary-fixed" />
                <span>NexusPay Enterprise LMS</span>
              </div>

              {/* Membership Status Badge & Join Button */}
              {membershipStatus === 'Verified Student' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-400/30 text-[11px] font-bold">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span>Official Student of {universityName}</span>
                </span>
              ) : membershipStatus === 'Pending Organization Approval' ? (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/30 text-[11px] font-bold">
                  <Clock3 className="w-3.5 h-3.5 animate-spin" />
                  <span>Pending Approval: {universityName}</span>
                </span>
              ) : (
                <button
                  onClick={() => setShowOrgModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-indigo-500/30 hover:bg-indigo-500/50 text-indigo-200 border border-indigo-400/40 text-[11px] font-bold transition-all shadow-xs"
                >
                  <Building2 className="w-3.5 h-3.5 text-indigo-300" />
                  <span>Join an Organization to become a Student →</span>
                </button>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-2 tracking-tight">
              Welcome back, {firstName}!
            </h1>
            <p className="text-on-primary-container text-xs md:text-sm leading-relaxed mb-6 font-normal max-w-2xl">
              {membershipStatus === 'Verified Student'
                ? `You are an officially enrolled student of ${universityName}. Access specialized departmental curricula and university credentials.`
                : membershipStatus === 'Pending Organization Approval'
                ? `Your request to join ${universityName} as an official student is currently being reviewed by organization administration.`
                : `You are currently browsing as an Independent Learner. Click "Join an Organization" to request official student enrollment with a university.`}
            </p>

            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/player"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-white text-primary text-xs font-bold hover:bg-surface-container-low shadow-sm transition-all hover:scale-[1.02]"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume Lesson 2.3</span>
              </Link>
              <Link
                to="/my-learning"
                className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all backdrop-blur-sm"
              >
                <span>Enrolled Tracks ({enrollments.length || profile?.enrolledCourses || 5})</span>
              </Link>
              {membershipStatus === 'Independent Learner' && (
                <button
                  onClick={() => setShowOrgModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold shadow-md transition-all"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Join Organization</span>
                </button>
              )}
            </div>
          </div>

          {/* Stat Badges Row */}
          <div className="mt-8 pt-6 border-t border-white/15 grid grid-cols-2 sm:grid-cols-4 gap-4 relative z-10">
            <div className="flex items-center gap-3.5 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/15 shadow-xs hover:bg-white/15 transition-all">
              <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center shadow-xs">
                <Flame className="w-5 h-5 text-tertiary-fixed fill-current" />
              </div>
              <div>
                <p className="text-lg font-bold leading-tight">{profile?.streakDays || 14} Days</p>
                <p className="text-[11px] text-primary-fixed font-medium mt-0.5">Daily Streak</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/15 shadow-xs hover:bg-white/15 transition-all">
              <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center shadow-xs">
                <Target className="w-5 h-5 text-secondary-fixed" />
              </div>
              <div>
                <p className="text-lg font-bold leading-tight">{profile?.completedHoursThisWeek || 8.5} / {profile?.weeklyGoalHours || 10}h</p>
                <p className="text-[11px] text-primary-fixed font-medium mt-0.5">Weekly Goal</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/15 shadow-xs hover:bg-white/15 transition-all">
              <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center shadow-xs">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div>
                <p className="text-lg font-bold leading-tight">{enrollments.length || 5} Tracks</p>
                <p className="text-[11px] text-primary-fixed font-medium mt-0.5">Active Study</p>
              </div>
            </div>

            <div className="flex items-center gap-3.5 bg-white/10 p-4 rounded-2xl backdrop-blur-md border border-white/15 shadow-xs hover:bg-white/15 transition-all">
              <div className="w-11 h-11 rounded-xl bg-white/15 flex items-center justify-center shadow-xs">
                <Award className="w-5 h-5 text-tertiary-fixed-dim" />
              </div>
              <div>
                <p className="text-lg font-bold leading-tight">{profile?.certificatesCount || 2} Earned</p>
                <p className="text-[11px] text-primary-fixed font-medium mt-0.5">Certificates</p>
              </div>
            </div>
          </div>
        </section>

        {/* Continue Learning Featured Card */}
        <section className="w-full">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h2 className="text-lg font-bold text-on-surface">Continue Learning</h2>
              <p className="text-xs text-on-surface-variant">Your current active professional specialization track</p>
            </div>
            <Link
              to="/course-progress"
              className="text-xs font-bold text-primary hover:underline flex items-center gap-1"
            >
              <span>Milestones</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="w-full bg-surface-container-lowest border border-outline-variant/80 rounded-3xl p-6 shadow-elevation-1 hover:shadow-elevation-2 transition-all">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              
              <div className="w-full lg:w-96 h-52 rounded-2xl overflow-hidden flex-shrink-0 bg-surface-container relative shadow-sm">
                <img
                  src={activeCourse.thumbnail || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80'}
                  alt={activeCourse.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent flex items-end p-3.5">
                  <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md text-[11px] font-bold text-white">
                    {activeCourse.currentModule || 'Module 1: Foundations'}
                  </span>
                </div>
              </div>

              <div className="flex-1 w-full flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="primary" size="sm">{activeCourse.category || 'Architecture'}</Badge>
                    <span className="text-xs text-outline font-medium">{activeCourse.institution || 'Stanford University'}</span>
                  </div>

                  <h3 className="text-lg md:text-xl font-bold text-on-surface mb-1.5">
                    {activeCourse.title}
                  </h3>
                  <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                    {activeCourse.description || activeCourse.subtitle}
                  </p>
                </div>

                <div className="space-y-3.5">
                  <LinearProgressBar 
                    progress={activeCourse.progress || 72} 
                    showLabel={true}
                    color="bg-primary"
                    height="h-2"
                  />

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 border-t border-outline-variant/60">
                    <div className="flex items-center gap-3 text-xs text-on-surface-variant font-medium">
                      <span className="flex items-center gap-1.5 text-on-surface font-semibold">
                        <Clock className="w-3.5 h-3.5 text-primary" /> Next Up: 2.3 State Management in NexusPay (10m)
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Link
                        to="/quiz"
                        className="px-4 py-2 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-semibold text-on-surface transition-colors"
                      >
                        Take Module Quiz
                      </Link>
                      <Link
                        to="/player"
                        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container shadow-xs transition-all"
                      >
                        <Play className="w-3.5 h-3.5 fill-current" />
                        <span>Resume Lesson</span>
                      </Link>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          </div>
        </section>

        {/* In Progress Grid */}
        <section className="w-full">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h2 className="text-lg font-bold text-on-surface">In Progress</h2>
              <p className="text-xs text-on-surface-variant font-normal">Pick up where you left off across enrolled tracks</p>
            </div>
            <Link to="/my-learning" className="text-xs font-bold text-primary hover:underline">
              View All Enrolled ({inProgressCourses.length + 1}) →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inProgressCourses.map((course) => (
              <CourseCard key={course.id} course={course} variant="in-progress" />
            ))}
          </div>
        </section>

        {/* Recommended For You Section */}
        <section className="w-full">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h2 className="text-lg font-bold text-on-surface">Recommended For You</h2>
              <p className="text-xs text-on-surface-variant font-normal">Based on your fintech architecture and cloud specialization</p>
            </div>
            <Link to="/explore" className="text-xs font-bold text-primary hover:underline flex items-center gap-1">
              <span>Explore All Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedCourses.map((course) => (
              <CourseCard key={course.id} course={course} variant="explore" />
            ))}
          </div>
        </section>

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
