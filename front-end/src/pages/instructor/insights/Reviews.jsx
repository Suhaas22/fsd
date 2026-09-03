import { Card, CardContent } from "../../../components/instructor/ui/Card";
import { Button } from "../../../components/instructor/ui/Button";
import { Input } from "../../../components/instructor/ui/Input";
import { Star, MessageSquare, Search, X, Send, Edit2, Trash2 } from "lucide-react";
import { useState, useMemo, useEffect } from "react";
import { cn } from "../../../utils/cn";
import { api } from "../../../utils/api";

export function Reviews() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCourse, setSelectedCourse] = useState("All Courses");
  const [selectedRating, setSelectedRating] = useState("All Ratings");
  const [sortBy, setSortBy] = useState("Newest First");

  const [reviewsData, setReviewsData] = useState({
    reviews: [],
    averageRating: 4.8,
    totalReviews: 1245,
    ratingBreakdown: [],
  });
  const [loading, setLoading] = useState(true);

  // Reply form states
  const [replyingId, setReplyingId] = useState(null);
  const [replyText, setReplyText] = useState("");

  const loadReviews = () => {
    api.get('/reviews', 'instructor')
      .then(data => {
        const rawList = Array.isArray(data) ? data : (Array.isArray(data?.items) ? data.items : (Array.isArray(data?.data) ? data.data : []));
        const normalized = rawList.map(r => ({
          ...r,
          id: r.id,
          name: r.name || r.learnerName || r.user || 'Verified Learner',
          avatar: r.avatar || r.learnerAvatar || '',
          course: r.course || r.courseTitle || 'Enterprise Masterclass',
          rating: Number(r.rating) || 5,
          content: r.content || r.comment || '',
          date: r.date || (r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : 'Recently'),
          timestamp: r.timestamp || (r.createdAt ? new Date(r.createdAt).getTime() : Date.now()),
          response: r.response || r.instructorReply || '',
        }));

        const total = normalized.length;
        const avg = total > 0 ? (normalized.reduce((sum, r) => sum + r.rating, 0) / total).toFixed(1) : 4.8;
        
        // Compute dynamic breakdown
        const breakdown = [5, 4, 3, 2, 1].map(stars => {
          const count = normalized.filter(r => Math.round(r.rating) === stars).length;
          const percent = total > 0 ? Math.round((count / total) * 100) : (stars === 5 ? 85 : stars === 4 ? 15 : 0);
          return { stars, count, percent };
        });

        setReviewsData({
          reviews: normalized,
          averageRating: avg,
          totalReviews: total || 1245,
          ratingBreakdown: breakdown,
        });
        setLoading(false);
      })
      .catch(err => {
        console.error('Error fetching reviews:', err);
        setLoading(false);
      });
  };

  useEffect(() => {
    loadReviews();
  }, []);

  const reviews = reviewsData.reviews || [];
  const ratings = reviewsData.ratingBreakdown || [];
  const uniqueCourses = useMemo(() => Array.from(new Set(reviews.map(r => r.course).filter(Boolean))), [reviews]);

  const filteredReviews = useMemo(() => {
    return reviews
      .filter((review) => {
        if (selectedCourse !== "All Courses" && review.course !== selectedCourse) {
          return false;
        }
        if (selectedRating === "5 Stars" && review.rating !== 5) return false;
        if (selectedRating === "4 Stars" && review.rating !== 4) return false;
        if (selectedRating === "3 Stars" && review.rating !== 3) return false;
        if (selectedRating === "1-2 Stars" && review.rating > 2) return false;

        if (searchQuery.trim() !== "") {
          const q = searchQuery.toLowerCase();
          const matchName = review.name?.toLowerCase().includes(q);
          const matchContent = review.content?.toLowerCase().includes(q);
          const matchCourse = review.course?.toLowerCase().includes(q);
          if (!matchName && !matchContent && !matchCourse) return false;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === "Newest First") return (b.timestamp || 0) - (a.timestamp || 0);
        if (sortBy === "Oldest First") return (a.timestamp || 0) - (b.timestamp || 0);
        return 0;
      });
  }, [reviews, searchQuery, selectedCourse, selectedRating, sortBy]);

  const handleStartReply = (id, existingResponse = "") => {
    setReplyingId(id);
    setReplyText(existingResponse || "");
  };

  const handleCancelReply = () => {
    setReplyingId(null);
    setReplyText("");
  };

  const handleSubmitReply = (id) => {
    if (!replyText.trim()) return;
    api.post(`/reviews/${id}/reply`, { response: replyText.trim() }, 'instructor')
      .then(() => {
        loadReviews();
        setReplyingId(null);
        setReplyText("");
      })
      .catch(err => console.error('Error submitting reply:', err));
  };

  const handleDeleteReply = (id) => {
    api.delete(`/reviews/${id}/reply`, 'instructor')
      .then(() => {
        loadReviews();
        if (replyingId === id) {
          setReplyingId(null);
          setReplyText("");
        }
      })
      .catch(err => console.error('Error deleting reply:', err));
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-900">Student Reviews</h1>
          <p className="text-navy-500">Monitor, search and respond to feedback from your learners.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <Card>
            <CardContent className="p-6">
              <div className="text-center mb-6">
                <div className="text-5xl font-bold text-navy-900 mb-2">{reviewsData.averageRating}</div>
                <div className="flex justify-center gap-1 mb-2 text-yellow-500">
                  {[1, 2, 3, 4, 5].map(i => <Star key={i} className="w-5 h-5 fill-current" />)}
                </div>
                <p className="text-sm text-navy-500">Course Rating ({reviewsData.totalReviews} reviews)</p>
              </div>
              
              <div className="space-y-3">
                {ratings.map(item => (
                  <div key={item.stars} className="flex items-center gap-3 text-sm">
                    <span className="w-12 font-medium text-navy-700 flex items-center gap-1">
                      {item.stars} <Star className="w-3.5 h-3.5 fill-current text-yellow-500" />
                    </span>
                    <div className="flex-1 h-2 bg-navy-100 rounded-full overflow-hidden">
                      <div className="h-full bg-yellow-500 rounded-full" style={{ width: `${item.percent}%` }} />
                    </div>
                    <span className="w-10 text-right text-navy-500 text-xs">{item.percent}%</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white p-3 rounded-xl border border-navy-200 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-navy-400" />
              <Input
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                placeholder="Search reviews..."
                className="pl-9 pr-8 h-9 text-sm bg-navy-50/50"
              />
              {searchQuery && (
                <button onClick={() => setSearchQuery("")} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-navy-400">
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
            <div className="flex gap-2 w-full sm:w-auto flex-wrap sm:flex-nowrap">
              {uniqueCourses.length > 0 && (
                <select
                  value={selectedCourse}
                  onChange={e => setSelectedCourse(e.target.value)}
                  className="border border-navy-200 rounded-lg text-xs px-2.5 py-1.5 bg-white outline-none max-w-[140px] truncate"
                >
                  <option value="All Courses">All Courses</option>
                  {uniqueCourses.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              )}
              <select
                value={selectedRating}
                onChange={e => setSelectedRating(e.target.value)}
                className="border border-navy-200 rounded-lg text-xs px-2.5 py-1.5 bg-white outline-none"
              >
                <option value="All Ratings">All Ratings</option>
                <option value="5 Stars">5 Stars</option>
                <option value="4 Stars">4 Stars</option>
                <option value="3 Stars">3 Stars</option>
                <option value="1-2 Stars">1-2 Stars</option>
              </select>
              <select
                value={sortBy}
                onChange={e => setSortBy(e.target.value)}
                className="border border-navy-200 rounded-lg text-xs px-2.5 py-1.5 bg-white outline-none"
              >
                <option value="Newest First">Newest First</option>
                <option value="Oldest First">Oldest First</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-slate-500 bg-white rounded-xl border border-navy-200">
              Loading reviews...
            </div>
          ) : filteredReviews.length > 0 ? (
            filteredReviews.map(review => (
              <Card key={review.id}>
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <h4 className="font-bold text-navy-900 text-sm">{review.name}</h4>
                      <p className="text-xs text-navy-500">{review.course} · {review.date}</p>
                    </div>
                    <div className="flex items-center gap-0.5 text-yellow-500">
                      {[...Array(review.rating)].map((_, i) => (
                        <Star key={i} className="w-4 h-4 fill-current" />
                      ))}
                    </div>
                  </div>
                  <p className="text-sm text-navy-700 leading-relaxed mb-4">{review.content}</p>

                  {review.response && replyingId !== review.id && (
                    <div className="bg-navy-50 p-3.5 rounded-lg border-l-4 border-l-primary-600 mb-3">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs font-bold text-navy-800">Your Response</span>
                        <div className="flex gap-2">
                          <button onClick={() => handleStartReply(review.id, review.response)} className="text-xs text-primary-600 hover:text-primary-800">
                            Edit
                          </button>
                          <button onClick={() => handleDeleteReply(review.id)} className="text-xs text-rose-600 hover:text-rose-800">
                            Delete
                          </button>
                        </div>
                      </div>
                      <p className="text-xs text-navy-600">{review.response}</p>
                    </div>
                  )}

                  {replyingId === review.id ? (
                    <div className="mt-3 space-y-2">
                      <textarea
                        value={replyText}
                        onChange={e => setReplyText(e.target.value)}
                        placeholder="Write your response to the student..."
                        rows={2}
                        className="w-full text-xs p-2.5 rounded-lg border border-navy-300 focus:outline-none focus:ring-1 focus:ring-primary-500"
                      />
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={handleCancelReply} className="h-7 text-xs">
                          Cancel
                        </Button>
                        <Button size="sm" onClick={() => handleSubmitReply(review.id)} className="h-7 text-xs">
                          <Send className="w-3 h-3 mr-1" /> Send Reply
                        </Button>
                      </div>
                    </div>
                  ) : !review.response && (
                    <Button variant="outline" size="sm" onClick={() => handleStartReply(review.id)} className="h-7 text-xs">
                      <MessageSquare className="w-3.5 h-3.5 mr-1" /> Reply to Review
                    </Button>
                  )}
                </CardContent>
              </Card>
            ))
          ) : (
            <div className="p-12 text-center bg-white rounded-xl border border-navy-200">
              <p className="text-sm text-navy-500">No reviews found matching your search criteria.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
