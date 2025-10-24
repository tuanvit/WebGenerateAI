'use client';

import React, { useState, useRef, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { ChevronDown } from 'lucide-react';

interface SelectProps {
    value?: string;
    onValueChange?: (value: string) => void;
    disabled?: boolean;
    children: React.ReactNode;
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    children: React.ReactNode;
}

interface SelectContentProps {
    children: React.ReactNode;
}

interface SelectItemProps {
    value: string;
    children: React.ReactNode;
}

interface SelectValueProps {
    placeholder?: string;
}

const SelectContext = React.createContext<{
    value?: string;
    onValueChange?: (value: string) => void;
    isOpen: boolean;
    setIsOpen: (open: boolean) => void;
}>({
    isOpen: false,
    setIsOpen: () => { }
});

const Select: React.FC<SelectProps> = ({ value, onValueChange, disabled, children }) => {
    const [isOpen, setIsOpen] = useState(false);

    return (
        <SelectContext.Provider value={{ value, onValueChange, isOpen, setIsOpen }}>
            <div className="relative">
                {children}
            </div>
        </SelectContext.Provider>
    );
};

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
    ({ className, children, ...props }, ref) => {
        const { isOpen, setIsOpen } = React.useContext(SelectContext);

        return (
            <button
                ref={ref}
                type="button"
                className={cn(
                    'flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm ring-offset-background placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
                    className
                )}
                onClick={() => setIsOpen(!isOpen)}
                {...props}
            >
                {children}
                <ChevronDown className="h-4 w-4 opacity-50" />
            </button>
        );
    }
);
SelectTrigger.displayName = 'SelectTrigger';

const SelectContent: React.FC<SelectContentProps> = ({ children }) => {
    const { isOpen, setIsOpen } = React.useContext(SelectContext);
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

    return (
        <div
            ref={contentRef}
            className="absolute top-full left-0 z-50 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-auto"
        >
            {children}
        </div>
    );
};

const SelectItem: React.FC<SelectItemProps> = ({ value, children }) => {
    const { onValueChange, setIsOpen, value: selectedValue } = React.useContext(SelectContext);

    const handleClick = () => {
        onValueChange?.(value);
        setIsOpen(false);
    };

    return (
        <div
            className={cn(
                'relative flex cursor-pointer select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100',
                selectedValue === value && 'bg-gray-100'
            )}
            onClick={handleClick}
        >
            {children}
        </div>
    );
};

const SelectValue: React.FC<SelectValueProps> = ({ placeholder }) => {
    const { value } = React.useContext(SelectContext);

    return (
        <span className={cn(!value && 'text-gray-500')}>
            {value || placeholder}
        </span>
    );
};

export { Select, SelectTrigger, SelectContent, SelectItem, SelectValue };