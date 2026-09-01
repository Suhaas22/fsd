import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  ChevronRight, 
  X, 
  Check, 
  Star, 
  Sparkles,
  RotateCcw
} from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import CourseCard from '../../components/common/CourseCard';
import Badge from '../../components/common/Badge';
import { useToast } from '../../components/common/Toast';
import api from '../../services/api';

const categories = [
  'All Subjects',
  'Cloud Architecture',
  'DevOps',
  'Machine Learning',
  'Cybersecurity',
  'FinTech Engineering',
  'Blockchain'
];

export default function ExploreCourses() {
  const [searchParams] = useSearchParams();
  const searchFromUrl = searchParams.get('search') || '';
  const categoryFromUrl = searchParams.get('category') || 'All Subjects';

  const { addToast } = useToast();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchFromUrl);
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('popular');
  const [bookmarkedIds, setBookmarkedIds] = useState([]);

  useEffect(() => {
    api.courses.list()
      .then((res) => {
        setCourses(Array.isArray(res) ? res : (res?.items || []));
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to fetch courses catalog:', err);
        setLoading(false);
      });
  }, []);

  const toggleBookmark = (id) => {
    setBookmarkedIds((prev) => {
      const isAlready = prev.includes(id);
      if (isAlready) {
        addToast('Course removed from wishlist', 'info');
        return prev.filter((x) => x !== id);
      } else {
        addToast('Course added to wishlist', 'success');
        return [...prev, id];
      }
    });
  };

  const handleLevelToggle = (lvl) => {
    setSelectedLevels((prev) =>
      prev.includes(lvl) ? prev.filter((l) => l !== lvl) : [...prev, lvl]
    );
  };

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesTitle = course.title?.toLowerCase().includes(query);
        const matchesDesc = course.description?.toLowerCase().includes(query);
        const matchesCategory = course.category?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesCategory) return false;
      }
      if (selectedCategory !== 'All Subjects' && course.category !== selectedCategory) {
        return false;
      }
      if (selectedLevels.length > 0 && !selectedLevels.includes(course.level)) {
        return false;
      }
      if (minRating > 0 && (course.rating || 5) < minRating) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return (b.enrolledCount || 0) - (a.enrolledCount || 0);
    });
  }, [courses, searchQuery, selectedCategory, selectedLevels, minRating, sortBy]);

  const resetFilters = () => {
    setSearchQuery('');
    setSelectedCategory('All Subjects');
    setSelectedLevels([]);
    setMinRating(0);
    setSortBy('popular');
  };

  return (
    <PageLayout>
      <div className="w-full max-w-[1560px] mx-auto px-4 md:px-8 lg:px-12 py-6 space-y-8">
        
        {/* Header Hero Banner */}
        <section className="w-full bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white rounded-3xl p-6 md:p-8 lg:p-10 shadow-elevation-2 relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-bold mb-3.5 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span>Institutional Course Catalog</span>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-2 tracking-tight">
              Explore Masterclass Tracks
            </h1>
            <p className="text-slate-300 text-xs md:text-sm leading-relaxed mb-6 font-normal max-w-2xl">
              Discover accredited enterprise architecture, distributed payments, AI, and cybersecurity courses taught by industry principal faculty.
            </p>

            <div className="relative max-w-xl">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search courses, instructors, or topics..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-11 pr-4 py-3 bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl text-xs md:text-sm text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-400"
              />
            </div>
          </div>
        </section>

        {/* Filter Categories Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-surface-container-low text-on-surface hover:bg-surface-container'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Results Grid Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-2">
          <div>
            <h2 className="text-lg font-bold text-on-surface">Available Masterclasses ({filteredCourses.length})</h2>
            <p className="text-xs text-on-surface-variant font-normal">All courses rendered dynamically from backend JSON database</p>
          </div>

          <div className="flex items-center gap-3">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-slate-200 rounded-xl px-3 py-1.5 text-xs font-semibold text-slate-700 focus:outline-none"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Courses Display */}
        {loading ? (
          <div className="py-20 text-center text-slate-400 text-xs">Loading course catalog from backend API...</div>
        ) : filteredCourses.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-3xl border border-slate-200 p-8">
            <p className="text-sm font-bold text-slate-700 mb-1">No courses match your criteria</p>
            <p className="text-xs text-slate-400 mb-4">Try clearing your search query or selecting a different subject category.</p>
            <button
              onClick={resetFilters}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-bold hover:bg-slate-200"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset All Filters</span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredCourses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                variant="explore"
                isBookmarked={bookmarkedIds.includes(course.id)}
                onToggleBookmark={() => toggleBookmark(course.id)}
              />
            ))}
          </div>
        )}
      </div>
    </PageLayout>
  );
}
