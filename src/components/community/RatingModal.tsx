'use client';

import React, { useState } from 'react';
import { X, Star } from 'lucide-react';
import { StarRating } from '../ui/StarRating';

interface RatingModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (rating: number, comment?: string) => Promise<void>;
    contentTitle: string;
    currentRating?: number;
    isLoading?: boolean;
}

export function RatingModal({
    isOpen,
    onClose,
    onSubmit,
    contentTitle,
    currentRating = 0,
    isLoading = false
}: RatingModalProps) {
    const [rating, setRating] = useState(currentRating);
    const [comment, setComment] = useState('');
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
            onClose();
            setComment('');
        } catch (error) {
            console.error('Error submitting rating:', error);
            alert('Có lỗi xảy ra khi gửi đánh giá. Vui lòng thử lại.');
        } finally {
            setIsSubmitting(false);
        }
    };

    const ratingLabels = {
        1: 'Rất tệ',
        2: 'Tệ',
        3: 'Trung bình',
        4: 'Tốt',
        5: 'Xuất sắc'
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="flex items-center justify-between p-6 border-b">
                    <h2 className="text-xl font-semibold text-gray-900">
                        Đánh giá nội dung
                    </h2>
                    <button
                        onClick={onClose}
                        className="text-gray-400 hover:text-gray-600 transition-colors"
                        disabled={isSubmitting}
                    >
                        <X className="w-6 h-6" />
                    </button>
                </div>

                {/* Content */}
                <form onSubmit={handleSubmit} className="p-6 space-y-6">
                    {/* Content title */}
                    <div>
                        <h3 className="font-medium text-gray-900 mb-2">Nội dung:</h3>
                        <p className="text-gray-600 bg-gray-50 p-3 rounded-lg">
                            {contentTitle}
                        </p>
                    </div>

                    {/* Rating selection */}
                    <div>
                        <label className="block font-medium text-gray-900 mb-3">
                            Đánh giá của bạn: <span className="text-red-500">*</span>
                        </label>

                        <div className="flex flex-col items-center space-y-3">
                            <StarRating
                                rating={rating}
                                size="lg"
                                interactive={true}
                                onRatingChange={setRating}
                                showCount={false}
                                className="justify-center"
                            />

                            {rating > 0 && (
                                <div className="text-center">
                                    <div className="text-lg font-medium text-gray-900">
                                        {rating} sao
                                    </div>
                                    <div className="text-sm text-gray-600">
                                        {ratingLabels[rating as keyof typeof ratingLabels]}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Optional comment */}
                    <div>
                        <label htmlFor="comment" className="block font-medium text-gray-900 mb-2">
                            Nhận xét (tùy chọn):
                        </label>
                        <textarea
                            id="comment"
                            value={comment}
                            onChange={(e) => setComment(e.target.value)}
                            placeholder="Chia sẻ ý kiến của bạn về nội dung này..."
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
                            rows={4}
                            maxLength={500}
                            disabled={isSubmitting}
                        />
                        <div className="text-right text-sm text-gray-500 mt-1">
                            {comment.length}/500 ký tự
                        </div>
                    </div>

                    {/* Action buttons */}
                    <div className="flex gap-3 pt-4">
                        <button
                            type="button"
                            onClick={onClose}
                            className="flex-1 px-4 py-2 text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                            disabled={isSubmitting}
                        >
                            Hủy
                        </button>
                        <button
                            type="submit"
                            className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                            disabled={isSubmitting || rating === 0}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                                    Đang gửi...
                                </div>
                            ) : (
                                currentRating > 0 ? 'Cập nhật đánh giá' : 'Gửi đánh giá'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}