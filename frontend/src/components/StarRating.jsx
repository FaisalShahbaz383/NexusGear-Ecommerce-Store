import React from 'react';
import { Star } from 'lucide-react';

const StarRating = ({ rating = 0, numReviews, showText = true, size = 16, interactive = false, onRatingChange }) => {
  return (
    <div className="flex items-center space-x-1.5">
      <div className="flex items-center text-amber-400">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            type="button"
            key={star}
            disabled={!interactive}
            onClick={() => interactive && onRatingChange && onRatingChange(star)}
            className={`${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'} focus:outline-none`}
          >
            <Star
              size={size}
              className={`${
                star <= Math.round(rating)
                  ? 'fill-amber-400 text-amber-400'
                  : 'text-slate-600'
              } transition-colors`}
            />
          </button>
        ))}
      </div>
      {showText && (
        <span className="text-xs font-medium text-slate-400">
          {rating ? Number(rating).toFixed(1) : '0.0'}
          {numReviews !== undefined && ` (${numReviews})`}
        </span>
      )}
    </div>
  );
};

export default StarRating;
