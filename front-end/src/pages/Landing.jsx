import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  GraduationCap,
  Users,
  Building2,
  ShieldCheck,
  ArrowRight,
  BookOpen,
  CheckCircle2,
  Award,
  Sparkles,
  Crown
} from 'lucide-react';
import api from '../services/api';

export default function Landing() {
  const [courses, setCourses] = useState([]);

  useEffect(() => {
    api.courses.list()
      .then((res) => {
        setCourses(Array.isArray(res) ? res : (res?.items || []));
      })
      .catch(() => {});
  }, []);

  const portals = [
    {
      level: 'Level 1',
      role: 'Super Admin',
      tagline: 'Global platform governance managing Admins, Organizations, Instructors, and Learners.',
      path: '/super-admin',
      badge: 'Platform Master',
      badgeColor: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      icon: Crown,
      color: 'from-purple-600 to-indigo-900',
      features: [
        'Global System Health & Audit Telemetry',
        'Manage Operational System Admins',
        'Manage Institutions & University Partnerships',
        'System-wide Financial Settlement Audit'
      ],
      cta: 'Enter Super Admin Portal'
    },
    {
      level: 'Level 2',
      role: 'Platform Admin',
      tagline: 'Operational administration controlling Organizations, Faculty, Learners, and Approvals.',
      path: '/admin',
      badge: 'Operations Control',
      badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      icon: ShieldCheck,
      color: 'from-blue-600 to-blue-900',
      features: [
        'Organization Verification & Compliance',
        'Instructor & Course Approval Queues',
        'Platform Dispute & Refund Management',
        'User Roster & Financial Telemetry'
      ],
      cta: 'Enter Admin Portal'
    },
    {
      level: 'Level 3',
      role: 'Organization',
      tagline: 'Institutional university & corporate management controlling faculty and learner cohorts.',
      path: '/org',
      badge: 'University & Corporate',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
      icon: Building2,
      color: 'from-indigo-600 to-indigo-950',
      features: [
        'Faculty Outreach & Course Teaching Requests',
        'Bulk Course Assignment to Learner Cohorts',
        'Institutional Royalty & Financial Reports',
        'Academic Dispute Governance'
      ],
      cta: 'Enter Organization Portal'
    },
    {
      level: 'Level 4',
      role: 'Instructor / Educator',
      tagline: 'Author masterclasses, create quizzes, track student progress + integrated Student View Mode.',
      path: '/instructor',
      badge: 'Educator Studio',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      icon: Users,
      color: 'from-emerald-600 to-teal-900',
      features: [
        'Course & Lesson Content Authoring Studio',
        'Interactive Quiz & Assessment Builder',
        'Student Roster Telemetry & Gradebook',
        'Integrated Student Mode Preview'
      ],
      cta: 'Enter Instructor Portal'
    },
    {
      level: 'Level 5',
      role: 'Learner / Student',
      tagline: 'Enroll in masterclass tracks, take quizzes, complete assignments, and earn verified certificates.',
      path: '/student',
      badge: 'Academic LMS',
      badgeColor: 'bg-amber-500/10 text-amber-600 border-amber-500/20',
      icon: GraduationCap,
      color: 'from-amber-500 to-orange-700',
      features: [
        'Interactive Course Discovery & Player',
        'Student Study Plan & Daily Streak Tracking',
        'Academic Quizzes & Verifiable Certificates',
        'Instant Course Enrollment Checkout'
      ],
      cta: 'Enter Student Portal'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-white font-sans">
      {/* Hero */}
      <header className="border-b border-slate-800 bg-gradient-to-b from-slate-900 via-slate-950 to-slate-950 px-4 py-16 text-center relative overflow-hidden">
        <div className="max-w-4xl mx-auto space-y-4 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-xs font-bold">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>NexusPay Enterprise EdTech • 5-Portal Architecture</span>
          </div>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight">
            Unified EdTech Platform Gateway
          </h1>
          <p className="text-slate-400 text-sm sm:text-base max-w-2xl mx-auto">
            100% backend-rendered platform driven by a single JSON database. Experience all 5 platform roles seamlessly.
          </p>
        </div>
      </header>

      {/* 5 Portals Grid */}
      <main className="max-w-7xl mx-auto px-4 md:px-8 py-12 space-y-8">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold text-slate-100">Select Platform Portal</h2>
          <p className="text-xs text-slate-400 mt-1">Hierarchical multi-tenant platform architecture</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {portals.map((portal) => {
            const Icon = portal.icon;
            return (
              <div key={portal.role} className="bg-slate-900 border border-slate-800 rounded-3xl p-6 flex flex-col justify-between hover:border-slate-700 transition-all shadow-xl">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{portal.level}</span>
                    <span className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${portal.badgeColor}`}>
                      {portal.badge}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${portal.color} flex items-center justify-center shadow-md`}>
                      <Icon className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-lg font-extrabold text-white">{portal.role}</h3>
                    </div>
                  </div>

                  <p className="text-xs text-slate-400 leading-relaxed">{portal.tagline}</p>

                  <ul className="space-y-2 pt-2 border-t border-slate-800/60">
                    {portal.features.map((f, i) => (
                      <li key={i} className="flex items-center gap-2 text-xs text-slate-300">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>{f}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  <Link
                    to={portal.path}
                    className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-all"
                  >
                    <span>{portal.cta}</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Dynamic Courses Preview */}
        {courses.length > 0 && (
          <div className="pt-12 border-t border-slate-800">
            <h3 className="text-xl font-bold text-slate-200 mb-6 text-center">Live Backend Course Catalog ({courses.length} Masterclasses)</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {courses.slice(0, 3).map((c) => (
                <div key={c.id} className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex gap-4 items-center">
                  <img src={c.thumbnail} alt="" className="w-20 h-16 rounded-xl object-cover" />
                  <div>
                    <h4 className="text-xs font-bold text-white line-clamp-1">{c.title}</h4>
                    <p className="text-[11px] text-slate-400">{c.category} • ${c.price}</p>
                    <Link to={`/student/course/${c.id}`} className="text-[11px] text-indigo-400 hover:underline font-bold mt-1 inline-block">
                      View Course Details →
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
