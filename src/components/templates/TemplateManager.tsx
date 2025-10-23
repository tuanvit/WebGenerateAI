'use client';

import { useState, useEffect } from 'react';
import { PromptTemplate } from '@/services/templates/SubjectTemplateService';
import TemplateBrowser from './TemplateBrowser';

interface TemplateManagerProps {
    onSelectTemplate?: (template: PromptTemplate) => void;
    selectedTemplateId?: string;
    showCreateButton?: boolean;
}

type ViewMode = 'browse' | 'favorites' | 'recent' | 'create';

export default function TemplateManager({
    onSelectTemplate,
    selectedTemplateId,
    showCreateButton = false
}: TemplateManagerProps) {
    const [viewMode, setViewMode] = useState<ViewMode>('browse');
    const [favoriteTemplates, setFavoriteTemplates] = useState<string[]>([]);
    const [recentTemplates, setRecentTemplates] = useState<PromptTemplate[]>([]);
    const [stats, setStats] = useState({
        totalTemplates: 0,
        favoriteCount: 0,
        recentCount: 0
    });

    // Load user preferences and recent templates
    useEffect(() => {
        const loadUserData = async () => {
            try {
                // Load favorites from localStorage for now
                const savedFavorites = localStorage.getItem('template-favorites');
                if (savedFavorites) {
                    setFavoriteTemplates(JSON.parse(savedFavorites));
                }

                // Load recent templates
                const savedRecent = localStorage.getItem('recent-templates');
                if (savedRecent) {
                    setRecentTemplates(JSON.parse(savedRecent));
                }

                // Load stats
                const response = await fetch('/api/templates/stats');
                if (response.ok) {
                    const data = await response.json();
                    setStats(data);
                }
            } catch (error) {
                console.error('Error loading user data:', error);
            }
        };

        loadUserData();
    }, []);

    const handleSelectTemplate = (template: PromptTemplate) => {
        // Add to recent templates
        const updatedRecent = [
            template,
            ...recentTemplates.filter(t => t.id !== template.id)
        ].slice(0, 10);

        setRecentTemplates(updatedRecent);
        localStorage.setItem('recent-templates', JSON.stringify(updatedRecent));

        // Call parent handler
        if (onSelectTemplate) {
            onSelectTemplate(template);
        }
    };

    const toggleFavorite = (templateId: string) => {
        const updatedFavorites = favoriteTemplates.includes(templateId)
            ? favoriteTemplates.filter(id => id !== templateId)
            : [...favoriteTemplates, templateId];

        setFavoriteTemplates(updatedFavorites);
        localStorage.setItem('template-favorites', JSON.stringify(updatedFavorites));
    };

    const renderViewModeContent = () => {
        switch (viewMode) {
            case 'browse':
                return (
                    <TemplateBrowser
                        onSelectTemplate={handleSelectTemplate}
                        selectedTemplateId={selectedTemplateId}
                    />
                );

            case 'favorites':
                return (
                    <div className="space-y-4">
                        <div className="text-center py-8">
                            <div className="text-gray-400 text-6xl mb-4">⭐</div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Templates yêu thích
                            </h3>
                            <p className="text-gray-600">
                                Các template bạn đã đánh dấu yêu thích sẽ hiển thị ở đây
                            </p>
                        </div>
                    </div>
                );

            case 'recent':
                return (
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">
                            Templates đã sử dụng gần đây
                        </h3>

                        {recentTemplates.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {recentTemplates.map((template) => (
                                    <div
                                        key={template.id}
                                        className="bg-white rounded-lg border border-gray-200 p-4 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex items-start justify-between mb-2">
                                            <h4 className="font-medium text-gray-900">
                                                {template.name}
                                            </h4>
                                            <button
                                                onClick={() => toggleFavorite(template.id)}
                                                className={`text-lg ${favoriteTemplates.includes(template.id)
                                                        ? 'text-yellow-500'
                                                        : 'text-gray-300 hover:text-yellow-500'
                                                    }`}
                                            >
                                                ⭐
                                            </button>
                                        </div>

                                        <div className="flex items-center space-x-2 text-sm text-gray-600 mb-3">
                                            <span className="bg-blue-100 text-blue-800 px-2 py-1 rounded">
                                                {template.subject}
                                            </span>
                                            <span className="bg-green-100 text-green-800 px-2 py-1 rounded">
                                                {template.outputType}
                                            </span>
                                        </div>

                                        <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                                            {template.description}
                                        </p>

                                        <button
                                            onClick={() => handleSelectTemplate(template)}
                                            className="w-full px-3 py-2 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            Sử dụng lại
                                        </button>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-8">
                                <div className="text-gray-400 text-6xl mb-4">🕒</div>
                                <h3 className="text-lg font-medium text-gray-900 mb-2">
                                    Chưa có template nào
                                </h3>
                                <p className="text-gray-600">
                                    Các template bạn sử dụng sẽ hiển thị ở đây
                                </p>
                            </div>
                        )}
                    </div>
                );

            case 'create':
                return (
                    <div className="space-y-4">
                        <div className="text-center py-8">
                            <div className="text-gray-400 text-6xl mb-4">🛠️</div>
                            <h3 className="text-lg font-medium text-gray-900 mb-2">
                                Tạo template mới
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Tính năng này sẽ được phát triển trong phiên bản tiếp theo
                            </p>
                            <button
                                onClick={() => setViewMode('browse')}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Quay lại duyệt templates
                            </button>
                        </div>
                    </div>
                );

            default:
                return null;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">
                        Quản lý Templates
                    </h2>
                    <p className="text-gray-600 mt-1">
                        Duyệt và sử dụng các template có sẵn cho việc tạo prompt
                    </p>
                </div>

                {showCreateButton && (
                    <button
                        onClick={() => setViewMode('create')}
                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                        + Tạo template mới
                    </button>
                )}
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center">
                        <div className="text-2xl text-blue-600 mr-3">📝</div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">
                                {stats.totalTemplates}
                            </div>
                            <div className="text-sm text-gray-600">
                                Tổng templates
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center">
                        <div className="text-2xl text-yellow-600 mr-3">⭐</div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">
                                {favoriteTemplates.length}
                            </div>
                            <div className="text-sm text-gray-600">
                                Yêu thích
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg border border-gray-200 p-4">
                    <div className="flex items-center">
                        <div className="text-2xl text-green-600 mr-3">🕒</div>
                        <div>
                            <div className="text-2xl font-bold text-gray-900">
                                {recentTemplates.length}
                            </div>
                            <div className="text-sm text-gray-600">
                                Đã sử dụng
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Navigation Tabs */}
            <div className="border-b border-gray-200">
                <nav className="-mb-px flex space-x-8">
                    {[
                        { key: 'browse', label: 'Duyệt templates', icon: '🔍' },
                        { key: 'recent', label: 'Gần đây', icon: '🕒' },
                        { key: 'favorites', label: 'Yêu thích', icon: '⭐' },
                        ...(showCreateButton ? [{ key: 'create', label: 'Tạo mới', icon: '➕' }] : [])
                    ].map((tab) => (
                        <button
                            key={tab.key}
                            onClick={() => setViewMode(tab.key as ViewMode)}
                            className={`flex items-center py-2 px-1 border-b-2 font-medium text-sm ${viewMode === tab.key
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                }`}
                        >
                            <span className="mr-2">{tab.icon}</span>
                            {tab.label}
                        </button>
                    ))}
                </nav>
            </div>

            {/* Content */}
            <div className="min-h-[400px]">
                {renderViewModeContent()}
            </div>
        </div>
    );
}