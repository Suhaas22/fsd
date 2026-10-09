// =========================================================================================
// FDFED M2026 - Student Module: Student Dashboard
// Design: Enhanced Coursera-Style Academic Precision Dashboard (Preserving All Original Layouts)
// Author: Student Portal Implementation | IIIT Sri City
// =========================================================================================

import React, { useState, useEffect, useMemo } from 'react';
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
  UserCheck,
  ChevronRight,
  Flame,
  Target,
  Calendar,
  X,
  Search
} from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import CourseCard from '../../components/common/CourseCard';
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
  const [orgSearchQuery, setOrgSearchQuery] = useState('');
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

  const filteredOrgs = useMemo(() => {
    if (!orgSearchQuery.trim()) return orgsList;
    const q = orgSearchQuery.toLowerCase();
    return orgsList.filter(o => 
      o.name?.toLowerCase().includes(q) || 
      o.location?.toLowerCase().includes(q) ||
      o.domain?.toLowerCase().includes(q)
    );
  }, [orgsList, orgSearchQuery]);

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-coursera border-t-transparent"></div>
        </div>
      </PageLayout>
    );
  }

  const activeEnrollment = enrollments.find((enrollment) => enrollment.status !== 'Completed') || enrollments[0];
  const activeCourseData = allCourses.find((course) => course.id === activeEnrollment?.courseId) || allCourses[0];
  const activeCourse = activeCourseData ? {
    ...activeCourseData,
    progress: activeEnrollment?.progress ?? activeCourseData.progress ?? 65,
  } : {
    id: 'crs-1',
    title: 'Advanced Enterprise Architecture & Payment Systems',
    subtitle: 'Master distributed consensus protocols and cloud banking networks.',
    category: 'Cloud Architecture',
    institution: 'Stanford University',
    progress: activeEnrollment?.progress ?? 65,
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
      <div className="w-full max-w-[1560px] mx-auto px-4 md:px-8 lg:px-12 py-8 space-y-8 bg-[#F8FAFC] min-h-screen">
        
        {/* Welcome Banner (Original Layout, Polished Coursera Deep Blue Gradient with Enhanced Stat Tiles) */}
        <section className="w-full bg-gradient-to-r from-[#002554] via-[#0040A1] to-[#0056D2] text-white rounded-2xl p-6 md:p-8 lg:p-10 shadow-md relative overflow-hidden">
          {/* Subtle Ambient Decorative Circles */}
          <div className="absolute -right-20 -top-20 w-80 h-80 rounded-full bg-white/5 pointer-events-none blur-2xl"></div>
          <div className="absolute right-40 -bottom-20 w-64 h-64 rounded-full bg-blue-400/10 pointer-events-none blur-xl"></div>

          <div className="relative z-10 max-w-4xl">
            
            {/* Status Pill */}
            <div className="mb-4">
              {membershipStatus === 'Verified Student' ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/20 text-emerald-200 border border-emerald-400/30 text-xs font-semibold backdrop-blur-sm">
                  <UserCheck className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Official Student • {universityName}</span>
                </div>
              ) : membershipStatus === 'Pending Organization Approval' ? (
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-200 border border-amber-400/30 text-xs font-semibold backdrop-blur-sm">
                  <Clock3 className="w-3.5 h-3.5 text-amber-300" />
                  <span>Pending Approval: {universityName}</span>
                </div>
              ) : (
                <button
                  onClick={() => setShowOrgModal(true)}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/15 hover:bg-white/25 text-white border border-white/25 text-xs font-semibold transition-all shadow-xs backdrop-blur-sm"
                >
                  <Building2 className="w-3.5 h-3.5 text-blue-200" />
                  <span>Join an Organization to become a Student →</span>
                </button>
              )}
            </div>

            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-2 tracking-tight">
              Welcome back, {firstName}!
            </h1>
            <p className="text-blue-100 text-xs md:text-sm leading-relaxed mb-6 font-normal max-w-2xl">
              {membershipStatus === 'Verified Student'
                ? `You are an officially enrolled student of ${universityName}. Access specialized departmental curricula and verified university credentials.`
                : membershipStatus === 'Pending Organization Approval'
                ? `Your request to join ${universityName} as an official student is currently being reviewed by organization administration.`
                : `You are currently browsing as an Independent Learner. Click "Join an Organization" to request official student enrollment with a university.`}
            </p>

            {/* Banner Action Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                to="/student/player"
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white text-[#0040A1] text-xs font-bold hover:bg-blue-50 shadow-sm transition-all hover:scale-[1.01]"
              >
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Resume Lesson 2.3</span>
              </Link>
              <Link
                to="/student/my-learning"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold border border-white/20 transition-all backdrop-blur-sm"
              >
                <span>Enrolled Tracks ({enrollments.length || profile?.enrolledCourses || 5})</span>
              </Link>
              {membershipStatus === 'Independent Learner' && (
                <button
                  onClick={() => setShowOrgModal(true)}
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md transition-all"
                >
                  <Building2 className="w-4 h-4" />
                  <span>Join Organization</span>
                </button>
              )}
            </div>
          </div>

          {/* Enhanced 4-Tile Stat Grid (Original Design Precision) */}
          <div className="mt-8 pt-6 border-t border-white/15 grid grid-cols-2 lg:grid-cols-4 gap-3.5 relative z-10">
            <div className="flex items-center gap-3 bg-white/10 p-3.5 rounded-xl backdrop-blur-md border border-white/15 shadow-xs hover:bg-white/15 transition-all">
              <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center shadow-xs flex-shrink-0">
                <BookOpen className="w-5 h-5 text-white" />
              </div>
              <div className="min-w-0">
                <p className="text-base font-bold leading-tight">{enrollments.length || 5} Tracks</p>
                <p className="text-xs text-blue-200 font-medium mt-0.5 truncate">Active Study</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/10 p-3.5 rounded-xl backdrop-blur-md border border-white/15 shadow-xs hover:bg-white/15 transition-all">
              <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center shadow-xs flex-shrink-0">
                <Award className="w-5 h-5 text-amber-300" />
              </div>
              <div className="min-w-0">
                <p className="text-base font-bold leading-tight">{profile?.certificatesCount || 2} Earned</p>
                <p className="text-xs text-blue-200 font-medium mt-0.5 truncate">Certificates</p>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/10 p-3.5 rounded-xl backdrop-blur-md border border-white/15 shadow-xs hover:bg-white/15 transition-all">
              <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center shadow-xs flex-shrink-0">
                <Target className="w-5 h-5 text-emerald-300" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-base font-bold leading-tight">{profile?.completedHoursThisWeek || 8.5} / {profile?.weeklyGoalHours || 10}h</p>
                <div className="w-full bg-white/20 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div className="bg-emerald-400 h-full rounded-full" style={{ width: '85%' }}></div>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3 bg-white/10 p-3.5 rounded-xl backdrop-blur-md border border-white/15 shadow-xs hover:bg-white/15 transition-all">
              <div className="w-10 h-10 rounded-lg bg-white/15 flex items-center justify-center shadow-xs flex-shrink-0">
                <Flame className="w-5 h-5 text-amber-400 fill-amber-400" />
              </div>
              <div className="min-w-0">
                <p className="text-base font-bold leading-tight">{profile?.streakDays || 14} Days</p>
                <p className="text-xs text-blue-200 font-medium mt-0.5 truncate">Learning Streak</p>
              </div>
            </div>
          </div>
        </section>

        {/* Milestone Reminder Announcement Strip (Enhancement: Academic Deadline Awareness) */}
        <div className="bg-blue-50/80 border border-blue-200/80 rounded-xl px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs shadow-xs">
          <div className="flex items-center gap-2.5 text-slate-800">
            <span className="p-1 rounded bg-coursera text-white font-bold flex-shrink-0">
              <Sparkles className="w-3.5 h-3.5" />
            </span>
            <span className="font-semibold">
              Upcoming Milestone: <span className="font-normal text-slate-600">Module 2 Architecture Assessment is active for your specialization track.</span>
            </span>
          </div>
          <Link
            to="/student/quiz"
            className="inline-flex items-center gap-1 font-bold text-coursera hover:underline whitespace-nowrap self-end sm:self-auto"
          >
            <span>Take Quiz</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* Continue Learning Featured Card (Original Layout, Polished Coursera Specification) */}
        <section className="w-full">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Continue Learning</h2>
              <p className="text-xs text-slate-500">Your current active professional specialization track</p>
            </div>
            <Link
              to="/student/my-learning"
              className="text-xs font-bold text-coursera hover:underline hidden sm:inline"
            >
              All Enrolled Courses →
            </Link>
          </div>

          <div className="w-full bg-white border border-slate-200/80 rounded-2xl p-6 shadow-[0_1px_3px_rgba(0,0,0,0.06)] hover:shadow-md transition-shadow">
            <div className="flex flex-col lg:flex-row items-start lg:items-center gap-6">
              
              <div className="w-full lg:w-80 h-48 rounded-xl overflow-hidden flex-shrink-0 bg-slate-100 relative shadow-xs">
                <img
                  src={activeCourse.thumbnail || 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80'}
                  alt={activeCourse.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent flex items-end justify-between p-3.5">
                  <span className="px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-[11px] font-bold text-white">
                    {activeCourse.currentModule || 'Module 1: Foundations'}
                  </span>
                  <span className="px-2 py-0.5 rounded bg-black/60 text-[10px] font-medium text-white/90">
                    ~45m left
                  </span>
                </div>
              </div>

              <div className="flex-1 w-full flex flex-col justify-between space-y-4">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-blue-50 text-coursera border border-blue-100">
                      {activeCourse.category || 'Architecture'}
                    </span>
                    <span className="text-xs text-slate-500 font-medium">
                      {activeCourse.institution || 'Stanford University'}
                    </span>
                    <span className="text-xs text-slate-400">•</span>
                    <span className="text-xs text-slate-500 font-medium">
                      {activeCourse.level || 'Advanced Level'}
                    </span>
                  </div>

                  <h3 className="text-base md:text-lg font-bold text-slate-900 mb-1 leading-snug">
                    {activeCourse.title}
                  </h3>
                  <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                    {activeCourse.description || activeCourse.subtitle}
                  </p>
                </div>

                <div className="space-y-3.5">
                  <div>
                    <div className="flex items-center justify-between text-xs text-slate-600 font-semibold mb-1.5">
                      <span>Course Progress</span>
                      <span className="text-coursera font-bold">{activeCourse.progress ?? 65}% (4 of 6 modules)</span>
                    </div>
                    <LinearProgressBar 
                      progress={activeCourse.progress ?? 65}
                      showLabel={false}
                      color="bg-coursera"
                      height="h-2"
                    />
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-3 pt-3.5 border-t border-slate-100">
                    <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                      <span className="flex items-center gap-1.5 text-slate-800 font-semibold">
                        <Clock className="w-3.5 h-3.5 text-coursera" /> Next Up: 2.3 State Management in NexusPay (10m)
                      </span>
                    </div>

                    <div className="flex items-center gap-2.5">
                      <Link
                        to="/student/quiz"
                        className="px-4 py-2 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors"
                      >
                        Take Module Quiz
                      </Link>
                      <Link
                        to="/student/player"
                        className="inline-flex items-center gap-1.5 px-5 py-2 rounded-lg bg-coursera text-white text-xs font-bold hover:bg-primary shadow-xs transition-all"
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

        {/* In Progress Grid (Original Layout, Polished Cards) */}
        <section className="w-full">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">In Progress</h2>
              <p className="text-xs text-slate-500 font-normal">Pick up where you left off across enrolled tracks</p>
            </div>
            <Link to="/student/my-learning" className="text-xs font-bold text-coursera hover:underline">
              View All Enrolled ({inProgressCourses.length + 1}) →
            </Link>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {inProgressCourses.map((course) => (
              <CourseCard key={course.id} course={course} variant="in-progress" />
            ))}
          </div>
        </section>

        {/* Recommended For You Section (Original Layout, Polished Cards) */}
        <section className="w-full">
          <div className="flex items-center justify-between mb-3.5">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recommended For You</h2>
              <p className="text-xs text-slate-500 font-normal">Based on your fintech architecture and cloud specialization</p>
            </div>
            <Link to="/student/explore" className="text-xs font-bold text-coursera hover:underline flex items-center gap-1">
              <span>Explore All Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {recommendedCourses.map((course) => (
              <CourseCard key={course.id} course={course} variant="explore" showBookmark={false} />
            ))}
          </div>
        </section>

      </div>

      {/* JOIN ORGANIZATION MODAL */}
      {showOrgModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="bg-white rounded-2xl p-6 max-w-lg w-full shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2 text-slate-900 font-bold text-base">
                <Building2 className="w-5 h-5 text-coursera" />
                <span>Join an Organization to become a Student</span>
              </div>
              <button 
                onClick={() => {
                  setShowOrgModal(false);
                  setOrgSearchQuery('');
                }} 
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Select an accredited university or enterprise organization. Submitting a request sends your profile to the Organization Admin for student membership verification.
            </p>

            {/* University Search Filter */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search university or organization..."
                value={orgSearchQuery}
                onChange={(e) => setOrgSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:border-coursera focus:bg-white"
              />
            </div>

            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {filteredOrgs.length > 0 ? (
                filteredOrgs.map((org) => (
                  <div
                    key={org.id}
                    onClick={() => setSelectedOrg(org)}
                    className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                      selectedOrg?.id === org.id
                        ? 'border-coursera bg-blue-50/60 shadow-xs ring-1 ring-coursera'
                        : 'border-slate-200 hover:border-slate-300 bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-900">{org.name}</h4>
                        <p className="text-[11px] text-slate-500">{org.location} • {org.domain || 'edu'}</p>
                      </div>
                      {selectedOrg?.id === org.id && <CheckCircle2 className="w-5 h-5 text-coursera" />}
                    </div>
                  </div>
                ))
              ) : (
                <div className="py-6 text-center text-xs text-slate-400">
                  No organization matching "{orgSearchQuery}"
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  setShowOrgModal(false);
                  setOrgSearchQuery('');
                }}
                className="px-4 py-2 text-xs font-bold text-slate-500 hover:bg-slate-100 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={!selectedOrg || submittingOrg}
                onClick={handleRequestJoinOrg}
                className="px-5 py-2 text-xs font-bold text-white bg-coursera hover:bg-primary disabled:opacity-50 rounded-lg shadow-sm transition-all"
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
