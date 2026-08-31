import React from 'react';
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
  Layers,
  Activity,
  DollarSign
} from 'lucide-react';

export default function Landing() {
  const actors = [
    {
      role: 'Student / Learner',
      tagline: 'Discover masterclasses, learn from elite faculty & earn accredited credentials.',
      path: '/student',
      badge: 'Academic LMS',
      badgeColor: 'bg-emerald-500/10 text-emerald-600 border-emerald-500/20',
      icon: GraduationCap,
      color: 'from-emerald-500 to-teal-700',
      bgLight: 'bg-emerald-50 hover:bg-emerald-100/60',
      features: [
        'Interactive Course Discovery & Study Plans',
        'High-Performance Video Player & Lesson Tracker',
        'Academic Quizzes & Verifiable Certificates',
        'Seamless Checkout with NexusPay'
      ],
      cta: 'Enter Student Portal'
    },
    {
      role: 'Instructor / Educator',
      tagline: 'Author scalable curriculum, build quizzes, track learner progress & receive royalties.',
      path: '/instructor',
      badge: 'Educator Studio',
      badgeColor: 'bg-indigo-500/10 text-indigo-600 border-indigo-500/20',
      icon: Users,
      color: 'from-indigo-600 to-indigo-900',
      bgLight: 'bg-indigo-50 hover:bg-indigo-100/60',
      features: [
        'Multi-Module & Lesson Curriculum Authoring',
        'Interactive Quiz & Assessment Builder',
        'Student Roster & Cohort Progress Telemetry',
        '70% Direct Educator Revenue Share'
      ],
      cta: 'Enter Educator Studio'
    },
    {
      role: 'Organization Admin',
      tagline: 'Lead enterprise academies, assign multi-faculty teaching teams & govern disputes.',
      path: '/org',
      badge: 'Enterprise Academy',
      badgeColor: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      icon: Building2,
      color: 'from-slate-900 via-indigo-950 to-slate-900',
      bgLight: 'bg-blue-50 hover:bg-blue-100/60',
      features: [
        'Faculty Directory & Course Teaching Outreach',
        'Multi-Instructor Course Track Publishing',
        'Batch University Student Enrollments',
        'Institutional Financial Statements & Dispute Resolution'
      ],
      cta: 'Enter Organization Portal'
    },
    {
      role: 'Platform Super Admin',
      tagline: 'Global platform governance, organization verification, course approvals & audit ledgers.',
      path: '/admin',
      badge: 'Platform Governance',
      badgeColor: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      icon: ShieldCheck,
      color: 'from-purple-600 to-slate-900',
      bgLight: 'bg-purple-50 hover:bg-purple-100/60',
      features: [
        'Full User & Identity Lifecycle Administration',
        'Organization Accreditation & Verification',
        'Course Catalog Review & Approval Pipelines',
        'Platform-Wide Disputes, Refunds & Analytics'
      ],
      cta: 'Enter Admin Control Center'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-white selection:bg-primary selection:text-white flex flex-col justify-between">
      
      {/* Top Navigation */}
      <header className="border-b border-slate-800/80 bg-slate-950/60 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-primary to-indigo-400 flex items-center justify-center font-black text-white text-lg shadow-lg shadow-indigo-500/20">
              NP
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-white flex items-center gap-1.5">
                NexusPay <span className="text-primary-light font-medium text-xs px-2 py-0.5 rounded-full bg-primary/20 border border-primary/30">Enterprise EdTech</span>
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 sm:gap-4">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Backend API Online (Port 3000)
            </span>
            <a
              href="http://localhost:3000/api/docs"
              target="_blank"
              rel="noreferrer"
              className="text-xs font-bold px-3.5 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors border border-slate-700 hidden sm:inline-flex items-center gap-1.5"
            >
              <BookOpen className="w-3.5 h-3.5 text-primary" />
              <span>Swagger Docs</span>
            </a>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 flex-1 flex flex-col justify-center">
        
        <div className="text-center max-w-3xl mx-auto space-y-4 mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-bold uppercase tracking-wider">
            <Sparkles className="w-3.5 h-3.5 text-primary" />
            <span>Unified Four-Actor EdTech Ecosystem</span>
          </div>
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Next-Generation Digital Learning & Institutional Platform
          </h1>
          <p className="text-sm sm:text-base text-slate-400 max-w-2xl mx-auto leading-relaxed">
            Consolidated enterprise architecture connecting Students, Teaching Faculty, Organizations, and Platform Administrators in a unified system.
          </p>
        </div>

        {/* 4 Interactive Actor Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {actors.map((actor, idx) => {
            const Icon = actor.icon;
            return (
              <div
                key={idx}
                className="group bg-slate-800/60 border border-slate-700/70 rounded-3xl p-6 flex flex-col justify-between hover:border-primary hover:shadow-2xl hover:shadow-primary/10 transition-all duration-300 relative overflow-hidden backdrop-blur-sm"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-primary to-indigo-500 text-white flex items-center justify-center shadow-md group-hover:scale-110 transition-transform">
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full border ${actor.badgeColor}`}>
                      {actor.badge}
                    </span>
                  </div>

                  <div>
                    <h2 className="text-lg font-black text-white group-hover:text-primary-light transition-colors">
                      {actor.role}
                    </h2>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {actor.tagline}
                    </p>
                  </div>

                  <ul className="space-y-2 pt-2 border-t border-slate-700/50 text-xs text-slate-300">
                    {actor.features.map((feat, fIdx) => (
                      <li key={fIdx} className="flex items-start gap-2">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0 mt-0.5" />
                        <span className="leading-snug">{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-6">
                  <Link
                    to={actor.path}
                    className="w-full py-3 px-4 rounded-xl bg-primary hover:bg-primary-container text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all group-hover:shadow-indigo-500/25"
                  >
                    <span>{actor.cta}</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Global Live Statistics Strip */}
        <div className="mt-12 bg-slate-950/70 border border-slate-800 rounded-3xl p-6 grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Relational Entities</span>
            <p className="text-2xl font-black text-white mt-1">19 Tables</p>
            <span className="text-[11px] text-slate-500">Modeled from ER Diagram</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">System Actors</span>
            <p className="text-2xl font-black text-primary-light mt-1">4 Portals</p>
            <span className="text-[11px] text-slate-500">Student • Educator • Org • Admin</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Backend Engine</span>
            <p className="text-2xl font-black text-emerald-400 mt-1">NestJS + JSON</p>
            <span className="text-[11px] text-slate-500">ACID-Like File Storage</span>
          </div>
          <div>
            <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider block">Frontend Framework</span>
            <p className="text-2xl font-black text-indigo-400 mt-1">React 18 + Vite</p>
            <span className="text-[11px] text-slate-500">Tailwind CSS Design System</span>
          </div>
        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800/80 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>NexusPay Enterprise EdTech Platform • Consolidated Multi-Actor Architecture</p>
      </footer>
    </div>
  );
}
