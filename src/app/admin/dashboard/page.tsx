import { Metadata } from 'next';
import { Suspense } from 'react';
import DashboardContent from '@/components/admin/dashboard/DashboardContent';

export const metadata: Metadata = {
    title: 'Dashboard - Admin Panel',
    description: 'Tổng quan hệ thống quản lý AI Tools và Templates',
};

function DashboardSkeleton() {
    return (
        <div className="space-y-6">
            {/* Stats skeleton */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="bg-white rounded-lg shadow p-4">
                        <div className="animate-pulse">
                            <div className="h-4 bg-gray-200 rounded w-20 mb-2"></div>
                            <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
                            <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Charts skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                        <div className="h-64 bg-gray-200 rounded"></div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="animate-pulse">
                        <div className="h-6 bg-gray-200 rounded w-32 mb-4"></div>
                        <div className="space-y-3">
                            {[...Array(5)].map((_, i) => (
                                <div key={i} className="h-4 bg-gray-200 rounded"></div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function AdminDashboardPage() {
    return (
        <Suspense fallback={<DashboardSkeleton />}>
            <DashboardContent />
        </Suspense>
    );
}