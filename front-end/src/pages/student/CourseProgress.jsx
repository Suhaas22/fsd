import React, { useState, useEffect } from 'react';
import { Link, useLocation, useParams, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  CheckCircle2, 
  PlayCircle, 
  FileQuestion, 
  Award, 
  Clock, 
  ChevronDown,
  ChevronUp,
  BookOpen,
  ArrowRight,
  TrendingUp,
  BarChart2,
  Lock,
  Layers,
  Sparkles,
  FileText
} from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import api from '../../services/api';

export default function CourseProgress() {
  const location = useLocation();
  const navigate = useNavigate();
  const { courseId } = useParams();
  const [openModules, setOpenModules] = useState([1, 2]);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.student.getEnrollments('lrn-1')
      .then((res) => {
        const list = Array.isArray(res) ? res : (res?.items || []);
        const selected = list.find((item) => item.id === location.state?.enrollmentId)
          || list.find((item) => item.courseId === location.state?.courseId)
          || list.find((item) => item.courseId === courseId);
        setEnrollment(selected || list[0] || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load course progress:', err);
        setLoading(false);
      });
  }, [courseId, location.state?.courseId, location.state?.enrollmentId]);

  const toggleModule = (id) => {
    setOpenModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-coursera border-t-transparent"></div>
        </div>
      </PageLayout>
    );
  }

  if (!enrollment) {
    return (
      <PageLayout>
        <div className="max-w-xl mx-auto py-24 text-center">
          <h1 className="text-xl font-bold text-slate-900">No enrollment found</h1>
          <p className="text-sm text-slate-500 mt-2">Enroll in a course before viewing its progress.</p>
          <Link to="/student/explore" className="inline-block mt-5 px-5 py-2.5 rounded-lg bg-coursera text-white text-sm font-semibold hover:bg-primary transition-colors">
            Explore courses
          </Link>
        </div>
      </PageLayout>
    );
  }

  const courseTitle = enrollment.courseTitle || 'NexusPay Core Architecture';
  const progressPercent = enrollment?.progress ?? 65;

  const modules = [
    {
      id: 1,
      name: 'MODULE 1',
      title: 'Foundations of Payment Orchestration',
      status: 'completed',
      progress: 100,
      items: [
        { id: '1.1', title: '1.1 Core Ledger Architecture & Double Entry', type: 'video', duration: '14 min', completed: true },
        { id: '1.2', title: '1.2 Idempotency Keys & Distributed State Locks', type: 'reading', duration: '8 min', completed: true },
        { id: '1.3', title: '1.3 Knowledge Check: Ledger Fundamentals', type: 'quiz', grade: '95%', duration: '15 min', completed: true }
      ]
    },
    {
      id: 2,
      name: 'MODULE 2',
      title: 'Advanced Routing & High Availability',
      status: 'in-progress',
      progress: 45,
      items: [
        { id: '2.1', title: '2.1 Multi-Gateway Smart Fallback Routing', type: 'video', duration: '18 min', completed: true },
        { id: '2.2', title: '2.2 API Rate Limits & Token Bucket Optimization', type: 'reading', duration: '12 min', current: true, completed: false },
        { id: '2.3', title: '2.3 Graded Assessment: Resilient Failover', type: 'quiz', duration: '20 min', locked: false, completed: false }
      ]
    },
    {
      id: 3,
      name: 'MODULE 3',
      title: 'PCI-DSS Compliance & Card Vaulting',
      status: 'locked',
      progress: 0,
      items: [
        { id: '3.1', title: '3.1 Tokenization Engines & Key Rotation', type: 'video', duration: '22 min', locked: true, completed: false },
        { id: '3.2', title: '3.2 Hardware Security Modules (HSM) Integration', type: 'reading', duration: '15 min', locked: true, completed: false },
        { id: '3.3', title: '3.3 Security Audit & Pen-Testing Protocol', type: 'quiz', duration: '25 min', locked: true, completed: false }
      ]
    }
  ];

  return (
    <PageLayout>
      <div className="bg-[#F8FAFC] min-h-screen">
        <div className="max-w-[1400px] mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Breadcrumb Navigation */}
          <nav className="flex items-center gap-2 text-xs text-slate-500 mb-6 font-medium">
            <Link to="/student/my-learning" className="hover:text-coursera transition-colors">My Learning</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to={`/student/course/${enrollment.courseId || 'c-1'}`} className="hover:text-coursera transition-colors line-clamp-1 max-w-xs">
              {courseTitle}
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-900 font-semibold">Course Progress</span>
          </nav>

          {/* 2-Column Stitch Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Left Syllabus Tree Navigation Sidebar (4 cols) */}
            <aside className="lg:col-span-4 bg-white rounded-xl border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.06)] p-6 space-y-6 lg:sticky lg:top-24">
              <div className="flex items-center gap-4 pb-5 border-b border-slate-100">
                <div className="w-12 h-12 rounded-xl bg-blue-50 text-coursera flex items-center justify-center shrink-0 border border-blue-100">
                  <Layers className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h2 className="text-base font-bold text-slate-900 leading-snug line-clamp-1">{courseTitle}</h2>
                  <p className="text-xs font-semibold text-secondary flex items-center gap-1.5 mt-0.5">
                    <span className="w-2 h-2 rounded-full bg-secondary inline-block"></span>
                    {progressPercent}% Completed
                  </p>
                </div>
              </div>

              {/* Module Nav Links */}
              <div className="space-y-1.5">
                <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-3 py-1">
                  Curriculum Overview
                </div>
                
                <a 
                  href="#module-1"
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm text-slate-700 hover:bg-slate-50 transition-colors group"
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                    <span className="truncate text-xs font-semibold">Module 1: Foundations</span>
                  </span>
                  <span className="text-[11px] font-bold text-secondary bg-emerald-50 px-2 py-0.5 rounded">100%</span>
                </a>

                <a 
                  href="#module-2"
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm bg-blue-50/70 border border-blue-100/60 text-coursera font-bold group"
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <span className="w-2.5 h-2.5 rounded-full bg-coursera animate-pulse shrink-0"></span>
                    <span className="truncate text-xs">Module 2: Advanced Logic</span>
                  </span>
                  <span className="text-[11px] font-bold text-coursera bg-white px-2 py-0.5 rounded shadow-xs">45%</span>
                </a>

                <a 
                  href="#module-3"
                  className="flex items-center justify-between px-3.5 py-2.5 rounded-lg text-sm text-slate-400 hover:bg-slate-50 transition-colors group opacity-75"
                >
                  <span className="flex items-center gap-2.5 min-w-0">
                    <Lock className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate text-xs font-medium">Module 3: Security & Vaults</span>
                  </span>
                  <span className="text-[11px] text-slate-400">Locked</span>
                </a>
              </div>

              {/* Continue Learning CTA */}
              <div className="pt-2">
                <Link
                  to="/student/player"
                  className="w-full flex items-center justify-center gap-2 py-3 px-4 bg-coursera hover:bg-primary text-white rounded-xl text-sm font-bold shadow-sm transition-all active:scale-[0.99]"
                >
                  <span>Continue Learning</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
                <div className="mt-3 text-center">
                  <Link
                    to="/student/quiz"
                    className="text-xs font-semibold text-coursera hover:underline"
                  >
                    Take Graded Quiz (Module 2)
                  </Link>
                </div>
              </div>
            </aside>

            {/* Right Main Content Area (8 cols) */}
            <main className="lg:col-span-8 space-y-6">
              
              {/* Header */}
              <div>
                <h1 className="text-2xl lg:text-3xl font-extrabold text-slate-900 tracking-tight">
                  Course Progress & Grades
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                  Track your curriculum milestones, assessment scores, and completion status.
                </p>
              </div>

              {/* Top Stats Bento Grid (Stitch Spec) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                
                {/* Overall Completion (2 cols on md) */}
                <div className="md:col-span-2 bg-white rounded-xl p-6 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.06)] relative overflow-hidden flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2">
                        <TrendingUp className="w-4 h-4 text-coursera" />
                        Overall Completion
                      </h3>
                      <div className="flex items-baseline gap-2 mt-2">
                        <span className="text-4xl font-extrabold text-coursera">{progressPercent}%</span>
                        <span className="text-sm font-semibold text-slate-500">Completed</span>
                      </div>
                    </div>
                    <span className="px-3 py-1 bg-blue-50 text-coursera text-xs font-bold rounded-full">
                      Active
                    </span>
                  </div>

                  <div>
                    <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden mb-3">
                      <div 
                        className="bg-coursera h-full rounded-full transition-all duration-500" 
                        style={{ width: `${progressPercent}%` }}
                      ></div>
                    </div>
                    <div className="flex justify-between text-xs font-medium text-slate-500">
                      <span>Started 3 weeks ago</span>
                      <span>Est. 3.5 hours remaining</span>
                    </div>
                  </div>
                </div>

                {/* Current Grade Card */}
                <div className="bg-white rounded-xl p-6 border border-slate-200/80 shadow-[0_1px_3px_rgba(0,0,0,0.06)] flex flex-col justify-between">
                  <div>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-2 mb-3">
                      <Award className="w-4 h-4 text-secondary" />
                      Current Grade
                    </h3>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="w-14 h-14 rounded-full bg-emerald-50 border-2 border-secondary text-secondary flex items-center justify-center font-black text-2xl">
                        A
                      </div>
                      <div>
                        <p className="text-xl font-extrabold text-slate-900">92.5%</p>
                        <p className="text-xs text-slate-500">Average score</p>
                      </div>
                    </div>
                  </div>
                  <Link
                    to="/student/quiz"
                    className="w-full text-center py-2 bg-slate-50 hover:bg-blue-50 text-coursera border border-slate-200 hover:border-blue-200 rounded-lg text-xs font-bold transition-colors"
                  >
                    View Quiz Scores
                  </Link>
                </div>

              </div>

              {/* Module Breakdown Section */}
              <div className="space-y-5 pt-2">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-slate-900">Module Breakdown</h2>
                  <span className="text-xs text-slate-500 font-medium">3 Modules • 9 Items</span>
                </div>

                {/* Module List Cards */}
                {modules.map((mod) => {
                  const isOpen = openModules.includes(mod.id);
                  const isCompleted = mod.status === 'completed';
                  const isInProgress = mod.status === 'in-progress';

                  return (
                    <div 
                      key={mod.id} 
                      id={`module-${mod.id}`}
                      className={`bg-white rounded-xl border ${
                        isInProgress ? 'border-blue-300 shadow-md ring-1 ring-blue-100' : 'border-slate-200/80 shadow-xs'
                      } overflow-hidden transition-all`}
                    >
                      {/* Module Header Bar */}
                      <div className={`p-5 flex flex-wrap md:flex-nowrap justify-between items-center gap-4 ${
                        isInProgress ? 'bg-blue-50/40' : 'bg-slate-50/50'
                      }`}>
                        <div className="flex-1 min-w-[200px]">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-[11px] font-bold bg-white text-coursera border border-blue-100">
                              {mod.name}
                            </span>
                            {isCompleted && (
                              <span className="flex items-center gap-1 text-secondary text-xs font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5" /> Completed
                              </span>
                            )}
                            {isInProgress && (
                              <span className="flex items-center gap-1 text-coursera text-xs font-bold">
                                <span className="w-2 h-2 rounded-full bg-coursera animate-ping"></span> In Progress
                              </span>
                            )}
                            {mod.status === 'locked' && (
                              <span className="flex items-center gap-1 text-slate-400 text-xs font-medium">
                                <Lock className="w-3 h-3" /> Locked
                              </span>
                            )}
                          </div>
                          <h3 className="text-base font-bold text-slate-900">{mod.title}</h3>
                        </div>

                        {/* Progress meter */}
                        <div className="w-full md:w-56 flex items-center gap-3">
                          <div className="flex-1">
                            <div className="flex justify-between text-[11px] font-semibold text-slate-500 mb-1">
                              <span>Progress</span>
                              <span>{mod.progress}%</span>
                            </div>
                            <div className="w-full bg-slate-200 rounded-full h-1.5 overflow-hidden">
                              <div 
                                className={`h-full rounded-full ${isCompleted ? 'bg-secondary' : 'bg-coursera'}`} 
                                style={{ width: `${mod.progress}%` }}
                              ></div>
                            </div>
                          </div>
                          <button
                            onClick={() => toggleModule(mod.id)}
                            className="p-1 text-slate-400 hover:text-slate-600 transition-colors"
                          >
                            {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                          </button>
                        </div>
                      </div>

                      {/* Items list */}
                      {isOpen && (
                        <div className="divide-y divide-slate-100 p-2">
                          {mod.items.map((item) => (
                            <div 
                              key={item.id}
                              className={`flex items-center justify-between p-3.5 rounded-lg transition-colors ${
                                item.current 
                                  ? 'bg-blue-50/60 border border-blue-200/60' 
                                  : 'hover:bg-slate-50'
                              }`}
                            >
                              <div className="flex items-center gap-3 min-w-0">
                                {item.completed ? (
                                  <CheckCircle2 className="w-5 h-5 text-secondary shrink-0" />
                                ) : item.locked ? (
                                  <Lock className="w-4 h-4 text-slate-300 shrink-0" />
                                ) : (
                                  <PlayCircle className="w-5 h-5 text-coursera shrink-0" />
                                )}
                                <span className={`text-xs md:text-sm truncate ${
                                  item.completed 
                                    ? 'text-slate-600' 
                                    : item.current 
                                    ? 'font-bold text-slate-900' 
                                    : 'font-medium text-slate-800'
                                }`}>
                                  {item.title}
                                </span>
                              </div>

                              <div className="flex items-center gap-3 shrink-0 ml-4">
                                <span className="text-xs text-slate-400 font-medium">{item.duration}</span>

                                {item.grade && (
                                  <span className="px-2 py-0.5 rounded bg-emerald-50 text-secondary text-xs font-bold border border-emerald-100">
                                    Grade: {item.grade}
                                  </span>
                                )}

                                {item.current && (
                                  <Link
                                    to="/student/player"
                                    className="px-3 py-1 bg-coursera hover:bg-primary text-white rounded-md text-xs font-bold shadow-xs transition-colors"
                                  >
                                    Resume
                                  </Link>
                                )}

                                {item.type === 'quiz' && !item.completed && !item.locked && (
                                  <Link
                                    to="/student/quiz"
                                    className="px-3 py-1 bg-blue-50 text-coursera hover:bg-blue-100 rounded-md text-xs font-bold transition-colors"
                                  >
                                    Start Quiz
                                  </Link>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

            </main>

          </div>

        </div>
      </div>
    </PageLayout>
  );
}
