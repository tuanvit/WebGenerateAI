"use client";

import { usePathname } from 'next/navigation';
import { useMemo } from 'react';

export type AdminSection = 'dashboard' | 'ai-tools' | 'templates' | 'settings';

export interface NavigationState {
    currentSection: AdminSection;
    isActive: (section: AdminSection) => boolean;
    getNavigationClass: (section: AdminSection) => string;
}

export const useAdminNavigation = (): NavigationState => {
    const pathname = usePathname();

    const currentSection = useMemo((): AdminSection => {
        if (pathname.includes('/admin/dashboard')) return 'dashboard';
        if (pathname.includes('/admin/ai-tools')) return 'ai-tools';
        if (pathname.includes('/admin/templates')) return 'templates';
        if (pathname.includes('/admin/settings')) return 'settings';
        return 'dashboard'; // default
    }, [pathname]);

    const isActive = (section: AdminSection): boolean => {
        return currentSection === section;
    };

    const getNavigationClass = (section: AdminSection): string => {
        const baseClass = 'flex items-center px-3 py-2 rounded-lg text-sm font-medium transition-colors';
        const activeClass = 'bg-blue-50 text-blue-700 border-r-2 border-blue-600';
        const inactiveClass = 'text-gray-600 hover:text-gray-900 hover:bg-gray-50';

        return `${baseClass} ${isActive(section) ? activeClass : inactiveClass}`;
    };

    return {
        currentSection,
        isActive,
        getNavigationClass
    };
};