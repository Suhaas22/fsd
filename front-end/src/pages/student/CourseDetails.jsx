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
import HumanAvatar from '../../components/common/HumanAvatar';

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
      <main className="max-w-[1240px] mx-auto px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Course Details (~65% / 8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
            <Link to="/student" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <Link to="/student/explore" className="hover:text-primary transition-colors">{course.category || 'Payment Architecture'}</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-on-surface font-bold truncate max-w-xs">{course.title}</span>
          </nav>

          {/* Header Section */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <span className="inline-block px-2.5 py-0.5 bg-[#E8EDF5] text-[#0056D2] font-label-md text-xs font-bold rounded">
                {course.level?.toUpperCase() || 'ADVANCED'}
              </span>
              <span className="text-xs font-semibold text-outline">
                {course.institution || 'Stanford University'}
              </span>
            </div>

            <h1 className="font-headline-lg text-2xl md:text-3xl lg:text-4xl font-bold text-on-surface tracking-tight leading-tight">
              {course.title}
            </h1>

            <p className="font-body-lg text-sm text-on-surface-variant leading-relaxed">
              {course.description || 'Master the complexities of routing, security, and high-volume transaction processing using NexusPay enterprise standards.'}
            </p>

            <div className="flex items-center gap-4 flex-wrap pt-1 text-xs">
              <div className="flex items-center gap-1.5 text-[#F5C518]">
                <Star className="w-4 h-4 fill-current" />
                <span className="font-bold text-on-surface text-sm">{course.rating || 4.8}</span>
                <span className="text-outline">({course.reviewsCount || '12,405'} reviews)</span>
              </div>

              <span className="w-1 h-1 rounded-full bg-outline-variant"></span>

              <div className="flex items-center gap-1.5 text-on-surface-variant">
                <Users className="w-4 h-4 text-primary" />
                <span>{course.enrolledCount || '45,211'} enrolled students</span>
              </div>

              <span className="w-1 h-1 rounded-full bg-outline-variant"></span>

              <div className="flex items-center gap-1.5 text-on-surface-variant">
                <Clock className="w-4 h-4 text-outline" />
                <span>{course.totalHours || '18h 30m'} total length</span>
              </div>
            </div>

            {/* Instructor Faculty Row */}
            <div className="flex items-center gap-3 pt-3 border-t border-outline-variant/60">
              <HumanAvatar 
                name={course.instructorName || course.leadInstructorName || 'Prof. James Wilson'} 
                size="md" 
              />
              <div>
                <div className="font-title-md text-xs font-bold text-on-surface">
                  {course.instructorName || course.leadInstructorName || 'Prof. James Wilson'}
                </div>
                <div className="text-[11px] text-primary font-medium">
                  Principal Faculty, {course.institution || 'Stanford University'}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs (Stitch) */}
          <div className="border-b border-outline-variant/80 pt-2">
            <nav className="flex gap-6 -mb-px text-xs font-bold">
              <button className="border-b-2 border-primary text-primary pb-3">About</button>
              <button className="border-b-2 border-transparent text-on-surface-variant hover:text-on-surface pb-3 transition-colors">Syllabus</button>
              <button className="border-b-2 border-transparent text-on-surface-variant hover:text-on-surface pb-3 transition-colors">Reviews</button>
              <button className="border-b-2 border-transparent text-on-surface-variant hover:text-on-surface pb-3 transition-colors">Faculty</button>
            </nav>
          </div>

          {/* Tab Content: What you'll learn */}
          <section className="space-y-4">
            <h2 className="font-headline-md text-base font-bold text-on-surface">What you'll learn</h2>
            <div className="bg-surface-container-low rounded-xl p-5 border border-outline-variant/70">
              <ul className="grid grid-cols-1 md:grid-cols-2 gap-3.5 text-xs text-on-surface">
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                  <span>Design robust payment routing architectures for global scale.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                  <span>Implement PCI-DSS compliant tokenization flows securely.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                  <span>Handle distributed consensus and asynchronous transaction state.</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-secondary shrink-0 mt-0.5" />
                  <span>Optimize API latency for sub-50ms high volume financial checkout.</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Skills you will gain */}
          <section className="space-y-3">
            <h2 className="font-title-lg text-sm font-bold text-on-surface">Skills you will gain</h2>
            <div className="flex flex-wrap gap-2">
              {['System Architecture', 'Distributed Consensus', 'PCI-DSS Compliance', 'AWS Multi-Region', 'State Management', 'Fraud Prevention'].map((skill, idx) => (
                <span key={idx} className="px-3 py-1 bg-[#E8EDF5] text-[#0056D2] font-label-md text-xs font-bold rounded">
                  {skill}
                </span>
              ))}
            </div>
          </section>

          {/* Syllabus Modules Accordion */}
          <section className="space-y-4 pt-2">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-md text-base font-bold text-on-surface">
                Course Syllabus ({modules.length} Modules)
              </h2>
              <span className="text-xs text-outline font-medium">All modules self-paced</span>
            </div>

            <div className="space-y-3">
              {modules.map((mod) => {
                const isExpanded = expandedModules.includes(mod.id);
                return (
                  <div key={mod.id} className="bg-surface-container-lowest rounded-xl border border-outline-variant/80 overflow-hidden shadow-xs">
                    <button
                      onClick={() => toggleModule(mod.id)}
                      className="w-full p-4 flex items-center justify-between hover:bg-surface-container-low text-left font-bold text-xs text-on-surface transition-colors"
                    >
                      <span className="flex items-center gap-2.5">
                        <PlayCircle className="w-4 h-4 text-primary" />
                        <span>{mod.title}</span>
                      </span>
                      <div className="flex items-center gap-3">
                        <span className="text-outline font-normal">{mod.lessons || 4} lessons • {mod.duration || '2h 15m'}</span>
                        {isExpanded ? <ChevronUp className="w-4 h-4 text-outline" /> : <ChevronDown className="w-4 h-4 text-outline" />}
                      </div>
                    </button>
                    {isExpanded && (
                      <div className="px-4 pb-4 pt-1 border-t border-outline-variant/40 space-y-2 text-xs text-on-surface-variant bg-surface-container-low/30">
                        <div className="flex items-center justify-between py-1.5 border-b border-outline-variant/30">
                          <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                            <span>Architectural Overview & Two-Phase Commit</span>
                          </span>
                          <span className="text-outline">18 min</span>
                        </div>
                        <div className="flex items-center justify-between py-1.5 border-b border-outline-variant/30">
                          <span className="flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-primary"></span>
                            <span>Distributed Locking & Raft Protocols</span>
                          </span>
                          <span className="text-outline">24 min</span>
                        </div>
                        <div className="flex items-center justify-between py-1.5">
                          <span className="flex items-center gap-2 text-primary font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-secondary"></span>
                            <span>Graded Module Assessment Quiz</span>
                          </span>
                          <span className="text-secondary font-bold">Graded • 80% to pass</span>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </section>

        </div>

        {/* Right Column: Sticky Sidebar (~35% / 4 cols - Stitch) */}
        <div className="lg:col-span-4">
          <div className="sticky top-24 bg-surface-container-lowest rounded-xl shadow-ambient border border-outline-variant/80 overflow-hidden">
            
            {/* Video Thumbnail Preview */}
            <div className="relative w-full aspect-video bg-surface-container group cursor-pointer overflow-hidden">
              <img 
                src={course.thumbnail} 
                alt={course.title} 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" 
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-colors">
                <div className="w-14 h-14 bg-white/95 rounded-full flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                  <PlayCircle className="w-8 h-8 text-primary" />
                </div>
              </div>
              <div className="absolute bottom-2.5 right-2.5 bg-black/70 text-white font-label-md text-[11px] font-bold px-2 py-0.5 rounded">
                Preview Course
              </div>
            </div>

            <div className="p-5 space-y-4">
              <div>
                <div className="font-headline-lg text-2xl font-bold text-on-surface mb-0.5">
                  ₹{course.price || 89.99}
                </div>
                <div className="font-body-md text-xs text-on-surface-variant font-medium">
                  Full Lifetime Access • Accredited Certification
                </div>
              </div>

              <button
                onClick={() => navigate('/student/checkout', { state: { course } })}
                className="w-full bg-primary hover:bg-primary-container text-white font-title-md text-xs font-bold py-3 rounded-lg transition-colors shadow-sm flex items-center justify-center gap-2"
              >
                <span>Enroll in Course</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleBookmarkToggle}
                  className="flex-1 py-2 rounded-lg border border-outline-variant hover:bg-surface-container text-xs font-bold text-on-surface flex items-center justify-center gap-1.5 transition-colors"
                >
                  <Bookmark className={`w-3.5 h-3.5 ${isSaved ? 'fill-primary text-primary' : ''}`} />
                  <span>{isSaved ? 'Saved to Wishlist' : 'Add to Wishlist'}</span>
                </button>

                <button
                  onClick={handleShare}
                  className="p-2 rounded-lg border border-outline-variant hover:bg-surface-container text-on-surface-variant transition-colors"
                  title="Share Course"
                >
                  <Share2 className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="text-center font-label-md text-[11px] text-outline">
                Starts immediately. Join {course.enrolledCount || 157} learners.
              </div>

              <hr className="border-outline-variant/60" />

              {/* Course Features */}
              <ul className="space-y-3 text-xs text-on-surface-variant">
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                  <span className="font-medium text-on-surface">Verified University Certificate</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                  <span className="font-medium text-on-surface">Interactive Quizzes & Assignments</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-4 h-4 text-secondary shrink-0" />
                  <span className="font-medium text-on-surface">Self-paced learning • 100% Online</span>
                </li>
                <li className="flex items-center gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-primary shrink-0" />
                  <span className="font-medium text-on-surface">30-day money-back guarantee</span>
                </li>
              </ul>
            </div>

          </div>
        </div>

      </main>
    </PageLayout>
  );
}
