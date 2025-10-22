"use client"

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavigationItem {
    href: string
    label: string
    icon?: React.ReactNode
}

interface ResponsiveNavigationProps {
    items: NavigationItem[]
    currentPath?: string
}

export default function ResponsiveNavigation({ items, currentPath }: ResponsiveNavigationProps) {
    const [isOpen, setIsOpen] = useState(false)
    const pathname = usePathname()

    const isActive = (href: string) => {
        return currentPath === href || pathname === href
    }

    return (
        <>
            {/* Mobile menu button */}
            <div className="md:hidden">
                <button
                    onClick={() => setIsOpen(!isOpen)}
                    className="inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-inset focus:ring-blue-500"
                    aria-expanded={isOpen}
                    aria-label="Mở menu điều hướng"
                >
                    <span className="sr-only">Mở menu chính</span>
                    {!isOpen ? (
                        <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                        </svg>
                    ) : (
                        <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    )}
                </button>
            </div>

            {/* Desktop navigation */}
            <nav className="hidden md:flex space-x-8" aria-label="Menu chính">
                {items.map((item) => (
                    <Link
                        key={item.href}
                        href={item.href}
                        className={`inline-flex items-center px-1 pt-1 text-sm font-medium transition-colors duration-200 ${isActive(item.href)
                                ? 'text-blue-600 border-b-2 border-blue-600'
                                : 'text-gray-500 hover:text-gray-700 hover:border-gray-300 border-b-2 border-transparent'
                            }`}
                        aria-current={isActive(item.href) ? 'page' : undefined}
                    >
                        {item.icon && <span className="mr-2" aria-hidden="true">{item.icon}</span>}
                        {item.label}
                    </Link>
                ))}
            </nav>

            {/* Mobile navigation menu */}
            {isOpen && (
                <div className="md:hidden">
                    <div className="pt-2 pb-3 space-y-1">
                        {items.map((item) => (
                            <Link
                                key={item.href}
                                href={item.href}
                                className={`block pl-3 pr-4 py-2 text-base font-medium transition-colors duration-200 ${isActive(item.href)
                                        ? 'text-blue-600 bg-blue-50 border-r-4 border-blue-600'
                                        : 'text-gray-500 hover:text-gray-700 hover:bg-gray-50'
                                    }`}
                                onClick={() => setIsOpen(false)}
                                aria-current={isActive(item.href) ? 'page' : undefined}
                            >
                                <div className="flex items-center">
                                    {item.icon && <span className="mr-3" aria-hidden="true">{item.icon}</span>}
                                    {item.label}
                                </div>
                            </Link>
                        ))}
                    </div>
                </div>
            )}
        </>
    )
}