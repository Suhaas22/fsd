import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  GraduationCap,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Globe2,
  Sparkles,
  BookOpen,
  Award,
  Lock,
  Layers,
  ChevronRight,
  TrendingUp,
  Clock,
  Compass,
  Check,
  Send,
  HelpCircle,
  FileText,
  Briefcase,
  ChevronDown,
  ChevronUp,
  Cpu,
  Database,
  Building,
  ExternalLink
} from 'lucide-react';

export default function OrgLanding() {
  const navigate = useNavigate();
  const [demoRequested, setDemoRequested] = useState(false);
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [activeFeatureTab, setActiveFeatureTab] = useState('telemetry');
  const [demoForm, setDemoForm] = useState({
    name: '',
    workEmail: '',
    orgName: '',
    teamSize: '50-200',
    interest: 'Enterprise Workforce Reskilling'
  });

  const handleDemoSubmit = (e) => {
    e.preventDefault();
    if (demoForm.name && demoForm.workEmail) {
      setDemoRequested(true);
    }
  };

  const enterprisePartners = [
    { name: 'Stanford Online', logo: '🏛️ Stanford Online', tag: 'Academic Partner' },
    { name: 'MITx Consortium', logo: '🔬 MITx Consortium', tag: 'Curriculum Hub' },
    { name: 'Google Cloud Enterprise', logo: '☁️ Google Cloud', tag: 'Tech Specialization' },
    { name: 'IBM Skills Network', logo: '💻 IBM Tech', tag: 'Enterprise AI' },
    { name: 'Imperial College London', logo: '🎓 Imperial London', tag: 'Global Research' },
    { name: 'AWS Training & Cert', logo: '⚡ AWS Academy', tag: 'Cloud DevOps' }
  ];

  const solutions = [
    {
      title: 'Enterprise Workforce Upskilling',
      badge: 'FOR CORPORATIONS',
      icon: Briefcase,
      color: 'from-blue-600 to-indigo-600',
      description: 'Close critical skill gaps in Generative AI, Cloud DevOps, Cybersecurity, and Strategic Leadership with customized learning journeys.',
      features: [
        'Role-based skill benchmark assessments',
        'Custom corporate learning paths & playlists',
        'SSO Integration (Okta, Azure AD, SAML 2.0)',
        'Quarterly business reviews & dedicated success manager'
      ]
    },
    {
      title: 'Campus & University Curricula Expansion',
      badge: 'FOR HIGHER EDUCATION',
      icon: GraduationCap,
      color: 'from-emerald-600 to-teal-700',
      description: 'Equip your students with world-class online courses, remote laboratory assignments, and dual credentials from Stanford, MITx, and IBM.',
      features: [
        'Direct credit-transfer pathway support',
        'Faculty-assisted grading & rubric coordination',
        'LMS integration with Canvas, Moodle & Blackboard',
        'Batch cohort enrollment & transcript synchronization'
      ]
    },
    {
      title: 'Government & Public Sector Academies',
      badge: 'FOR PUBLIC INSTITUTIONS',
      icon: ShieldCheck,
      color: 'from-purple-600 to-indigo-800',
      description: 'Deploy nation-scale digital literacy and advanced technical skills initiatives with verifiable cryptographic certificate credentials.',
      features: [
        'Secure multi-tenant data governance',
        'Custom localized language tracks',
        'Detailed economic impact & telemetry reports',
        'Tax-exempt institutional procurement contracts'
      ]
    }
  ];

  const enterpriseStats = [
    { value: '4.8x', label: 'ROI within 12 Months', desc: 'Reported by global enterprise L&D leaders' },
    { value: '89%', label: 'Course Completion Rate', desc: 'Driven by curated cohort-based schedules' },
    { value: '7,000+', label: 'Accredited Programs', desc: 'Taught by top 150 global university faculty' },
    { value: '250K+', label: 'Corporate Learners Active', desc: 'Across 45+ countries worldwide' }
  ];

  const enterprisePlans = [
    {
      name: 'Team Academy',
      tagline: 'Ideal for fast-moving technical teams & departments',
      price: '₹24,631.71',
      unit: '/ user / year',
      popular: false,
      features: [
        'Up to 50 active learner seats',
        'Unlimited access to 7,000+ courses',
        'Standard LMS analytics & skill telemetry',
        'Automated shareable certificate issuance',
        'Self-serve billing via NexusPay'
      ],
      cta: 'Get Started with Team'
    },
    {
      name: 'Enterprise Plus',
      tagline: 'Comprehensive upskilling for medium & large organizations',
      price: 'Custom Quote',
      unit: 'Volume-based pricing',
      popular: true,
      features: [
        '50 to 5,000+ learner licenses',
        'Custom enterprise skill tracks & playlists',
        'SSO & LMS Integration (Canvas, Okta, SAML)',
        'Faculty outreach & multi-instructor governance',
        'Dedicated Enterprise Customer Success Manager',
        'Quarterly executive ROI & skill benchmark reports'
      ],
      cta: 'Contact Enterprise Sales'
    },
    {
      name: 'University Consortium',
      tagline: 'Dual-degree & campus credit curriculum expansion',
      price: 'Institutional',
      unit: 'Per campus license',
      popular: false,
      features: [
        'Unlimited student cohort enrollments',
        'Co-branded accredited degree pathways',
        'Faculty authoring & grading permissions',
        'Automated SIS/ERP student record sync',
        'Faculty development & pedagogy masterclasses'
      ],
      cta: 'Explore University Partnership'
    }
  ];

  const enterpriseFaqs = [
    {
      q: 'How does SSO and LMS (Canvas, Blackboard, Moodle) integration work?',
      a: 'EduSphere Enterprise connects seamlessly via LTI 1.3 standards and SAML 2.0 / OAuth2 single sign-on (Okta, Microsoft Azure AD, Google Workspace). Course grades, attendance, and completions synchronize directly back into your existing SIS or LMS roster.'
    },
    {
      q: 'Can we batch enroll employee cohorts or student classes using CSV files?',
      a: 'Yes! The Organization Admin portal includes our Batch Roster Tool. You can upload a CSV containing emails, departments, and course assignments to enroll hundreds of learners with customized welcome emails and deadline reminders.'
    },
    {
      q: 'How are instructor requests and faculty permissions managed?',
      a: 'Organization administrators can review instructor affiliation requests, invite qualified external professors, assign specific courses, set custom royalty splits, and manage instructor dispute resolutions in real time.'
    },
    {
      q: 'Are certificates co-branded with our organization and accredited universities?',
      a: 'Yes! On Enterprise and University Consortium tiers, certificates display your organization’s crest alongside EduSphere and participating universities (e.g., Stanford Online, IBM), complete with cryptographic QR code validation.'
    },
    {
      q: 'What payment and procurement terms are supported?',
      a: 'We support consolidated annual invoicing, PO terms (Net 30/60), corporate wire transfers, and instant card payments via NexusPay with automated GST-compliant tax invoices.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-slate-900 selection:bg-blue-600 selection:text-white flex flex-col justify-between font-sans">
      
      {/* ────────────────────────────────────────────────────────────── */}
      {/* 0. TOP PORTAL SWITCHER STRIP (UPPERCASE BUTTONS) */}
      {/* ────────────────────────────────────────────────────────────── */}
      <div className="bg-[#F2ECE4] border-b border-[#E5DDD2] py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <span className="w-2 h-2 rounded-full bg-blue-600"></span>
            <span className="hidden sm:inline">QUICK ACCESS PORTALS:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <Link
              to="/"
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-emerald-50 text-emerald-800 border border-emerald-300/80 uppercase text-[10px] sm:text-[11px] font-extrabold tracking-wider shadow-2xs hover:shadow-xs transition-all flex items-center gap-1.5"
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-600" />
              <span>STUDENT / LEARNER</span>
            </Link>

            <Link
              to="/org"
              className="px-3 py-1.5 rounded-lg bg-blue-50 text-blue-900 border-2 border-blue-500 uppercase text-[10px] sm:text-[11px] font-black tracking-wider shadow-xs flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-700" />
              <span>ORGANIZATION ADMIN</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 1. ORGANIZATION HEADER */}
      {/* ────────────────────────────────────────────────────────────── */}
      <header className="border-b border-[#E5DDD2] bg-[#FAF7F2]/95 backdrop-blur-md sticky top-0 z-50 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          <div className="flex items-center gap-4">
            <Link to="/org" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-700 via-indigo-700 to-blue-900 flex items-center justify-center font-black text-white text-xl shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                <Building2 className="w-6 h-6" />
              </div>
              <div>
                <span className="font-black text-xl tracking-tight text-slate-900 flex items-center gap-1">
                  Edu<span className="text-blue-600">Sphere</span>
                  <span className="text-xs font-bold bg-blue-100 text-blue-800 border border-blue-200 px-2 py-0.5 rounded-full ml-1">
                    BUSINESS
                  </span>
                </span>
                <span className="text-[10px] text-slate-500 tracking-wider uppercase font-bold block -mt-0.5">
                  Institutional Academy & Workforce Governance
                </span>
              </div>
            </Link>
          </div>

          <div className="hidden lg:flex items-center gap-6 text-xs font-semibold text-slate-700">
            <a href="#solutions" className="hover:text-blue-600 transition-colors">Solutions</a>
            <a href="#features" className="hover:text-blue-600 transition-colors">Institutional Tools</a>
            <a href="#plans" className="hover:text-blue-600 transition-colors">Plans & Pricing</a>
            <a href="#faq" className="hover:text-blue-600 transition-colors">Enterprise FAQ</a>
            <a href="#demo" className="hover:text-blue-600 transition-colors">Request Demo</a>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/signin?role=Organization"
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-white border border-[#E0D7CB] transition-all bg-[#FAF7F2]"
            >
              Sign In
            </Link>
            <Link
              to="/org/dashboard"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all flex items-center gap-1.5"
            >
              <span>Org Admin Portal</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

        </div>
      </header>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 2. HERO SECTION */}
      {/* ────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-[#E5DDD2] bg-gradient-to-b from-[#FAF7F2] via-[#F4EFE6] to-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Hero Content */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E0D7CB] text-blue-800 text-xs font-bold uppercase tracking-wider shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Enterprise Learning & University Governance</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Upskill Your Workforce with <br />
                <span className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 bg-clip-text text-transparent">
                  World-Class University Curricula.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Empower your organization with accredited skill benchmarks, multi-faculty outreach, batch student enrollments, and real-time learning telemetry.
              </p>

              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <a
                  href="#demo"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02]"
                >
                  <span>Request Enterprise Demo</span>
                  <ArrowRight className="w-4 h-4" />
                </a>
                <Link
                  to="/org/dashboard"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-[#F2ECE4] text-slate-800 hover:text-blue-600 font-bold text-sm border border-[#E0D7CB] shadow-2xs transition-all flex items-center justify-center gap-2"
                >
                  <Building2 className="w-4 h-4 text-blue-600" />
                  <span>Enter Organization Dashboard</span>
                </Link>
              </div>

              {/* Trust Indicators */}
              <div className="pt-6 grid grid-cols-2 sm:grid-cols-4 gap-4 border-t border-[#E5DDD2] text-left">
                {enterpriseStats.map((stat, idx) => (
                  <div key={idx}>
                    <div className="text-xl sm:text-2xl font-black text-blue-700">{stat.value}</div>
                    <div className="text-xs font-bold text-slate-900">{stat.label}</div>
                    <div className="text-[10px] text-slate-500">{stat.desc}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right Live Org Admin Telemetry Preview */}
            <div className="lg:col-span-5 relative">
              <div className="bg-white border border-[#E0D7CB] rounded-3xl p-6 shadow-xl shadow-stone-900/5 relative overflow-hidden group hover:border-blue-300 transition-all">
                <div className="flex items-center justify-between pb-4 border-b border-[#F2ECE4]">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                      <Building2 className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">Apex Enterprise Academy</h4>
                      <span className="text-[11px] text-emerald-700 font-semibold flex items-center gap-1">
                        <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                        Active Enterprise License
                      </span>
                    </div>
                  </div>
                  <span className="text-[10px] font-bold uppercase bg-blue-50 text-blue-700 px-2.5 py-1 rounded-full border border-blue-200">
                    Cohort Q3 2026
                  </span>
                </div>

                <div className="py-4 space-y-3">
                  <div className="grid grid-cols-3 gap-2 text-center">
                    <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E5DDD2]">
                      <span className="text-[10px] text-slate-500 font-semibold block">Total Seats</span>
                      <span className="text-lg font-black text-slate-900">250</span>
                    </div>
                    <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E5DDD2]">
                      <span className="text-[10px] text-slate-500 font-semibold block">Active Learners</span>
                      <span className="text-lg font-black text-blue-700">238</span>
                    </div>
                    <div className="bg-[#FAF7F2] p-2.5 rounded-xl border border-[#E5DDD2]">
                      <span className="text-[10px] text-slate-500 font-semibold block">Certificates</span>
                      <span className="text-lg font-black text-emerald-700">184</span>
                    </div>
                  </div>

                  <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#E5DDD2] space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>Cloud DevOps & AI Skill Track</span>
                      <span className="text-blue-700 font-bold">84% Cohort Benchmark</span>
                    </div>
                    <div className="w-full h-2 bg-[#E5DDD2] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full w-[84%]" />
                    </div>
                  </div>

                  <div className="bg-[#FAF7F2] p-3 rounded-2xl border border-[#E5DDD2] space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-700">
                      <span>Executive Strategic Finance MasterTrack</span>
                      <span className="text-blue-700 font-bold">92% Cohort Benchmark</span>
                    </div>
                    <div className="w-full h-2 bg-[#E5DDD2] rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-emerald-600 to-teal-600 rounded-full w-[92%]" />
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-[#F2ECE4] flex items-center justify-between">
                  <span className="text-xs text-slate-500">Live JSON Synced Database</span>
                  <Link
                    to="/org/dashboard"
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <span>Open Admin Panel</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 2.5 TRUSTED INSTITUTIONAL PARTNERS */}
      {/* ────────────────────────────────────────────────────────────── */}
      <section className="py-8 bg-white border-b border-[#E5DDD2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-[11px] font-bold uppercase tracking-widest text-slate-400 mb-6">
            TRUSTED BY WORLD-CLASS UNIVERSITIES AND FORTUNE 500 WORKFORCES
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {enterprisePartners.map((partner, idx) => (
              <div
                key={idx}
                className="px-4 py-2 rounded-xl bg-[#FAF7F2] border border-[#E0D7CB] flex items-center gap-2 text-xs font-bold text-slate-700 hover:border-blue-400 transition-all shadow-2xs"
              >
                <span>{partner.logo}</span>
                <span className="text-[10px] text-blue-600 font-semibold bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                  {partner.tag}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 3. SOLUTIONS BY INSTITUTION TYPE */}
      {/* ────────────────────────────────────────────────────────────── */}
      <section id="solutions" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white text-blue-800 border border-[#E0D7CB] text-xs font-bold uppercase tracking-wider mb-3 shadow-2xs">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            <span>Tailored Institutional Solutions</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
            Designed for Modern Enterprise and Academic Workflows
          </h2>
          <p className="text-sm text-slate-600 mt-2">
            Whether upskilling a global technical workforce or expanding university curriculum, EduSphere provides complete institutional governance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {solutions.map((sol, idx) => {
            const Icon = sol.icon;
            return (
              <div
                key={idx}
                className="bg-white border border-[#E0D7CB] rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-blue-300 transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className={`w-12 h-12 rounded-2xl bg-gradient-to-tr ${sol.color} text-white flex items-center justify-center shadow-md`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full bg-blue-50 text-blue-800 border border-blue-200">
                      {sol.badge}
                    </span>
                  </div>

                  <div>
                    <h3 className="font-extrabold text-lg text-slate-900">{sol.title}</h3>
                    <p className="text-xs text-slate-600 mt-1 leading-relaxed">{sol.description}</p>
                  </div>

                  <div className="pt-4 border-t border-[#F2ECE4] space-y-2">
                    {sol.features.map((feat, fIdx) => (
                      <div key={fIdx} className="flex items-start gap-2 text-xs text-slate-700">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="pt-6">
                  <Link
                    to="/org/dashboard"
                    className="w-full py-2.5 px-4 rounded-xl bg-[#FAF7F2] hover:bg-blue-600 text-slate-800 hover:text-white border border-[#E0D7CB] hover:border-blue-600 font-bold text-xs flex items-center justify-center gap-1.5 transition-all text-center"
                  >
                    <span>Launch Portal Feature</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 4. INSTITUTIONAL CAPABILITIES & TOOLS */}
      {/* ────────────────────────────────────────────────────────────── */}
      <section id="features" className="py-16 sm:py-20 bg-[#F4EFE6] border-y border-[#E5DDD2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          
          <div className="mb-12 text-center max-w-3xl mx-auto">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Powerful Administration & Academic Controls
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Everything organization admins need to govern instructors, enroll student cohorts, and audit financial statements.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                title: 'Faculty Directory & Outreach',
                desc: 'Invite, verify, and assign qualified university professors and industry instructors to teaching tracks.',
                path: '/org/instructors',
                icon: Users
              },
              {
                title: 'Batch Cohort Enrollments',
                desc: 'Bulk enroll hundreds of students into mandatory skill programs with CSV uploads and automated email notifications.',
                path: '/org/assign-courses',
                icon: GraduationCap
              },
              {
                title: 'Institutional Financial Ledgers',
                desc: 'Consolidated seat invoices, educator royalty distributions, and automated dispute resolution workflows.',
                path: '/org/payments',
                icon: BarChart3
              },
              {
                title: 'Skill Benchmark Telemetry',
                desc: 'Real-time cohort completion percentages, quiz scores, and verifiable blockchain-backed credential auditing.',
                path: '/org/reports',
                icon: ShieldCheck
              }
            ].map((tool, idx) => {
              const Icon = tool.icon;
              return (
                <div
                  key={idx}
                  className="bg-white border border-[#E0D7CB] rounded-3xl p-6 flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-blue-300 transition-all"
                >
                  <div className="space-y-3">
                    <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-extrabold text-base text-slate-900">{tool.title}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed">{tool.desc}</p>
                  </div>
                  <div className="pt-4 mt-4 border-t border-[#F2ECE4]">
                    <Link
                      to={tool.path}
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                    >
                      <span>Access in Portal</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 5. PRICING & INSTITUTIONAL PLANS */}
      {/* ────────────────────────────────────────────────────────────── */}
      <section id="plans" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="text-center max-w-3xl mx-auto mb-12">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Flexible Licensing for Teams of Any Scale
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Choose standard team seats or comprehensive enterprise-grade platform deployments.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          {enterprisePlans.map((plan, idx) => (
            <div
              key={idx}
              className={`bg-white rounded-3xl flex flex-col justify-between shadow-2xs hover:shadow-md transition-all ${
                plan.popular
                  ? 'border-2 border-blue-600 shadow-xl shadow-blue-900/10 relative'
                  : 'border border-[#E0D7CB]'
              }`}
            >
              {plan.popular && (
                <div className="bg-[#002244] text-white text-center py-2 text-xs font-black uppercase tracking-wider rounded-t-2xl">
                  Most Popular for Enterprises
                </div>
              )}

              <div className="p-6 sm:p-8 space-y-4 flex-1 flex flex-col justify-between">
                <div className="space-y-4">
                  <div>
                    <h3 className="font-black text-xl text-slate-900">{plan.name}</h3>
                    <p className="text-xs text-slate-500 mt-1">{plan.tagline}</p>
                  </div>

                  <div className="pt-2">
                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-black text-slate-900">{plan.price}</span>
                      <span className="text-xs text-slate-500 font-semibold">{plan.unit}</span>
                    </div>
                  </div>

                  <div className="pt-2">
                    <a
                      href="#demo"
                      className={`w-full py-3.5 px-4 rounded-xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition-all text-center ${
                        plan.popular
                          ? 'bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/25'
                          : 'border-2 border-blue-600 text-blue-700 hover:bg-blue-50'
                      }`}
                    >
                      <span>{plan.cta}</span>
                    </a>
                  </div>

                  <div className="pt-4 border-t border-[#F2ECE4] space-y-2.5">
                    <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">Included features:</span>
                    <ul className="space-y-2 text-xs text-slate-600">
                      {plan.features.map((feat, fIdx) => (
                        <li key={fIdx} className="flex items-start gap-2">
                          <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 5.5 ENTERPRISE FREQUENTLY ASKED QUESTIONS */}
      {/* ────────────────────────────────────────────────────────────── */}
      <section id="faq" className="py-16 sm:py-20 bg-white border-t border-[#E5DDD2]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-10">
            <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
              Frequently Asked Questions
            </span>
            <h3 className="text-2xl sm:text-3xl font-black text-slate-900 mt-2">
              Institutional Integration & Administration
            </h3>
            <p className="text-xs sm:text-sm text-slate-600 mt-1">
              Key information for enterprise IT leaders, HR directors, and university deans.
            </p>
          </div>

          <div className="bg-[#FAF7F2] border border-[#E0D7CB] rounded-3xl p-6 sm:p-8 divide-y divide-[#E5DDD2] shadow-2xs">
            {enterpriseFaqs.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={idx} className="py-4 first:pt-0 last:pb-0">
                  <button
                    type="button"
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between text-left gap-4 group"
                  >
                    <span className="font-bold text-sm sm:text-base text-slate-900 group-hover:text-blue-600 transition-colors">
                      {faq.q}
                    </span>
                    <div className="w-6 h-6 rounded-full bg-white border border-[#E0D7CB] flex items-center justify-center shrink-0 text-slate-500 group-hover:text-blue-600">
                      {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="mt-3 text-xs sm:text-sm text-slate-600 leading-relaxed pr-8 animate-fadeIn">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 6. REQUEST DEMO & CONTACT SALES FORM */}
      {/* ────────────────────────────────────────────────────────────── */}
      <section id="demo" className="py-16 sm:py-20 bg-[#F4EFE6] border-t border-[#E5DDD2]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-white border border-[#E0D7CB] rounded-3xl p-8 sm:p-10 shadow-lg shadow-stone-900/5">
            
            <div className="text-center max-w-2xl mx-auto mb-8 space-y-2">
              <span className="text-xs font-bold uppercase tracking-wider text-blue-700 bg-blue-50 px-3 py-1 rounded-full border border-blue-200">
                Institutional Partnership
              </span>
              <h3 className="text-2xl sm:text-3xl font-black text-slate-900">
                Schedule a Consultation with our Academic Advisors
              </h3>
              <p className="text-xs sm:text-sm text-slate-600">
                Learn how top universities and Fortune 500 companies deploy EduSphere for institutional learning.
              </p>
            </div>

            {demoRequested ? (
              <div className="text-center py-10 space-y-4 bg-emerald-50 rounded-2xl border border-emerald-200 p-6">
                <div className="w-14 h-14 bg-emerald-600 text-white rounded-full flex items-center justify-center mx-auto shadow-md">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-xl font-black text-emerald-900">Enterprise Consultation Scheduled!</h4>
                <p className="text-xs sm:text-sm text-emerald-800 max-w-md mx-auto">
                  Thank you, <strong>{demoForm.name}</strong>. An EduSphere Institutional Account Executive will contact you at <strong>{demoForm.workEmail}</strong> within 1 business day.
                </p>
                <div className="pt-2">
                  <Link
                    to="/org/dashboard"
                    className="inline-block px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl shadow-xs"
                  >
                    Enter Org Admin Portal Now
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleDemoSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Full Name</label>
                    <input
                      type="text"
                      required
                      value={demoForm.name}
                      onChange={(e) => setDemoForm({ ...demoForm, name: e.target.value })}
                      placeholder="e.g. Dr. Arthur Pendelton"
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E0D7CB] rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Work Email</label>
                    <input
                      type="email"
                      required
                      value={demoForm.workEmail}
                      onChange={(e) => setDemoForm({ ...demoForm, workEmail: e.target.value })}
                      placeholder="arthur@university.edu"
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E0D7CB] rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Organization / University Name</label>
                    <input
                      type="text"
                      required
                      value={demoForm.orgName}
                      onChange={(e) => setDemoForm({ ...demoForm, orgName: e.target.value })}
                      placeholder="e.g. Stanford Medical / Apex Global"
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E0D7CB] rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Team or Student Body Size</label>
                    <select
                      value={demoForm.teamSize}
                      onChange={(e) => setDemoForm({ ...demoForm, teamSize: e.target.value })}
                      className="w-full px-3.5 py-2.5 bg-[#FAF7F2] border border-[#E0D7CB] rounded-xl text-xs text-slate-900 focus:outline-none focus:border-blue-500 focus:bg-white"
                    >
                      <option value="10-50">10 - 50 Learners</option>
                      <option value="50-200">50 - 200 Learners</option>
                      <option value="200-1000">200 - 1,000 Learners</option>
                      <option value="1000+">1,000+ Campus / Enterprise</option>
                    </select>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-3.5 px-6 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs sm:text-sm shadow-md shadow-blue-600/25 transition-all flex items-center justify-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>Submit Request for Institutional Consultation</span>
                  </button>
                </div>
              </form>
            )}

          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 7. COMPREHENSIVE FOOTER */}
      {/* ────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#E5DDD2] bg-[#FAF7F2] pt-12 pb-8 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-[#E5DDD2]">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-black">
                <Building2 className="w-4 h-4" />
              </div>
              <span className="font-black text-slate-900 text-base">
                EduSphere <span className="text-blue-600">For Business & Universities</span>
              </span>
            </div>

            <div className="flex items-center gap-4 text-xs font-semibold text-slate-600">
              <Link to="/" className="hover:text-blue-600 transition-colors">Student LMS</Link>
              <Link to="/instructor" className="hover:text-blue-600 transition-colors">Educator Studio</Link>
              <Link to="/org/dashboard" className="text-blue-600 font-bold hover:underline">Org Admin Panel</Link>
              <Link to="/admin" className="hover:text-blue-600 transition-colors">Super Admin</Link>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500 text-[11px]">
            <p>© 2026 EduSphere Global Inc. Institutional & Enterprise Portal. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link to="/terms" className="hover:text-slate-800 transition-colors">Enterprise Terms</Link>
              <Link to="/privacy" className="hover:text-slate-800 transition-colors">Privacy Statement</Link>
              <Link to="/honor-code" className="hover:text-slate-800 transition-colors">Security & Compliance</Link>
            </div>
          </div>
        </div>
      </footer>

    </div>
  );
}