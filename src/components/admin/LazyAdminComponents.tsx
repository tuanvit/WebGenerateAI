/**
 * Lazy-loaded Admin Components
 * Implements lazy loading for admin components to improve initial page load performance
 */

'use client';

import { lazy, Suspense } from 'react';
import { LazyComponent } from '@/lib/admin/client-performance';

// Lazy load admin components
const LazyAIToolsManager = lazy(() => import('./ai-tools/AIToolsManager'));
const LazyTemplatesManager = lazy(() => import('./templates/TemplatesManager'));
const LazyDashboardContent = lazy(() => import('./dashboard/DashboardContent'));
const LazyBackupManager = lazy(() => import('./backup/BackupManager'));
const LazyAuditLogsViewer = lazy(() => import('./audit/AuditLogsViewer'));

// Loading fallback component
const AdminLoadingFallback = ({ componentName }: { componentName: string }) => (
    <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Đang tải {componentName}...</p>
        </div>
    </div>
);

// Lazy-loaded AI Tools Manager
export const AIToolsManager = (props: any) => (
    <LazyComponent threshold={0.1}>
        <Suspense fallback={<AdminLoadingFallback componentName="Quản lý AI Tools" />}>
            <LazyAIToolsManager {...props} />
        </Suspense>
    </LazyComponent>
);

// Lazy-loaded Templates Manager
export const TemplatesManager = (props: any) => (
    <LazyComponent threshold={0.1}>
        <Suspense fallback={<AdminLoadingFallback componentName="Quản lý Templates" />}>
            <LazyTemplatesManager {...props} />
        </Suspense>
    </LazyComponent>
);

// Lazy-loaded Dashboard Content
export const DashboardContent = (props: any) => (
    <LazyComponent threshold={0.1}>
        <Suspense fallback={<AdminLoadingFallback componentName="Dashboard" />}>
            <LazyDashboardContent {...props} />
        </Suspense>
    </LazyComponent>
);

// Lazy-loaded Backup Manager
export const BackupManager = (props: any) => (
    <LazyComponent threshold={0.1}>
        <Suspense fallback={<AdminLoadingFallback componentName="Quản lý Backup" />}>
            <LazyBackupManager {...props} />
        </Suspense>
    </LazyComponent>
);

// Lazy-loaded Audit Logs Viewer
export const AuditLogsViewer = (props: any) => (
    <LazyComponent threshold={0.1}>
        <Suspense fallback={<AdminLoadingFallback componentName="Nhật ký Audit" />}>
            <LazyAuditLogsViewer {...props} />
        </Suspense>
    </LazyComponent>
);

// Preload components for better UX
export const preloadAdminComponents = () => {
    // Preload critical components
    import('./ai-tools/AIToolsManager');
    import('./templates/TemplatesManager');
    import('./dashboard/DashboardContent');
};

// Component registry for dynamic loading
export const ADMIN_COMPONENTS = {
    'ai-tools': AIToolsManager,
    'templates': TemplatesManager,
    'dashboard': DashboardContent,
    'backup': BackupManager,
    'audit': AuditLogsViewer
} as const;

export type AdminComponentKey = keyof typeof ADMIN_COMPONENTS;