
// Bommadevara Suhaas - S20240010035

/*

ExploreCoursesAssign
├── CourseCard
│   ├── Badge
│   └── RatingStars
└── filter and sort controls

*/ 


import React, { useMemo, useState } from 'react';
import { Bookmark, Clock, Search, Star } from 'lucide-react';

const courses = [
  { id: 'advanced-api-integrations', title: 'Advanced API Integrations for Enterprise Payments', institution: 'NexusTech Institute', rating: 4.9, reviewsCount: 3840, studentsCount: 18450, level: 'Advanced', duration: '6 Weeks', price: 89.99, originalPrice: 129.99, badge: 'Bestseller', category: 'Computer Science', skills: ['API Design', 'Payment Routing', 'Security'], thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&auto=format&fit=crop&q=80' },
  { id: 'aws-solutions-architect', title: 'Advanced AWS Solutions Architect', institution: 'CloudTech Academy', rating: 4.8, reviewsCount: 4120, studentsCount: 32900, level: 'Advanced', duration: '8 Weeks', price: 99.99, originalPrice: 149.99, badge: 'Featured', category: 'Cloud Architecture', skills: ['AWS IAM', 'VPC Peering', 'Terraform'], thumbnail: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=80' },
  { id: 'python-data-science', title: 'Python for Data Science Fundamentals', institution: 'Tech University', rating: 4.9, reviewsCount: 6540, studentsCount: 48200, level: 'Beginner', duration: '5 Weeks', price: 49.99, originalPrice: 79.99, badge: 'Popular', category: 'Data Science', skills: ['Python', 'Pandas', 'NumPy'], thumbnail: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?w=800&auto=format&fit=crop&q=80' },
  { id: 'agile-project-management', title: 'Agile Project Management Leadership', institution: 'Business Institute', rating: 4.7, reviewsCount: 2190, studentsCount: 19400, level: 'Intermediate', duration: '4 Weeks', price: 59.99, originalPrice: 89.99, category: 'Business', skills: ['Scrum', 'Kanban', 'Jira'], thumbnail: 'https://images.unsplash.com/photo-1531403009284-440f080d1e12?w=800&auto=format&fit=crop&q=80' },
  { id: 'applied-machine-learning', title: 'Applied Machine Learning Masterclass', institution: 'Global Tech Uni', rating: 4.8, reviewsCount: 12400, studentsCount: 54000, level: 'Intermediate', duration: '3 Months', price: 89.99, originalPrice: 99.99, badge: 'Specialization', category: 'Computer Science', skills: ['Machine Learning', 'PyTorch', 'MLOps'], thumbnail: 'https://images.unsplash.com/photo-1555949963-aa79dcee981c?w=800&auto=format&fit=crop&q=80' },
  { id: 'corporate-finance', title: 'Corporate Finance Essentials & Risk Management', institution: 'Business School', rating: 4.9, reviewsCount: 8200, studentsCount: 38000, level: 'Beginner', duration: '4 Weeks', price: 74.99, originalPrice: 110, category: 'Finance', skills: ['CAPM', 'DCF Modeling', 'Valuation'], thumbnail: 'https://images.unsplash.com/photo-1611974789855-9c2a0a7236a3?w=800&auto=format&fit=crop&q=80' },
];

const categories = ['All Subjects', 'Computer Science', 'Cloud Architecture', 'Data Science', 'Finance', 'Business'];

function RatingStars({ rating, reviewsCount }) {
  return <div className="flex items-center gap-1 text-xs"><Star className="w-4 h-4 fill-amber-400 text-amber-400" /><strong>{rating.toFixed(1)}</strong><span className="text-outline">({reviewsCount.toLocaleString()})</span></div>;
}

function Badge({ children }) {
  return <span className="rounded-full bg-primary-fixed px-2 py-0.5 text-[11px] font-semibold text-primary">{children}</span>;
}

// child component that receives course data and reports bookmarkc licks to its praentt
function CourseCard({ course, isBookmarked, onBookmarkToggle }) {
  return (
    <article className="overflow-hidden rounded-2xl border border-outline-variant bg-surface-container-lowest shadow-ambient">
      <div className="relative h-40"><img src={course.thumbnail} alt={course.title} className="h-full w-full object-cover" />
        <button type="button" onClick={() => onBookmarkToggle(course.id)} aria-label={`Bookmark ${course.title}`} className="absolute right-3 top-3 rounded-full bg-white p-2 text-primary shadow"><Bookmark className={`h-4 w-4 ${isBookmarked ? 'fill-current' : ''}`} /></button>
      </div>
      <div className="p-4"><div className="mb-2 flex items-center justify-between text-xs text-outline"><span>{course.institution}</span><span>{course.level}</span></div>
        {course.badge && <div className="mb-2"><Badge>{course.badge}</Badge></div>}
        <h2 className="min-h-12 font-bold text-on-surface">{course.title}</h2><div className="my-3"><RatingStars rating={course.rating} reviewsCount={course.reviewsCount} /></div>
        <div className="mb-3 flex items-center gap-1 text-xs text-on-surface-variant"><Clock className="h-4 w-4" />{course.duration}</div>
        <div className="mb-4 flex flex-wrap gap-1">{course.skills.map((skill) => <span key={skill} className="rounded bg-surface-container px-2 py-1 text-[11px]">{skill}</span>)}</div>
        <div className="flex items-center justify-between border-t border-outline-variant pt-3"><span className="font-bold">₹{course.price}</span><button type="button" className="rounded-lg bg-primary px-3 py-1.5 text-xs font-semibold text-white">Enroll</button></div>
      </div>
    </article>
  );
}

export default function ExploreCoursesAssign() {
  // lifted state that fliters and bookmarked ids ares hared by the controls and every course cadrd
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All Subjects');
  const [selectedLevels, setSelectedLevels] = useState([]);
  const [minRating, setMinRating] = useState(0);
  const [sortBy, setSortBy] = useState('popular');
  const [bookmarkedIds, setBookmarkedIds] = useState(['aws-solutions-architect']);

  const toggleBookmark = (courseId) => setBookmarkedIds((ids) => ids.includes(courseId) ? ids.filter((id) => id !== courseId) : [...ids, courseId]);
  const toggleLevel = (level) => setSelectedLevels((levels) => levels.includes(level) ? levels.filter((item) => item !== level) : [...levels, level]);
  const clearFilters = () => { setSearchQuery(''); setSelectedCategory('All Subjects'); setSelectedLevels([]); setMinRating(0); };

  const filteredCourses = useMemo(() => courses.filter((course) => {
    const matchesSearch = course.title.toLowerCase().includes(searchQuery.toLowerCase()) || course.skills.some((skill) => skill.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesSearch && (selectedCategory === 'All Subjects' || course.category === selectedCategory) && (!selectedLevels.length || selectedLevels.includes(course.level)) && course.rating >= minRating;
  }).sort((a, b) => sortBy === 'rating' ? b.rating - a.rating : sortBy === 'price-low' ? a.price - b.price : b.studentsCount - a.studentsCount), [searchQuery, selectedCategory, selectedLevels, minRating, sortBy]);

  return (
    <main className="mx-auto max-w-7xl px-4 py-8 text-on-surface"><h1 className="text-2xl font-bold">Explore Courses & Specializations</h1><p className="mb-6 text-sm text-on-surface-variant">Showing {filteredCourses.length} verified courses</p>
      <div className="mb-6 flex flex-wrap gap-2">{categories.map((category) => <button type="button" key={category} onClick={() => setSelectedCategory(category)} className={`rounded-full px-3 py-2 text-xs font-semibold ${selectedCategory === category ? 'bg-primary text-white' : 'bg-surface-container'}`}>{category}</button>)}</div>
      <div className="grid gap-6 lg:grid-cols-[220px_1fr]"><aside className="space-y-5 rounded-2xl border border-outline-variant bg-surface-container-low p-4"><label className="block text-xs font-bold">Search<input value={searchQuery} onChange={(event) => setSearchQuery(event.target.value)} placeholder="Search courses" className="mt-2 w-full rounded-lg border border-outline-variant bg-white px-3 py-2 text-sm" /></label>
        <fieldset><legend className="mb-2 text-xs font-bold">Level</legend>{['Beginner', 'Intermediate', 'Advanced'].map((level) => <label key={level} className="mb-2 flex gap-2 text-sm"><input type="checkbox" checked={selectedLevels.includes(level)} onChange={() => toggleLevel(level)} />{level}</label>)}</fieldset>
        <label className="block text-xs font-bold">Minimum rating<select value={minRating} onChange={(event) => setMinRating(Number(event.target.value))} className="mt-2 w-full rounded-lg border border-outline-variant bg-white p-2"><option value="0">Any rating</option><option value="4.5">4.5 and above</option><option value="4">4.0 and above</option></select></label><button type="button" onClick={clearFilters} className="text-xs font-bold text-primary">Clear filters</button>
      </aside><section><div className="mb-4 flex justify-end"><select aria-label="Sort courses" value={sortBy} onChange={(event) => setSortBy(event.target.value)} className="rounded-lg border border-outline-variant bg-white p-2 text-sm"><option value="popular">Most popular</option><option value="rating">Highest rated</option><option value="price-low">Price: low to high</option></select></div>
        {filteredCourses.length ? <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">{filteredCourses.map((course) => <CourseCard key={course.id} course={course} isBookmarked={bookmarkedIds.includes(course.id)} onBookmarkToggle={toggleBookmark} />)}</div> : <p className="rounded-xl bg-surface-container p-8 text-center">No courses match these filters.</p>}</section>
      </div>
    </main>
  );
}




/*

Props
ExploreCoursesAssign passes data and functions to child components.
- CourseCard receives:
  - course
  - isBookmarked
  - onBookmarkToggle
- RatingStars receives:
  - rating
  - reviewsCount
- Badge receives:
  - children

Callback functions
Child components communicate with the parent through callbacks.
- When a user clicks the bookmark button, CourseCard calls onBookmarkToggle(course.id).
- This invokes the toggleBookmark function in ExploreCoursesAssign.
- The parent then updates the bookmarkedIds state, and the card UI updates automatically.

Lifted state
All shared state is stored in the common parent component, ExploreCoursesAssign:
- searchQuery — course search text
- selectedCategory — selected course category
- selectedLevels — selected difficulty levels
- minRating — minimum course rating filter
- sortBy — selected sorting option
- bookmarkedIds — IDs of bookmarked courses

*/

