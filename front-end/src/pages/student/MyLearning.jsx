import { dateLabel } from '../../utils/adminDisplay';
import { AdminDataState } from '../../components/admin/AdminUI';
import React, { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Play,
  Search,
  Award,
  BookOpen,
  ArrowRight,
  Star,
  X,
  Send,
  MessageSquare,
} from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import { LinearProgressBar } from '../../components/common/ProgressBar';
import { useStudent } from '../../context/StudentContext';
import { useToast } from '../../components/common/Toast';
import api from '../../services/api';

const TABS = [
  { id: 'active', label: 'Active' },
  { id: 'completed', label: 'Completed' },
];

export default function MyLearning() {
  const { student, enrollments, isLoading, refreshData, error } = useStudent();
  const { addToast } = useToast();
  const [tab, setTab] = useState('active');
  const [query, setQuery] = useState('');

  // Review modal state
  const [reviewCourse, setReviewCourse] = useState(null);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    document.title = 'My Learning | Acadex';
    refreshData();
  }, [refreshData]);

  const groups = useMemo(
    () => ({
      active: enrollments.filter(
        (e) =>
          e.status === 'Active' &&
          e.contentAvailable !== false &&
          e.courseStatus !== 'Archived'
      ),
      completed: enrollments.filter(
        (e) =>
          e.status === 'Completed' &&
          e.contentAvailable !== false &&
          e.courseStatus !== 'Archived'
      ),
    }),
    [enrollments],
  );

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return groups[tab]
      .filter(
        (e) =>
          !q ||
          [e.courseTitle, e.category, e.instructorName].some((v) =>
            v?.toLowerCase().includes(q)
          )
      )
      .sort((a, b) =>
        String(b.lastAccessedAt || b.enrolledAt || '').localeCompare(
          String(a.lastAccessedAt || a.enrolledAt || '')
        )
      );
  }, [groups, tab, query]);

  return (
    <PageLayout>
      {error && (
        <div className="learner-page">
          <AdminDataState
            error={error.message || String(error)}
            refresh={refreshData}
          />
        </div>
      )}
      <div className="max-w-[1100px] mx-auto px-4 md:px-8 py-8 space-y-6">
        <header>
          <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
            My learning
          </h1>
        </header>

        <div className="flex border-b border-slate-200 gap-6">
          {TABS.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`pb-3 text-sm font-semibold flex items-center gap-2 border-b-2 -mb-px ${
                tab === t.id
                  ? 'border-[#0056D2] text-[#0056D2]'
                  : 'border-transparent text-slate-500 hover:text-slate-800'
              }`}
            >
              {t.label}
              <span className="px-2 py-0.5 rounded-full text-xs bg-slate-100 text-slate-600">
                {groups[t.id].length}
              </span>
            </button>
          ))}
        </div>

        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search my courses"
            className="w-full h-10 pl-9 pr-3 bg-white border border-slate-200 rounded-lg text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#0056D2]"
          />
        </div>

        {isLoading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#0056D2] border-t-transparent" />
          </div>
        ) : list.length === 0 ? (
          <div className="py-16 text-center bg-white rounded-xl border border-slate-200">
            <BookOpen className="w-10 h-10 text-slate-300 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-800">
              {query
                ? 'No courses match your search'
                : tab === 'completed'
                  ? 'No completed courses yet'
                  : 'No active courses'}
            </p>
            {!query && (
              <Link
                to="/student/explore"
                className="mt-4 inline-flex items-center gap-2 px-5 py-2 rounded-lg bg-[#0056D2] text-white text-xs font-bold"
              >
                Browse courses <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            )}
          </div>
        ) : (
          <div className="space-y-4">
            {list.map((e) => {
              const done = e.status === 'Completed';
              return (
                <div
                  key={e.id}
                  className="bg-white rounded-xl border border-slate-200 overflow-hidden flex flex-col md:flex-row"
                >
                  <div className="md:w-60 h-36 md:h-auto bg-slate-100 shrink-0">
                    {e.thumbnail && (
                      <img
                        src={e.thumbnail}
                        alt={e.courseTitle}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col justify-between gap-3">
                    <div>
                      <p className="text-xs font-semibold text-[#0056D2]">
                        {[e.category, e.instructorName, e.institution]
                          .filter(Boolean)
                          .join(' • ')}
                      </p>
                      <h2 className="text-base font-semibold text-slate-900">
                        {e.courseTitle || 'Course not recorded'}
                      </h2>
                      <p className="text-xs text-slate-500 mt-1">
                        Enrolled {e.enrolledDate}
                        {done && e.completedAt
                          ? ` • Completed ${dateLabel(e.completedAt)}`
                          : ''}
                      </p>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs text-slate-600 mb-1.5">
                        <span>
                          {e.completionTracked
                            ? `${(e.completedLessons || []).length} of ${e.totalLessons} lessons`
                            : `${e.totalLessons} published lessons`}
                        </span>
                        <span className="font-bold">{e.progress || 0}%</span>
                      </div>
                      <LinearProgressBar
                        progress={e.progress || 0}
                        color={done ? 'bg-emerald-600' : 'bg-[#0056D2]'}
                      />
                    </div>
                  </div>
                  <div className="p-5 md:w-48 flex md:flex-col items-center justify-center gap-2 border-t md:border-t-0 md:border-l border-slate-100">
                    <Link
                      to={`/student/learn/${e.courseId}`}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-[#0056D2] text-white text-xs font-bold hover:bg-[#00419E]"
                    >
                      <Play className="w-3.5 h-3.5 fill-current" />
                      {done
                        ? 'Replay'
                        : e.progress === 0
                          ? 'Start'
                          : 'Continue'}
                    </Link>
                    {e.paymentId && (
                      <Link
                        className="admin-button w-full justify-center"
                        to={`/student/billing/${e.paymentId}`}
                      >
                        View payment
                      </Link>
                    )}
                    <button
                      type="button"
                      onClick={() => {
                        setReviewCourse(e);
                        setReviewRating(5);
                        setReviewComment('');
                      }}
                      className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />{' '}
                      Write Review
                    </button>
                    {done && e.certificateId && (
                      <Link
                        to="/student/certificates"
                        className="w-full inline-flex items-center justify-center gap-1.5 py-2 rounded-lg bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700"
                      >
                        <Award className="w-3.5 h-3.5" /> Certificate
                      </Link>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Write Review Modal */}
      {reviewCourse && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="bg-white rounded-3xl p-6 sm:p-7 max-w-lg w-full space-y-5 shadow-2xl border border-slate-100">
            <div className="flex justify-between items-center border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-black text-slate-900 tracking-tight">
                  Write Course Review
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {reviewCourse.courseTitle}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setReviewCourse(null)}
                className="w-8 h-8 rounded-full hover:bg-slate-100 text-slate-400 hover:text-slate-600 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form
              onSubmit={async (ev) => {
                ev.preventDefault();
                if (!student?.id)
                  return addToast(
                    'Your profile is still loading. Please retry.',
                    'warning'
                  );
                if (!reviewComment.trim())
                  return addToast(
                    'Please enter your review feedback',
                    'warning'
                  );
                setSubmittingReview(true);
                try {
                  await api.courses.addReview(
                    reviewCourse.courseId,
                    reviewRating,
                    reviewComment.trim(),
                    student.name,
                    student.id,
                  );
                  addToast(
                    'Your review was published successfully!',
                    'success',
                  );
                  addToast(
                    'Your review was published successfully!',
                    'success'
                  );
                  setReviewCourse(null);
                  setReviewComment('');
                } catch (err) {
                  addToast(err.message || 'Could not submit review', 'error');
                } finally {
                  setSubmittingReview(false);
                }
              }}
              className="space-y-4"
            >
              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Rating
                </label>
                <div className="bg-slate-50/80 border border-slate-200 rounded-xl p-3 flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => setReviewRating(star)}
                        className="p-1 hover:scale-115 transition-transform focus:outline-none"
                      >
                        <Star
                          className={`w-6 h-6 ${
                            reviewRating >= star
                              ? 'fill-amber-400 text-amber-400 filter drop-shadow-[0_1px_2px_rgba(251,191,36,0.3)]'
                              : 'text-slate-200 fill-slate-50'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                  <span className="text-xs font-bold text-slate-600">
                    {reviewRating} of 5 Stars
                  </span>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-700 block mb-1.5">
                  Your Feedback
                </label>
                <textarea
                  value={reviewComment}
                  onChange={(ev) => setReviewComment(ev.target.value)}
                  rows={4}
                  maxLength={1000}
                  placeholder="Share details on curriculum quality, clarity, coding assignments, and instructor responsiveness..."
                  className="w-full text-xs sm:text-sm p-3 bg-slate-50/50 hover:bg-slate-50 focus:bg-white border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#0056D2]/20 focus:border-[#0056D2] resize-none transition-all"
                  required
                />
                <div className="flex justify-between items-center text-[11px] text-slate-400 mt-1">
                  <span>
                    Reviews help other learners and guide instructors.
                  </span>
                  <span>{reviewComment.length}/1000</span>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                <Link
                  to="/student/reviews"
                  onClick={() => setReviewCourse(null)}
                  className="text-xs font-bold text-[#0056D2] hover:underline"
                >
                  Manage all reviews →
                </Link>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setReviewCourse(null)}
                    className="px-4 py-2 border border-slate-200 text-xs font-bold text-slate-600 hover:bg-slate-50 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submittingReview}
                    className="inline-flex items-center gap-1.5 px-5 py-2 bg-[#0056D2] hover:bg-[#00419E] text-white text-xs font-extrabold rounded-xl disabled:opacity-50 transition-all shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />{' '}
                    {submittingReview ? 'Submitting...' : 'Post Review'}
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}
    </PageLayout>
  );
}
