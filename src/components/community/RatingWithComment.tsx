'use client';

import React, { useState } from 'react';

interface RatingWithCommentProps {
    contentId: string;
    currentRating?: number;
    currentComment?: string;
    onSubmit: (rating: number, comment?: string) => Promise<void>;
    onCancel: () => void;
}

export function RatingWithComment({
    contentId,
    currentRating = 0,
    currentComment = '',
    onSubmit,
    onCancel
}: RatingWithCommentProps) {
    const [rating, setRating] = useState(currentRating);
    const [comment, setComment] = useState(currentComment);
    const [hoveredRating, setHoveredRating] = useState(0);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (rating === 0) {
            alert('Vui lòng chọn số sao đánh giá');
            return;
        }

        setIsSubmitting(true);
        try {
            await onSubmit(rating, comment.trim() || undefined);
        } catch (error) {
            console.error('Error submitting rating:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg max-w-md w-full p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    {currentRating > 0 ? 'Cập nhật đánh giá' : 'Đánh giá nội dung'}
                </h3>

                <form onSubmit={handleSubmit}>
                    {/* Star Rating */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Đánh giá của bạn
                        </label>
                        <div className="flex items-center gap-1">
                            {[1, 2, 3, 4, 5].map((star) => (
                                <button
                                    key={star}
                                    type="button"
                                    onClick={() => setRating(star)}
                                    onMouseEnter={() => setHoveredRating(star)}
                                    onMouseLeave={() => setHoveredRating(0)}
                                    className={`text-2xl transition-colors ${star <= (hoveredRating || rating)
                                            ? 'text-yellow-400'
                                            : 'text-gray-300'
                                        } hover:text-yellow-400`}
                                >
                                    ⭐
                                </button>
                            ))}
                            <span className="ml-2 text-sm text-gray-600">
                                {rating > 0 ? `${rating} sao` : 'Chưa đánh giá'}
                            </span>
                        </div>
                    </div>

                    {/* Comment */}
                    <div className="mb-6">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Nhận xét (tùy chọn)
                        </label>
                        <textarea
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Chia sẻ ý kiến của bạn về nội dung này..."
                            rows={4}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            maxLength={500}
                        />
                        <div className="text-xs text-gray-500 mt-1">
                            {comment.length}/500 ký tự
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex justify-end gap-3">
                        <button
                            type="button"
                            onClick={onCancel}
                            className="px-4 py-2 text-gray-700 bg-gray-200 rounded-lg hover:bg-gray-300 transition-colors"
                            disabled={isSubmitting}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                            disabled={isSubmitting || rating === 0}
                        >
                            {isSubmitting ? 'Đang gửi...' : (currentRating > 0 ? 'Cập nhật' : 'Gửi đánh giá')}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}