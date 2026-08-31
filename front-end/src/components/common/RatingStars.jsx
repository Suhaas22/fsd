import React from 'react';
import { Star } from 'lucide-react';

export default function RatingStars({ rating = 4.8, size = "sm", reviewsCount, showText = true }) {
  const iconSize = size === "lg" ? "w-5 h-5" : size === "md" ? "w-4 h-4" : "w-3.5 h-3.5";

  return (
    <div className="flex items-center gap-1.5">
      <div className="flex items-center text-[#F5C518]">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            className={`${iconSize} ${
              star <= Math.round(rating)
                ? 'fill-[#F5C518] text-[#F5C518]'
                : 'text-outline-variant'
            }`}
          />
        ))}
      </div>
      {showText && (
        <span className="text-xs font-bold text-on-surface flex items-center gap-1">
          {rating.toFixed(1)}
          {reviewsCount && (
            <span className="text-outline font-normal">
              ({typeof reviewsCount === 'number' && reviewsCount > 1000 ? `${(reviewsCount / 1000).toFixed(1)}k` : reviewsCount})
            </span>
          )}
        </span>
      )}
    </div>
  );
}
