/**
 * Admin Caching System
 * Implements server-side caching with Next.js unstable_cache
 * Provides cache invalidation strategies for data updates
 */

import { unstable_cache, revalidateTag } from 'next/cache';
import { AIToolsService } from './services/ai-tools-service';
import { TemplatesService } from './services/templates-service';
import { AdminDashboardService } from './services/admin-dashboard-service';
import { AIToolData, AIToolSearchFilters } from './repositories/ai-tools-repository';
import { TemplateData, TemplateFilters } from './repositories/templates-repository';
import { AdminDashboardStats } from './index';

// Cache tags for different data types
export const CACHE_TAGS = {
    AI_TOOLS: 'ai-tools',
    AI_TOOLS_STATS: 'ai-tools-stats',
    TEMPLATES: 'templates',
    TEMPLATES_STATS: 'templates-stats',
    DASHBOARD: 'dashboard',
    DASHBOARD_STATS: 'dashboard-stats',
    SYSTEM_HEALTH: 'system-health',
    USER_STATS: 'user-stats',
    CONTENT_STATS: 'content-stats'
} as const;

// Cache durations (in seconds)
export const CACHE_DURATIONS = {
    SHORT: 60,      // 1 minute - for frequently changing data
    MEDIUM: 300,    // 5 minutes - for moderately changing data
    LONG: 900,      // 15 minutes - for rarely changing data
    VERY_LONG: 3600 // 1 hour - for very stable data
} as const;

// Service instances
const aiToolsService = new AIToolsService();
const templatesService = new TemplatesService();
const dashboardService = new AdminDashboardService();

/**
 * Cached AI Tools operations
 */
export const getCachedAITools = unstable_cache(
    async (filters: AIToolSearchFilters = {}) => {
        return await aiToolsService.getAITools(filters);
    },
    ['admin-ai-tools'],
    {
        revalidate: CACHE_DURATIONS.MEDIUM,
        tags: [CACHE_TAGS.AI_TOOLS]
    }
);

export const getCachedAIToolById = unstable_cache(
    async (id: string) => {
        return await aiToolsService.getAIToolById(id);
    },
    ['admin-ai-tool-by-id'],
    {
        revalidate: CACHE_DURATIONS.LONG,
        tags: [CACHE_TAGS.AI_TOOLS]
    }
);

export const getCachedAIToolsStatistics = unstable_cache(
    async () => {
        return await aiToolsService.getAIToolsStatistics();
    },
    ['admin-ai-tools-stats'],
    {
        revalidate: CACHE_DURATIONS.LONG,
        tags: [CACHE_TAGS.AI_TOOLS_STATS]
    }
);

export const getCachedRecommendedToolsForCurriculum = unstable_cache(
    async (subject?: string, gradeLevel?: number) => {
        return await aiToolsService.getRecommendedToolsForCurriculum(subject, gradeLevel);
    },
    ['admin-recommended-tools'],
    {
        revalidate: CACHE_DURATIONS.VERY_LONG,
        tags: [CACHE_TAGS.AI_TOOLS]
    }
);

/**
 * Cached Templates operations
 */
export const getCachedTemplates = unstable_cache(
    async (filters: TemplateFilters = {}) => {
        return await templatesService.getTemplates(filters);
    },
    ['admin-templates'],
    {
        revalidate: CACHE_DURATIONS.MEDIUM,
        tags: [CACHE_TAGS.TEMPLATES]
    }
);

export const getCachedTemplateById = unstable_cache(
    async (id: string) => {
        return await templatesService.getTemplateById(id);
    },
    ['admin-template-by-id'],
    {
        revalidate: CACHE_DURATIONS.LONG,
        tags: [CACHE_TAGS.TEMPLATES]
    }
);

export const getCachedTemplatesStatistics = unstable_cache(
    async () => {
        return await templatesService.getTemplatesStatistics();
    },
    ['admin-templates-stats'],
    {
        revalidate: CACHE_DURATIONS.LONG,
        tags: [CACHE_TAGS.TEMPLATES_STATS]
    }
);

export const getCachedTemplatesBySubjectAndGrade = unstable_cache(
    async (subject: string, gradeLevel: number) => {
        return await templatesService.getTemplatesBySubjectAndGrade(subject, gradeLevel);
    },
    ['admin-templates-by-subject-grade'],
    {
        revalidate: CACHE_DURATIONS.VERY_LONG,
        tags: [CACHE_TAGS.TEMPLATES]
    }
);

/**
 * Cached Dashboard operations
 */
export const getCachedDashboardStats = unstable_cache(
    async () => {
        return await dashboardService.getDashboardStats();
    },
    ['admin-dashboard-stats'],
    {
        revalidate: CACHE_DURATIONS.MEDIUM,
        tags: [CACHE_TAGS.DASHBOARD_STATS]
    }
);

