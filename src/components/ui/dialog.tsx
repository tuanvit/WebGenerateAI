'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { X } from 'lucide-react';

interface DialogContextType {
    open: boolean;
    onOpenChange: (open: boolean) => void;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

interface DialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    children: React.ReactNode;
}

const Dialog = ({ open, onOpenChange, children }: DialogProps) => {
    return (
        <DialogContext.Provider value={{ open, onOpenChange }}>
            {children}
        </DialogContext.Provider>
    );
};

interface DialogTriggerProps {
    children: React.ReactNode;
    asChild?: boolean;
}

const DialogTrigger = ({ children, asChild }: DialogTriggerProps) => {
    const context = useContext(DialogContext);
    if (!context) {
        throw new Error('DialogTrigger must be used within Dialog');
    }

    const { onOpenChange } = context;

    if (asChild && React.isValidElement(children)) {
        return React.cloneElement(children, {
            onClick: () => onOpenChange(true)
        });
    }

    return (
        <button onClick={() => onOpenChange(true)}>
            {children}
        </button>
    );
};

interface DialogContentProps {
    children: React.ReactNode;
    className?: string;
}

const DialogContent = ({ children, className }: DialogContentProps) => {
    const context = useContext(DialogContext);
    if (!context) {
        throw new Error('DialogContent must be used within Dialog');
    }

    const { open, onOpenChange } = context;

    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onOpenChange(false);
            }
        };

        if (open) {
            document.addEventListener('keydown', handleEscape);
            document.body.style.overflow = 'hidden';
        }

        return () => {
            document.removeEventListener('keydown', handleEscape);
            document.body.style.overflow = 'unset';
        };
    }, [open, onOpenChange]);

    if (!open) {
        return null;
    }

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50"
                onClick={() => onOpenChange(false)}
            />

            {/* Content */}
            <div className={cn(
                'relative bg-white rounded-lg shadow-lg w-full max-w-lg mx-4 max-h-[90vh] overflow-hidden',
                className
            )}>
                <button
                    onClick={() => onOpenChange(false)}
                    className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none z-10"
                >
                    <X className="h-4 w-4" />
                    <span className="sr-only">Close</span>
                </button>
                {children}
            </div>
        </div>
    );
};

interface DialogHeaderProps {
    children: React.ReactNode;
    className?: string;
}

const DialogHeader = ({ children, className }: DialogHeaderProps) => {
    return (
        <div className={cn('flex flex-col space-y-1.5 text-center sm:text-left p-6 pb-0', className)}>
            {children}
        </div>
    );
};

interface DialogTitleProps {
    children: React.ReactNode;
    className?: string;
}

const DialogTitle = ({ children, className }: DialogTitleProps) => {
    return (
        <h2 className={cn('text-lg font-semibold leading-none tracking-tight', className)}>
            {children}
        </h2>
    );
};

interface DialogDescriptionProps {
    children: React.ReactNode;
    className?: string;
}

const DialogDescription = ({ children, className }: DialogDescriptionProps) => {
    return (
        <p className={cn('text-sm text-muted-foreground', className)}>
            {children}
        </p>
    );
};

interface DialogFooterProps {
    children: React.ReactNode;
    className?: string;
}

const DialogFooter = ({ children, className }: DialogFooterProps) => {
    return (
        <div className={cn('flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 p-6 pt-0', className)}>
            {children}
        </div>
    );
};

export { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter };