import React, { useState, useEffect, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  Sparkles,
  X,
  SlidersHorizontal,
  BookOpen
} from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import CourseCard from '../../components/common/CourseCard';
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
  const [searchParams, setSearchParams] = useSearchParams();
  const searchFromUrl = searchParams.get('q') || searchParams.get('search') || '';
  const categoryFromUrl = searchParams.get('category') || 'All Subjects';

  const { addToast } = useToast();

  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState(searchFromUrl);
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl);
  const [sortBy, setSortBy] = useState('popular');
  const [bookmarkedIds, setBookmarkedIds] = useState([]);

  // Synchronize with URL search parameters (e.g. from Navbar search)
  useEffect(() => {
    const q = searchParams.get('q') || searchParams.get('search') || '';
    const cat = searchParams.get('category') || 'All Subjects';
    setSearchQuery(q);
    setSelectedCategory(cat);
  }, [searchParams]);

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

  const handleCategorySelect = (cat) => {
    setSelectedCategory(cat);
    const newParams = new URLSearchParams(searchParams);
    if (cat === 'All Subjects') {
      newParams.delete('category');
    } else {
      newParams.set('category', cat);
    }
    setSearchParams(newParams);
  };

  const handleSearchChange = (e) => {
    const val = e.target.value;
    setSearchQuery(val);
    const newParams = new URLSearchParams(searchParams);
    if (val.trim()) {
      newParams.set('q', val);
    } else {
      newParams.delete('q');
      newParams.delete('search');
    }
    setSearchParams(newParams);
  };

  const handleClearSearch = () => {
    setSearchQuery('');
    setSelectedCategory('All Subjects');
    const newParams = new URLSearchParams(searchParams);
    newParams.delete('q');
    newParams.delete('search');
    newParams.delete('category');
    setSearchParams(newParams);
  };

  const filteredCourses = useMemo(() => {
    return courses.filter((course) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase().trim();
        const matchesTitle = course.title?.toLowerCase().includes(query);
        const matchesDesc = (course.description || course.subtitle || '')?.toLowerCase().includes(query);
        const matchesCategory = course.category?.toLowerCase().includes(query);
        const matchesInstructor = (course.instructorName || course.leadInstructorName || '')?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesDesc && !matchesCategory && !matchesInstructor) return false;
      }
      if (selectedCategory !== 'All Subjects' && course.category !== selectedCategory) {
        return false;
      }
      return true;
    }).sort((a, b) => {
      if (sortBy === 'price-low') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'price-high') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'rating') return (b.rating || 0) - (a.rating || 0);
      return (b.enrolledCount || 0) - (a.enrolledCount || 0);
    });
  }, [courses, searchQuery, selectedCategory, sortBy]);

  return (
    <PageLayout>
      <div className="w-full max-w-[1560px] mx-auto px-4 md:px-8 lg:px-12 py-8 space-y-8 bg-[#F8FAFC] min-h-screen">
        
        {/* Header Hero Banner (Original Layout with Polished Coursera Styling) */}
        <section className="w-full bg-gradient-to-r from-[#002554] via-[#0040A1] to-[#0056D2] text-white rounded-2xl p-6 md:p-8 lg:p-10 shadow-md relative overflow-hidden">
          <div className="relative z-10 max-w-3xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/15 backdrop-blur-md text-[11px] font-bold mb-3.5 border border-white/20">
              <Sparkles className="w-3.5 h-3.5 text-amber-300" />
              <span>Institutional Course Catalog</span>
            </div>
            <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold mb-2 tracking-tight">
              Explore Masterclass Tracks
            </h1>
            <p className="text-blue-100 text-xs md:text-sm leading-relaxed mb-6 font-normal max-w-2xl">
              Discover accredited enterprise architecture, distributed payments, AI, and cybersecurity courses taught by industry principal faculty.
            </p>

            <div className="relative max-w-xl">
              <Search className="w-4 h-4 absolute left-4 top-1/2 -translate-y-1/2 text-blue-200" />
              <input
                type="text"
                placeholder="Search courses, instructors, or topics (e.g. Distributed, Kafka, AWS)..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="w-full pl-11 pr-10 py-3 bg-white/15 backdrop-blur-md border border-white/25 rounded-xl text-xs md:text-sm text-white placeholder-blue-200 focus:outline-none focus:ring-2 focus:ring-white/40 focus:bg-white/20 transition-all shadow-inner"
              />
              {searchQuery && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    const newParams = new URLSearchParams(searchParams);
                    newParams.delete('q');
                    newParams.delete('search');
                    setSearchParams(newParams);
                  }}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-blue-200 hover:text-white transition-colors"
                  title="Clear search"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </section>

        {/* Filter Categories Bar (Horizontal Pills) */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => handleCategorySelect(cat)}
                className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all shadow-xs ${
                  isActive
                    ? 'bg-coursera text-white shadow-sm ring-1 ring-coursera'
                    : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200/80 hover:text-coursera'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Results Grid Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pt-1">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              {selectedCategory === 'All Subjects' ? 'Available Masterclasses' : `${selectedCategory} Courses`} ({filteredCourses.length})
            </h2>
            <p className="text-xs text-slate-500 font-normal">
              {searchQuery ? `Showing matching results for "${searchQuery}"` : 'Accredited university programs and technical specializations'}
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <label htmlFor="course-sort" className="text-xs font-semibold text-slate-500">
              Sort by:
            </label>
            <select
              id="course-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="bg-white border border-slate-200/90 rounded-xl px-3.5 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-coursera/20 shadow-xs cursor-pointer"
            >
              <option value="popular">Most Popular</option>
              <option value="rating">Highest Rated</option>
              <option value="price-low">Price: Low to High</option>
              <option value="price-high">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Courses Display Grid */}
        {loading ? (
          <div className="py-24 text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-coursera border-t-transparent mx-auto mb-3"></div>
            <p className="text-xs text-slate-500 font-medium">Loading course catalog...</p>
          </div>
        ) : filteredCourses.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-2xl border border-slate-200 p-8 shadow-xs">
            <div className="w-12 h-12 rounded-xl bg-blue-50 text-coursera flex items-center justify-center mx-auto mb-3">
              <BookOpen className="w-6 h-6" />
            </div>
            <p className="text-sm font-bold text-slate-800 mb-1">No courses found</p>
            <p className="text-xs text-slate-500 mb-5 max-w-md mx-auto">
              {searchQuery 
                ? `No courses matched your query "${searchQuery}" in ${selectedCategory}.` 
                : `There are currently no courses listed under "${selectedCategory}".`}
            </p>
            <button
              onClick={handleClearSearch}
              className="px-4 py-2 rounded-xl bg-coursera text-white text-xs font-bold hover:bg-primary transition-all shadow-xs"
            >
              Show All Courses
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
                onBookmarkToggle={toggleBookmark}
              />
            ))}
          </div>
        )}

      </div>
    </PageLayout>
  );
}
