import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Play, 
  Search, 
  Award, 
  Clock, 
  CheckCircle2, 
  BookOpen,
  ArrowRight,
  Filter,
  Check
} from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import Badge from '../../components/common/Badge';
import api from '../../services/api';

export default function MyLearning() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('in-progress');
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTopic, setSelectedTopic] = useState('All Topics');
  const [sortBy, setSortBy] = useState('recent');

  useEffect(() => {
    let active = true;
    const loadEnrollments = () => api.student.getEnrollments('lrn-1')
      .then((res) => {
        if (!active) return;
        setEnrollments(Array.isArray(res) ? res : (res?.items || []));
        setLoading(false);
      })
      .catch((err) => {
        if (!active) return;
        console.error('Failed to fetch student enrollments:', err);
        setLoading(false);
      });

    setLoading(true);
    loadEnrollments();
    window.addEventListener('focus', loadEnrollments);
    return () => {
      active = false;
      window.removeEventListener('focus', loadEnrollments);
    };
  }, [location.key]);

  const inProgressList = enrollments.filter((e) => (e.progress || 0) < 100 && e.status !== 'Completed');
  const completedList = enrollments.filter((e) => e.progress === 100 || e.status === 'Completed');
  const savedList = enrollments.slice(0, 2);

  const displayList = activeTab === 'in-progress' 
    ? inProgressList 
    : activeTab === 'completed' 
    ? completedList 
    : savedList;

  const filteredList = displayList.filter((item) => {
    const matchesSearch = item.courseTitle?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesSearch;
  }).sort((a, b) => {
    if (sortBy === 'progress-high') return (b.progress || 0) - (a.progress || 0);
    if (sortBy === 'progress-low') return (a.progress || 0) - (b.progress || 0);
    if (sortBy === 'title') return (a.courseTitle || '').localeCompare(b.courseTitle || '');
    return 0;
  });

  return (
    <PageLayout>
      <main className="flex-grow w-full max-w-[1200px] mx-auto px-4 md:px-8 py-8 space-y-6">
        
        {/* Header & Tabs (Stitch) */}
        <header className="space-y-4">
          <div>
            <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-on-surface">
              My Learning
            </h1>
            <p className="font-body-lg text-sm text-on-surface-variant mt-1">
              Track your active coursework, completed university credentials, and saved tracks.
            </p>
          </div>

          {/* Stitch Filter Tabs */}
          <div className="flex border-b border-outline-variant/80 gap-6">
            <button
              onClick={() => setActiveTab('in-progress')}
              className={`pb-3 font-title-md text-sm font-semibold transition-colors flex items-center gap-2 ${
                activeTab === 'in-progress'
                  ? 'border-b-2 border-primary text-primary font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span>In Progress</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-surface-container font-medium">
                {inProgressList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('completed')}
              className={`pb-3 font-title-md text-sm font-semibold transition-colors flex items-center gap-2 ${
                activeTab === 'completed'
                  ? 'border-b-2 border-primary text-primary font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span>Completed</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-surface-container font-medium">
                {completedList.length}
              </span>
            </button>

            <button
              onClick={() => setActiveTab('saved')}
              className={`pb-3 font-title-md text-sm font-semibold transition-colors flex items-center gap-2 ${
                activeTab === 'saved'
                  ? 'border-b-2 border-primary text-primary font-bold'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span>Wishlist / Saved</span>
              <span className="px-2 py-0.5 rounded-full text-xs bg-surface-container font-medium">
                {savedList.length}
              </span>
            </button>
          </div>
        </header>

        {/* Filters & Search Row (Stitch) */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <input
              type="text"
              placeholder="Search my enrolled courses..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-white border border-outline-variant/80 rounded-lg text-xs font-medium text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-outline-variant/80 rounded-lg py-2 pl-3 pr-8 text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
            >
              <option value="recent">Recently Accessed</option>
              <option value="title">Course Title (A-Z)</option>
              <option value="progress-high">Progress (High - Low)</option>
              <option value="progress-low">Progress (Low - High)</option>
            </select>
          </div>
        </div>

        {/* Course List: Stitch Horizontal Cards */}
        {loading ? (
          <div className="py-20 text-center text-outline text-xs">
            Loading enrolled courses from backend...
          </div>
        ) : filteredList.length === 0 ? (
          <div className="py-16 text-center bg-surface-container-lowest rounded-xl border border-outline-variant p-8">
            <BookOpen className="w-10 h-10 text-outline mx-auto mb-2 opacity-50" />
            <p className="text-sm font-bold text-on-surface">No tracks found in this category</p>
            <p className="text-xs text-outline mt-1 mb-4">
              Explore the accredited university catalog to register for new specializations.
            </p>
            <Link 
              to="/student/explore" 
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-white text-xs font-bold hover:bg-primary-container transition-all shadow-sm"
            >
              <span>Explore Course Catalog</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-5">
            {filteredList.map((item) => {
              const progress = item.progress ?? (item.status === 'Completed' ? 100 : 45);
              const isCompleted = item.status === 'Completed' || progress === 100;
              const circumference = 2 * Math.PI * 28; // radius 28
              const strokeOffset = circumference - (circumference * progress) / 100;
              const institution = item.institution || "Stanford University";

              return (
                <div 
                  key={item.id} 
                  className="bg-surface-container-lowest rounded-xl border border-outline-variant/80 overflow-hidden flex flex-col md:flex-row hover:shadow-hover transition-all group"
                >
                  {/* Left: 280px aspect cover thumbnail */}
                  <div className="w-full md:w-[280px] h-[160px] md:h-auto shrink-0 relative overflow-hidden bg-surface-container">
                    <img 
                      src={
                        item.thumbnail || 
                        "https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=600&auto=format&fit=crop&q=80"
                      } 
                      alt={item.courseTitle} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
                    />
                    {isCompleted && (
                      <div className="absolute top-2.5 left-2.5 bg-[#006D37] text-white text-[11px] font-bold px-2.5 py-0.5 rounded shadow-sm">
                        COMPLETED
                      </div>
                    )}
                  </div>

                  {/* Center: Details */}
                  <div className="p-5 flex-grow flex flex-col justify-between">
                    <div>
                      <div className="font-label-md text-xs font-semibold text-primary uppercase tracking-wider mb-1">
                        {institution}
                      </div>

                      <Link 
                        to={`/student/course/${item.courseId || 'crs-1'}`}
                        className="font-headline-md text-base md:text-lg font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-2 mb-2"
                      >
                        {item.courseTitle || 'Advanced Enterprise Architecture & Payment Systems'}
                      </Link>

                      <p className="font-body-md text-xs text-on-surface-variant line-clamp-2 leading-relaxed mb-3">
                        {item.description || 'Master distributed consensus protocols, Two-Phase Commit, and cloud banking architectures.'}
                      </p>
                    </div>

                    <div className="font-label-md text-xs text-on-surface-variant flex items-center gap-3">
                      <span>{isCompleted ? 'All modules completed' : `${item.currentModule || 'Module 2 of 4'} • Est. 4h remaining`}</span>
                      <span>•</span>
                      <span>Enrolled: {item.enrolledDate || 'Aug 2026'}</span>
                    </div>
                  </div>

                  {/* Right Column: Stitch Circular Progress Indicator & Button */}
                  <div className="p-6 md:w-[240px] border-t md:border-t-0 md:border-l border-outline-variant/60 flex flex-row md:flex-col items-center justify-between md:justify-center bg-surface-container-low/40 shrink-0 gap-4">
                    <div className="relative w-16 h-16 flex items-center justify-center">
                      <svg className="w-16 h-16 transform -rotate-90">
                        <circle
                          className="text-surface-container-high"
                          cx="32"
                          cy="32"
                          r="28"
                          fill="transparent"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <circle
                          className={isCompleted ? "text-secondary" : "text-primary"}
                          cx="32"
                          cy="32"
                          r="28"
                          fill="transparent"
                          stroke="currentColor"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeOffset}
                          strokeWidth="4"
                          strokeLinecap="round"
                        />
                      </svg>
                      <span className="absolute text-xs font-bold text-on-surface">
                        {progress}%
                      </span>
                    </div>

                    <div className="flex flex-col gap-2 w-full max-w-[140px]">
                      {isCompleted ? (
                        <Link
                          to="/student/certificates"
                          className="bg-[#006D37] hover:bg-[#00542a] text-white font-title-md text-xs font-bold py-2 px-4 rounded-lg transition-colors w-full text-center shadow-xs flex items-center justify-center gap-1.5"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>View Certificate</span>
                        </Link>
                      ) : (
                        <Link
                          to="/student/player"
                          className="bg-primary hover:bg-primary-container text-white font-title-md text-xs font-bold py-2 px-4 rounded-lg transition-colors w-full text-center shadow-xs flex items-center justify-center gap-1.5"
                        >
                          <Play className="w-3.5 h-3.5 fill-current" />
                          <span>Continue</span>
                        </Link>
                      )}

                      <Link
                        to={`/student/course-progress/${item.courseId || 'crs-1'}`}
                        state={{ enrollmentId: item.id, courseId: item.courseId }}
                        className="text-xs font-semibold text-primary hover:underline text-center"
                      >
                        View Syllabus
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Stitch Bottom Box: Looking for more? */}
        <section className="mt-8 text-center py-8 border border-dashed border-outline-variant/80 rounded-xl bg-surface-container-lowest space-y-2">
          <BookOpen className="w-8 h-8 text-primary mx-auto" />
          <h3 className="font-title-lg text-sm font-bold text-on-surface">
            Looking for more skills to master?
          </h3>
          <p className="font-body-md text-xs text-on-surface-variant max-w-md mx-auto mb-4">
            Explore our accredited catalog of distributed engineering, cryptography, and fintech cloud programs.
          </p>
          <Link
            to="/student/explore"
            className="inline-block border border-primary text-primary hover:bg-primary/5 font-title-md text-xs font-bold py-2 px-6 rounded-lg transition-colors"
          >
            Browse Catalog
          </Link>
        </section>

      </main>
    </PageLayout>
  );
}
