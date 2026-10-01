import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
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
  Search,
  ChevronDown,
  ChevronUp,
  Star,
  Clock,
  Layers,
  Briefcase,
  Play,
  TrendingUp,
  Compass,
  Globe2,
  Check,
  Code,
  Brain,
  BarChart3,
  Cpu,
  Database,
  Lock,
  ExternalLink,
  Menu,
  X
} from 'lucide-react';
import { api } from '../services/api';

export default function Landing() {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [loadingCourses, setLoadingCourses] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [isExploreOpen, setIsExploreOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState('monthly'); // 'monthly' | 'annually'
  const [openFaqIndex, setOpenFaqIndex] = useState(null);
  const [showAllFaqs, setShowAllFaqs] = useState(false);

  // Curated categories
  const categories = [
    { name: 'All', icon: Compass, count: '200+ Courses' },
    { name: 'AI & Machine Learning', icon: Brain, count: '48 Courses' },
    { name: 'Computer Science', icon: Code, count: '62 Courses' },
    { name: 'Data Science & Analytics', icon: BarChart3, count: '35 Courses' },
    { name: 'Cloud Architecture & DevOps', icon: Cpu, count: '28 Courses' },
    { name: 'Business Leadership', icon: Briefcase, count: '40 Courses' },
    { name: 'Cybersecurity', icon: Lock, count: '18 Courses' }
  ];

  // Partner institutions
  const partners = [
    { name: 'Stanford Online', logo: '🏛️ Stanford', tag: 'Top Academic Partner' },
    { name: 'MITx Open Learning', logo: '🔬 MITx', tag: 'Pioneer in Engineering' },
    { name: 'Google Cloud Academy', logo: '☁️ Google Cloud', tag: 'Industry Certification' },
    { name: 'IBM Skills Network', logo: '💻 IBM Tech', tag: 'Enterprise AI & Data' },
    { name: 'Imperial College London', logo: '🎓 Imperial', tag: 'Global Research' },
    { name: 'DeepLearn Institute', logo: '⚡ DeepLearn AI', tag: 'Specialized Neural Nets' }
  ];

  // Updated subscriber testimonials with requested names
  const testimonials = [
    {
      name: 'Abigail P.',
      role: 'Product Lead & Lifelong Learner',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
      quote: '"I have a full-time job and 3 kids. I needed the flexibility offered by EduSphere Plus in order to achieve my goals. My EduSphere Plus subscription motivated me to keep learning."'
    },
    {
      name: 'Warner',
      role: 'AI Researcher & Data Engineer',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
      quote: '"EduSphere Plus keeps me motivated to learn. With each course, I\'m getting more value out of my subscription. I can access cutting-edge specializations almost instantly!"'
    },
    {
      name: 'Swapna N.',
      role: 'Cloud Architect & Educator',
      avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
      quote: '"I really appreciate the flexibility I get with EduSphere Plus. I can try any course and switch to another one for no additional cost. This motivates me to learn even more!"'
    }
  ];

  // FAQ list
  const faqs = [
    {
      q: 'Can I try EduSphere Plus first, to make sure it\'s right for me?',
      a: 'Yes! We offer a full 7-day free trial on EduSphere Plus plans. You can access all masterclasses, practice labs, and lecture materials without being charged until your trial concludes.'
    },
    {
      q: 'What is included in EduSphere Plus?',
      a: 'EduSphere Plus provides unlimited access to over 7,000 courses, Specializations, and Professional Certificates taught by top faculty from Stanford, MITx, IBM, and Google Cloud.'
    },
    {
      q: 'Will I save money with EduSphere Plus?',
      a: 'If you plan to earn 2 or more course certificates or complete a multi-course specialization per year, EduSphere Plus saves up to 60% compared to purchasing individual course enrollments.'
    },
    {
      q: 'Can I cancel my subscription at any time?',
      a: 'Yes, absolutely. You can cancel your subscription with one click from your student account settings before the next renewal date with zero penalties or hidden fees.'
    },
    {
      q: 'Are certificates accredited and shareable on LinkedIn?',
      a: 'Yes! Every verified certificate includes a unique verification hash, QR code, and direct one-click LinkedIn and resume sharing options.'
    },
    {
      q: 'How does team & enterprise billing work for organizations?',
      a: 'EduSphere for Teams offers centralized seat provisioning, consolidated quarterly or annual invoicing, LMS integration, and custom skills benchmark analytics.'
    },
    {
      q: 'Can instructors earn revenue by publishing courses on EduSphere?',
      a: 'Yes, our Educator Studio provides direct 70% royalty distribution, real-time learner telemetry, and automated quiz evaluation.'
    },
    {
      q: 'How do I switch between Student, Instructor, Org, and Super Admin portals?',
      a: 'You can use the dedicated portal switcher buttons at the top of the page to instantly access any role portal.'
    }
  ];

  // Fallback courses
  const fallbackCourses = [
    {
      id: 'crs-1',
      title: 'Advanced Enterprise Cloud Architecture & Distributed Systems',
      category: 'Cloud Architecture & DevOps',
      institution: 'Stanford Online & Nexus',
      instructorName: 'Prof. James Wilson',
      rating: 4.9,
      reviewCount: '14,820',
      level: 'Intermediate',
      totalHours: '24 hours',
      modulesCount: 4,
      thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80',
      badge: 'Specialization'
    },
    {
      id: 'crs-2',
      title: 'Deep Learning & Large Language Models Specialization',
      category: 'AI & Machine Learning',
      institution: 'DeepLearn Institute',
      instructorName: 'Dr. Sarah Jenkins',
      rating: 4.95,
      reviewCount: '28,450',
      level: 'Advanced',
      totalHours: '32 hours',
      modulesCount: 5,
      thumbnail: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&auto=format&fit=crop&q=80',
      badge: 'Professional Certificate'
    },
    {
      id: 'crs-3',
      title: 'Fullstack Modern Web Engineering with React, Node & TypeScript',
      category: 'Computer Science',
      institution: 'MITx Open Learning',
      instructorName: 'Elena Rostova',
      rating: 4.88,
      reviewCount: '9,340',
      level: 'Beginner',
      totalHours: '28 hours',
      modulesCount: 6,
      thumbnail: 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80',
      badge: 'Specialization'
    },
    {
      id: 'crs-4',
      title: 'Applied Data Science & Machine Learning with Python',
      category: 'Data Science & Analytics',
      institution: 'IBM Skills Network',
      instructorName: 'Robert Brown',
      rating: 4.85,
      reviewCount: '19,100',
      level: 'Beginner',
      totalHours: '20 hours',
      modulesCount: 4,
      thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
      badge: 'Course'
    },
    {
      id: 'crs-5',
      title: 'Strategic Fintech, Blockchain & Modern Payment Rails',
      category: 'Business Leadership',
      institution: 'Imperial College London',
      instructorName: 'Dr. Sarah Jenkins',
      rating: 4.92,
      reviewCount: '7,630',
      level: 'Intermediate',
      totalHours: '16 hours',
      modulesCount: 3,
      thumbnail: 'https://images.unsplash.com/photo-1559526324-4b87b5e36e44?w=600&auto=format&fit=crop&q=80',
      badge: 'MasterTrack Certificate'
    },
    {
      id: 'crs-6',
      title: 'Cybersecurity Analyst & Threat Intelligence Fundamentals',
      category: 'Cybersecurity',
      institution: 'Google Cloud Academy',
      instructorName: 'Marcus Vance',
      rating: 4.89,
      reviewCount: '12,500',
      level: 'Beginner',
      totalHours: '22 hours',
      modulesCount: 4,
      thumbnail: 'https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80',
      badge: 'Professional Certificate'
    }
  ];

  // Fetch live courses
  useEffect(() => {
    async function loadCourses() {
      try {
        setLoadingCourses(true);
        const data = await api.courses.list();
        if (data && Array.isArray(data) && data.length > 0) {
          const formatted = data.map((c, idx) => ({
            id: c.id || `crs-${idx + 1}`,
            title: c.title,
            category: c.category || 'Computer Science',
            institution: c.institution || 'EduSphere University Consortium',
            instructorName: c.leadInstructorName || c.instructorName || 'Lead Faculty',
            rating: c.rating || 4.9,
            reviewCount: `${((idx + 3) * 1240).toLocaleString()}`,
            level: c.level || 'Intermediate',
            totalHours: c.totalHours || '20 hours',
            modulesCount: c.modules?.length || c.modulesCount || 4,
            thumbnail: c.thumbnail || fallbackCourses[idx % fallbackCourses.length].thumbnail,
            badge: idx % 2 === 0 ? 'Specialization' : 'Professional Certificate'
          }));
          setCourses(formatted);
        } else {
          setCourses(fallbackCourses);
        }
      } catch (err) {
        console.warn('Using fallback courses for landing preview:', err.message);
        setCourses(fallbackCourses);
      } finally {
        setLoadingCourses(false);
      }
    }
    loadCourses();
  }, []);

  const filteredCourses = (courses.length > 0 ? courses : fallbackCourses).filter((course) => {
    const matchesCategory =
      selectedCategory === 'All' ||
      course.category.toLowerCase().includes(selectedCategory.toLowerCase()) ||
      (selectedCategory === 'AI & Machine Learning' && (course.category.includes('AI') || course.title.includes('AI') || course.title.includes('Learning')));
    
    const matchesSearch =
      !searchQuery ||
      course.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.category.toLowerCase().includes(searchQuery.toLowerCase()) ||
      course.instructorName.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      const catalogEl = document.getElementById('catalog-section');
      if (catalogEl) {
        catalogEl.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const displayedFaqs = showAllFaqs ? faqs : faqs.slice(0, 3);

  return (
    <div className="min-h-screen bg-[#FAF7F2] text-slate-900 selection:bg-blue-600 selection:text-white flex flex-col justify-between font-sans">
      
      {/* ────────────────────────────────────────────────────────────── */}
      {/* 0. TOP PORTAL SWITCHER STRIP (UPPERCASE BUTTONS) */}
      {/* ────────────────────────────────────────────────────────────── */}
      <div className="bg-[#F2ECE4] border-b border-[#E5DDD2] py-2 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span className="hidden sm:inline">QUICK ACCESS PORTALS:</span>
          </div>

          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <Link
              to="/"
              className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-900 border-2 border-emerald-500 uppercase text-[10px] sm:text-[11px] font-black tracking-wider shadow-xs flex items-center gap-1.5"
            >
              <GraduationCap className="w-3.5 h-3.5 text-emerald-700" />
              <span>STUDENT / LEARNER</span>
            </Link>

            <Link
              to="/organization/landing"
              className="px-3 py-1.5 rounded-lg bg-white hover:bg-blue-50 text-blue-800 border border-blue-300/80 uppercase text-[10px] sm:text-[11px] font-extrabold tracking-wider shadow-2xs hover:shadow-xs transition-all flex items-center gap-1.5"
            >
              <Building2 className="w-3.5 h-3.5 text-blue-600" />
              <span>ORGANIZATION ADMIN</span>
            </Link>
          </div>
        </div>
      </div>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 1. MEGA NAVIGATION HEADER */}
      {/* ────────────────────────────────────────────────────────────── */}
      <header className="border-b border-[#E5DDD2] bg-[#FAF7F2]/95 backdrop-blur-md sticky top-0 z-50 transition-all shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          
          {/* Left: Brand Logo & Explore Dropdown */}
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-3 group">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-blue-800 flex items-center justify-center font-black text-white text-xl shadow-md shadow-blue-500/20 group-hover:scale-105 transition-transform">
                E
              </div>
              <div>
                <span className="font-black text-xl tracking-tight text-slate-900 flex items-center gap-1">
                  Edu<span className="text-blue-600">Sphere</span>
                </span>
                <span className="text-[10px] text-slate-500 tracking-wider uppercase font-bold block -mt-1">
                  Learn Without Limits
                </span>
              </div>
            </Link>

            {/* Explore Mega Menu Button */}
            <div className="relative hidden lg:block">
              <button
                type="button"
                onClick={() => setIsExploreOpen(!isExploreOpen)}
                className="px-4 py-2 rounded-xl bg-white hover:bg-[#F2ECE4] border border-[#E0D7CB] text-slate-800 font-bold text-xs flex items-center gap-2 transition-all shadow-2xs"
              >
                <Compass className="w-4 h-4 text-blue-600" />
                <span>Explore Categories</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform text-slate-500 ${isExploreOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Explore Popover Menu */}
              {isExploreOpen && (
                <div
                  onMouseLeave={() => setIsExploreOpen(false)}
                  className="absolute left-0 mt-3 w-80 bg-white border border-[#E0D7CB] rounded-2xl p-3 shadow-xl shadow-stone-900/10 z-50 animate-fadeIn"
                >
                  <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-slate-500 border-b border-[#F2ECE4]">
                    Browse Popular Domains
                  </div>
                  <div className="py-2 space-y-1">
                    {categories.map((cat, idx) => {
                      const Icon = cat.icon;
                      return (
                        <button
                          key={idx}
                          type="button"
                          onClick={() => {
                            setSelectedCategory(cat.name);
                            setIsExploreOpen(false);
                            const el = document.getElementById('catalog-section');
                            if (el) el.scrollIntoView({ behavior: 'smooth' });
                          }}
                          className="w-full px-3 py-2 rounded-xl hover:bg-[#FAF7F2] text-left flex items-center justify-between text-xs text-slate-700 hover:text-blue-600 transition-colors group"
                        >
                          <div className="flex items-center gap-2.5">
                            <Icon className="w-4 h-4 text-blue-600 group-hover:scale-110 transition-transform" />
                            <span className="font-semibold">{cat.name}</span>
                          </div>
                          <span className="text-[10px] text-slate-400">{cat.count}</span>
                        </button>
                      );
                    })}
                  </div>
                  <div className="p-2 border-t border-[#F2ECE4] text-center">
                    <Link
                      to="/student/explore"
                      className="text-xs font-bold text-blue-600 hover:text-blue-700 block"
                    >
                      View All 200+ Courses & Degrees →
                    </Link>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Center: Live Search Bar */}
          <div className="hidden md:flex flex-1 max-w-md mx-2">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Search className="w-4 h-4" />
              </div>
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="What do you want to learn today? (e.g., AI, React, Cloud)"
                className="w-full pl-10 pr-20 py-2.5 bg-white border border-[#E0D7CB] rounded-xl text-slate-900 placeholder-slate-400 text-xs focus:bg-white focus:outline-none focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-2xs"
              />
              <button
                type="submit"
                className="absolute inset-y-1 right-1 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-[11px] font-bold transition-colors flex items-center shadow-xs"
              >
                Search
              </button>
            </form>
          </div>

          {/* Right: Quick Links & Auth Buttons */}
          <div className="hidden sm:flex items-center gap-3">
            <Link
              to="/student/explore"
              className="text-xs font-semibold text-slate-700 hover:text-blue-600 px-2 py-1 transition-colors"
            >
              Courses
            </Link>
            <Link
              to="/organization/landing"
              className="text-xs font-semibold text-slate-700 hover:text-blue-600 px-2 py-1 transition-colors"
            >
              For Enterprise
            </Link>

            <div className="h-5 w-px bg-[#E0D7CB]" />

            <Link
              to="/signin"
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-700 hover:text-blue-600 hover:bg-white border border-[#E0D7CB] transition-all bg-[#FAF7F2]"
            >
              Log In
            </Link>
            <Link
              to="/signup"
              className="px-4 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              Join for Free
            </Link>
          </div>

          {/* Mobile Menu Toggle */}
          <div className="sm:hidden flex items-center gap-2">
            <Link
              to="/signin"
              className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 text-white"
            >
              Sign In
            </Link>
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg bg-white border border-[#E0D7CB] text-slate-700"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        {mobileMenuOpen && (
          <div className="sm:hidden border-t border-[#E5DDD2] bg-[#FAF7F2] px-4 py-4 space-y-3 shadow-lg">
            <form onSubmit={handleSearchSubmit} className="relative w-full">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search courses, skills, degrees..."
                className="w-full pl-3 pr-10 py-2 bg-white border border-[#E0D7CB] rounded-lg text-xs text-slate-900"
              />
            </form>
            <div className="grid grid-cols-2 gap-2 pt-2">
              <Link to="/student/explore" className="p-2 rounded-lg bg-white border border-[#E0D7CB] text-center text-xs font-bold text-slate-800">
                Catalog
              </Link>
              <Link to="/signup" className="p-2 rounded-lg bg-blue-600 text-center text-xs font-bold text-white">
                Join Free
              </Link>
              <Link to="/instructor" className="p-2 rounded-lg bg-white border border-[#E0D7CB] text-center text-xs text-slate-700 font-semibold">
                Educators
              </Link>
              <Link to="/organization/landing" className="p-2 rounded-lg bg-white border border-[#E0D7CB] text-center text-xs text-slate-700 font-semibold">
                Enterprise
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 2. HERO SECTION */}
      {/* ────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden pt-12 pb-16 sm:pt-20 sm:pb-24 border-b border-[#E5DDD2] bg-gradient-to-b from-[#FAF7F2] via-[#F4EFE6] to-[#FAF7F2]">
        
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Hero Left: Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#E0D7CB] text-blue-800 text-xs font-bold uppercase tracking-wider shadow-2xs">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Next-Gen Global Academic & Professional LMS</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-[1.1]">
                Learn Without Limits. <br />
                <span className="bg-gradient-to-r from-blue-700 via-indigo-700 to-blue-900 bg-clip-text text-transparent">
                  Master In-Demand Skills.
                </span>
              </h1>

              <p className="text-base sm:text-lg text-slate-600 max-w-2xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Build job-ready expertise with online courses, verified specializations, and accredited university credentials from the world's leading faculty.
              </p>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4 pt-2">
                <Link
                  to="/signup"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-sm flex items-center justify-center gap-2 shadow-lg shadow-blue-600/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                >
                  <span>Join EduSphere for Free</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <Link
                  to="/student/explore"
                  className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white hover:bg-[#F2ECE4] text-slate-800 hover:text-blue-600 font-bold text-sm border border-[#E0D7CB] shadow-2xs transition-all flex items-center justify-center gap-2"
                >
                  <BookOpen className="w-4 h-4 text-blue-600" />
                  <span>Explore 200+ Courses</span>
                </Link>
              </div>

              {/* Trust Indicators Strip */}
              <div className="pt-6 grid grid-cols-3 gap-4 border-t border-[#E5DDD2] max-w-lg mx-auto lg:mx-0 text-left">
                <div>
                  <div className="text-xl sm:text-2xl font-black text-slate-900">120K+</div>
                  <div className="text-[11px] text-slate-500 font-medium">Enrolled Learners</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-blue-700">4.9 ★</div>
                  <div className="text-[11px] text-slate-500 font-medium">Average Rating</div>
                </div>
                <div>
                  <div className="text-xl sm:text-2xl font-black text-emerald-700">100%</div>
                  <div className="text-[11px] text-slate-500 font-medium">Online & Self-Paced</div>
                </div>
              </div>
            </div>

            {/* Hero Right: Live Interactive Card Preview */}
            <div className="lg:col-span-5 relative">
              <div className="bg-white border border-[#E0D7CB] rounded-3xl p-6 shadow-xl shadow-stone-900/5 relative overflow-hidden backdrop-blur-xl group hover:border-blue-300 transition-all">
                
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                    <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">Live Active Session</span>
                  </div>
                  <span className="text-xs font-bold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
                    Stanford Online Partner
                  </span>
                </div>

                <div className="relative rounded-2xl overflow-hidden mb-4 aspect-video bg-stone-100">
                  <img
                    src="https://images.unsplash.com/photo-1620712943543-bcc4688e7485?w=600&auto=format&fit=crop&q=80"
                    alt="AI Course"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 via-slate-950/30 to-transparent flex items-end p-4">
                    <div>
                      <span className="text-[10px] font-bold text-cyan-300 uppercase tracking-wider">Module 3 of 5</span>
                      <h4 className="text-sm font-bold text-white">Transformer Attention & PyTorch Implementations</h4>
                    </div>
                  </div>
                </div>

                {/* Interactive Learner Progress Gauge */}
                <div className="space-y-3 bg-[#FAF7F2] rounded-2xl p-4 border border-[#E5DDD2]">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-700 font-semibold">Specialization Progress</span>
                    <span className="text-blue-700 font-bold">78% Complete</span>
                  </div>
                  <div className="w-full h-2 bg-[#E5DDD2] rounded-full overflow-hidden">
                    <div className="h-full bg-gradient-to-r from-blue-600 to-indigo-600 rounded-full w-[78%]" />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1">
                    <span>14 Lessons Mastered</span>
                    <span className="text-emerald-700 font-bold">Verified Certificate Pending</span>
                  </div>
                </div>

                {/* Quick Link into LMS */}
                <div className="mt-4 pt-4 border-t border-[#F2ECE4] flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center text-xs font-bold shadow-2xs">
                      SJ
                    </div>
                    <span className="text-xs text-slate-700 font-semibold">Dr. Sarah Jenkins</span>
                  </div>
                  <Link
                    to="/student/explore"
                    className="text-xs font-bold text-blue-600 hover:text-blue-700 flex items-center gap-1"
                  >
                    <span>View Curriculum</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 3. PARTNERS & ACCREDITATION BANNER */}
      {/* ────────────────────────────────────────────────────────────── */}
      <section className="py-10 bg-[#F4EFE6] border-b border-[#E5DDD2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-center text-xs font-bold uppercase tracking-widest text-slate-500 mb-6">
            We collaborate with 150+ leading universities & enterprise organizations
          </p>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 items-center">
            {partners.map((partner, idx) => (
              <div
                key={idx}
                className="p-3.5 rounded-2xl bg-white border border-[#E0D7CB] text-center hover:border-blue-300 hover:shadow-sm transition-all shadow-2xs"
              >
                <span className="font-extrabold text-sm text-slate-800 block">{partner.logo}</span>
                <span className="text-[10px] text-slate-500 font-medium block mt-0.5">{partner.tag}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 4. TABBED COURSE EXPLORER & CATALOG (PLACED ABOVE PRICING) */}
      {/* ────────────────────────────────────────────────────────────── */}
      <section id="catalog-section" className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
          <div>
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white text-blue-800 text-xs font-bold uppercase tracking-wider mb-2 border border-[#E0D7CB]">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              <span>Explore Top Programs</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Start Learning with World-Class Courses
            </h2>
            <p className="text-sm text-slate-600 mt-1 max-w-2xl">
              Select a domain below or search to discover curated masterclasses, practical code labs, and accredited certifications.
            </p>
          </div>

          <Link
            to="/student/explore"
            className="text-xs sm:text-sm font-bold text-blue-700 hover:text-blue-800 flex items-center gap-1.5 shrink-0"
          >
            <span>See Full 200+ Course Catalog</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-4 mb-8 scrollbar-none">
          {categories.map((cat, idx) => {
            const isSelected = selectedCategory === cat.name;
            return (
              <button
                key={idx}
                type="button"
                onClick={() => setSelectedCategory(cat.name)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-sm'
                    : 'bg-white border border-[#E0D7CB] text-slate-700 hover:text-blue-600 shadow-2xs'
                }`}
              >
                <span>{cat.name}</span>
              </button>
            );
          })}
        </div>

        {/* Course Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses.map((course, idx) => (
            <div
              key={course.id || idx}
              className="group bg-white border border-[#E0D7CB] rounded-3xl overflow-hidden flex flex-col justify-between hover:border-blue-400 hover:shadow-md transition-all duration-300 shadow-2xs"
            >
              <div>
                {/* Thumbnail Header */}
                <div className="relative aspect-video overflow-hidden bg-stone-100">
                  <img
                    src={course.thumbnail}
                    alt={course.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md px-2.5 py-1 rounded-lg text-[10px] font-bold text-slate-800 border border-[#E0D7CB]">
                    {course.badge || 'Specialization'}
                  </div>
                  <div className="absolute top-3 right-3 bg-blue-600 text-white px-2 py-0.5 rounded-md text-[10px] font-extrabold uppercase">
                    {course.level}
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-3">
                  <div className="text-[11px] font-bold text-blue-700 uppercase tracking-wider">
                    {course.institution}
                  </div>

                  <h3 className="font-extrabold text-base text-slate-900 group-hover:text-blue-600 transition-colors leading-snug line-clamp-2">
                    {course.title}
                  </h3>

                  <div className="text-xs text-slate-500 flex items-center gap-2">
                    <span>Instructor: <strong className="text-slate-800">{course.instructorName}</strong></span>
                  </div>

                  {/* Rating & Stats */}
                  <div className="flex items-center gap-3 pt-1 text-xs">
                    <div className="flex items-center gap-1 font-bold text-amber-500">
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      <span>{course.rating}</span>
                    </div>
                    <span className="text-slate-400">({course.reviewCount || '1.2k'} reviews)</span>
                    <span className="text-slate-300">•</span>
                    <div className="flex items-center gap-1 text-slate-500 font-medium">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{course.totalHours}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Card Footer CTA */}
              <div className="p-5 pt-0">
                <Link
                  to={`/student/explore`}
                  className="w-full py-2.5 px-4 rounded-xl bg-[#FAF7F2] hover:bg-blue-600 text-slate-800 hover:text-white border border-[#E0D7CB] hover:border-blue-600 text-xs font-bold flex items-center justify-center gap-2 transition-all shadow-2xs"
                >
                  <span>Enroll & Learn More</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 5. SUBSCRIBER TESTIMONIALS (Hear from Subscribers) */}
      {/* ────────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 bg-[#F4EFE6] border-t border-[#E5DDD2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="mb-8">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              Is EduSphere Plus worth it? Hear from subscribers
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Read authentic feedback from working professionals and students leveling up their careers.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div
                key={idx}
                className="bg-white border border-[#E0D7CB] rounded-3xl p-6 flex flex-col justify-between shadow-2xs hover:shadow-md hover:border-blue-300 transition-all"
              >
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <img
                      src={t.avatar}
                      alt={t.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-blue-100"
                    />
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">{t.name}</h4>
                      <span className="text-[11px] text-slate-500 font-medium">{t.role}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 text-amber-500">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  <p className="text-xs text-slate-700 leading-relaxed font-normal italic">
                    {t.quote}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-[#F2ECE4] flex items-center justify-between text-[11px] text-slate-400">
                  <span>Verified Subscriber</span>
                  <span className="text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3 text-emerald-600" /> Active Student
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 6. PRICING & SUBSCRIPTION PLANS (Find the right plan) */}
      {/* ────────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        
        <div className="mb-10 text-center sm:text-left">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Find the right plan for your goals
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Choose flexible individual masterclasses or unlock thousands of accredited programs with EduSphere Plus.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
          
          {/* Card 1: Individual Courses & Programs */}
          <div className="bg-white border border-[#E0D7CB] rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all">
            <div className="space-y-4">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">Individual Courses & Programs</h3>
                <p className="text-xs text-slate-500 mt-1">Learn a single topic or skill and earn an accredited credential</p>
              </div>

              <div className="pt-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">₹1,699</span>
                  <span className="text-xs text-slate-500 font-semibold">/month</span>
                </div>
                <span className="text-[11px] text-slate-400 block mt-0.5">Visit a course to purchase</span>
              </div>

              <div className="pt-2">
                <Link
                  to="/student/explore"
                  className="w-full py-3 px-4 rounded-xl border-2 border-blue-600 text-blue-700 hover:bg-blue-50 font-bold text-xs flex items-center justify-center gap-1.5 transition-all text-center"
                >
                  <span>Explore courses</span>
                </Link>
              </div>

              <div className="pt-4 border-t border-[#F2ECE4] space-y-2.5">
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">Key features:</span>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                    <span>Choose from thousands of courses in AI, business, technology, and more</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                    <span>Earn a shareable certificate upon completion</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                    <span>Pay once for a single course or subscribe to a bundled Specialization</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          {/* Card 2: EduSphere Plus (Best Value Featured) */}
          <div className="bg-white border-2 border-blue-600 rounded-3xl overflow-hidden flex flex-col justify-between shadow-xl shadow-blue-900/10 relative">
            {/* Best Value Banner */}
            <div className="bg-[#002244] text-white text-center py-2 text-xs font-black uppercase tracking-wider">
              Best value
            </div>

            <div className="p-6 sm:p-8 space-y-4 flex-1 flex flex-col justify-between">
              <div className="space-y-4">
                <div>
                  <h3 className="font-black text-xl text-slate-900">EduSphere Plus</h3>
                  <p className="text-xs text-slate-500 mt-1">Master multiple topics or skills and earn unlimited credentials</p>
                </div>

                {/* Billing Radio Toggle */}
                <div className="flex items-center gap-4 text-xs font-semibold pt-1">
                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="billing"
                      checked={billingCycle === 'monthly'}
                      onChange={() => setBillingCycle('monthly')}
                      className="text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>Billed Monthly</span>
                  </label>

                  <label className="flex items-center gap-1.5 cursor-pointer select-none">
                    <input
                      type="radio"
                      name="billing"
                      checked={billingCycle === 'annually'}
                      onChange={() => setBillingCycle('annually')}
                      className="text-blue-600 focus:ring-blue-500 w-4 h-4"
                    />
                    <span>Billed Annually</span>
                    <span className="bg-[#002244] text-white text-[10px] font-bold px-2 py-0.5 rounded-full ml-0.5">
                      Save 40%
                    </span>
                  </label>
                </div>

                <div className="pt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-black text-slate-900">
                      {billingCycle === 'monthly' ? '₹2,099' : '₹1,259'}
                    </span>
                    <span className="text-xs text-slate-500 font-semibold">/month</span>
                  </div>
                  <span className="text-[11px] text-slate-400 block mt-0.5">Cancel anytime</span>
                </div>

                <div className="pt-2">
                  <Link
                    to="/signup"
                    className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs flex items-center justify-center gap-1.5 shadow-md shadow-blue-600/25 transition-all text-center"
                  >
                    <span>Start 7-day free trial</span>
                  </Link>
                </div>

                <div className="pt-4 border-t border-[#F2ECE4] space-y-2.5">
                  <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">Key features:</span>
                  <ul className="space-y-2 text-xs text-slate-600">
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>Access thousands of courses in AI, business, technology, and more with one subscription</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>Earn unlimited certificates after your trial ends</span>
                    </li>
                    <li className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
                      <span>Learn job-relevant skills and tools with hands-on labs and projects from Industry experts</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>

          {/* Card 3: EduSphere for Teams */}
          <div className="bg-white border border-[#E0D7CB] rounded-3xl p-6 sm:p-8 flex flex-col justify-between shadow-2xs hover:shadow-md transition-all">
            <div className="space-y-4">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">EduSphere for Teams</h3>
                <p className="text-xs text-slate-500 mt-1">Upskill up to 125 employees across multiple departments</p>
              </div>

              <div className="pt-2">
                <div className="flex items-baseline gap-1">
                  <span className="text-3xl font-black text-slate-900">₹24,631.71</span>
                  <span className="text-xs text-slate-500 font-semibold">/year</span>
                </div>
                <span className="text-[11px] text-slate-400 block mt-0.5">Per user for 12 months</span>
              </div>

              <div className="pt-2">
                <Link
                  to="/organization/landing"
                  className="w-full py-3 px-4 rounded-xl border-2 border-blue-600 text-blue-700 hover:bg-blue-50 font-bold text-xs flex items-center justify-center gap-1.5 transition-all text-center"
                >
                  <span>Get started</span>
                </Link>
              </div>

              <div className="pt-4 border-t border-[#F2ECE4] space-y-2.5">
                <span className="text-[11px] font-bold text-slate-800 uppercase tracking-wider block">Key features:</span>
                <ul className="space-y-2 text-xs text-slate-600">
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                    <span>Access to everything included in EduSphere Plus</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                    <span>Analytics and custom benchmark reporting</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                    <span>AI-powered program builder & personalized learning paths</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="w-4 h-4 text-slate-700 shrink-0 mt-0.5" />
                    <span>Flexible payment options like quarterly billing and invoicing</span>
                  </li>
                </ul>
              </div>
            </div>
          </div>

        </div>

      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 7. PROMO CALLOUT BANNER (Time's on your side) */}
      {/* ────────────────────────────────────────────────────────────── */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="bg-[#004bbb] rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl shadow-blue-900/15">
          <div className="space-y-3 max-w-2xl text-center md:text-left z-10">
            <div className="inline-flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider">
              <span>EDUSPHERE PLUS</span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-black leading-snug">
              Time's on your side. Start turning minutes into milestones.
            </h3>
            <p className="text-xs sm:text-sm text-blue-100 leading-relaxed font-normal">
              In just seven days, you can move from short lessons to real skills. Ready to make today count?
            </p>
            <div className="pt-2">
              <Link
                to="/signup"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white hover:bg-blue-50 text-[#004bbb] font-extrabold text-xs shadow-md transition-all hover:scale-[1.02]"
              >
                <span>Start 7-day free trial</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          <div className="relative z-10 shrink-0">
            <img
              src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=300&auto=format&fit=crop&q=80"
              alt="Learner studying"
              className="w-40 h-40 sm:w-48 sm:h-48 object-cover rounded-3xl border-4 border-white/30 shadow-2xl"
            />
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 8. FREQUENTLY ASKED QUESTIONS (Interactive Accordion) */}
      {/* ────────────────────────────────────────────────────────────── */}
      <section className="py-16 sm:py-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
        <div className="mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
            Frequently asked questions
          </h2>
          <p className="text-sm text-slate-600 mt-1">
            Quick answers about subscriptions, accreditation, and institutional access.
          </p>
        </div>

        <div className="bg-white border border-[#E0D7CB] rounded-3xl p-6 sm:p-8 divide-y divide-[#F2ECE4] shadow-2xs">
          {displayedFaqs.map((faq, idx) => {
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
                  <div className="w-6 h-6 rounded-full bg-[#FAF7F2] flex items-center justify-center shrink-0 text-slate-500 group-hover:text-blue-600">
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

          {/* Show all button */}
          <div className="pt-6 text-center border-t border-[#F2ECE4]">
            <button
              type="button"
              onClick={() => setShowAllFaqs(!showAllFaqs)}
              className="text-xs sm:text-sm font-bold text-blue-700 hover:text-blue-800 inline-flex items-center gap-1.5"
            >
              <span>{showAllFaqs ? 'Show fewer questions' : `Show all ${faqs.length} frequently asked questions`}</span>
              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAllFaqs ? 'rotate-180' : ''}`} />
            </button>
          </div>
        </div>

        <div className="text-[11px] text-slate-400 mt-4">
          1 - Source: 2026 EduSphere Global Learner Outcomes Report
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 9. PRE-FOOTER ROYAL BLUE CTA BANNER */}
      {/* ────────────────────────────────────────────────────────────── */}
      <section className="bg-[#004bbb] py-16 text-white text-center">
        <div className="max-w-4xl mx-auto px-4 space-y-4">
          <div className="inline-flex items-center gap-2 bg-white/20 px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-wider">
            <span>EDUSPHERE PLUS</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-black">
            Start in minutes today.
          </h2>
          <p className="text-lg text-blue-100 font-medium">
            Build skills this week.
          </p>
          <div className="pt-4">
            <Link
              to="/signup"
              className="inline-block px-8 py-3.5 rounded-xl bg-white hover:bg-blue-50 text-[#004bbb] font-extrabold text-sm shadow-xl transition-all hover:scale-[1.02]"
            >
              Start 7-day free trial
            </Link>
          </div>
        </div>
      </section>

      {/* ────────────────────────────────────────────────────────────── */}
      {/* 10. COMPREHENSIVE FOOTER */}
      {/* ────────────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#E5DDD2] bg-[#FAF7F2] pt-16 pb-12 text-xs text-slate-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
            
            {/* Col 1: Skills */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Skills</h4>
              <ul className="space-y-2 text-slate-600">
                <li><Link to="/student/explore" className="hover:text-blue-600 transition-colors">Accounting</Link></li>
                <li><Link to="/student/explore" className="hover:text-blue-600 transition-colors">Artificial Intelligence (AI)</Link></li>
                <li><Link to="/student/explore" className="hover:text-blue-600 transition-colors">Cybersecurity</Link></li>
                <li><Link to="/student/explore" className="hover:text-blue-600 transition-colors">Data Analytics</Link></li>
                <li><Link to="/student/explore" className="hover:text-blue-600 transition-colors">Digital Marketing</Link></li>
                <li><Link to="/student/explore" className="hover:text-blue-600 transition-colors">Human Resources (HR)</Link></li>
              </ul>
            </div>

            {/* Col 2: Professional Certificates */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Professional Certificates</h4>
              <ul className="space-y-2 text-slate-600">
                <li><Link to="/student/explore" className="hover:text-blue-600 transition-colors">Google AI Certificate</Link></li>
                <li><Link to="/student/explore" className="hover:text-blue-600 transition-colors">Google Cybersecurity Certificate</Link></li>
                <li><Link to="/student/explore" className="hover:text-blue-600 transition-colors">Google Data Analytics Certificate</Link></li>
                <li><Link to="/student/explore" className="hover:text-blue-600 transition-colors">Google IT Support Certificate</Link></li>
                <li><Link to="/student/explore" className="hover:text-blue-600 transition-colors">IBM AI Engineering Certificate</Link></li>
              </ul>
            </div>

            {/* Col 3: Courses & Specializations */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Courses & Specializations</h4>
              <ul className="space-y-2 text-slate-600">
                <li><Link to="/student/explore" className="hover:text-blue-600 transition-colors">AI Essentials Specialization</Link></li>
                <li><Link to="/student/explore" className="hover:text-blue-600 transition-colors">AI for Business Specialization</Link></li>
                <li><Link to="/student/explore" className="hover:text-blue-600 transition-colors">Deep Learning Specialization</Link></li>
                <li><Link to="/student/explore" className="hover:text-blue-600 transition-colors">Excel Skills for Business</Link></li>
                <li><Link to="/student/explore" className="hover:text-blue-600 transition-colors">Financial Markets Course</Link></li>
              </ul>
            </div>

            {/* Col 4: Career Resources */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Career Resources</h4>
              <ul className="space-y-2 text-slate-600">
                <li><Link to="/student/explore" className="hover:text-blue-600 transition-colors">Career Aptitude Test</Link></li>
                <li><Link to="/student/explore" className="hover:text-blue-600 transition-colors">CompTIA Security+ Prep</Link></li>
                <li><Link to="/student/explore" className="hover:text-blue-600 transition-colors">Essential IT Certifications</Link></li>
                <li><Link to="/student/explore" className="hover:text-blue-600 transition-colors">High Income Skills to Learn</Link></li>
                <li><Link to="/student/explore" className="hover:text-blue-600 transition-colors">Interview Preparation Guides</Link></li>
              </ul>
            </div>

            {/* Col 5: Platform Portals */}
            <div className="space-y-3">
              <h4 className="font-bold text-slate-900 uppercase tracking-wider text-[11px]">Portals & Gateways</h4>
              <ul className="space-y-2 text-slate-600 font-semibold">
                <li><Link to="/student" className="hover:text-blue-600 transition-colors uppercase text-[11px]">STUDENT PORTAL</Link></li>
                <li><Link to="/instructor" className="hover:text-blue-600 transition-colors uppercase text-[11px]">EDUCATOR STUDIO</Link></li>
                <li><Link to="/organization/landing" className="hover:text-blue-600 transition-colors uppercase text-[11px]">ORGANIZATION PORTAL</Link></li>
                <li><Link to="/admin" className="hover:text-blue-600 transition-colors uppercase text-[11px]">ADMIN CENTER</Link></li>
                <li><Link to="/signin" className="hover:text-blue-600 transition-colors">Sign In Portal</Link></li>
                <li><Link to="/signup" className="hover:text-blue-600 transition-colors">Create Free Account</Link></li>
              </ul>
            </div>

          </div>

          <div className="pt-8 border-t border-[#E5DDD2] flex flex-col sm:flex-row items-center justify-between gap-4 text-slate-500">
            <p>© 2026 EduSphere Global Inc. All rights reserved.</p>
            <div className="flex items-center gap-4">
              <Link to="/privacy" className="hover:text-blue-600 transition-colors">Privacy Policy</Link>
              <Link to="/terms" className="hover:text-blue-600 transition-colors">Terms of Service</Link>
              <Link to="/honor-code" className="hover:text-blue-600 transition-colors">Honor Code</Link>
              <a href="#" onClick={(e) => { e.preventDefault(); alert("Cookie Preferences saved."); }} className="hover:text-blue-600 transition-colors">Cookie Preferences</a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
}
