import { dateLabel } from '../../utils/adminDisplay';
import SearchableSelect from '../../components/common/SearchableSelect';
import { AdminHeader } from '../../components/admin/AdminUI';
import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Star,
  MessageSquare,
  Award,
  Pencil,
  Trash2,
  ExternalLink,
  Plus,
  Search,
  ChevronDown,
  X,
  Send,
  CheckCircle2,
  BookOpen,
  Calendar,
  Sparkles,
  Filter,
  Check,
  AlertCircle,
} from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import { useStudent } from '../../context/StudentContext';
import { useToast } from '../../components/common/Toast';
import api from '../../services/api';

function StarRating({ value, size = 'w-4 h-4', onPick, interactive = false }) {
  const [hoverRating, setHoverRating] = useState(0);

  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => {
        const isFilled = (hoverRating || value) >= star;
        return (
          <button
            key={star}
            type="button"
            disabled={!interactive}
            onClick={() => onPick && onPick(star)}
            onMouseEnter={() => interactive && setHoverRating(star)}
            onMouseLeave={() => interactive && setHoverRating(0)}
            className={`transition-all ${
              interactive
                ? 'cursor-pointer hover:scale-115 active:scale-95 focus:outline-none'
                : 'cursor-default'
            }`}
          >
            <Star
              className={`${size} ${
                isFilled
                  ? 'fill-amber-400 text-amber-400 filter drop-shadow-[0_1px_2px_rgba(251,191,36,0.3)]'
                  : 'text-slate-200 fill-slate-50'
              }`}
            />
          </button>
        );
      })}
    </div>
  );
}

const RATING_LABELS = {
  1: '1 - Poor',
  2: '2 - Needs improvement',
  3: '3 - Average',
  4: '4 - Very good',
  5: '5 - Excellent',
};

