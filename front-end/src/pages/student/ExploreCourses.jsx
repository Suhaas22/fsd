import React, { useState, useMemo } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { 
  Search, 
  SlidersHorizontal, 
  ChevronRight, 
  X, 
  Check, 
  Star, 
  ArrowUpDown, 
  Grid, 
  List,
  RotateCcw,
  Sparkles
} from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import CourseCard from '../../components/common/CourseCard';
import Badge from '../../components/common/Badge';
import { coursesData, exploreCategories } from '../../data/coursesData';
import { useToast } from '../../components/common/Toast';

export default function ExploreCourses() {
  const [searchParams, setSearchParams] = useSearchParams();
  const searchFromUrl = searchParams.get('search') || '';
  const categoryFromUrl = searchParams.get('category') || 'All Subjects';

  const { addToast } = useToast();

  const [searchQuery, setSearchQuery] = useState(searchFromUrl);
  const [selectedCategory, setSelectedCategory] = useState(categoryFromUrl);
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [selectedDurations, setSelectedDurations] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState("popular");
  const [bookmarkedIds, setBookmarkedIds] = useState(['aws-solutions-architect']);

  const toggleBookmark = (id) => {
    setBookmarkedIds(prev => {
      const isAlready = prev.includes(id);
      if (isAlready) {
        addToast('Course removed from wishlist', 'info');
        return prev.filter(x => x !== id);
      } else {
        addToast('Course added to wishlist', 'success');
        return [...prev, id];
      }
    });
  };

  const handleLevelToggle = (lvl) => {
    setSelectedLevels(prev => 
      prev.includes(lvl) ? prev.filter(l => l !== lvl) : [...prev, lvl]
    );
  };

  const handleDurationToggle = (dur) => {
    setSelectedDurations(prev => 
      prev.includes(dur) ? prev.filter(d => d !== dur) : [...prev, dur]
    );
  };

  const clearAllFilters = () => {
    setSelectedCategory("All Subjects");
    setSelectedLevels([]);
    setSelectedDurations([]);
    setMinRating(0);
    setSearchQuery('');
    setSearchParams({});
    addToast('All filters cleared', 'info');
  };

  // Filtered & Sorted Courses
  const filteredCourses = useMemo(() => {
    return coursesData.filter(course => {
      // Search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = course.title.toLowerCase().includes(query);
        const matchSub = course.subtitle?.toLowerCase().includes(query);
        const matchSkills = course.skills?.some(s => s.toLowerCase().includes(query));
        const matchInst = course.institution?.toLowerCase().includes(query);
        if (!matchTitle && !matchSub && !matchSkills && !matchInst) return false;
      }

      // Category
      if (selectedCategory !== "All Subjects" && course.category !== selectedCategory) {
        return false;
      }

      // Level
      if (selectedLevels.length > 0 && !selectedLevels.includes(course.level)) {
        return false;
      }

      // Rating
      if (minRating > 0 && course.rating < minRating) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (sortBy === "popular") return b.studentsCount - a.studentsCount;
      if (sortBy === "rating") return b.rating - a.rating;
      if (sortBy === "price-low") return a.price - b.price;
      if (sortBy === "price-high") return b.price - a.price;
      return 0;
    });
  }, [searchQuery, selectedCategory, selectedLevels, minRating, sortBy]);

  const activeFiltersCount = 
    (selectedCategory !== "All Subjects" ? 1 : 0) + 
    selectedLevels.length + 
    (minRating > 0 ? 1 : 0) + 
    (searchQuery ? 1 : 0);

  return (
    <PageLayout>
      <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        
        {/* Breadcrumb Bar */}
        <nav className="flex items-center gap-2 text-xs text-outline mb-4 font-medium">
          <Link to="/" className="hover:text-primary transition-colors">Home</Link>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-on-surface">Browse Catalog</span>
          <ChevronRight className="w-3.5 h-3.5" />
          <span className="text-primary font-bold">{selectedCategory}</span>
        </nav>

        {/* Page Title & Sort Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-outline-variant">
          <div>
            <h1 className="text-xl md:text-2xl font-bold text-on-surface tracking-tight">
              {selectedCategory === "All Subjects" ? "Explore Courses & Specializations" : `${selectedCategory} Programs`}
            </h1>
            <p className="text-xs text-on-surface-variant mt-0.5">
              Showing <strong className="text-on-surface font-bold">{filteredCourses.length}</strong> verified courses
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-xs font-semibold text-on-surface-variant bg-surface-container-low px-3 py-1.5 rounded-xl border border-outline-variant/60">
              <ArrowUpDown className="w-3.5 h-3.5 text-primary" />
              <span>Sort:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-transparent text-on-surface text-xs font-bold focus:outline-none cursor-pointer"
              >
                <option value="popular">Most Popular</option>
                <option value="rating">Highest Rated</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
              </select>
            </div>
          </div>
        </div>

        {/* Category Pills Bar */}
        <div className="flex items-center gap-2 overflow-x-auto py-4 scrollbar-none">
          {exploreCategories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-primary text-white shadow-xs'
                  : 'bg-surface-container hover:bg-surface-container-high text-on-surface-variant'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Active Filters Pill Bar */}
        {activeFiltersCount > 0 && (
          <div className="flex items-center flex-wrap gap-2 mb-6 p-3 rounded-2xl bg-surface-container-low border border-outline-variant/60">
            <span className="text-xs font-bold text-on-surface-variant mr-1">Active filters:</span>
            {selectedCategory !== "All Subjects" && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                {selectedCategory}
                <X className="w-3 h-3 cursor-pointer" onClick={() => setSelectedCategory("All Subjects")} />
              </span>
            )}
            {selectedLevels.map(lvl => (
              <span key={lvl} className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                Level: {lvl}
                <X className="w-3 h-3 cursor-pointer" onClick={() => handleLevelToggle(lvl)} />
              </span>
            ))}
            {minRating > 0 && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                {minRating}★+
                <X className="w-3 h-3 cursor-pointer" onClick={() => setMinRating(0)} />
              </span>
            )}
            {searchQuery && (
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-lg bg-primary/10 text-primary text-xs font-semibold">
                "{searchQuery}"
                <X className="w-3 h-3 cursor-pointer" onClick={() => { setSearchQuery(''); setSearchParams({}); }} />
              </span>
            )}
            <button
              onClick={clearAllFilters}
              className="text-xs font-bold text-error hover:underline ml-auto flex items-center gap-1"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>Reset</span>
            </button>
          </div>
        )}

        {/* Main Content Layout (Sidebar + Course Grid) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          
          {/* Left Filter Sidebar (3 cols) */}
          <aside className="lg:col-span-3 space-y-4">
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-5 shadow-ambient sticky top-24">
              
              <div className="flex items-center justify-between pb-3 border-b border-outline-variant mb-4">
                <div className="flex items-center gap-2 font-bold text-xs text-on-surface">
                  <SlidersHorizontal className="w-3.5 h-3.5 text-primary" />
                  <span>Filter Catalog</span>
                </div>
                {activeFiltersCount > 0 && (
                  <button onClick={clearAllFilters} className="text-[11px] text-primary font-semibold hover:underline">
                    Clear
                  </button>
                )}
              </div>

              {/* Search Inside Filter */}
              <div className="mb-4">
                <label className="text-[11px] font-bold text-on-surface uppercase tracking-wider block mb-1.5">
                  Keyword
                </label>
                <div className="relative">
                  <Search className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-outline" />
                  <input
                    type="text"
                    placeholder="Search topics, skills..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-2.5 py-1.5 text-xs bg-surface-container-low border border-outline-variant rounded-lg focus:outline-none focus:border-primary text-on-surface font-medium"
                  />
                </div>
              </div>

              {/* Difficulty Level */}
              <div className="mb-4">
                <label className="text-[11px] font-bold text-on-surface uppercase tracking-wider block mb-2">
                  Difficulty Level
                </label>
                <div className="space-y-1.5">
                  {["Beginner", "Intermediate", "Advanced"].map((lvl) => (
                    <label key={lvl} className="flex items-center gap-2.5 text-xs text-on-surface cursor-pointer select-none font-medium">
                      <input
                        type="checkbox"
                        checked={selectedLevels.includes(lvl)}
                        onChange={() => handleLevelToggle(lvl)}
                        className="rounded border-outline-variant text-primary focus:ring-primary w-3.5 h-3.5 cursor-pointer"
                      />
                      <span>{lvl}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Minimum Rating */}
              <div className="mb-4">
                <label className="text-[11px] font-bold text-on-surface uppercase tracking-wider block mb-2">
                  Minimum Rating
                </label>
                <div className="space-y-1">
                  {[4.5, 4.0, 3.5].map((stars) => (
                    <button
                      key={stars}
                      onClick={() => setMinRating(minRating === stars ? 0 : stars)}
                      className={`w-full flex items-center justify-between p-2 rounded-lg text-xs transition-colors ${
                        minRating === stars ? 'bg-primary-fixed/60 font-bold text-primary ring-1 ring-primary/40' : 'hover:bg-surface-container-low text-on-surface-variant'
                      }`}
                    >
                      <div className="flex items-center gap-1 text-[#F5C518]">
                        <Star className="w-3.5 h-3.5 fill-current" />
                        <span className="text-on-surface font-semibold text-xs">{stars} & above</span>
                      </div>
                      {minRating === stars && <Check className="w-3.5 h-3.5 text-primary" />}
                    </button>
                  ))}
                </div>
              </div>

              {/* Duration */}
              <div>
                <label className="text-[11px] font-bold text-on-surface uppercase tracking-wider block mb-2">
                  Duration
                </label>
                <div className="space-y-1.5">
                  {["1-4 Weeks", "1-3 Months", "3+ Months"].map((dur) => (
                    <label key={dur} className="flex items-center gap-2.5 text-xs text-on-surface cursor-pointer select-none font-medium">
                      <input
                        type="checkbox"
                        checked={selectedDurations.includes(dur)}
                        onChange={() => handleDurationToggle(dur)}
                        className="rounded border-outline-variant text-primary focus:ring-primary w-3.5 h-3.5 cursor-pointer"
                      />
                      <span>{dur}</span>
                    </label>
                  ))}
                </div>
              </div>

            </div>
          </aside>

          {/* Right Main Grid (9 cols) */}
          <main className="lg:col-span-9">
            {filteredCourses.length === 0 ? (
              <div className="text-center py-16 bg-surface-container-lowest border border-outline-variant rounded-2xl p-6">
                <div className="w-12 h-12 rounded-full bg-surface-container flex items-center justify-center mx-auto text-outline mb-3">
                  <Search className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-on-surface mb-1">No matching courses found</h3>
                <p className="text-xs text-on-surface-variant mb-4">Try adjusting your filters or keyword query.</p>
                <button
                  onClick={clearAllFilters}
                  className="px-4 py-2 rounded-xl bg-primary text-white text-xs font-bold hover:bg-primary-container shadow-xs"
                >
                  Clear All Filters
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
          </main>

        </div>

      </div>
    </PageLayout>
  );
}
