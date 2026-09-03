import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Play, 
  Search, 
  Award, 
  Clock, 
  CheckCircle2, 
  BookOpen
} from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import { LinearProgressBar } from '../../components/common/ProgressBar';
import Badge from '../../components/common/Badge';
import api from '../../services/api';

export default function MyLearning() {
  const location = useLocation();
  const [activeTab, setActiveTab] = useState('in-progress');
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

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

  const displayList = activeTab === 'in-progress' ? inProgressList : completedList;
  const filteredList = displayList.filter((item) =>
    item.courseTitle?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <PageLayout>
      <div className="w-full max-w-[1560px] mx-auto px-4 md:px-8 lg:px-12 py-6 space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-outline-variant/60 pb-6">
          <div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-on-surface tracking-tight">My Learning Studio</h1>
            <p className="text-xs md:text-sm text-on-surface-variant">Track your active enrollments, completed certifications, and learning milestones.</p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('in-progress')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'in-progress'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
              }`}
            >
              In Progress ({inProgressList.length})
            </button>
            <button
              onClick={() => setActiveTab('completed')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'completed'
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
              }`}
            >
              Completed ({completedList.length})
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400" />
          <input
            type="text"
            placeholder="Search my enrolled courses..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-xs focus:ring-2 focus:ring-primary"
          />
        </div>

        {/* Content */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs">Fetching enrolled tracks from backend...</div>
        ) : filteredList.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-700">No tracks in this view</p>
            <p className="text-xs text-slate-400 mt-1 mb-4">Explore the course catalog to enroll in new masterclasses.</p>
            <Link to="/explore" className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold">
              Explore Courses Catalog
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredList.map((item) => (
              <div key={item.id} className="bg-white rounded-3xl border border-slate-200 overflow-hidden p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="primary" size="sm">Stanford University</Badge>
                    <span className="text-[11px] text-slate-400 font-medium">Enrolled: {item.enrolledDate || 'Aug 2026'}</span>
                  </div>

                  <Link to={`/course-progress/${item.courseId}`} state={{ enrollmentId: item.id, courseId: item.courseId }} className="block text-base font-bold text-slate-900 line-clamp-2 hover:text-primary">
                    {item.courseTitle || 'Advanced Enterprise Architecture'}
                  </Link>

                  <LinearProgressBar progress={item.progress || 50} showLabel={true} />
                </div>

                <div className="pt-4 border-t border-slate-100 mt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-500 font-medium">
                    {item.status === 'Completed' ? '100% Completed' : `${item.progress || 50}% Completed`}
                  </span>

                  <Link
                    to={`/course-progress/${item.courseId}`}
                    state={{ enrollmentId: item.id, courseId: item.courseId }}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container transition-colors"
                  >
                    <Play className="w-3.5 h-3.5 fill-current" />
                    <span>{item.status === 'Completed' ? 'Review progress' : 'View progress'}</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

      </div>
    </PageLayout>
  );
}