export default function StudentReviews() {
  const { student, enrollments } = useStudent();
  const { addToast } = useToast();

  const [loadError, setLoadError] = useState('');
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [search, setSearch] = useState('');
  const [starFilter, setStarFilter] = useState('all');
  const [tabFilter, setTabFilter] = useState('all'); // 'all' | 'replied' | 'unreplied'

  // Modals & form state
  const [editingReview, setEditingReview] = useState(null);
  const [editRating, setEditRating] = useState(5);
  const [editComment, setEditComment] = useState('');
  const [savingEdit, setSavingEdit] = useState(false);

  const [showNewModal, setShowNewModal] = useState(false);
  const [selectedCourseId, setSelectedCourseId] = useState('');
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [submittingNew, setSubmittingNew] = useState(false);

  const loadReviews = useCallback(
    async (isRefresh = false) => {
      setLoadError('');
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      try {
        const res = await api.student.getMyReviews();
        const list = Array.isArray(res) ? res : res?.data || res?.items || [];
        setReviews(list);
      } catch (err) {
        setReviews([]);
        setLoadError(err.message || 'Unable to load your reviews');
        addToast(err.message || 'Unable to load your reviews', 'error');
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [student?.name],
  );

  useEffect(() => {
    document.title = 'My Reviews & Ratings | Acadex';
    loadReviews();
  }, [loadReviews]);

  // Statistics
  const totalReviews = reviews.length;
  const avgRating =
    totalReviews > 0
      ? (
          reviews.reduce((sum, r) => sum + Number(r.rating || 0), 0) /
          totalReviews
        ).toFixed(1)
      : '0.0';
  const responsesReceived = reviews.filter((r) => Boolean(r.response)).length;
  const fiveStarReviews = reviews.filter((r) => Number(r.rating) === 5).length;

  // Filtered list
  const filtered = useMemo(() => {
    return reviews.filter((r) => {
      const q = search.trim().toLowerCase();
      const matchQuery =
        !q ||
        (r.courseTitle || '').toLowerCase().includes(q) ||
        (r.comment || '').toLowerCase().includes(q);
      const matchStar =
        starFilter === 'all' || Number(r.rating) === Number(starFilter);
      const matchTab =
        tabFilter === 'all' ||
        (tabFilter === 'replied' && Boolean(r.response)) ||
        (tabFilter === 'unreplied' && !r.response);

      return matchQuery && matchStar && matchTab;
    });
  }, [reviews, search, starFilter, tabFilter]);

  // Handlers
  const openEditModal = (r) => {
    setEditingReview(r);
    setEditRating(Number(r.rating) || 5);
    setEditComment(r.comment || '');
  };

  const handleUpdateReview = async (e) => {
    e.preventDefault();
    if (!editComment.trim())
      return addToast('Please enter your review feedback', 'warning');
    setSavingEdit(true);
    try {
      await api.courses.updateReview(
        editingReview.id,
        editRating,
        editComment.trim(),
      );
      addToast('Review updated successfully', 'success');
      setEditingReview(null);
      await loadReviews(true);
    } catch (err) {
      addToast(err.message || 'Failed to update review', 'error');
    } finally {
      setSavingEdit(false);
    }
  };

  const handleDeleteReview = async (reviewId) => {
    if (
      !window.confirm(
        'Are you sure you want to delete this review? This action cannot be undone.',
      )
    )
      return;
    try {
      await api.courses.deleteReview(reviewId);
      addToast('Review deleted successfully', 'info');
      await loadReviews(true);
    } catch (err) {
      addToast(err.message || 'Failed to delete review', 'error');
    }
  };

  const handleCreateReview = async (e) => {
    e.preventDefault();
    if (!student?.id)
      return addToast(
        'Your profile is still loading. Please retry.',
        'warning',
      );
    if (!selectedCourseId)
      return addToast('Please select a course to review', 'warning');
    if (!newComment.trim())
      return addToast('Please enter your review comment', 'warning');
    setSubmittingNew(true);
    try {
      await api.courses.addReview(
        selectedCourseId,
        newRating,
        newComment.trim(),
        student.name,
        student.id,
      );
      addToast('Your review was published successfully!', 'success');
      setShowNewModal(false);
      setSelectedCourseId('');
      setNewComment('');
      setNewRating(5);
      await loadReviews(true);
    } catch (err) {
      addToast(err.message || 'Could not submit review', 'error');
    } finally {
      setSubmittingNew(false);
    }
  };

  const coursesToReview = enrollments || [];

  return (
    <PageLayout>
      {loadError && (
        <div className="learner-page">
          <p
            role="alert"
            className="workspace-error"
          >
            {loadError}
          </p>
          <button
            className="admin-button mt-3"
            onClick={() => loadReviews(true)}
          >
            Try again
          </button>
        </div>
      )}
      <div className="learner-page admin-page learner-reviews">
        <AdminHeader title="Reviews">
          <button
            type="button"
            className="admin-button admin-button-primary"
            disabled={!coursesToReview.length}
            onClick={() => {
              if (coursesToReview.length && !selectedCourseId)
                setSelectedCourseId(coursesToReview[0].courseId);
              setShowNewModal(true);
            }}
          >
            <Plus size={15} />
            Write a review
          </button>
        </AdminHeader>

        {/* Metric Overview Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Reviews Written
              </span>
              <div className="w-9 h-9 rounded-xl bg-blue-50 text-[#0056D2] border border-blue-100 flex items-center justify-center">
                <Star className="w-4 h-4 fill-current" />
              </div>
            </div>
            <p className="text-3xl font-semibold text-slate-900 mt-3">
              {totalReviews}
            </p>
            <p className="text-xs text-slate-500 mt-1 flex items-center gap-1">
              <span className="font-semibold text-blue-600">
                {fiveStarReviews}
              </span>{' '}
              perfect 5-star ratings
            </p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Average Score
              </span>
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 border border-amber-100 flex items-center justify-center">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div className="flex items-baseline gap-2 mt-3">
              <p className="text-3xl font-semibold text-slate-900">
                {avgRating}
              </p>
              <span className="text-xs font-semibold text-slate-400">
                / 5.0
              </span>
            </div>
            <div className="mt-1 flex items-center gap-1.5">
              <StarRating
                value={Math.round(Number(avgRating) || 0)}
                size="w-3.5 h-3.5"
              />
              <span className="text-[11px] text-slate-400 font-medium">
                composite
              </span>
            </div>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs hover:border-slate-300 transition-all">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">
                Faculty Replies
              </span>
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center">
                <MessageSquare className="w-4 h-4" />
              </div>
            </div>
            <p className="text-3xl font-semibold text-slate-900 mt-3">
              {responsesReceived}
            </p>
            <p className="text-xs text-emerald-600 font-semibold mt-1 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              {totalReviews > 0
                ? `${Math.round((responsesReceived / totalReviews) * 100)}% responded`
                : 'Active dialogue'}
            </p>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-2xs space-y-3">
          <div className="flex flex-col md:flex-row gap-3">
            {/* Search Input */}
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search reviews by course title or feedback text..."
                className="w-full h-11 pl-10 pr-9 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0056D2]/20 focus:border-[#0056D2] transition-all"
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Star Rating Select Filter */}
            <div className="relative min-w-[170px]">
              <select
                value={starFilter}
                onChange={(e) => setStarFilter(e.target.value)}
                className="w-full h-11 bg-slate-50/70 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl px-3.5 pr-9 text-xs sm:text-sm font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#0056D2]/20 focus:border-[#0056D2] appearance-none cursor-pointer transition-all"
              >
                <option value="all">All Star Ratings</option>
                <option value="5">5 Stars (Exceptional)</option>
                <option value="4">4 Stars (Very Good)</option>
                <option value="3">3 Stars (Satisfactory)</option>
                <option value="2">2 Stars (Needs Work)</option>
                <option value="1">1 Star (Poor)</option>
              </select>
              <ChevronDown className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            </div>
          </div>

          {/* Quick Filter Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider mr-1">
                Filter:
              </span>
              <button
                onClick={() => setTabFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  tabFilter === 'all'
                    ? 'bg-[#0056D2] text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                All ({reviews.length})
              </button>
              <button
                onClick={() => setTabFilter('replied')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  tabFilter === 'replied'
                    ? 'bg-emerald-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                With Faculty Reply ({responsesReceived})
              </button>
              <button
                onClick={() => setTabFilter('unreplied')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                  tabFilter === 'unreplied'
                    ? 'bg-amber-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                Awaiting Reply ({totalReviews - responsesReceived})
              </button>
            </div>

            {(search || starFilter !== 'all' || tabFilter !== 'all') && (
              <button
                onClick={() => {
                  setSearch('');
                  setStarFilter('all');
                  setTabFilter('all');
                }}
                className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
              >
                Reset Filters
              </button>
            )}
          </div>
        </div>

        {/* Reviews List Feed */}
        {loading ? (
          <div className="bg-white border border-slate-200 rounded-2xl p-16 flex flex-col items-center justify-center space-y-4 shadow-2xs">
            <div className="relative">
              <div className="animate-spin rounded-full h-12 w-12 border-4 border-[#0056D2]/20 border-t-[#0056D2]" />
              <Star className="w-5 h-5 text-[#0056D2] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 fill-current" />
            </div>
            <p className="text-sm font-semibold text-slate-700">
              Loading your course evaluations...
            </p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="bg-white border border-slate-200 rounded-3xl p-12 text-center space-y-4 shadow-2xs">
            <div className="w-14 h-14 rounded-2xl bg-blue-50 text-[#0056D2] border border-blue-100 flex items-center justify-center mx-auto">
              <MessageSquare className="w-7 h-7" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-slate-900">
                {search || starFilter !== 'all' || tabFilter !== 'all'
                  ? 'No reviews match your selected filters'
                  : 'No course evaluations submitted yet'}
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto mt-1.5 leading-relaxed">
                {search || starFilter !== 'all' || tabFilter !== 'all'
                  ? 'Try clearing your search terms or choosing a different rating filter.'
                  : 'Share actionable insights on lesson clarity, coding exercises, and faculty guidance. Instructors review and respond to student feedback directly.'}
              </p>
            </div>

            <div className="pt-2">
              {search || starFilter !== 'all' || tabFilter !== 'all' ? (
                <button
                  onClick={() => {
                    setSearch('');
                    setStarFilter('all');
                    setTabFilter('all');
                  }}
                  className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors"
                >
                  Clear All Filters
                </button>
              ) : (
                <button
                  onClick={() => {
                    if (coursesToReview.length > 0)
                      setSelectedCourseId(coursesToReview[0].courseId);
                    setShowNewModal(true);
                  }}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-[#0056D2] hover:bg-[#00419E] text-white text-xs font-semibold rounded-xl transition-all shadow-md shadow-blue-500/15"
                >
                  <Plus className="w-4 h-4" /> Write Your First Review
                </button>
              )}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {filtered.map((r) => (
              <div
                key={r.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-6 space-y-4 shadow-2xs hover:border-slate-300 hover:shadow-sm transition-all"
              >
                {/* Header Row: Course Title & Action Buttons */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 border-b border-slate-100 pb-4">
                  <div className="flex items-start gap-3.5">
                    <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#0056D2] border border-blue-100 flex items-center justify-center shrink-0 mt-0.5">
                      <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                      <Link
                        to={`/student/course/${r.courseId}`}
                        className="text-base font-semibold text-slate-900 hover:text-[#0056D2] flex items-center gap-1.5 transition-colors group"
                      >
                        <span>{r.courseTitle || 'Course not recorded'}</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#0056D2] transition-colors" />
                      </Link>

                      <div className="flex flex-wrap items-center gap-3 mt-1.5">
                        <StarRating value={Number(r.rating) || 0} />
                        <span className="text-xs font-semibold text-slate-700">
                          {r.rating === undefined
                            ? 'Not rated'
                            : Number(r.rating).toFixed(1)}{' '}
                          / 5.0
                        </span>
                        <span className="text-xs text-slate-300">•</span>
                        <span className="text-xs text-slate-500 flex items-center gap-1 font-medium">
                          <Calendar className="w-3.5 h-3.5 text-slate-400" />
                          {r.createdAt ? dateLabel(r.createdAt) : 'Recent'}
                        </span>
                        {r.updatedAt && r.updatedAt !== r.createdAt && (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-slate-100 text-slate-600">
                            Edited
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Edit / Delete Buttons */}
                  <div className="flex items-center gap-2 self-end sm:self-start">
                    <button
                      onClick={() => openEditModal(r)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900 text-xs font-semibold transition-all"
                      title="Edit this review"
                    >
                      <Pencil className="w-3.5 h-3.5 text-slate-500" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteReview(r.id)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-rose-200 text-rose-600 hover:bg-rose-50 text-xs font-semibold transition-all"
                      title="Delete this review"
                    >
                      <Trash2 className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>

                {/* Comment Body */}
                <div className="pl-1">
                  <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line font-normal">
                    {r.comment}
                  </p>
                </div>

                {/* Instructor Response Block */}
                {r.response ? (
                  <div className="bg-slate-50 border-l-4 border-[#0056D2] rounded-r-2xl p-4 mt-3 space-y-1.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wide bg-blue-100/70 text-[#0056D2]">
                          <CheckCircle2 className="w-3 h-3 text-[#0056D2]" />{' '}
                          Instructor Response
                        </span>
                        <span className="text-xs font-semibold text-slate-700">
                          Verified Educator
                        </span>
                      </div>
                      {r.repliedAt && (
                        <span className="text-[11px] text-slate-400 font-medium">
                          {dateLabel(r.repliedAt)}
                        </span>
                      )}
                    </div>
                    <p className="text-xs sm:text-sm text-slate-700 leading-relaxed font-normal pt-1">
                      {r.response}
                    </p>
                  </div>
                ) : (
                  <div className="pt-1 flex items-center gap-2 text-xs text-slate-400">
                    <div className="w-2 h-2 rounded-full bg-amber-400" />
                    <span>Awaiting instructor review and response</span>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Edit Review Modal */}
      {editingReview && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-5 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 tracking-tight">
                  Edit Course Review
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Update your evaluation for instructors and students.
                </p>
              </div>
              <button
                onClick={() => setEditingReview(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-3.5">
              <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block">
                Course
              </span>
              <p className="text-sm font-semibold text-slate-900 mt-0.5">
                {editingReview.courseTitle || 'Enrolled Course'}
              </p>
            </div>

            <form
              onSubmit={handleUpdateReview}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Rating:{' '}
                  <span className="text-[#0056D2] font-semibold">
                    {RATING_LABELS[editRating] || `${editRating} Stars`}
                  </span>
                </label>
                <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                  <StarRating
                    value={editRating}
                    size="w-7 h-7"
                    onPick={setEditRating}
                    interactive
                  />
                  <span className="text-xs font-semibold text-slate-500">
                    {editRating} of 5
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Your Feedback & Comment
                </label>
                <textarea
                  value={editComment}
                  onChange={(e) => setEditComment(e.target.value)}
                  rows={4}
                  maxLength={1000}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0056D2]/20 focus:border-[#0056D2] resize-none transition-all"
                  placeholder="Share details regarding pacing, lesson clarity, coding labs, and concepts learned..."
                  required
                />
                <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
                  <span>
                    Constructive reviews help instructors refine modules.
                  </span>
                  <span>{editComment.length}/1000</span>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setEditingReview(null)}
                  className="px-4 py-2.5 border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={savingEdit}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-[#0056D2] hover:bg-[#00419E] text-white text-xs font-semibold rounded-xl disabled:opacity-50 transition-all shadow-sm"
                >
                  <Send className="w-3.5 h-3.5" />{' '}
                  {savingEdit ? 'Saving Updates...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Write a New Review Modal */}
      {showNewModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-5 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-semibold text-slate-900 tracking-tight">
                  Write a Course Review
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Submit an evaluation and rating for your enrolled coursework.
                </p>
              </div>
              <button
                onClick={() => setShowNewModal(false)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={handleCreateReview}
              className="space-y-4"
            >
              <div>
                <SearchableSelect
                  label="Course"
                  value={selectedCourseId}
                  onChange={setSelectedCourseId}
                  required
                  options={coursesToReview.map((c) => ({
                    value: c.courseId,
                    label: c.courseTitle,
                  }))}
                  placeholder="Choose an enrolled course"
                  searchPlaceholder="Search your enrolled courses…"
                />
                {!coursesToReview.length && (
                  <p className="admin-muted mt-2">
                    Enroll in a course before writing a review.
                  </p>
                )}
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Rating:{' '}
                  <span className="text-[#0056D2] font-semibold">
                    {RATING_LABELS[newRating]}
                  </span>
                </label>
                <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                  <StarRating
                    value={newRating}
                    size="w-7 h-7"
                    onPick={setNewRating}
                    interactive
                  />
                  <span className="text-xs font-semibold text-slate-500">
                    {newRating} of 5
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                  Your Feedback & Comment
                </label>
                <textarea
                  value={newComment}
                  onChange={(e) => setNewComment(e.target.value)}
                  rows={4}
                  maxLength={1000}
                  className="w-full text-xs sm:text-sm px-3.5 py-2.5 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0056D2]/20 focus:border-[#0056D2] resize-none transition-all"
                  placeholder="Share details on curriculum quality, instructors, assignments, and test labs (you can review multiple times)..."
                  required
                />
                <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
                  <span>
                    You can post additional reviews or updates at any time.
                  </span>
                  <span>{newComment.length}/1000</span>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowNewModal(false)}
                  className="px-4 py-2.5 border border-slate-200 text-xs font-semibold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingNew || coursesToReview.length === 0}
                  className="inline-flex items-center gap-1.5 px-6 py-2.5 bg-gradient-to-r from-[#0056D2] to-[#00419E] hover:from-[#004bb8] hover:to-[#003480] text-white text-xs font-semibold rounded-xl disabled:opacity-50 transition-all shadow-md shadow-blue-500/15"
                >
                  <Send className="w-3.5 h-3.5" />{' '}
                  {submittingNew ? 'Submitting...' : 'Post Evaluation'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