export const getCachedSystemHealth = unstable_cache(
    async () => {
        return await dashboardService.getSystemHealth();
    },
    ['admin-system-health'],
    {
        revalidate: CACHE_DURATIONS.SHORT,
        tags: [CACHE_TAGS.SYSTEM_HEALTH]
    }
);

export const getCachedContentStats = unstable_cache(
    async () => {
        return await dashboardService.getContentStats();
    },
    ['admin-content-stats'],
    {
        revalidate: CACHE_DURATIONS.LONG,
        tags: [CACHE_TAGS.CONTENT_STATS]
    }
);

/**
 * Cache invalidation functions
 */
export const invalidateAIToolsCache = () => {
    revalidateTag(CACHE_TAGS.AI_TOOLS);
    revalidateTag(CACHE_TAGS.AI_TOOLS_STATS);
    revalidateTag(CACHE_TAGS.DASHBOARD_STATS);
    revalidateTag(CACHE_TAGS.CONTENT_STATS);
};

export const invalidateTemplatesCache = () => {
    revalidateTag(CACHE_TAGS.TEMPLATES);
    revalidateTag(CACHE_TAGS.TEMPLATES_STATS);
    revalidateTag(CACHE_TAGS.DASHBOARD_STATS);
    revalidateTag(CACHE_TAGS.CONTENT_STATS);
};

export const invalidateDashboardCache = () => {
    revalidateTag(CACHE_TAGS.DASHBOARD);
    revalidateTag(CACHE_TAGS.DASHBOARD_STATS);
    revalidateTag(CACHE_TAGS.SYSTEM_HEALTH);
    revalidateTag(CACHE_TAGS.USER_STATS);
    revalidateTag(CACHE_TAGS.CONTENT_STATS);
};

export const invalidateAllAdminCache = () => {
    Object.values(CACHE_TAGS).forEach(tag => {
        revalidateTag(tag);
    });
};

/**
 * Cache warming functions for critical admin data
 */
export const warmCriticalAdminCache = async () => {
    try {
        console.log('Warming critical admin cache...');

        // Warm AI Tools cache
        await Promise.all([
            getCachedAITools({ page: 1, limit: 20 }),
            getCachedAIToolsStatistics(),
            getCachedRecommendedToolsForCurriculum()
        ]);

        // Warm Templates cache
        await Promise.all([
            getCachedTemplates({ page: 1, limit: 20 }),
            getCachedTemplatesStatistics()
        ]);

        // Warm Dashboard cache
        await Promise.all([
            getCachedDashboardStats(),
            getCachedSystemHealth(),
            getCachedContentStats()
        ]);

        console.log('Critical admin cache warmed successfully');
    } catch (error) {
        console.error('Error warming critical admin cache:', error);
    }
};

/**
 * Cache management utilities
 */
export const getCacheStatus = () => {
    return {
        tags: Object.values(CACHE_TAGS),
        durations: CACHE_DURATIONS,
        lastWarmed: new Date().toISOString()
    };
};

/**
 * Selective cache invalidation based on operation type
 */
export const invalidateCacheForOperation = (operation: string, resource: string) => {
    switch (resource) {
        case 'ai-tools':
            invalidateAIToolsCache();
            break;
        case 'templates':
            invalidateTemplatesCache();
            break;
        case 'dashboard':
            invalidateDashboardCache();
            break;
        default:
            // For unknown resources, invalidate all cache
            invalidateAllAdminCache();
    }
};

/**
 * Cache preloading for specific admin pages
 */
export const preloadAdminPageCache = async (page: string) => {
    try {
        switch (page) {
            case 'ai-tools':
                await Promise.all([
                    getCachedAITools({ page: 1, limit: 20 }),
                    getCachedAIToolsStatistics()
                ]);
                break;

            case 'templates':
                await Promise.all([
                    getCachedTemplates({ page: 1, limit: 20 }),
                    getCachedTemplatesStatistics()
                ]);
                break;

            case 'dashboard':
                await Promise.all([
                    getCachedDashboardStats(),
                    getCachedSystemHealth(),
                    getCachedContentStats()
                ]);
                break;
        }
    } catch (error) {
        console.error(`Error preloading cache for ${page}:`, error);
    }
};

/**
 * Cache metrics for monitoring
 */
export const getCacheMetrics = () => {
    return {
        totalTags: Object.keys(CACHE_TAGS).length,
        cacheStrategies: {
            short: `${CACHE_DURATIONS.SHORT}s`,
            medium: `${CACHE_DURATIONS.MEDIUM}s`,
            long: `${CACHE_DURATIONS.LONG}s`,
            veryLong: `${CACHE_DURATIONS.VERY_LONG}s`
        },
        lastInvalidation: new Date().toISOString()
    };
};