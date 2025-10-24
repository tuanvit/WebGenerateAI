'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';

interface DropdownMenuProps {
    children: React.ReactNode;
}

interface DropdownMenuTriggerProps {
    asChild?: boolean;
    children: React.ReactNode;
}

interface DropdownMenuContentProps {
    align?: 'start' | 'center' | 'end';
    children: React.ReactNode;
}

interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
    children: React.ReactNode;
}

const DropdownMenuContext = React.createContext<{
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}>({
    isOpen: false,
    setIsOpen: () => { }
});

const DropdownMenu: React.FC<DropdownMenuProps> = ({ children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <DropdownMenuContext.Provider value={{ isOpen, setIsOpen }}>
            <div className="relative inline-block text-left">
                {children}
            </div>
        </DropdownMenuContext.Provider>
    );
};

const DropdownMenuTrigger = React.forwardRef<HTMLDivElement, DropdownMenuTriggerProps>(
    ({ asChild, children, ...props }, ref) => {
        const { setIsOpen, isOpen } = React.useContext(DropdownMenuContext);

        const handleClick = () => {
            setIsOpen(!isOpen);
        };

        if (asChild && React.isValidElement(children)) {
            return React.cloneElement(children, {
                ...children.props,
                onClick: handleClick,
                ref
            });
        }

        return (
            <div ref={ref} onClick={handleClick} {...props}>
                {children}
            </div>
        );
    }
);
DropdownMenuTrigger.displayName = 'DropdownMenuTrigger';

const DropdownMenuContent: React.FC<DropdownMenuContentProps> = ({ align = 'start', children }) => {
    const { isOpen, setIsOpen } = React.useContext(DropdownMenuContext);
    const contentRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (contentRef.current && !contentRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };

        if (isOpen) {
            document.addEventListener('mousedown', handleClickOutside);
        }

        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [isOpen, setIsOpen]);

    if (!isOpen) return null;

    const alignmentClasses = {
        start: 'left-0',
        center: 'left-1/2 transform -translate-x-1/2',
        end: 'right-0'
    };

    return (
        <div
            ref={contentRef}
            className={cn(
                'absolute top-full z-50 mt-1 w-56 bg-white border border-gray-200 rounded-md shadow-lg',
                alignmentClasses[align]
            )}
        >
            <div className="py-1">
                {children}
            </div>
        </div>
    );
};

const DropdownMenuItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps>(
    ({ className, children, onClick, ...props }, ref) => {
        const { setIsOpen } = React.useContext(DropdownMenuContext);

        const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
            onClick?.(e);
            setIsOpen(false);
        };

        return (
            <div
                ref={ref}
                className={cn(
                    'relative flex cursor-pointer select-none items-center px-2 py-1.5 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100',
                    className
                )}
                onClick={handleClick}
                {...props}
            >
                {children}
            </div>
        );
    }
);
DropdownMenuItem.displayName = 'DropdownMenuItem';

const DropdownMenuSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className, ...props }, ref) => (
        <div
            ref={ref}
            className={cn('my-1 h-px bg-gray-200', className)}
            {...props}
        />
    )
);
DropdownMenuSeparator.displayName = 'DropdownMenuSeparator';

export {
    DropdownMenu,
    DropdownMenuTrigger,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
};