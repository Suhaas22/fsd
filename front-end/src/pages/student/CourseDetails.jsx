import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { 
  ChevronRight, 
  CheckCircle2, 
  Clock, 
  Globe, 
  Calendar, 
  Award, 
  FileText, 
  ShieldCheck, 
  ChevronDown, 
  ChevronUp, 
  PlayCircle, 
  Share2, 
  Bookmark, 
  Star,
  Users,
  Video,
  FileQuestion,
  Sparkles,
  Check,
  ArrowRight,
  ThumbsUp,
  HelpCircle
} from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import RatingStars from '../../components/common/RatingStars';
import Badge from '../../components/common/Badge';
import { coursesData } from '../../data/coursesData';
import { useToast } from '../../components/common/Toast';

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();

  // Find matching course or default to first
  const course = coursesData.find(c => c.id === id) || coursesData[0];

  const [expandedModules, setExpandedModules] = useState([1, 2]);
  const [isSaved, setIsSaved] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Scroll to top on course change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (course.modules && course.modules.length > 0) {
      setExpandedModules([course.modules[0].id]);
    }
  }, [id, course]);

  const toggleModule = (modId) => {
    setExpandedModules(prev =>
      prev.includes(modId) ? prev.filter(m => m !== modId) : [...prev, modId]
    );
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopiedLink(true);
    addToast('Course link copied to clipboard!', 'success');
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const defaultWhatYouLearn = [
    "Master foundational and advanced concepts with real-world architecture examples.",
    "Implement production-ready patterns, secure pipelines, and scalable configurations.",
    "Build hands-on capstone projects tailored for enterprise environments.",
    "Gain official certification readiness with practice assessments."
  ];

  const defaultModules = [
    {
      id: 1,
      title: "Foundations & Architectural Overview",
      duration: "2.5 hours",
      lessonsCount: 4,
      lessons: [
        { id: "1.1", title: "Core Concepts & System Topology", duration: "25 min", type: "video", completed: true },
        { id: "1.2", title: "Enterprise Design Patterns", duration: "35 min", type: "video", completed: true },
        { id: "1.3", title: "Security & Governance Standards", duration: "30 min", type: "video", completed: false },
        { id: "1.4", title: "Module 1 Knowledge Check", duration: "15 min", type: "quiz", completed: false }
      ]
    },
    {
      id: 2,
      title: "Advanced Implementation & Optimization",
      duration: "3.5 hours",
      lessonsCount: 4,
      lessons: [
        { id: "2.1", title: "High-Throughput Configuration", duration: "40 min", type: "video", completed: false },
        { id: "2.2", title: "State Management & Distributed Locking", duration: "35 min", type: "video", completed: false },
        { id: "2.3", title: "Hands-on Practical Lab", duration: "50 min", type: "assignment", completed: false },
        { id: "2.4", title: "Module 2 Assessment", duration: "20 min", type: "quiz", completed: false }
      ]
    }
  ];

  const displayWhatYouLearn = (course.whatYouWillLearn && course.whatYouWillLearn.length > 0) 
    ? course.whatYouWillLearn 
    : defaultWhatYouLearn;

  const displayModules = (course.modules && course.modules.length > 0)
    ? course.modules
    : defaultModules;

  const totalLessons = displayModules.reduce((acc, m) => acc + (m.lessons?.length || 0), 0);

  return (
    <PageLayout>
      <div className="w-full max-w-[1680px] mx-auto px-4 md:px-8 lg:px-12 py-8">
        
        {/* Breadcrumb Navigation */}
        <nav className="flex items-center gap-2 text-xs text-outline mb-6 font-medium">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <Link to="/explore" className="hover:text-primary transition-colors">Browse Catalog</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-on-surface">{course.category || "Technology"}</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-primary font-bold line-clamp-1">{course.title}</span>
        </nav>

        {/* Top Grid: Hero Info + Sticky Action Card */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          
          {/* Left 8 Cols: Main Info */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* Title & Metadata */}
            <div>
              <div className="flex flex-wrap items-center gap-2.5 mb-3">
                <Badge variant="primary" size="md">{course.institution || "NexusTech Institute"}</Badge>
                {course.badge && <Badge variant="secondary" size="md">{course.badge}</Badge>}
                <span className="text-xs text-outline font-semibold">Updated {course.lastUpdated || "October 2024"}</span>
              </div>

              <h1 className="text-headline-lg text-2xl md:text-4xl font-black text-on-surface tracking-tight leading-tight mb-4">
                {course.title}
              </h1>

              <p className="text-body-lg text-on-surface-variant leading-relaxed mb-6 font-medium">
                {course.subtitle || course.description}
              </p>

              {/* Stats & Instructor line */}
              <div className="flex flex-wrap items-center gap-6 text-xs text-on-surface pb-6 border-b border-outline-variant font-medium">
                <RatingStars rating={course.rating || 4.9} reviewsCount={course.reviewsCount || 3840} size="md" />
                <span className="flex items-center gap-1.5 font-semibold">
                  <Users className="w-4 h-4 text-primary" />
                  {(course.studentsCount || 18450).toLocaleString()} enrolled professionals
                </span>
                <span className="flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-outline" />
                  {course.language || "English"} [Subtitles & Transcripts]
                </span>
              </div>

              {/* Instructor Capsule */}
              {course.instructor && (
                <div className="flex items-center gap-4 pt-6">
                  <img
                    src={course.instructor.avatar || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80"}
                    alt={course.instructor.name}
                    className="w-14 h-14 rounded-2xl object-cover ring-2 ring-primary/20 shadow-sm"
                  />
                  <div>
                    <p className="text-[11px] text-outline font-bold uppercase tracking-wider">Lead Instructor</p>
                    <p className="text-sm font-bold text-on-surface">{course.instructor.name}</p>
                    <p className="text-xs text-on-surface-variant">{course.instructor.title}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Section 1: What you'll learn */}
            <section className="bg-surface-container-low border border-outline-variant rounded-3xl p-6 md:p-8 shadow-ambient">
              <h2 className="text-headline-md text-lg font-bold text-on-surface mb-4 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-primary" />
                <span>What you'll learn in this course</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {displayWhatYouLearn.map((item, idx) => (
                  <div key={idx} className="flex items-start gap-3">
                    <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                    <span className="text-xs md:text-sm text-on-surface leading-relaxed font-medium">
                      {item}
                    </span>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 2: Skills you will gain */}
            {course.skills && course.skills.length > 0 && (
              <section>
                <h2 className="text-headline-md text-lg font-bold text-on-surface mb-3">
                  Skills & Technologies You Will Gain
                </h2>
                <div className="flex flex-wrap gap-2">
                  {course.skills.map((skill, idx) => (
                    <span
                      key={idx}
                      className="px-3.5 py-1.5 rounded-xl bg-surface-container-high border border-outline-variant text-xs font-semibold text-on-surface hover:border-primary hover:text-primary transition-colors cursor-pointer"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Section 3: Course Description */}
            <section className="space-y-4">
              <h2 className="text-headline-md text-lg font-bold text-on-surface">
                Detailed Course Syllabus & Architecture
              </h2>
              <p className="text-sm text-on-surface-variant leading-relaxed font-normal">
                {course.description || course.subtitle}
              </p>
            </section>

            {/* Section 4: Course Syllabus / Modules */}
            <section>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-headline-md text-lg font-bold text-on-surface">
                    Curriculum & Module Breakdown
                  </h2>
                  <p className="text-xs text-on-surface-variant">
                    {displayModules.length} modules • {totalLessons} lectures & hands-on exercises • {course.duration || "6 Weeks"}
                  </p>
                </div>
                <button
                  onClick={() => {
                    if (expandedModules.length === displayModules.length) {
                      setExpandedModules([]);
                    } else {
                      setExpandedModules(displayModules.map(m => m.id));
                    }
                  }}
                  className="text-xs font-bold text-primary hover:underline"
                >
                  {expandedModules.length === displayModules.length ? "Collapse All" : "Expand All"}
                </button>
              </div>

              {/* Modules Accordion */}
              <div className="border border-outline-variant rounded-2xl overflow-hidden divide-y divide-outline-variant shadow-ambient">
                {displayModules.map((module) => {
                  const isOpen = expandedModules.includes(module.id);
                  return (
                    <div key={module.id} className="bg-surface-container-lowest">
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="w-full px-5 py-4 flex items-center justify-between text-left hover:bg-surface-container-low transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          {isOpen ? <ChevronUp className="w-4 h-4 text-outline" /> : <ChevronDown className="w-4 h-4 text-outline" />}
                          <div>
                            <span className="text-xs font-bold text-primary mr-2">Module {module.id}:</span>
                            <span className="text-sm font-bold text-on-surface">{module.title}</span>
                          </div>
                        </div>
                        <div className="text-xs text-outline font-semibold">
                          {module.lessonsCount || module.lessons?.length || 3} lessons • {module.duration}
                        </div>
                      </button>

                      {isOpen && (
                        <div className="px-5 pb-4 pt-1 bg-surface-container-low/40 divide-y divide-outline-variant/40">
                          {module.lessons?.map((lesson) => (
                            <div key={lesson.id} className="py-2.5 flex items-center justify-between text-xs">
                              <div className="flex items-center gap-3">
                                {lesson.type === 'quiz' ? (
                                  <FileQuestion className="w-4 h-4 text-tertiary" />
                                ) : (
                                  <PlayCircle className="w-4 h-4 text-primary" />
                                )}
                                <span className="text-on-surface font-medium">{lesson.title}</span>
                                {lesson.completed && (
                                  <span className="text-[10px] text-secondary font-bold">✓ Completed</span>
                                )}
                              </div>
                              <span className="text-outline font-medium">{lesson.duration}</span>
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

          {/* Right 4 Cols: Sticky Action & Pricing Card */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-elevation-2 space-y-6">
              
              {/* Thumbnail Preview */}
              <div className="relative rounded-2xl overflow-hidden h-52 bg-surface-container group shadow-sm">
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
                <Link
                  to="/player"
                  className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white gap-2 group-hover:bg-black/50 transition-colors"
                >
                  <div className="w-14 h-14 rounded-full bg-white/90 text-primary flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform">
                    <PlayCircle className="w-7 h-7 fill-current" />
                  </div>
                  <span className="text-xs font-bold tracking-wide uppercase">Preview Lecture (Free)</span>
                </Link>
              </div>

              {/* Price & Guarantee */}
              <div>
                <div className="flex items-baseline gap-3 mb-1">
                  <span className="text-3xl font-extrabold text-on-surface">${course.price || 89.99}</span>
                  {course.originalPrice && (
                    <span className="text-sm text-outline line-through">${course.originalPrice}</span>
                  )}
                  <span className="text-xs font-bold text-secondary bg-secondary-fixed/40 px-2.5 py-0.5 rounded-full">
                    30% OFF PROMO
                  </span>
                </div>
                <p className="text-[11px] text-outline flex items-center gap-1.5 mt-1 font-medium">
                  <ShieldCheck className="w-4 h-4 text-secondary" />
                  30-day full refund guarantee. Lifetime access.
                </p>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3">
                <Link
                  to="/checkout"
                  className="w-full py-3.5 rounded-2xl bg-primary text-white text-sm font-bold flex items-center justify-center hover:bg-primary-container shadow-elevation-1 transition-all hover:scale-[1.01]"
                >
                  Enroll Now • Lifetime Access
                </Link>

                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setIsSaved(!isSaved);
                      addToast(isSaved ? 'Removed from wishlist' : 'Saved to wishlist!', 'success');
                    }}
                    className={`flex-1 py-2.5 rounded-xl border text-xs font-bold flex items-center justify-center gap-1.5 transition-colors ${
                      isSaved ? 'bg-primary/10 border-primary text-primary' : 'border-outline-variant hover:bg-surface-container text-on-surface'
                    }`}
                  >
                    <Bookmark className="w-3.5 h-3.5 fill-current" />
                    <span>{isSaved ? "Saved in Wishlist" : "Save Course"}</span>
                  </button>

                  <button
                    onClick={handleShare}
                    className="p-2.5 rounded-xl border border-outline-variant hover:bg-surface-container text-on-surface text-xs font-semibold flex items-center justify-center transition-colors"
                    title="Share Course Link"
                  >
                    {copiedLink ? <Check className="w-4 h-4 text-secondary" /> : <Share2 className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* What's Included */}
              <div className="pt-5 border-t border-outline-variant/60 space-y-3">
                <p className="text-xs font-bold text-on-surface uppercase tracking-wider">This course includes:</p>
                <ul className="space-y-2.5 text-xs text-on-surface-variant font-medium">
                  <li className="flex items-center gap-2.5">
                    <Video className="w-4 h-4 text-primary" />
                    <span>{course.duration || "12.5 hours"} on-demand video & labs</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <FileText className="w-4 h-4 text-primary" />
                    <span>8 downloadable architectural blueprints</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <FileQuestion className="w-4 h-4 text-primary" />
                    <span>4 graded quizzes & capstone project</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <Award className="w-4 h-4 text-primary" />
                    <span>Verified Certificate of Completion</span>
                  </li>
                </ul>
              </div>

            </div>
          </div>

        </div>

      </div>
    </PageLayout>
  );
}
