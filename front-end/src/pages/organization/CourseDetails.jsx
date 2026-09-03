import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft,
  Edit,
  Star,
  Users,
  BookOpen,
  DollarSign,
  GraduationCap,
  Mail
} from 'lucide-react';
import OrgLayout from '../../components/organization/OrgLayout';
import { useOrg } from '../../context/OrgContext';

export default function CourseDetails() {
  const { id } = useParams();
  const { courses, instructors: allInstructors } = useOrg();
  const course = courses.find(c => c.id === id) || courses[0];

  if (!course) {
    return (
      <OrgLayout breadcrumbs={[{ label: 'Courses', path: '/courses' }, { label: 'Course Not Found' }]}>
        <div className="p-8 text-center">
          <p className="text-sm font-bold text-on-surface">Course not found</p>
          <Link to="/courses" className="text-xs text-primary font-bold hover:underline mt-2 inline-block">
            Return to Courses
          </Link>
        </div>
      </OrgLayout>
    );
  }

  // Resolve assigned instructors list
  const assignedTeam = course.instructors && course.instructors.length > 0
    ? course.instructors
    : [
        {
          id: course.instructorId || 'inst-1',
          name: course.instructorName || 'Lead Professor',
          role: 'Lead Instructor',
          avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
          specialization: course.category
        }
      ];

  return (
    <OrgLayout
      breadcrumbs={[
        { label: 'Courses', path: '/courses' },
        { label: course.title }
      ]}
      actions={
        <Link
          to={`/courses/${course.id}/edit`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold shadow-sm transition-all"
        >
          <Edit className="w-4 h-4" />
          <span>Edit Course Content</span>
        </Link>
      }
    >
      <div className="space-y-6">
        <Link to="/courses" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
          <ChevronLeft className="w-4 h-4" />
          <span>Back to Course Catalog</span>
        </Link>

        {/* Course Banner */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 md:p-8 shadow-elevation-1 flex flex-col md:flex-row items-center gap-6">
          <img src={course.thumbnail} alt={course.title} className="w-full md:w-64 h-40 rounded-2xl object-cover shadow-sm flex-shrink-0" />
          <div className="flex-1 space-y-2">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full bg-primary/10 text-primary text-xs font-bold">{course.category}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface text-xs font-semibold">{course.level}</span>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">{course.status}</span>
            </div>
            <h1 className="text-xl md:text-2xl font-bold text-on-surface">{course.title}</h1>
            <p className="text-xs text-on-surface-variant leading-relaxed">{course.description}</p>
            <p className="text-xs text-outline pt-1">
              Authored by <strong className="text-on-surface font-semibold">{course.instructorName}</strong> • {course.totalHours} on-demand video
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-outline uppercase font-bold tracking-wider block">Course Price</span>
            <p className="text-3xl font-black text-emerald-700">₹{course.price}</p>
          </div>
        </div>

        {/* 4 Stat Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 shadow-sm text-center">
            <span className="text-[10px] text-outline uppercase font-bold tracking-wider">Total Enrolled</span>
            <p className="text-xl font-bold text-primary mt-1">{course.enrolledCount || 0} learners</p>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 shadow-sm text-center">
            <span className="text-[10px] text-outline uppercase font-bold tracking-wider">Completion Rate</span>
            <p className="text-xl font-bold text-emerald-700 mt-1">72%</p>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 shadow-sm text-center">
            <span className="text-[10px] text-outline uppercase font-bold tracking-wider">Student Rating</span>
            <p className="text-xl font-bold text-amber-600 mt-1 flex items-center justify-center gap-1">
              <Star className="w-4 h-4 fill-current" /> {course.rating || 5.0}
            </p>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 shadow-sm text-center">
            <span className="text-[10px] text-outline uppercase font-bold tracking-wider">Gross Revenue</span>
            <p className="text-xl font-bold text-on-surface mt-1">${(course.revenue || (course.price * (course.enrolledCount || 0))).toLocaleString()}</p>
          </div>
        </div>

        {/* Multi-Faculty Teaching Team Section */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-elevation-1 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
            <div className="flex items-center gap-2">
              <GraduationCap className="w-5 h-5 text-primary" />
              <h2 className="text-base font-bold text-on-surface">Assigned Faculty Teaching Team</h2>
            </div>
            <span className="text-xs text-primary font-bold">{assignedTeam.length} Faculty Member(s)</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {assignedTeam.map((inst, idx) => (
              <div key={inst.id || idx} className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/70 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <img src={inst.avatar} alt={inst.name} className="w-12 h-12 rounded-2xl object-cover shadow-xs" />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-xs text-on-surface">{inst.name}</h3>
                      <span className={`px-2 py-0.2 rounded text-[9px] font-bold ${
                        inst.role === 'Lead Instructor' || idx === 0
                          ? 'bg-primary text-white'
                          : 'bg-secondary/15 text-secondary font-bold'
                      }`}>
                        {inst.role || (idx === 0 ? 'Lead Instructor' : 'Co-Instructor')}
                      </span>
                    </div>
                    <p className="text-[11px] text-outline mt-0.5">{inst.specialization}</p>
                  </div>
                </div>
                <Link
                  to={`/instructors/${inst.id}`}
                  className="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface font-semibold text-[11px] transition-colors"
                >
                  View Profile
                </Link>
              </div>
            ))}
          </div>
        </div>

        {/* Modules & Lessons */}
        <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-elevation-1 space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-outline-variant">
            <h2 className="text-base font-bold text-on-surface">Curriculum Modules & Lessons</h2>
            <span className="text-xs text-outline">{course.modules?.length || 3} Total Modules</span>
          </div>
          <div className="space-y-3">
            {(course.modules || [
              { id: 'mod-1', title: 'Module 1: Distributed Consensus & Two-Phase Commit', lessons: 4, duration: '3h 15m' },
              { id: 'mod-2', title: 'Module 2: AWS Multi-Region Active-Active Replication', lessons: 6, duration: '4h 30m' },
              { id: 'mod-3', title: 'Module 3: PCI-DSS Level 1 Cryptographic Key Management', lessons: 5, duration: '3h 45m' }
            ]).map((mod, idx) => (
              <div key={mod.id || idx} className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant/60 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-xl bg-primary/10 text-primary font-bold text-xs flex items-center justify-center">
                    {idx + 1}
                  </div>
                  <div>
                    <h3 className="font-bold text-xs text-on-surface">{mod.title}</h3>
                    <p className="text-[11px] text-outline">{mod.lessons || 3} Lessons • {mod.duration || '2h 30m'}</p>
                  </div>
                </div>
                <span className="px-3 py-1 rounded-xl bg-surface-container text-xs font-semibold text-on-surface-variant">
                  Verified Content
                </span>
              </div>
            ))}
          </div>
        </div>

      </div>
    </OrgLayout>
  );
}
