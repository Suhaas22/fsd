import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Play, 
  ArrowRight, 
  Search, 
  Bookmark, 
  Award, 
  Clock, 
  CheckCircle2, 
  TrendingUp, 
  Filter,
  MoreVertical,
  BookOpen
} from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import { LinearProgressBar, CircularProgress } from '../../components/common/ProgressBar';
import Badge from '../../components/common/Badge';
import { coursesData } from '../../data/coursesData';

export default function MyLearning() {
  const [activeTab, setActiveTab] = useState('in-progress'); // 'in-progress' | 'completed' | 'saved'
  const [orgFilter, setOrgFilter] = useState('all');
  const [topicFilter, setTopicFilter] = useState('all');
  const [sortBy, setSortBy] = useState('recent');

  const inProgressList = [
    {
      id: "aws-solutions-architect",
      title: "Advanced AWS Solutions Architect",
      institution: "CloudTech Academy",
      modulesCompleted: 3,
      totalModules: 8,
      progress: 72,
      timeLeft: "3h 45m left",
      lastAccessed: "2 hours ago",
      nextLesson: "2.3 State Management in NexusPay",
      thumbnail: "https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "advanced-api-integrations",
      title: "Advanced API Integrations for Enterprise Payments",
      institution: "NexusTech Institute",
      modulesCompleted: 2,
      totalModules: 4,
      progress: 50,
      timeLeft: "6h 15m left",
      lastAccessed: "Yesterday",
      nextLesson: "2.3 State Management in NexusPay",
      thumbnail: "https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "python-data-science",
      title: "Python for Data Science Fundamentals",
      institution: "Tech University",
      modulesCompleted: 4,
      totalModules: 5,
      progress: 78,
      timeLeft: "1h 30m left",
      lastAccessed: "3 days ago",
      nextLesson: "5.1 Machine Learning Pipelines",
      thumbnail: "https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "agile-project-management",
      title: "Agile Project Management Leadership",
      institution: "Business Institute",
      modulesCompleted: 1,
      totalModules: 4,
      progress: 22,
      timeLeft: "8h left",
      lastAccessed: "5 days ago",
      nextLesson: "1.4 Sprint Retrospective Mastery",
      thumbnail: "https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=600&auto=format&fit=crop&q=80"
    }
  ];

  const completedList = [
    {
      id: "cert-001",
      title: "Advanced Payment Systems Architecture",
      institution: "NexusTech Institute",
      completedDate: "October 15, 2024",
      grade: "98.4%",
      credentialId: "NX-CERT-8849-V7",
      thumbnail: "https://images.unsplash.com/photo-1606326608606-aa0b62935f2b?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "cert-002",
      title: "Fraud Prevention Strategies in Financial Ecosystems",
      institution: "Global Security Academics",
      completedDate: "September 28, 2024",
      grade: "95.0%",
      credentialId: "NX-CERT-7201-F3",
      thumbnail: "https://images.unsplash.com/photo-1563986768609-322da13575f3?w=600&auto=format&fit=crop&q=80"
    },
    {
      id: "cert-003",
      title: "Corporate Finance & Capital Asset Pricing Models",
      institution: "Business School",
      completedDate: "August 12, 2024",
      grade: "94.2%",
      credentialId: "NX-CERT-4391-B8",
      thumbnail: "https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=600&auto=format&fit=crop&q=80"
    }
  ];

  const savedList = coursesData.slice(4, 8);

  return (
    <PageLayout>
      <div className="w-full max-w-[1680px] mx-auto px-4 md:px-8 lg:px-12 py-8 space-y-8">
        
        {/* Header Title & Tabs */}
        <div>
          <h1 className="text-headline-lg font-black text-2xl md:text-3xl text-on-surface tracking-tight mb-2">
            My Learning & Academic Portal
          </h1>
          <p className="text-xs text-on-surface-variant">
            Track your active enrolled courses, completed certifications, and bookmarked subjects
          </p>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-8 mt-6 border-b border-outline-variant text-sm font-bold">
            <button
              onClick={() => setActiveTab('in-progress')}
              className={`pb-3 relative transition-colors ${
                activeTab === 'in-progress'
                  ? 'text-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span>In Progress ({inProgressList.length})</span>
              {activeTab === 'in-progress' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('completed')}
              className={`pb-3 relative transition-colors ${
                activeTab === 'completed'
                  ? 'text-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span>Completed ({completedList.length})</span>
              {activeTab === 'completed' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></span>
              )}
            </button>

            <button
              onClick={() => setActiveTab('saved')}
              className={`pb-3 relative transition-colors ${
                activeTab === 'saved'
                  ? 'text-primary'
                  : 'text-on-surface-variant hover:text-on-surface'
              }`}
            >
              <span>Saved / Wishlist ({savedList.length})</span>
              {activeTab === 'saved' && (
                <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-primary rounded-full"></span>
              )}
            </button>
          </div>
        </div>

        {/* Filter & Sort Controls */}
        <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-surface-container-low border border-outline-variant/60">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-bold text-on-surface">
              <Filter className="w-3.5 h-3.5 text-primary" />
              <span>Filter by:</span>
            </div>

            <select
              value={orgFilter}
              onChange={(e) => setOrgFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-surface-container-lowest border border-outline-variant text-xs font-bold focus:outline-none focus:border-primary"
            >
              <option value="all">All Organizations</option>
              <option value="nexus">NexusTech Institute</option>
              <option value="partner">Partner Institutions</option>
            </select>

            <select
              value={topicFilter}
              onChange={(e) => setTopicFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-surface-container-lowest border border-outline-variant text-xs font-bold focus:outline-none focus:border-primary"
            >
              <option value="all">All Topics</option>
              <option value="cloud">Cloud Architecture</option>
              <option value="fintech">Payments & FinTech</option>
              <option value="data">Data Science</option>
            </select>
          </div>

          <div className="flex items-center gap-2 text-xs text-on-surface-variant">
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-1.5 rounded-xl bg-surface-container-lowest border border-outline-variant text-xs font-bold focus:outline-none focus:border-primary text-on-surface"
            >
              <option value="recent">Recently Accessed</option>
              <option value="title">Title (A-Z)</option>
              <option value="progress">Progress (High-Low)</option>
            </select>
          </div>
        </div>

        {/* Content Tabs */}
        {activeTab === 'in-progress' && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            {inProgressList.map((course) => (
              <div
                key={course.id}
                className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-ambient hover:shadow-elevation-2 transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
              >
                {/* Course preview & meta */}
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-32 h-24 rounded-2xl overflow-hidden bg-surface-container flex-shrink-0 relative shadow-sm">
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="space-y-1">
                    <span className="text-[10px] font-bold text-primary uppercase tracking-wider">
                      {course.institution}
                    </span>
                    <Link to={`/course/${course.id}`}>
                      <h3 className="text-base font-bold text-on-surface hover:text-primary transition-colors line-clamp-1">
                        {course.title}
                      </h3>
                    </Link>
                    <p className="text-xs text-outline flex items-center gap-2 font-medium">
                      <span>{course.modulesCompleted} of {course.totalModules} modules</span>
                      <span>•</span>
                      <span className="flex items-center gap-1 text-on-surface-variant font-semibold">
                        <Clock className="w-3 h-3 text-outline" /> {course.timeLeft}
                      </span>
                    </p>
                    <p className="text-xs text-primary font-bold line-clamp-1">
                      Next: {course.nextLesson}
                    </p>
                  </div>
                </div>

                {/* Progress bar and CTAs */}
                <div className="w-full md:w-64 flex flex-col gap-3">
                  <LinearProgressBar
                    progress={course.progress}
                    showLabel={true}
                    color={course.progress >= 70 ? "bg-secondary" : "bg-primary"}
                  />

                  <div className="flex items-center gap-2.5">
                    <Link
                      to="/player"
                      className="flex-1 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-white text-xs font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      <span>Resume</span>
                    </Link>

                    <Link
                      to="/course-progress"
                      className="px-3.5 py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-xs font-bold text-on-surface transition-colors"
                      title="View Module Progress"
                    >
                      <span>Progress</span>
                    </Link>
                  </div>
                </div>

              </div>
            ))}
          </div>
        )}

        {activeTab === 'completed' && (
          <div className="grid grid-cols-1 md:grid-cols-3 xl:grid-cols-4 gap-6">
            {completedList.map((item) => (
              <div
                key={item.id}
                className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-6 shadow-ambient hover:shadow-elevation-2 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="w-full h-40 rounded-2xl overflow-hidden bg-surface-container mb-4 shadow-sm">
                    <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                  <Badge variant="success" size="sm" className="mb-2">Completed</Badge>
                  <h3 className="text-sm font-bold text-on-surface mb-1 line-clamp-2">{item.title}</h3>
                  <p className="text-xs text-outline mb-4">{item.institution}</p>
                </div>

                <div className="pt-4 border-t border-outline-variant space-y-3">
                  <div className="flex justify-between text-xs font-semibold">
                    <span className="text-outline">Final Score:</span>
                    <span className="text-secondary font-bold">{item.grade}</span>
                  </div>
                  <Link
                    to="/certificates"
                    className="w-full py-2.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-primary text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                  >
                    <Award className="w-4 h-4" />
                    <span>View Certificate</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'saved' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {savedList.map((course) => (
              <div key={course.id} className="bg-surface-container-lowest border border-outline-variant rounded-3xl p-5 shadow-ambient flex flex-col justify-between">
                <div>
                  <div className="w-full h-40 rounded-2xl overflow-hidden bg-surface-container mb-3">
                    <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                  </div>
                  <span className="text-xs text-outline font-semibold">{course.institution}</span>
                  <h3 className="text-sm font-bold text-on-surface mt-1 mb-2 line-clamp-2">{course.title}</h3>
                  <p className="text-xs text-on-surface-variant line-clamp-2 leading-relaxed">{course.subtitle}</p>
                </div>
                <div className="pt-4 mt-4 border-t border-outline-variant flex items-center justify-between">
                  <span className="font-black text-on-surface text-base">${course.price}</span>
                  <Link to="/checkout" className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container shadow-xs">
                    Enroll Now
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
