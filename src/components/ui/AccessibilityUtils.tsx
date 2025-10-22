"use client"

import { ReactNode } from 'react'

interface SkipLinkProps {
    href: string
    children: ReactNode
}

export function SkipLink({ href, children }: SkipLinkProps) {
    return (
        <a
            href={href}
            className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-blue-600 text-white px-4 py-2 rounded-md z-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
            {children}
        </a>
    )
}

interface ScreenReaderOnlyProps {
    children: ReactNode
}

export function ScreenReaderOnly({ children }: ScreenReaderOnlyProps) {
    return <span className="sr-only">{children}</span>
}

interface LiveRegionProps {
    children: ReactNode
    level?: 'polite' | 'assertive' | 'off'
    atomic?: boolean
}

export function LiveRegion({ children, level = 'polite', atomic = false }: LiveRegionProps) {
    return (
        <div
            aria-live={level}
            aria-atomic={atomic}
            className="sr-only"
        >
            {children}
        </div>
    )
}

interface FocusTrapProps {
    children: ReactNode
    active: boolean
}

export function FocusTrap({ children, active }: FocusTrapProps) {
    // This is a simplified focus trap - in production, consider using a library like focus-trap-react
    return (
        <div
            onKeyDown={(e) => {
                if (!active) return

                if (e.key === 'Tab') {
                    const focusableElements = e.currentTarget.querySelectorAll(
                        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                    )
                    const firstElement = focusableElements[0] as HTMLElement
                    const lastElement = focusableElements[focusableElements.length - 1] as HTMLElement

                    if (e.shiftKey) {
                        if (document.activeElement === firstElement) {
                            e.preventDefault()
                            lastElement?.focus()
                        }
                    } else {
                        if (document.activeElement === lastElement) {
                            e.preventDefault()
                            firstElement?.focus()
                        }
                    }
                }
            }}
        >
            {children}
        </div>
    )
}

interface LoadingSpinnerProps {
    size?: 'sm' | 'md' | 'lg'
    label?: string
}

export function LoadingSpinner({ size = 'md', label = 'Đang tải...' }: LoadingSpinnerProps) {
    const sizeClasses = {
        sm: 'h-4 w-4',
        md: 'h-8 w-8',
        lg: 'h-12 w-12'
    }

    return (
        <div className="flex items-center justify-center" role="status" aria-label={label}>
            <div
                className={`animate-spin rounded-full border-b-2 border-blue-600 ${sizeClasses[size]}`}
                aria-hidden="true"
            />
            <ScreenReaderOnly>{label}</ScreenReaderOnly>
        </div>
    )
}

interface ErrorMessageProps {
    message: string
    id?: string
}

export function ErrorMessage({ message, id }: ErrorMessageProps) {
    return (
        <div
            id={id}
            role="alert"
            aria-live="assertive"
            className="mt-1 text-sm text-red-600"
        >
            {message}
        </div>
    )
}

interface SuccessMessageProps {
    message: string
    id?: string
}

export function SuccessMessage({ message, id }: SuccessMessageProps) {
    return (
        <div
            id={id}
            role="status"
            aria-live="polite"
            className="mt-1 text-sm text-green-600"
        >
            {message}
        </div>
    )
}