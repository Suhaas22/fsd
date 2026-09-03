import { Card, CardContent } from "../../../components/instructor/ui/Card";
import { Badge } from "../../../components/instructor/ui/Badge";
import { Button } from "../../../components/instructor/ui/Button";
import { Input } from "../../../components/instructor/ui/Input";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "../../../components/instructor/ui/Tabs";
import { Search, Star, Users, MoreVertical, LayoutGrid, List, X, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import { useState, useMemo, useEffect } from "react";
import { cn } from "../../../utils/cn";
import { api } from "../../../utils/api";

export function MyCourses() {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeTab, setActiveTab] = useState("all");
  const [sortBy, setSortBy] = useState("newest");
  const [viewMode, setViewMode] = useState("grid");

  useEffect(() => {
    api.get('/courses', 'instructor')
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.items || []);
        setCourses(list);
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching courses:', err);
        setCourses([]);
        setLoading(false);
      });
  }, []);

  const filteredCourses = useMemo(() => {
    return courses
      .filter((course) => {
        if (activeTab === "published" && course.status !== "Published") return false;
        if (activeTab === "draft" && course.status !== "Draft") return false;
        if (activeTab === "archived" && course.status !== "Archived") return false;

        if (searchQuery.trim() !== "") {
          const q = searchQuery.toLowerCase();
          const matchTitle = course.title?.toLowerCase().includes(q);
          const matchCat = course.category?.toLowerCase().includes(q);
          const matchLevel = course.level?.toLowerCase().includes(q);
          if (!matchTitle && !matchCat && !matchLevel) return false;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === "newest") return (b.timestamp || 0) - (a.timestamp || 0);
        if (sortBy === "oldest") return (a.timestamp || 0) - (b.timestamp || 0);
        if (sortBy === "popular") return (b.students || 0) - (a.students || 0);
        if (sortBy === "rating") return (b.rating || 0) - (a.rating || 0);
        return 0;
      });
  }, [courses, activeTab, searchQuery, sortBy]);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900 tracking-tight">My Courses</h1>
          <p className="text-navy-500 mt-1">Manage, search and organize your courses.</p>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-white p-2.5 rounded-xl border border-navy-200/60 shadow-sm">
        <div className="relative w-full md:w-96 shrink-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
          <Input 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search your courses by title or topic..." 
            className="pl-9 pr-8 bg-navy-50/50 border-transparent focus:bg-white transition-colors" 
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-navy-400 hover:text-navy-700 p-0.5 rounded-full hover:bg-navy-100 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
        
        <div className="flex items-center justify-between md:justify-end gap-3 w-full md:w-auto">
          <select 
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="border border-navy-200 rounded-lg text-sm px-3 py-2 bg-white flex-1 md:flex-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-500 outline-none transition-all shadow-sm"
          >
            <option value="newest">Newest First</option>
            <option value="oldest">Oldest First</option>
            <option value="popular">Most Popular</option>
            <option value="rating">Highest Rated</option>
          </select>
          <div className="border border-navy-200 rounded-lg flex p-1 bg-navy-50/50 shrink-0">
            <button 
              onClick={() => setViewMode("grid")}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                viewMode === "grid" ? "bg-white shadow-sm text-navy-900" : "text-navy-500 hover:text-navy-900"
              )}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode("list")}
              className={cn(
                "p-1.5 rounded-md transition-colors",
                viewMode === "list" ? "bg-white shadow-sm text-navy-900" : "text-navy-500 hover:text-navy-900"
              )}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="bg-white border border-navy-200/60 shadow-sm p-1 rounded-xl">
          <TabsTrigger value="all">All Courses ({courses.length})</TabsTrigger>
          <TabsTrigger value="published">Published ({courses.filter(c => c.status === "Published").length})</TabsTrigger>
          <TabsTrigger value="draft">Drafts ({courses.filter(c => c.status === "Draft").length})</TabsTrigger>
          <TabsTrigger value="archived">Archived (0)</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {loading ? (
            <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-navy-200/60">
              Loading courses...
            </div>
          ) : filteredCourses.length > 0 ? (
            viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredCourses.map((course) => (
                  <Card key={course.id} className="overflow-hidden hover:shadow-elevated transition-all duration-300 flex flex-col group border-navy-200/60 hover:border-primary-300/50">
                    <div className="aspect-[16/9] relative overflow-hidden bg-navy-100">
                      <img src={course.image || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop'} alt={course.title} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                      <div className="absolute inset-0 bg-gradient-to-t from-navy-900/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                      <div className="absolute top-3 right-3">
                        <Badge variant={course.status === "Published" ? "success" : "default"} className="shadow-sm backdrop-blur-md bg-white/90">
                          {course.status}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-5 flex flex-col flex-1 bg-white">
                      <div className="text-xs font-semibold text-primary-600 mb-2 uppercase tracking-wider">{course.category}</div>
                      <h3 className="font-bold text-navy-900 leading-snug mb-3 line-clamp-2 flex-1 group-hover:text-primary-700 transition-colors">
                        {course.title}
                      </h3>
                      <div className="flex items-center gap-4 text-sm font-medium text-navy-600 mb-5">
                        <span className="flex items-center gap-1.5">
                          <Star className="w-4 h-4 text-amber-500 fill-current" />
                          {course.rating > 0 ? course.rating : "New"}
                        </span>
                        <span className="flex items-center gap-1.5">
                          <Users className="w-4 h-4 text-navy-400" />
                          {(course.students || 0).toLocaleString()}
                        </span>
                      </div>
                      <div className="flex items-center justify-between border-t border-navy-100/80 pt-4 mt-auto">
                        <span className="text-xs font-medium text-navy-400">Updated {course.updated || 'Recently'}</span>
                        <div className="flex items-center gap-2">
                          <Link to={`/instructor/courses/${course.id}/content`}>
                            <Button variant="outline" size="sm" className="h-8 shadow-sm">Manage</Button>
                          </Link>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="space-y-3">
                {filteredCourses.map((course) => (
                  <Card key={course.id} className="overflow-hidden hover:shadow-card transition-all border-navy-200/60">
                    <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <img src={course.image || 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=400&h=250&fit=crop'} alt={course.title} className="w-20 h-14 rounded-lg object-cover shrink-0" />
                        <div>
                          <div className="flex items-center gap-2">
                            <Badge variant={course.status === "Published" ? "success" : "default"} className="text-[10px] px-1.5 py-0">
                              {course.status}
                            </Badge>
                            <span className="text-xs font-semibold text-primary-600 uppercase">{course.category}</span>
                          </div>
                          <h3 className="font-bold text-navy-900 text-base mt-1">{course.title}</h3>
                          <div className="flex items-center gap-4 text-xs text-navy-500 mt-1">
                            <span>{(course.students || 0).toLocaleString()} students</span>
                            <span>·</span>
                            <span>★ {course.rating > 0 ? course.rating : "New"}</span>
                            <span>·</span>
                            <span>Updated {course.updated || 'Recently'}</span>
                          </div>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                        <Link to={`/instructor/courses/${course.id}/content`}>
                          <Button variant="outline" size="sm">Manage Course</Button>
                        </Link>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )
          ) : (
            <div className="border-2 border-dashed border-navy-200 rounded-2xl p-12 text-center bg-white">
              <div className="w-12 h-12 rounded-full bg-navy-100 flex items-center justify-center mx-auto mb-3 text-navy-400">
                <BookOpen className="w-6 h-6" />
              </div>
              <h3 className="font-bold text-navy-900 text-base">No courses found</h3>
              <p className="text-sm text-navy-500 mt-1">
                {searchQuery ? `No courses matching "${searchQuery}"` : "No courses in this category."}
              </p>
              {searchQuery && (
                <Button variant="outline" size="sm" onClick={() => setSearchQuery("")} className="mt-4">
                  Clear Search
                </Button>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
