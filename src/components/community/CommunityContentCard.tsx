'use client';

import React, { useState } from 'react';
import {
    Heart,
    Share2,
    User,
    Calendar,
    MoreVertical,
    Flag,
    Edit
} from 'lucide-react';
import { StarRating, RatingBreakdown } from '../ui/StarRating';
import { RatingModal } from './RatingModal';

interface CommunityContentCardProps {
    content: {
        id: string;
        title: string;
        description: string;
        content: string;
        subject: string;
        gradeLevel: number;
        tags: string[];
        rating: number;
        ratingCount: number;
        createdAt: string;
        author: {
            id?: string;
            name: string;
            school?: string;
        };
    };
    userRating?: number;
    isSaved?: boolean;
    canRate?: boolean;
    canDelete?: boolean;
    onRate?: (contentId: string, rating: number) => Promise<void>;
    onSave?: (contentId: string) => Promise<void>;
    onUnsave?: (contentId: string) => Promise<void>;
    onDelete?: (contentId: string) => Promise<void>;
    onShare?: (contentId: string) => void;
    onReport?: (contentId: string) => void;
    onAdapt?: (contentId: string) => void;
    className?: string;
}

export function CommunityContentCard({
    content,
    userRating = 0,
    isSaved = false,
    canRate = true,
    canDelete = false,
    onRate,
    onSave,
    onUnsave,
    onDelete,
    onShare,
    onReport,
    onAdapt,
    className = ''
}: CommunityContentCardProps) {
    const [showRatingModal, setShowRatingModal] = useState(false);
    const [showFullContent, setShowFullContent] = useState(false);
    const [showRatingBreakdown, setShowRatingBreakdown] = useState(false);
    const [isLoading, setIsLoading] = useState(false);

    const handleRateClick = () => {
        if (canRate && onRate) {
            setShowRatingModal(true);
        }
    };

    const handleRatingSubmit = async (rating: number) => {
        if (onRate) {
            setIsLoading(true);
            try {
                await onRate(content.id, rating);
            } finally {
                setIsLoading(false);
            }
        }
    };

    const handleSaveToggle = async () => {
        setIsLoading(true);
        try {
            if (isSaved && onUnsave) {
                await onUnsave(content.id);
            } else if (!isSaved && onSave) {
                await onSave(content.id);
            }
        } finally {
            setIsLoading(false);
        }
    };

    const truncatedContent = content.content.length > 200
        ? content.content.substring(0, 200) + '...'
        : content.content;

    // Mock rating distribution for demo
    const ratingDistribution = {
        5: Math.floor(content.ratingCount * 0.4),
        4: Math.floor(content.ratingCount * 0.3),
        3: Math.floor(content.ratingCount * 0.2),
        2: Math.floor(content.ratingCount * 0.08),
        1: Math.floor(content.ratingCount * 0.02)
    };

    return (
        <>
            <div className={`bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border ${className}`}>
                {/* Header */}
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-start justify-between">
                        <div className="flex-1">
                            <h3 className="text-lg font-semibold text-gray-900 mb-2">
                                {content.title}
                            </h3>
                            <p className="text-gray-600 text-sm mb-3">
                                {content.description}
                            </p>

                            {/* Tags */}
                            <div className="flex flex-wrap gap-2 mb-3">
                                <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded-full">
                                    {content.subject}
                                </span>
                                <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                                    Lớp {content.gradeLevel}
                                </span>
                                {Array.isArray(content.tags) && content.tags.slice(0, 3).map((tag, index) => (
                                    <span key={index} className="px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                                        {tag}
                                    </span>
                                ))}
                                {Array.isArray(content.tags) && content.tags.length > 3 && (
                                    <span className="px-2 py-1 bg-gray-100 text-gray-500 text-xs rounded-full">
                                        +{content.tags.length - 3}
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* More options */}
                        <div className="flex items-center gap-2">
                            {canDelete && (
                                <button
                                    onClick={() => onDelete?.(content.id)}
                                    className="p-2 text-red-400 hover:text-red-600 rounded-full hover:bg-red-50"
                                    title="Xóa nội dung"
                                >
                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                    </svg>
                                </button>
                            )}
                            <button className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100">
                                <MoreVertical className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    {/* Rating */}
                    <div className="flex items-center gap-4">
                        <div
                            onClick={() => setShowRatingBreakdown(!showRatingBreakdown)}
                            className="hover:bg-gray-50 rounded-lg p-1 transition-colors cursor-pointer"
                        >
                            <StarRating
                                rating={content.rating}
                                totalRatings={content.ratingCount}
                                size="md"
                                showCount={true}
                            />
                        </div>

                        {canRate && (
                            <button
                                onClick={handleRateClick}
                                className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                                disabled={isLoading}
                            >
                                {userRating > 0 ? `Bạn đã đánh giá ${userRating} sao` : 'Đánh giá'}
                            </button>
                        )}
                    </div>

                    {/* Rating breakdown */}
                    {showRatingBreakdown && (
                        <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                            <RatingBreakdown
                                ratingDistribution={ratingDistribution}
                                totalRatings={content.ratingCount}
                                averageRating={content.rating}
                            />
                        </div>
                    )}
                </div>

                {/* Content preview */}
                <div className="p-6">
                    <div className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-2">Nội dung:</h4>
                        <div className="text-gray-700 text-sm leading-relaxed">
                            {showFullContent ? content.content : truncatedContent}
                            {content.content.length > 200 && (
                                <button
                                    onClick={() => setShowFullContent(!showFullContent)}
                                    className="ml-2 text-blue-600 hover:text-blue-800 font-medium"
                                >
                                    {showFullContent ? 'Thu gọn' : 'Xem thêm'}
                                </button>
                            )}
                        </div>
                    </div>

                    {/* Author info */}
                    <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                        <User className="w-4 h-4" />
                        <span>{content.author.name}</span>
                        {content.author.school && (
                            <>
                                <span>•</span>
                                <span>{content.author.school}</span>
                            </>
                        )}
                        <span>•</span>
                        <Calendar className="w-4 h-4" />
                        <span>{new Date(content.createdAt).toLocaleDateString('vi-VN')}</span>
                    </div>

                    {/* Action buttons */}
                    <div className="flex items-center gap-3">
                        <button
                            onClick={handleSaveToggle}
                            disabled={isLoading}
                            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isSaved
                                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                                }`}
                        >
                            <Heart className={`w-4 h-4 ${isSaved ? 'fill-current' : ''}`} />
                            {isSaved ? 'Đã lưu' : 'Lưu'}
                        </button>

                        {onShare && (
                            <button
                                onClick={() => onShare(content.id)}
                                className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                            >
                                <Share2 className="w-4 h-4" />
                                Chia sẻ
                            </button>
                        )}

                        {onAdapt && (
                            <button
                                onClick={() => onAdapt(content.id)}
                                className="flex items-center gap-2 px-3 py-2 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg text-sm font-medium transition-colors"
                            >
                                <Edit className="w-4 h-4" />
                                Tùy chỉnh
                            </button>
                        )}

                        {onReport && (
                            <button
                                onClick={() => onReport(content.id)}
                                className="flex items-center gap-2 px-3 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-lg text-sm font-medium transition-colors"
                            >
                                <Flag className="w-4 h-4" />
                                Báo cáo
                            </button>
                        )}
                    </div>
                </div>
            </div>

            {/* Rating Modal */}
            <RatingModal
                isOpen={showRatingModal}
                onClose={() => setShowRatingModal(false)}
                onSubmit={handleRatingSubmit}
                contentTitle={content.title}
                currentRating={userRating}
                isLoading={isLoading}
            />
        </>
    );
}