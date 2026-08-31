import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  ChevronRight, 
  CheckCircle2, 
  PlayCircle, 
  FileQuestion, 
  BookOpen, 
  Award, 
  Lock, 
  Clock, 
  TrendingUp, 
  Calendar,
  Sparkles,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import { LinearProgressBar, CircularProgress } from '../../components/common/ProgressBar';
import Badge from '../../components/common/Badge';
import { courseProgressData } from '../../data/progressData';

export default function CourseProgress() {
  const [openModules, setOpenModules] = useState([1, 2]);

  const toggleModule = (id) => {
    setOpenModules(prev =>
      prev.includes(id) ? prev.filter(m => m !== id) : [...prev, id]
    );
  };

  return (
    <PageLayout>
      <div className="w-full max-w-[1680px] mx-auto px-4 md:px-8 lg:px-12 py-8 space-y-8">
        
        {/* Breadcrumb Bar */}
        <nav className="flex items-center gap-2 text-xs text-outline mb-4 font-medium">
          <Link to="/my-learning" className="hover:text-primary transition-colors">My Learning</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-on-surface">{courseProgressData.courseTitle}</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-primary font-bold">Course Progress</span>
        </nav>

        {/* Page Title */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="primary" size="sm">{courseProgressData.institution}</Badge>
              <span className="text-xs text-outline font-semibold">Enrolled October 2024</span>
            </div>
            <h1 className="text-headline-lg font-black text-2xl md:text-3xl text-on-surface tracking-tight">
              {courseProgressData.courseTitle} — Progress & Performance
            </h1>
            <p className="text-xs text-on-surface-variant mt-1">
              Track your milestones, module completion, quiz grades, and certificate qualification
            </p>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/player"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-primary hover:bg-primary-container text-white font-bold text-xs shadow-elevation-1 transition-all"
            >
              <PlayCircle className="w-4 h-4 fill-current" />
              <span>Resume Active Lesson (2.3)</span>
            </Link>
          </div>
        </div>

        {/* Top Summary Metrics Cards (3 Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Overall Completion Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-ambient flex items-center gap-6">
            <CircularProgress progress={courseProgressData.overallCompletion} size={84} strokeWidth={8} color="#0040A1" />
            <div className="space-y-1">
              <span className="text-xs text-outline font-bold uppercase tracking-wider">Overall Completion</span>
              <h3 className="text-2xl font-black text-on-surface">{courseProgressData.overallCompletion}% Done</h3>
              <p className="text-xs text-on-surface-variant flex items-center gap-1.5 font-medium">
                <Clock className="w-3.5 h-3.5 text-primary" />
                <span>{courseProgressData.estimatedTimeLeft}</span>
              </p>
            </div>
          </div>

          {/* Current Grade Card */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-ambient flex items-center gap-6">
            <div className="w-18 h-18 rounded-2xl bg-secondary-container text-on-secondary-container p-4 flex flex-col items-center justify-center font-black shadow-xs">
              <span className="text-3xl leading-none">{courseProgressData.currentGrade}</span>
              <span className="text-[10px] font-bold text-secondary uppercase tracking-widest mt-1">Grade</span>
            </div>
            <div className="space-y-1">
              <span className="text-xs text-outline font-bold uppercase tracking-wider">Weighted Performance</span>
              <h3 className="text-2xl font-black text-on-surface">{courseProgressData.gradePercentage}% Avg</h3>
              <p className="text-xs text-on-surface-variant font-medium">
                Based on {courseProgressData.quizzesCompleted} graded quizzes
              </p>
            </div>
          </div>

          {/* Certificate Tracker */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-ambient flex items-center gap-6">
            <div className="w-18 h-18 rounded-2xl bg-tertiary-fixed text-on-tertiary-fixed p-4 flex items-center justify-center shadow-xs">
              <Award className="w-9 h-9 text-tertiary" />
            </div>
            <div className="space-y-1">
              <span className="text-xs text-outline font-bold uppercase tracking-wider">Certificate Status</span>
              <h3 className="text-lg font-bold text-on-surface">Unlocked at 100%</h3>
              <Link to="/certificates" className="text-xs font-bold text-primary hover:underline block">
                View Certificate Gallery →
              </Link>
            </div>
          </div>

        </div>

        {/* Module Breakdown Section */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-headline-md text-lg font-bold text-on-surface">
              Module Breakdown & Milestones
            </h2>
            <span className="text-xs text-outline font-semibold">
              4 Modules • 15 Content Items
            </span>
          </div>

          <div className="space-y-4">
            {courseProgressData.modules.map((mod) => {
              const isOpen = openModules.includes(mod.id);
              const isLocked = mod.status === 'locked';

              return (
                <div
                  key={mod.id}
                  className={`bg-surface-container-lowest border rounded-3xl overflow-hidden transition-all shadow-ambient ${
                    mod.status === 'in-progress'
                      ? 'border-primary/60 ring-2 ring-primary/20'
                      : 'border-outline-variant'
                  }`}
                >
                  {/* Module Header */}
                  <div
                    onClick={() => !isLocked && toggleModule(mod.id)}
                    className={`p-6 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      isLocked ? 'opacity-60 cursor-not-allowed bg-surface-container-low/40' : 'cursor-pointer hover:bg-surface-container-low/50'
                    }`}
                  >
                    <div className="flex items-start md:items-center gap-4">
                      {mod.status === 'completed' && (
                        <div className="w-11 h-11 rounded-2xl bg-secondary-container text-on-secondary-container flex items-center justify-center flex-shrink-0 shadow-xs">
                          <CheckCircle2 className="w-6 h-6 text-secondary" />
                        </div>
                      )}
                      {mod.status === 'in-progress' && (
                        <div className="w-11 h-11 rounded-2xl bg-primary-fixed text-primary flex items-center justify-center flex-shrink-0 font-black text-sm shadow-xs">
                          {mod.id}
                        </div>
                      )}
                      {mod.status === 'locked' && (
                        <div className="w-11 h-11 rounded-2xl bg-surface-container text-outline flex items-center justify-center flex-shrink-0">
                          <Lock className="w-5 h-5" />
                        </div>
                      )}

                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-primary uppercase tracking-wider">{mod.moduleNumber}</span>
                          {mod.status === 'completed' && <Badge variant="success" size="sm">Completed</Badge>}
                          {mod.status === 'in-progress' && <Badge variant="primary" size="sm">Active</Badge>}
                          {mod.status === 'locked' && <Badge variant="outline" size="sm">Locked</Badge>}
                        </div>
                        <h3 className="text-base md:text-lg font-bold text-on-surface mt-0.5">
                          {mod.title}
                        </h3>
                      </div>
                    </div>

                    <div className="flex items-center gap-6">
                      <div className="w-44 text-right">
                        <span className="text-xs font-bold text-on-surface">{mod.progress}% Done</span>
                        <LinearProgressBar progress={mod.progress} height="h-2" color={mod.progress === 100 ? "bg-secondary" : "bg-primary"} />
                      </div>
                      {!isLocked && (
                        <div className="text-outline">
                          {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Module Lesson Items */}
                  {isOpen && !isLocked && (
                    <div className="px-6 pb-6 pt-2 border-t border-outline-variant/60 divide-y divide-outline-variant/40 bg-surface-container-low/30">
                      {mod.items.map((item) => (
                        <div key={item.id} className="py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                          
                          <div className="flex items-center gap-3">
                            {item.completed ? (
                              <CheckCircle2 className="w-4 h-4 text-secondary flex-shrink-0" />
                            ) : item.current ? (
                              <div className="w-4 h-4 rounded-full border-2 border-primary border-t-transparent animate-spin flex-shrink-0" />
                            ) : (
                              <div className="w-4 h-4 rounded-full border border-outline flex-shrink-0" />
                            )}

                            <div>
                              <span className={`font-semibold text-xs ${item.current ? 'text-primary font-bold' : 'text-on-surface'}`}>
                                {item.title}
                              </span>
                              <p className="text-[11px] text-outline font-medium">
                                {item.type === 'quiz' ? 'Graded Assessment' : item.type === 'assignment' ? 'Practical Lab' : 'Video Lesson'} • {item.duration}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-3 self-end sm:self-center">
                            {item.score && (
                              <span className="px-3 py-1 rounded-xl bg-secondary-container text-on-secondary-container font-bold text-xs">
                                Score: {item.score}
                              </span>
                            )}

                            {item.current && (
                              <Link
                                to="/player"
                                className="px-4 py-2 rounded-xl bg-primary text-white font-bold hover:bg-primary-container transition-colors shadow-sm"
                              >
                                Resume
                              </Link>
                            )}

                            {item.type === 'quiz' && !item.completed && (
                              <Link
                                to="/quiz"
                                className="px-4 py-2 rounded-xl bg-tertiary-fixed text-on-tertiary-fixed font-bold hover:bg-tertiary-fixed-dim transition-colors"
                              >
                                Start Quiz
                              </Link>
                            )}

                            {item.completed && (
                              <span className="text-secondary font-bold text-[11px]">✓ Completed</span>
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
        </section>

      </div>
    </PageLayout>
  );
}
