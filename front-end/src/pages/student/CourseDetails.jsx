import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  Award, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  PlayCircle, 
  Share2, 
  Bookmark, 
  Star,
  Users,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import RatingStars from '../../components/common/RatingStars';
import Badge from '../../components/common/Badge';
import { useToast } from '../../components/common/Toast';
import api from '../../services/api';

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expandedModules, setExpandedModules] = useState(['1', 'mod-1']);
  const [isSaved, setIsSaved] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    const targetId = id || 'crs-1';
    api.courses.get(targetId)
      .then((res) => {
        setCourse(res);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch course details:', err);
        // Fallback fetch first course if specific ID fails
        api.courses.list()
          .then((res) => {
            const list = Array.isArray(res) ? res : (res?.items || []);
            setCourse(list[0] || null);
            setLoading(false);
          })
          .catch(() => setLoading(false));
      });
  }, [id]);

  const toggleModule = (modId) => {
    setExpandedModules((prev) =>
      prev.includes(modId) ? prev.filter((m) => m !== modId) : [...prev, modId]
    );
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    addToast('Course link copied to clipboard!', 'success');
  };

  const handleBookmarkToggle = () => {
    setIsSaved(!isSaved);
    addToast(isSaved ? 'Removed from saved courses' : 'Saved to your wishlist!', isSaved ? 'info' : 'success');
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

  if (!course) {
    return (
      <PageLayout>
        <div className="max-w-4xl mx-auto py-20 text-center">
          <h2 className="text-xl font-bold text-slate-800">Course Not Found</h2>
          <p className="text-xs text-slate-500 mt-2 mb-4">The requested course could not be loaded from the backend catalog.</p>
          <Link to="/explore" className="px-4 py-2 bg-primary text-white text-xs font-bold rounded-xl">
            Explore Courses Catalog
          </Link>
        </div>
      </PageLayout>
    );
  }

  const modules = course.modules || [
    { id: '1', title: 'Module 1: Architecture Foundations & Consensus Protocols', lessons: 4, duration: '3h 15m' },
    { id: '2', title: 'Module 2: High Throughput Multi-Region AWS Active Replication', lessons: 5, duration: '4h 00m' },
  ];

  return (
    <PageLayout>
      <div className="w-full bg-slate-900 text-white border-b border-slate-800">
        <div className="max-w-[1560px] mx-auto px-4 md:px-8 lg:px-12 py-8 md:py-12">
          
          <div className="flex items-center gap-2 text-xs text-slate-400 mb-4">
            <Link to="/explore" className="hover:text-white">Explore</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span>{course.category || 'Cloud Architecture'}</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-white font-medium truncate max-w-xs">{course.title}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            
            <div className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-2">
                <Badge variant="primary" size="sm">{course.level || 'Advanced'}</Badge>
                <span className="text-xs text-slate-400 font-medium">{course.institution || 'Stanford University'}</span>
              </div>

              <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight">
                {course.title}
              </h1>

              <p className="text-slate-300 text-xs md:text-sm leading-relaxed">
                {course.description}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2">
                <div className="flex items-center gap-1.5 text-amber-400 font-bold">
                  <Star className="w-4 h-4 fill-current" />
                  <span>{course.rating || 4.8}</span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-300">
                  <Users className="w-4 h-4 text-blue-400" />
                  <span>{course.enrolledCount || 157} Enrolled Students</span>
                </div>

                <div className="flex items-center gap-1.5 text-slate-300">
                  <Clock className="w-4 h-4 text-indigo-400" />
                  <span>{course.totalHours || '18.5h'} total learning</span>
                </div>
              </div>

              <div className="flex items-center gap-3 pt-4">
                <div className="w-10 h-10 rounded-full overflow-hidden border border-slate-700 bg-slate-800">
                  <img
                    src={course.instructors?.[0]?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80'}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                </div>
                <div>
                  <p className="text-xs text-slate-400">Taught by Principal Faculty</p>
                  <p className="text-xs font-bold text-white">{course.instructorName || course.leadInstructorName || 'Prof. James Wilson'}</p>
                </div>
              </div>
            </div>

            {/* Sidebar Pricing Box */}
            <div className="bg-white text-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-200">
              <div className="w-full h-44 rounded-2xl overflow-hidden mb-4 bg-slate-100">
                <img src={course.thumbnail} alt="" className="w-full h-full object-cover" />
              </div>

              <div className="flex items-baseline justify-between mb-4">
                <span className="text-3xl font-extrabold text-slate-900">${course.price || 89.99}</span>
                <span className="text-xs text-slate-500 font-semibold">Full Lifetime Access</span>
              </div>

              <div className="space-y-2.5 mb-6">
                <button
                  onClick={() => navigate('/checkout', { state: { course } })}
                  className="w-full py-3 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-md transition-all flex items-center justify-center gap-2"
                >
                  <span>Enroll in Course</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <div className="flex items-center gap-2">
                  <button
                    onClick={handleBookmarkToggle}
                    className="flex-1 py-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-xs font-bold text-slate-700 flex items-center justify-center gap-1.5"
                  >
                    <Bookmark className={`w-4 h-4 ${isSaved ? 'fill-current text-indigo-600' : ''}`} />
                    <span>{isSaved ? 'Saved' : 'Wishlist'}</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="p-2.5 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-600"
                    title="Share Course"
                  >
                    <Share2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-2 text-xs text-slate-600 border-t border-slate-100 pt-4">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Verified Professional Certificate</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Interactive Quizzes & Assignments</span>
                </div>
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Direct Faculty Q&A Access</span>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>

      {/* Curriculum Modules */}
      <div className="max-w-[1560px] mx-auto px-4 md:px-8 lg:px-12 py-10 space-y-6">
        <h2 className="text-xl font-bold text-slate-900">Course Curriculum ({modules.length} Modules)</h2>

        <div className="space-y-4 max-w-4xl">
          {modules.map((mod) => {
            const isExpanded = expandedModules.includes(mod.id);
            return (
              <div key={mod.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                <button
                  onClick={() => toggleModule(mod.id)}
                  className="w-full p-4 flex items-center justify-between hover:bg-slate-50 text-left font-bold text-xs text-slate-900"
                >
                  <span className="flex items-center gap-2">
                    <PlayCircle className="w-4 h-4 text-indigo-600" />
                    <span>{mod.title}</span>
                  </span>
                  <div className="flex items-center gap-3">
                    <span className="text-slate-400 font-normal">{mod.lessons || 4} lessons • {mod.duration || '2h'}</span>
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </div>
                </button>
              </div>
            );
          })}
        </div>
      </div>
    </PageLayout>
  );
}
