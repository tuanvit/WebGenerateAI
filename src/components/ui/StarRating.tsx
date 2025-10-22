'use client';

import React, { useState } from 'react';
import { Star, StarHalf } from 'lucide-react';

interface StarRatingProps {
    rating: number;
    totalRatings?: number;
    size?: 'sm' | 'md' | 'lg';
    interactive?: boolean;
    onRatingChange?: (rating: number) => void;
    showCount?: boolean;
    className?: string;
}

export function StarRating({
    rating,
    totalRatings = 0,
    size = 'md',
    interactive = false,
    onRatingChange,
    showCount = true,
    className = ''
}: StarRatingProps) {
    const [hoverRating, setHoverRating] = useState(0);
    const [isHovering, setIsHovering] = useState(false);

    const displayRating = isHovering ? hoverRating : rating;

    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-5 h-5',
        lg: 'w-6 h-6'
    };

    const textSizeClasses = {
        sm: 'text-sm',
        md: 'text-base',
        lg: 'text-lg'
    };

    const handleStarClick = (starRating: number) => {
        if (interactive && onRatingChange) {
            onRatingChange(starRating);
        }
    };

    const handleStarHover = (starRating: number) => {
        if (interactive) {
            setHoverRating(starRating);
            setIsHovering(true);
        }
    };

    const handleMouseLeave = () => {
        if (interactive) {
            setIsHovering(false);
            setHoverRating(0);
        }
    };

    const renderStar = (index: number) => {
        const starValue = index + 1;
        const filled = displayRating >= starValue;
        const halfFilled = displayRating >= starValue - 0.5 && displayRating < starValue;

        return (
            <button
                key={index}
                type="button"
                className={`
          ${sizeClasses[size]} 
          ${interactive ? 'cursor-pointer hover:scale-110 transition-transform' : 'cursor-default'}
          ${filled || halfFilled ? 'text-yellow-400' : 'text-gray-300'}
          focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-1 rounded
        `}
                onClick={() => handleStarClick(starValue)}
                onMouseEnter={() => handleStarHover(starValue)}
                disabled={!interactive}
                aria-label={`${starValue} sao`}
            >
                {halfFilled ? (
                    <StarHalf className="fill-current" />
                ) : (
                    <Star className={filled ? 'fill-current' : ''} />
                )}
            </button>
        );
    };

    return (
        <div
            className={`flex items-center gap-2 ${className}`}
            onMouseLeave={handleMouseLeave}
        >
            <div className="flex items-center gap-1" role="img" aria-label={`Đánh giá ${rating.toFixed(1)} trên 5 sao`}>
                {[0, 1, 2, 3, 4].map(renderStar)}
            </div>

            {showCount && (
                <div className={`${textSizeClasses[size]} text-gray-600 flex items-center gap-1`}>
                    <span className="font-medium">{rating.toFixed(1)}</span>
                    {totalRatings > 0 && (
                        <span className="text-gray-500">
                            ({totalRatings.toLocaleString('vi-VN')} đánh giá)
                        </span>
                    )}
                </div>
            )}

            {interactive && isHovering && (
                <span className={`${textSizeClasses[size]} text-blue-600 font-medium`}>
                    {hoverRating} sao
                </span>
            )}
        </div>
    );
}

// Component riêng cho việc hiển thị đánh giá chi tiết
interface RatingBreakdownProps {
    ratingDistribution: Record<number, number>;
    totalRatings: number;
    averageRating: number;
}

export function RatingBreakdown({
    ratingDistribution,
    totalRatings,
    averageRating
}: RatingBreakdownProps) {
    if (totalRatings === 0) {
        return (
            <div className="text-center py-4 text-gray-500">
                Chưa có đánh giá nào
            </div>
        );
    }

    return (
        <div className="space-y-3">
            {/* Tổng quan */}
            <div className="flex items-center gap-4">
                <div className="text-3xl font-bold text-gray-900">
                    {averageRating.toFixed(1)}
                </div>
                <div>
                    <StarRating
                        rating={averageRating}
                        totalRatings={totalRatings}
                        size="lg"
                        showCount={false}
                    />
                    <div className="text-sm text-gray-600 mt-1">
                        {totalRatings.toLocaleString('vi-VN')} đánh giá
                    </div>
                </div>
            </div>

            {/* Phân bố đánh giá */}
            <div className="space-y-2">
                {[5, 4, 3, 2, 1].map((stars) => {
                    const count = ratingDistribution[stars] || 0;
                    const percentage = totalRatings > 0 ? (count / totalRatings) * 100 : 0;

                    return (
                        <div key={stars} className="flex items-center gap-2 text-sm">
                            <span className="w-6 text-right">{stars}</span>
                            <Star className="w-4 h-4 text-yellow-400 fill-current" />
                            <div className="flex-1 bg-gray-200 rounded-full h-2">
                                <div
                                    className="bg-yellow-400 h-2 rounded-full transition-all duration-300"
                                    style={{ width: `${percentage}%` }}
                                />
                            </div>
                            <span className="w-12 text-right text-gray-600">
                                {count}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}