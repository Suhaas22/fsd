import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Search,
  Star,
  ChevronRight,
  Mail,
  Send,
  BookOpen
} from 'lucide-react';
import OrgLayout from '../../components/organization/OrgLayout';
import { useOrg } from '../../context/OrgContext';

export default function Instructors() {
  const { instructors } = useOrg();
  const [search, setSearch] = useState('');

  const filteredInstructors = instructors.filter(inst =>
    inst.name.toLowerCase().includes(search.toLowerCase()) ||
    inst.specialization.toLowerCase().includes(search.toLowerCase()) ||
    inst.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <OrgLayout
      breadcrumbs={[{ label: 'Instructors' }]}
      actions={
        <Link
          to="/assign-courses"
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold shadow-sm transition-all"
        >
          <BookOpen className="w-4 h-4" />
          <span>Assign Course to Faculty</span>
        </Link>
      }
    >
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-on-surface">College Faculty Instructors</h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Managing {instructors.length} verified professors and instructors. Click on any educator to view full details.
            </p>
          </div>
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-outline absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search faculty by name, topic..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs bg-surface-container-low border border-outline-variant rounded-xl focus:outline-none focus:border-primary text-on-surface font-medium"
            />
          </div>
        </div>

        {/* Grid of All College Instructors */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredInstructors.map((inst) => (
            <div
              key={inst.id}
              className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-elevation-1 hover:shadow-elevation-2 transition-all flex flex-col justify-between space-y-5"
            >
              <div>
                <div className="flex items-start justify-between mb-4">
                  <Link to={`/instructors/${inst.id}`} className="flex items-center gap-3 group">
                    <img src={inst.avatar} alt={inst.name} className="w-14 h-14 rounded-2xl object-cover shadow-sm group-hover:scale-105 transition-transform" />
                    <div>
                      <h3 className="font-bold text-sm text-on-surface group-hover:text-primary transition-colors">{inst.name}</h3>
                      <p className="text-[11px] text-primary font-semibold">{inst.educatorType}</p>
                      <span className="text-[10px] text-outline flex items-center gap-1 mt-0.5">
                        <Mail className="w-3 h-3" /> {inst.email}
                      </span>
                    </div>
                  </Link>
                  <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    {inst.status}
                  </span>
                </div>
                <div className="space-y-2">
                  <span className="inline-block px-2.5 py-1 rounded-lg bg-surface-container text-[11px] font-bold text-on-surface">
                    {inst.specialization}
                  </span>
                  <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">
                    {inst.bio}
                  </p>
                </div>
              </div>

              <div>
                <div className="grid grid-cols-3 gap-2 py-3 border-t border-b border-outline-variant/60 text-center text-xs my-2">
                  <div>
                    <span className="text-[10px] text-outline uppercase block font-medium">Courses</span>
                    <span className="font-bold text-on-surface">{inst.coursesCount}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-outline uppercase block font-medium">Learners</span>
                    <span className="font-bold text-on-surface">{inst.enrolledStudents}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-outline uppercase block font-medium">Rating</span>
                    <span className="font-bold text-amber-600 flex items-center justify-center gap-0.5">
                      <Star className="w-3 h-3 fill-current" /> {inst.avgRating}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-3">
                  <Link
                    to={`/instructors/${inst.id}`}
                    className="flex-1 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-bold transition-colors flex items-center justify-center gap-1"
                  >
                    <span>View Details</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </Link>
                  <Link
                    to={`/assign-courses?instructorId=${inst.id}`}
                    className="py-2.5 px-3 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold transition-colors flex items-center justify-center gap-1"
                    title="Assign a course to this professor"
                  >
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Assign</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </OrgLayout>
  );
}
