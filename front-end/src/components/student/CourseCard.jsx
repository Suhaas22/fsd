import React from 'react';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Star,
  Users,
  ArrowUpRight,
  CheckCircle2,
} from 'lucide-react';
import { ratingLabel, coursePriceLabel } from '../../utils/adminDisplay';
export default function CourseCard({ course: c }) {
  return (
    <article className="learner-course-card">
      <Link
        className="learner-course-cover"
        to={c.isEnrolled ? `/student/learn/${c.id}` : `/student/course/${c.id}`}
        tabIndex={-1}
        aria-hidden="true"
      >
        <BookOpen size={38} />
        {c.thumbnail && (
          <img
            src={c.thumbnail}
            alt=""
            loading="lazy"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
        )}
        {c.isEnrolled && (
          <span>
            <CheckCircle2 size={12} />
            Enrolled
          </span>
        )}
      </Link>
      <div className="learner-course-card-body">
        <p className="learner-kicker">
          {[c.category, c.level].filter(Boolean).join(' · ')}
        </p>
        <h2>
          <Link
            to={
              c.isEnrolled
                ? `/student/learn/${c.id}`
                : `/student/course/${c.id}`
            }
          >
            {c.title}
          </Link>
        </h2>
        <p className="learner-course-institute">
          {c.organizationName || 'Institute not recorded'}
        </p>
        <p className="learner-course-instructor">
          {c.instructorName || 'Instructor not recorded'}
        </p>
        <div className="learner-course-facts">
          <span className="learner-course-rating">
            <Star size={13} />
            {ratingLabel(c.rating)}
            {c.reviewsCount > 0 && <small>({c.reviewsCount})</small>}
          </span>
          <span>
            <Users size={13} />
            {c.enrolledCount} learners
          </span>
        </div>
        <div className="learner-course-card-footer">
          <div>
            <strong>{coursePriceLabel(c)}</strong>
            <small>
              {c.lessonsCount} lessons · {c.modules.length} modules
            </small>
          </div>
          <Link
            className="admin-button"
            to={
              c.isEnrolled
                ? `/student/learn/${c.id}`
                : `/student/course/${c.id}`
            }
          >
            {c.isEnrolled ? 'Continue' : 'View course'}
            <ArrowUpRight size={14} />
          </Link>
        </div>
      </div>
    </article>
  );
}
