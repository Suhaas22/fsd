import React from 'react';
import { useParams, Link } from 'react-router-dom';
import {
  ChevronLeft,
  Mail,
  Star,
  BookOpen,
  Users,
  DollarSign
} from 'lucide-react';
import OrgLayout from '../../components/organization/OrgLayout';
import { useOrg } from '../../context/OrgContext';

export default function InstructorDetails() {
  const { id } = useParams();
  const { instructors, courses } = useOrg();
  const instructor = instructors.find(inst => inst.id === id) || instructors[0];
  const instructorCourses = courses.filter(c =>
    c.instructors?.some(courseInstructor => courseInstructor.id === instructor.id) ||
    c.instructorId === instructor.id ||
    c.instructorName === instructor.name
  );

  return (
    <OrgLayout
      breadcrumbs={[
        { label: 'Instructors', path: '/instructors' },
        { label: instructor.name }
      ]}
      actions={
        <Link
          to={`/org/assign-courses?instructorId=${instructor.id}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold shadow-sm transition-all"
        >
          <BookOpen className="w-4 h-4" />
          <span>Assign Course to {instructor.name.split(' ')[0]}</span>
        </Link>
      }
    >
      <div className="space-y-6">
        <Link to="/org/instructors" className="inline-flex items-center gap-1.5 text-xs font-bold text-primary hover:underline">
          <ChevronLeft className="w-4 h-4" />
          <span>Back to All Faculty</span>
        </Link>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 md:p-8 shadow-elevation-1 flex flex-col md:flex-row items-center gap-6">
          <img src={instructor.avatar} alt={instructor.name} className="w-24 h-24 rounded-3xl object-cover shadow-sm flex-shrink-0" />
          <div className="flex-1 text-center md:text-left space-y-2">
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-3">
              <h1 className="text-2xl font-bold text-on-surface">{instructor.name}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                {instructor.status}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-surface-container-high text-on-surface text-xs font-semibold">
                {instructor.educatorType}
              </span>
            </div>
            <p className="text-xs text-on-surface-variant max-w-2xl">{instructor.bio}</p>
            <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-xs text-outline pt-1">
              <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {instructor.email}</span>
              <span>Joined: {instructor.joinedDate}</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 shadow-sm text-center">
            <span className="text-[10px] text-outline uppercase font-bold tracking-wider">Authored Tracks</span>
            <p className="text-xl font-bold text-on-surface mt-1">{instructorCourses.length || instructor.coursesCount}</p>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 shadow-sm text-center">
            <span className="text-[10px] text-outline uppercase font-bold tracking-wider">Enrolled Learners</span>
            <p className="text-xl font-bold text-primary mt-1">{instructor.enrolledStudents}</p>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 shadow-sm text-center">
            <span className="text-[10px] text-outline uppercase font-bold tracking-wider">Average Rating</span>
            <p className="text-xl font-bold text-amber-600 mt-1 flex items-center justify-center gap-1">
              <Star className="w-4 h-4 fill-current" /> {instructor.avgRating}
            </p>
          </div>
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-4 shadow-sm text-center">
            <span className="text-[10px] text-outline uppercase font-bold tracking-wider">Gross Royalty</span>
            <p className="text-xl font-bold text-emerald-700 mt-1">${instructor.revenueGenerated.toLocaleString()}</p>
          </div>
        </div>

        <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-elevation-1">
          <h2 className="text-base font-bold text-on-surface pb-4 border-b border-outline-variant mb-4">
            Curriculum Courses by {instructor.name}
          </h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="text-outline uppercase text-[10px] tracking-wider border-b border-outline-variant">
                  <th className="pb-3 font-bold">Course Title</th>
                  <th className="pb-3 font-bold">Category</th>
                  <th className="pb-3 font-bold">Enrolled</th>
                  <th className="pb-3 font-bold">Price</th>
                  <th className="pb-3 font-bold text-right">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-outline-variant/40">
                {instructorCourses.map((c) => (
                  <tr key={c.id} className="hover:bg-surface-container-low/50 transition-colors">
                    <td className="py-4">
                      <div className="flex items-center gap-3">
                        <img src={c.thumbnail} alt={c.title} className="w-12 h-9 rounded-lg object-cover" />
                        <div>
                          <Link to={`/org/courses/${c.id}`} className="font-bold text-sm text-on-surface hover:text-primary transition-colors">
                            {c.title}
                          </Link>
                          <p className="text-[10px] text-outline">{c.totalHours} • {c.lessonsCount} lessons</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 font-semibold text-primary">{c.category}</td>
                    <td className="py-4 font-bold text-on-surface">{c.enrolledCount} learners</td>
                    <td className="py-4 font-bold text-emerald-700">${c.price}</td>
                    <td className="py-4 text-right">
                      <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                        {c.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </OrgLayout>
  );
}
