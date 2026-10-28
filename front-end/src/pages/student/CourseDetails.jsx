import { formatDuration } from '../../utils/duration';
import { dateLabel } from '../../utils/adminDisplay';
import { ratingLabel, coursePriceLabel } from '../../utils/adminDisplay';
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useParams, Link, useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronRight,
  Clock,
  Award,
  ChevronDown,
  ChevronUp,
  PlayCircle,
  Star,
  Users,
  ArrowRight,
  Pencil,
  Trash2,
  Send,
  Layers,
  BookOpen,
} from 'lucide-react';
import PageLayout from '../../components/layout/PageLayout';
import { useToast } from '../../components/common/Toast';
import api from '../../services/api';
import HumanAvatar from '../../components/common/HumanAvatar';
import { useStudent } from '../../context/StudentContext';

function Stars({ value, size = 'w-3 h-3', onPick }) {
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((s) => {
        const icon = (
          <Star
            className={`${size} ${s <= value ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`}
          />
        );
        return onPick ? (
          <button
            key={s}
            type="button"
            onClick={() => onPick(s)}
            aria-label={`${s} star`}
          >
            {icon}
          </button>
        ) : (
          <span key={s}>{icon}</span>
        );
      })}
    </div>
  );
}

export default function CourseDetails() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToast } = useToast();
  const { student, enrollments, refreshData } = useStudent();

  const [loadError, setLoadError] = useState('');
  const [revision, setRevision] = useState(0);
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState([]);
  const [reviews, setReviews] = useState([]);
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [editingReviewId, setEditingReviewId] = useState(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [busy, setBusy] = useState(false);

  const location = useLocation();

  useEffect(() => {
    if (location.hash !== '#reviews' || loading || !course) return;
    setShowReviewForm(true);
    const timer = window.setTimeout(() => {
      document
        .getElementById('reviews')
        ?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 50);
    return () => window.clearTimeout(timer);
  }, [location.hash, loading, course]);

  useEffect(() => {
    if (typeof refreshData === 'function') refreshData();
  }, [refreshData]);

  const enrollment = useMemo(
    () =>
      enrollments.find(
        (e) =>
          e.courseId === id ||
          e.id === id ||
          e.courseId === course?.id ||
          e.id === course?.id,
      ),
    [enrollments, id, course],
  );
  const isEnrolled = Boolean(enrollment);
  const myReviews = student
    ? reviews.filter((r) => r.learnerId === student.id)
    : [];
  const otherReviews = student
    ? reviews.filter((r) => r.learnerId !== student.id)
    : reviews;

  const loadCourse = useCallback(
    () =>
      api.student
        .getCatalogCourse(id)
        .then(setCourse)
        .catch((e) => {
          setCourse(null);
          setLoadError(e.message);
          throw e;
        }),
    [id],
  );
  const loadReviews = useCallback(
    () =>
      api.courses
        .getReviews(id)
        .then((r) => setReviews(Array.isArray(r) ? r : [])),
    [id],
  );

  useEffect(() => {
    setLoading(true);
    setLoadError('');
    Promise.allSettled([loadCourse(), loadReviews()]).finally(() =>
      setLoading(false),
    );
  }, [loadCourse, loadReviews, revision]);

  useEffect(() => {
    if (course) document.title = `${course.title} | Acadex`;
  }, [course]);

  const handleEnroll = async () => {
    if (isEnrolled) {
      navigate(`/student/learn/${course?.id || id}`);
      return;
    }
    if (Number(course?.price) > 0) {
      navigate(`/student/checkout?courseId=${course?.id || id}`);
      return;
    }
    setBusy(true);
    try {
      await api.student.enrollFree(course?.id || id);
      await refreshData();
      addToast('Enrolled successfully', 'success');
      navigate(`/student/learn/${course?.id || id}`);
    } catch (err) {
      if (err.message?.toLowerCase().includes('already enrolled')) {
        navigate(`/student/learn/${course?.id || id}`);
        return;
      }
      addToast(err.message || 'Could not enroll', 'error');
    } finally {
      setBusy(false);
    }
  };

  const afterReviewChange = async () => {
    await Promise.allSettled([loadReviews(), loadCourse()]);
  };

  const submitReview = async () => {
    if (!rating) return addToast('Select a star rating', 'warning');
    if (!comment.trim()) return addToast('Write a short comment', 'warning');
    setBusy(true);
    try {
      if (editingReviewId) {
        await api.courses.updateReview(editingReviewId, rating, comment.trim());
        addToast('Review updated', 'success');
      } else {
        await api.courses.addReview(
          id,
          rating,
          comment.trim(),
          student?.name,
          student?.id,
        );
        addToast('Review submitted', 'success');
      }
      await afterReviewChange();
      setEditingReviewId(null);
      setShowReviewForm(false);
      setRating(5);
      setComment('');
    } catch (err) {
      addToast(err.message || 'Could not save review', 'error');
    } finally {
      setBusy(false);
    }
  };

  const deleteReview = async (reviewId) => {
    if (!reviewId || !window.confirm('Delete this review?')) return;
    setBusy(true);
    try {
      await api.courses.deleteReview(reviewId);
      await afterReviewChange();
      addToast('Review deleted', 'info');
    } catch (err) {
      addToast(err.message || 'Could not delete review', 'error');
    } finally {
      setBusy(false);
    }
  };

  if (loading) {
    return (
      <PageLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-[#0056D2] border-t-transparent" />
        </div>
      </PageLayout>
    );
  }

  if (!course) {
    return (
      <PageLayout>
        <div className="max-w-xl mx-auto py-20 text-center">
          <h2 className="text-xl font-bold text-slate-800">
            Course not available
          </h2>
          <p className="text-xs text-slate-500 mt-2 mb-4">
            {loadError ||
              'This course does not exist or is not open for enrollment.'}
          </p>
          <button
            className="admin-button mr-3"
            onClick={() => setRevision((v) => v + 1)}
          >
            Try again
          </button>
          <Link
            to="/student/explore"
            className="px-4 py-2 bg-[#0056D2] text-white text-xs font-bold rounded-lg"
          >
            Browse courses
          </Link>
        </div>
      </PageLayout>
    );
  }

  const modules = Array.isArray(course.modules) ? course.modules : [];
  const lessonCount = course.lessonsCount;
  const instructors = course.instructors || [];

  return (
    <PageLayout>
      <div className="max-w-[1200px] mx-auto px-4 md:px-8 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        <div className="lg:col-span-8 space-y-8">
          <nav className="flex items-center gap-2 text-xs text-slate-500 font-medium">
            <Link
              to="/student/explore"
              className="hover:text-[#0056D2]"
            >
              Catalog
            </Link>
            <ChevronRight className="w-3.5 h-3.5" />
            <span className="text-slate-900 font-semibold truncate">
              {course.title}
            </span>
          </nav>

          <header className="space-y-3">
            <div className="flex items-center gap-2 text-xs">
              {course.level && (
                <span className="px-2.5 py-0.5 bg-blue-50 text-[#0056D2] font-bold rounded">
                  {course.level}
                </span>
              )}
              {course.category && (
                <span className="font-semibold text-slate-500">
                  {course.category}
                </span>
              )}
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-slate-900 tracking-tight">
              {course.title}
            </h1>
            {course.description && (
              <p className="text-sm text-slate-600 leading-relaxed">
                {course.description}
              </p>
            )}
            <div className="flex items-center gap-4 flex-wrap text-xs text-slate-600">
              <span className="flex items-center gap-1.5">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                {course.reviewsCount > 0 ? (
                  <>
                    <b className="text-slate-900">
                      {ratingLabel(course.rating)}
                    </b>{' '}
                    ({course.reviewsCount} review
                    {course.reviewsCount === 1 ? '' : 's'})
                  </>
                ) : (
                  'No ratings yet'
                )}
              </span>
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-slate-400" />{' '}
                {course.enrolledCount || 0} enrolled
              </span>
              {course.totalHours && (
                <span className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-slate-400" />{' '}
                  {course.totalHours}
                </span>
              )}
              {course.organizationName && (
                <span className="font-semibold">{course.organizationName}</span>
              )}
            </div>
          </header>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-slate-900">Instructors</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {instructors.map((ins) => (
                <div
                  key={ins.id || ins.name}
                  className="flex items-center gap-3 bg-white border border-slate-200 rounded-xl p-3"
                >
                  <HumanAvatar
                    name={ins.name}
                    size="md"
                  />
                  <div className="min-w-0">
                    <p className="text-sm font-bold text-slate-900 truncate">
                      {ins.name}
                    </p>
                    <p className="text-[11px] text-slate-500 truncate">
                      {[ins.role, ins.specialization]
                        .filter(Boolean)
                        .join(' • ')}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-slate-900">Syllabus</h2>
              <span className="text-xs text-slate-500">
                {modules.length} modules • {lessonCount} lessons
              </span>
            </div>
            {modules.length === 0 ? (
              <p className="text-xs text-slate-500 bg-white border border-slate-200 rounded-xl p-4">
                The instructor has not published the syllabus yet.
              </p>
            ) : (
              <div className="space-y-2">
                {modules.map((mod, idx) => {
                  const open = expanded.includes(mod.id);
                  const lessons = Array.isArray(mod.lessons) ? mod.lessons : [];
                  const count = mod.lessonsCount;
                  return (
                    <div
                      key={mod.id}
                      className="bg-white border border-slate-200 rounded-xl overflow-hidden"
                    >
                      <button
                        onClick={() =>
                          setExpanded((p) =>
                            open
                              ? p.filter((x) => x !== mod.id)
                              : [...p, mod.id],
                          )
                        }
                        className="w-full p-4 flex items-center justify-between text-left text-sm font-semibold text-slate-900 hover:bg-slate-50"
                      >
                        <span className="flex items-center gap-2.5">
                          <PlayCircle className="w-4 h-4 text-[#0056D2]" />
                          Module {idx + 1}: {mod.title}
                        </span>
                        <span className="flex items-center gap-3 text-xs text-slate-500 font-normal">
                          {count} lessons
                          {mod.duration
                            ? ` • ${formatDuration(mod.duration)}`
                            : ''}
                          {open ? (
                            <ChevronUp className="w-4 h-4" />
                          ) : (
                            <ChevronDown className="w-4 h-4" />
                          )}
                        </span>
                      </button>
                      {open && (
                        <ul className="px-4 pb-3 border-t border-slate-100 text-xs text-slate-600 divide-y divide-slate-100">
                          {lessons.map((lesson, i) => (
                            <li
                              key={lesson.id || i}
                              className="py-2 flex items-center gap-2"
                            >
                              <span className="w-1.5 h-1.5 rounded-full bg-[#0056D2]" />{' '}
                              {lesson.title || 'Untitled lesson'}
                              {lesson.duration
                                ? ` · ${formatDuration(lesson.duration)}`
                                : ''}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          <section
            id="reviews"
            className="space-y-4"
          >
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <h2 className="text-base font-bold text-slate-900">
                Reviews & Comments{' '}
                {reviews.length > 0 && (
                  <span className="text-xs font-normal text-slate-500">
                    ({reviews.length})
                  </span>
                )}
              </h2>
              {enrollment && (
                <button
                  onClick={() => {
                    setEditingReviewId(null);
                    setRating(5);
                    setComment('');
                    setShowReviewForm((prev) => !prev);
                  }}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-[#0056D2] hover:bg-[#00419E] text-white text-xs font-bold rounded-lg transition-colors w-fit"
                >
                  <Star className="w-3.5 h-3.5 fill-current" />
                  {showReviewForm && !editingReviewId
                    ? 'Close Form'
                    : 'Write Review / Comment'}
                </button>
              )}
            </div>

            {showReviewForm && (
              <div className="bg-white border-2 border-blue-100 rounded-xl p-5 space-y-3 shadow-xs">
                <div className="flex items-center justify-between">
                  <p className="text-sm font-bold text-slate-900">
                    {editingReviewId
                      ? 'Edit your review'
                      : 'Write a review or comment'}
                  </p>
                  <button
                    onClick={() => {
                      setShowReviewForm(false);
                      setEditingReviewId(null);
                      setComment('');
                      setRating(5);
                    }}
                    className="text-xs text-slate-400 hover:text-slate-600"
                  >
                    Cancel
                  </button>
                </div>
                <div className="space-y-1">
                  <span className="text-xs font-semibold text-slate-600">
                    Your Rating
                  </span>
                  <Stars
                    value={rating}
                    size="w-6 h-6"
                    onPick={setRating}
                  />
                </div>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  rows={3}
                  maxLength={1000}
                  placeholder="Share your thoughts, feedback, questions, or comments about this course..."
                  className="w-full text-sm px-3.5 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:border-[#0056D2] resize-none"
                />
                <div className="flex gap-2">
                  <button
                    onClick={submitReview}
                    disabled={busy}
                    className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#0056D2] text-white text-xs font-bold rounded-lg hover:bg-[#00419E] disabled:opacity-50 transition-colors"
                  >
                    <Send className="w-3.5 h-3.5" />{' '}
                    {editingReviewId ? 'Save changes' : 'Submit review'}
                  </button>
                  <button
                    onClick={() => {
                      setShowReviewForm(false);
                      setEditingReviewId(null);
                      setComment('');
                      setRating(5);
                    }}
                    className="px-4 py-2 border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-50 rounded-lg"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            )}

            {!enrollment && (
              <p className="text-xs text-slate-500">
                Enroll in this course to leave a review.
              </p>
            )}

            {/* Current user's reviews list with edit & delete on each */}
            {myReviews.length > 0 && (
              <div className="space-y-3">
                <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                  Your Reviews & Comments ({myReviews.length})
                </p>
                {myReviews.map((r) => (
                  <div
                    key={r.id}
                    className="bg-blue-50/60 border border-blue-200 rounded-xl p-4 space-y-2"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <HumanAvatar
                          name={r.learnerName || student?.name || 'You'}
                          size="sm"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-slate-900">
                              {r.learnerName || 'You'}
                            </span>
                            <span className="text-[10px] font-semibold bg-blue-100 text-[#0056D2] px-1.5 py-0.5 rounded">
                              You
                            </span>
                          </div>
                          <div className="flex items-center gap-2 mt-0.5">
                            <Stars value={r.rating} />
                            {r.createdAt && (
                              <span className="text-[11px] text-slate-400">
                                {dateLabel(r.createdAt)}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-1">
                        <button
                          onClick={() => {
                            setEditingReviewId(r.id);
                            setRating(r.rating || 5);
                            setComment(r.comment || '');
                            setShowReviewForm(true);
                          }}
                          className="p-1.5 rounded-lg hover:bg-white text-slate-600 transition-colors"
                          title="Edit review"
                        >
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => deleteReview(r.id)}
                          disabled={busy}
                          className="p-1.5 rounded-lg hover:bg-white text-rose-500 transition-colors"
                          title="Delete review"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                    {r.comment && (
                      <p className="text-xs text-slate-700 leading-relaxed">
                        {r.comment}
                      </p>
                    )}
                    {r.response && (
                      <div className="ml-4 pl-3 border-l-2 border-[#0056D2]/30 mt-2">
                        <p className="text-[11px] font-bold text-[#0056D2]">
                          Instructor response
                        </p>
                        <p className="text-xs text-slate-600">{r.response}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Other reviews list */}
            {otherReviews.length > 0 && (
              <div className="space-y-3">
                {myReviews.length > 0 && (
                  <p className="text-xs font-bold text-slate-600 uppercase tracking-wider">
                    Other Reviews
                  </p>
                )}
                {otherReviews.map((r) => (
                  <div
                    key={r.id}
                    className="bg-white border border-slate-200 rounded-xl p-4 space-y-2"
                  >
                    <div className="flex items-center gap-2">
                      <HumanAvatar
                        name={r.learnerName || 'Learner'}
                        size="sm"
                      />
                      <div>
                        <p className="text-xs font-bold text-slate-900">
                          {r.learnerName || 'Learner'}
                        </p>
                        <div className="flex items-center gap-2">
                          <Stars value={r.rating} />
                          {r.createdAt && (
                            <span className="text-[11px] text-slate-400">
                              {dateLabel(r.createdAt)}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {r.comment && (
                      <p className="text-xs text-slate-700">{r.comment}</p>
                    )}
                    {r.response && (
                      <div className="ml-4 pl-3 border-l-2 border-[#0056D2]/30">
                        <p className="text-[11px] font-bold text-[#0056D2]">
                          Instructor response
                        </p>
                        <p className="text-xs text-slate-600">{r.response}</p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}

            {reviews.length === 0 && (
              <p className="text-xs text-slate-500 bg-white border border-slate-200 rounded-xl p-4">
                No reviews yet. Be the first to share your feedback!
              </p>
            )}
          </section>
        </div>

        <aside className="lg:col-span-4">
          <div className="sticky top-24 bg-white rounded-xl border border-slate-200 overflow-hidden">
            <div className="aspect-video bg-slate-100">
              {course.thumbnail && (
                <img
                  src={course.thumbnail}
                  alt={course.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>
            <div className="p-5 space-y-4">
              <p className="text-2xl font-extrabold text-slate-900">
                {coursePriceLabel(course)}
              </p>

              {isEnrolled ? (
                <Link
                  to={`/student/learn/${course.id || id}`}
                  className="w-full bg-[#0056D2] hover:bg-[#00419E] text-white text-sm font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                >
                  Go to Course
                  <ArrowRight className="w-4 h-4" />
                </Link>
              ) : (
                <button
                  onClick={handleEnroll}
                  disabled={busy}
                  className="w-full bg-[#0056D2] hover:bg-[#00419E] text-white text-sm font-bold py-3 rounded-lg flex items-center justify-center gap-2 disabled:opacity-50 transition-colors"
                >
                  {Number(course.price) > 0 ? 'Enroll now' : 'Enroll for free'}
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              <ul className="space-y-2.5 text-xs text-slate-600 pt-2 border-t border-slate-100">
                <li className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-slate-400" /> {modules.length}{' '}
                  modules
                </li>
                <li className="flex items-center gap-2">
                  <BookOpen className="w-4 h-4 text-slate-400" /> {lessonCount}{' '}
                  lessons
                </li>
                {course.totalHours && (
                  <li className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-slate-400" />{' '}
                    {course.totalHours} of content
                  </li>
                )}
                <li className="flex items-center gap-2">
                  <Award className="w-4 h-4 text-slate-400" /> Certificate of
                  completion
                </li>
              </ul>
            </div>
          </div>
        </aside>
      </div>
    </PageLayout>
  );
}
