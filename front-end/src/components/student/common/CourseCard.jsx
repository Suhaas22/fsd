import React from 'react';
import { Link } from 'react-router-dom';
import { Clock, BarChart, Bookmark, PlayCircle, ArrowRight } from 'lucide-react';
import RatingStars from './RatingStars';
import Badge from './Badge';
import { LinearProgressBar } from './ProgressBar';

export default function CourseCard({ 
  course, 
  variant = "explore", // "explore" | "dashboard" | "in-progress" | "horizontal"
  onBookmarkToggle,
  isBookmarked = false
}) {
  if (!course) return null;

  if (variant === "in-progress") {
    return (
      <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/70 shadow-ambient hover:shadow-elevation-2 transition-all p-5 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-3 mb-3">
            <span className="text-xs font-semibold text-primary uppercase tracking-wider">
              {course.institution}
            </span>
            <span className="text-xs font-medium text-outline">
              {course.currentModule || "In Progress"}
            </span>
          </div>

          <Link to={`/course/${course.id || 'course-details'}`} className="group">
            <h3 className="font-title-lg text-base font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-2 mb-2">
              {course.title}
            </h3>
          </Link>
          <p className="text-xs text-on-surface-variant line-clamp-2 mb-4">
            {course.subtitle || course.description}
          </p>
        </div>

        <div>
          <div className="mb-4">
            <LinearProgressBar 
              progress={course.progress || 45} 
              showLabel={true}
              color={course.progress >= 70 ? "bg-secondary" : "bg-primary"}
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-outline-variant/60">
            <Link
              to="/player"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-container shadow-sm transition-all"
            >
              <PlayCircle className="w-4 h-4" />
              <span>Resume</span>
            </Link>
            <Link
              to="/course-progress"
              className="text-xs font-semibold text-primary hover:underline flex items-center gap-1"
            >
              <span>View Progress</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface-container-lowest rounded-2xl border border-outline-variant/70 shadow-ambient hover:shadow-elevation-2 hover:-translate-y-0.5 transition-all overflow-hidden flex flex-col group">
      {/* Thumbnail */}
      <div className="relative h-44 w-full overflow-hidden bg-surface-container">
        <img
          src={course.thumbnail}
          alt={course.title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        {course.badge && (
          <div className="absolute top-3 left-3">
            <Badge variant={course.badge === 'Specialization' ? 'secondary' : 'primary'} size="sm">
              {course.badge}
            </Badge>
          </div>
        )}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            onBookmarkToggle && onBookmarkToggle(course.id);
          }}
          className={`absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center transition-all ${
            isBookmarked ? 'bg-primary text-white' : 'bg-black/40 text-white hover:bg-black/60'
          }`}
          aria-label="Bookmark Course"
        >
          <Bookmark className="w-4 h-4 fill-current" />
        </button>
      </div>

      {/* Content */}
      <div className="p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Institution & Level */}
          <div className="flex items-center justify-between text-xs text-outline mb-1.5 font-medium">
            <span>{course.institution}</span>
            <span className="capitalize">{course.level}</span>
          </div>

          {/* Title */}
          <Link to={`/course/${course.id || 'course-details'}`}>
            <h3 className="font-title-lg text-base font-bold text-on-surface group-hover:text-primary transition-colors line-clamp-2 mb-2 leading-snug">
              {course.title}
            </h3>
          </Link>

          {/* Rating */}
          <div className="mb-3">
            <RatingStars rating={course.rating} reviewsCount={course.reviewsCount} />
          </div>

          {/* Meta Info */}
          <div className="flex items-center gap-3 text-xs text-on-surface-variant mb-4">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-outline" />
              {course.duration}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1">
              <BarChart className="w-3.5 h-3.5 text-outline" />
              {course.level}
            </span>
          </div>

          {/* Skills Tags */}
          {course.skills && (
            <div className="flex flex-wrap gap-1.5 mb-4">
              {course.skills.slice(0, 3).map((skill, idx) => (
                <span
                  key={idx}
                  className="px-2 py-0.5 rounded-md bg-surface-container text-[11px] font-medium text-on-surface-variant"
                >
                  {skill}
                </span>
              ))}
              {course.skills.length > 3 && (
                <span className="px-1.5 py-0.5 rounded-md bg-surface-container text-[11px] text-outline">
                  +{course.skills.length - 3}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Footer & Price */}
        <div className="pt-3 border-t border-outline-variant/60 flex items-center justify-between">
          <div className="flex items-baseline gap-1.5">
            <span className="text-base font-bold text-on-surface">
              ${course.price}
            </span>
            {course.originalPrice && (
              <span className="text-xs text-outline line-through">
                ${course.originalPrice}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <Link
              to={`/course/${course.id || 'course-details'}`}
              className="px-3 py-1.5 rounded-xl bg-surface-container hover:bg-surface-container-high text-on-surface text-xs font-semibold transition-colors"
            >
              Details
            </Link>
            <Link
              to="/checkout"
              className="px-3 py-1.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary-container shadow-sm transition-all"
            >
              Enroll
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
