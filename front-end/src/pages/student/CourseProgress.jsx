import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronRight, 
  CheckCircle2, 
  PlayCircle, 
  FileQuestion, 
  Award, 
  Clock, 
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import { CircularProgress } from '../../components/common/ProgressBar';
import Badge from '../../components/common/Badge';
import api from '../../services/api';

export default function CourseProgress() {
  const [openModules, setOpenModules] = useState([1, 2]);
  const [enrollment, setEnrollment] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.student.getEnrollments('lrn-1')
      .then((res) => {
        const list = Array.isArray(res) ? res : [];
        setEnrollment(list[0] || null);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load course progress:', err);
        setLoading(false);
      });
  }, []);

  const toggleModule = (id) => {
    setOpenModules((prev) =>
      prev.includes(id) ? prev.filter((m) => m !== id) : [...prev, id]
    );
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

  const courseTitle = enrollment?.courseTitle || 'Advanced Enterprise Architecture & Payment Systems';
  const progressPercent = enrollment?.progress || 72;

  const modules = [
    {
      id: 1,
      title: 'Module 1: Distributed Consensus & Two-Phase Commit',
      lessonsCount: 4,
      duration: '3h 15m',
      status: 'Completed',
      items: [
        { id: '1.1', title: '1.1 Two-Phase Commit Protocol in Banking', type: 'video', duration: '18m', completed: true },
        { id: '1.2', title: '1.2 Raft & Paxos Consensus Engines', type: 'video', duration: '24m', completed: true },
        { id: '1.3', title: '1.3 Module 1 Graded Assessment', type: 'quiz', duration: '20m', score: '95%', completed: true }
      ]
    },
    {
      id: 2,
      title: 'Module 2: AWS Multi-Region Active-Active Replication',
      lessonsCount: 6,
      duration: '4h 30m',
      status: 'In Progress',
      items: [
        { id: '2.1', title: '2.1 Multi-Region VPC Peering & Transit Gateways', type: 'video', duration: '25m', completed: true },
        { id: '2.2', title: '2.2 DynamoDB Global Tables & Conflict Resolution', type: 'video', duration: '30m', completed: true },
        { id: '2.3', title: '2.3 State Management in NexusPay', type: 'video', duration: '10m', completed: false }
      ]
    }
  ];

  return (
    <PageLayout>
      <div className="w-full max-w-[1680px] mx-auto px-4 md:px-8 lg:px-12 py-8 space-y-8">
        
        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs text-outline mb-4 font-medium">
          <Link to="/my-learning" className="hover:text-primary transition-colors">My Learning</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-on-surface">{courseTitle}</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-primary font-bold">Course Progress</span>
        </nav>

        {/* Page Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="primary" size="sm">Stanford University</Badge>
              <span className="text-xs text-outline font-semibold">Enrolled August 2026</span>
            </div>
            <h1 className="text-headline-lg font-black text-2xl md:text-3xl text-on-surface tracking-tight">
              {courseTitle} — Progress & Performance
            </h1>
            <p className="text-xs text-on-surface-variant mt-1">
              Track your milestones, module completion, quiz grades, and certificate qualification
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/player"
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-primary text-white text-xs font-bold shadow-md hover:bg-primary-container transition-all"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Resume Course</span>
            </Link>
          </div>
        </div>

        {/* Overview Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-6">
            <CircularProgress progress={progressPercent} size={80} strokeWidth={8} color="#0040A1" />
            <div>
              <h3 className="text-2xl font-black text-slate-900">{progressPercent}% Completed</h3>
              <p className="text-xs text-slate-500 mt-1">Estimated 3h 45m left to complete track</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold text-2xl">
              A+
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">92% Grade Avg</h3>
              <p className="text-xs text-slate-500 mt-1">Based on graded quiz submissions</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs flex items-center gap-6">
            <div className="w-16 h-16 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
              <Award className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900">Certificate Status</h3>
              <p className="text-xs text-slate-500 mt-1">Unlocked upon 100% module completion</p>
            </div>
          </div>
        </div>

        {/* Modules Accordion */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold text-slate-900">Curriculum Milestones ({modules.length} Modules)</h2>

          {modules.map((mod) => {
            const isOpen = openModules.includes(mod.id);
            return (
              <div key={mod.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-xs">
                <button
                  onClick={() => toggleModule(mod.id)}
                  className="w-full p-5 flex items-center justify-between hover:bg-slate-50 text-left font-bold text-sm text-slate-900"
                >
                  <span className="flex items-center gap-2">
                    <BookOpen className="w-4 h-4 text-indigo-600" />
                    <span>{mod.title}</span>
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-slate-400 font-normal">{mod.lessonsCount} lessons • {mod.duration}</span>
                    {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>

                {isOpen && (
                  <div className="divide-y divide-slate-100 border-t border-slate-100 bg-slate-50/50">
                    {mod.items.map((item) => (
                      <div key={item.id} className="p-4 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          {item.completed ? (
                            <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                          ) : (
                            <PlayCircle className="w-4 h-4 text-slate-400 shrink-0" />
                          )}
                          <span className={item.completed ? 'font-medium text-slate-700' : 'font-semibold text-slate-900'}>
                            {item.title}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-slate-400">
                          <span>{item.duration}</span>
                          {item.type === 'quiz' && (
                            <Link to="/quiz" className="px-2.5 py-1 rounded-lg bg-indigo-50 text-indigo-600 font-bold hover:bg-indigo-100">
                              Quiz
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

      </div>
    </PageLayout>
  );
}
