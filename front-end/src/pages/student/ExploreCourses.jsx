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
      <main className="flex-grow w-full max-w-[1240px] mx-auto px-4 md:px-8 py-8 flex flex-col md:flex-row gap-8">
        
        {/* Left Sidebar Filters (280px on desktop - Stitch) */}
        <aside className="w-full md:w-[260px] lg:w-[280px] shrink-0 space-y-6">
          <div className="flex justify-between items-center pb-3 border-b border-outline-variant/80">
            <h2 className="font-title-lg text-base font-bold text-on-surface">Filter By</h2>
            {(selectedCategory !== 'All Subjects' || selectedLevels.length > 0 || minRating > 0 || searchQuery) && (
              <button 
                onClick={resetFilters}
                className="font-label-md text-xs font-semibold text-primary hover:underline"
              >
                Clear all
              </button>
            )}
          </div>

          {/* Search Box in Sidebar */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-outline" />
            <input
              type="text"
              placeholder="Search keyword..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-white border border-outline-variant/80 rounded-lg text-xs font-medium text-on-surface placeholder:text-outline focus:outline-none focus:ring-2 focus:ring-primary"
            />
          </div>

          {/* Subject Filter Accordion */}
          <div className="border-b border-outline-variant/60 pb-5 space-y-3">
            <h3 className="font-title-md text-xs font-bold text-on-surface uppercase tracking-wider">
              Subject Category
            </h3>
            <div className="space-y-2 max-h-52 overflow-y-auto pr-1">
              {categories.map((cat) => {
                const isSelected = selectedCategory === cat;
                return (
                  <label 
                    key={cat} 
                    onClick={() => setSelectedCategory(cat)}
                    className="flex items-center gap-2.5 cursor-pointer text-xs group py-1"
                  >
                    <input
                      type="radio"
                      name="category"
                      checked={isSelected}
                      onChange={() => setSelectedCategory(cat)}
                      className="w-4 h-4 text-primary rounded-full border-outline-variant focus:ring-primary"
                    />
                    <span className={`transition-colors ${isSelected ? 'font-bold text-primary' : 'text-on-surface-variant group-hover:text-on-surface'}`}>
                      {cat}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Level Filter Checkboxes */}
          <div className="border-b border-outline-variant/60 pb-5 space-y-3">
            <h3 className="font-title-md text-xs font-bold text-on-surface uppercase tracking-wider">
              Experience Level
            </h3>
            <div className="space-y-2">
              {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => {
                const isChecked = selectedLevels.includes(lvl);
                return (
                  <label 
                    key={lvl} 
                    className="flex items-center gap-2.5 cursor-pointer text-xs group py-1"
                  >
                    <input
                      type="checkbox"
                      checked={isChecked}
                      onChange={() => handleLevelToggle(lvl)}
                      className="w-4 h-4 text-primary rounded border-outline-variant focus:ring-primary"
                    />
                    <span className={`transition-colors ${isChecked ? 'font-bold text-primary' : 'text-on-surface-variant group-hover:text-on-surface'}`}>
                      {lvl}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Rating Filter */}
          <div className="space-y-3">
            <h3 className="font-title-md text-xs font-bold text-on-surface uppercase tracking-wider">
              Minimum Rating
            </h3>
            <div className="space-y-2">
              {[4.5, 4.0, 3.5].map((rating) => (
                <label 
                  key={rating}
                  onClick={() => setMinRating(minRating === rating ? 0 : rating)}
                  className="flex items-center gap-2.5 cursor-pointer text-xs group py-1"
                >
                  <input
                    type="radio"
                    name="rating"
                    checked={minRating === rating}
                    onChange={() => setMinRating(minRating === rating ? 0 : rating)}
                    className="w-4 h-4 text-primary rounded-full border-outline-variant focus:ring-primary"
                  />
                  <span className="flex items-center gap-1 text-on-surface-variant">
                    <Star className="w-3.5 h-3.5 fill-[#F5C518] text-[#F5C518]" />
                    <span className="font-semibold text-on-surface">{rating}</span> & up
                  </span>
                </label>
              ))}
            </div>
          </div>

        </aside>

        {/* Right Main Content (Stitch) */}
        <section className="flex-1 min-w-0 space-y-6">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-2 text-xs text-on-surface-variant font-medium">
            <Link to="/student" className="hover:text-primary transition-colors">Home</Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-on-surface-variant">Browse</span>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-on-surface font-bold">{selectedCategory}</span>
          </nav>

          {/* Header & Sort */}
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 pb-2 border-b border-outline-variant/60">
            <div>
              <h1 className="font-headline-lg text-2xl md:text-3xl font-bold text-on-surface">
                {selectedCategory === 'All Subjects' ? 'Course Catalog' : `${selectedCategory} Courses`}
              </h1>
              <p className="font-body-md text-xs text-on-surface-variant mt-1">
                Showing {filteredCourses.length} accredited university courses
              </p>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <label className="text-xs text-on-surface-variant font-medium whitespace-nowrap" htmlFor="sort">
                Sort by:
              </label>
              <select
                id="sort"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-white border border-outline-variant/80 rounded-lg py-1.5 pl-3 pr-8 text-xs font-semibold text-on-surface focus:outline-none focus:ring-2 focus:ring-primary"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* Active Filters Row (Stitch) */}
          {(selectedCategory !== 'All Subjects' || selectedLevels.length > 0 || minRating > 0 || searchQuery) && (
            <div className="flex flex-wrap items-center gap-2 pt-1">
              {selectedCategory !== 'All Subjects' && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container rounded-full text-xs font-semibold text-on-surface">
                  Subject: {selectedCategory}
                  <button onClick={() => setSelectedCategory('All Subjects')} className="hover:text-red-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {selectedLevels.map((lvl) => (
                <span key={lvl} className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container rounded-full text-xs font-semibold text-on-surface">
                  Level: {lvl}
                  <button onClick={() => handleLevelToggle(lvl)} className="hover:text-red-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              ))}

              {minRating > 0 && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container rounded-full text-xs font-semibold text-on-surface">
                  Rating: {minRating}★+
                  <button onClick={() => setMinRating(0)} className="hover:text-red-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              {searchQuery && (
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-surface-container rounded-full text-xs font-semibold text-on-surface">
                  Query: "{searchQuery}"
                  <button onClick={() => setSearchQuery('')} className="hover:text-red-600">
                    <X className="w-3.5 h-3.5" />
                  </button>
                </span>
              )}

              <button 
                onClick={resetFilters}
                className="text-xs font-bold text-primary hover:underline ml-2"
              >
                Clear all
              </button>
            </div>
          )}

          {/* Course Grid: Stitch 3-Column Display */}
          {loading ? (
            <div className="py-20 text-center text-outline text-xs">
              Fetching catalog courses...
            </div>
          ) : filteredCourses.length === 0 ? (
            <div className="py-16 text-center bg-surface-container-lowest rounded-xl border border-outline-variant p-8">
              <p className="text-sm font-bold text-on-surface mb-1">No courses match your criteria</p>
              <p className="text-xs text-outline mb-4">
                Try clearing your search query or selecting a different subject filter.
              </p>
              <button
                onClick={resetFilters}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-lg bg-surface-container text-on-surface text-xs font-bold hover:bg-surface-container-high"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset All Filters</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
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

        </section>

      </main>
    </PageLayout>
  );
}
