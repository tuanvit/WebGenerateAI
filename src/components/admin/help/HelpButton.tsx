"use client"

import { useState } from 'react';
import { HelpCircle, Book, MessageCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import HelpSystem from './HelpSystem';

interface HelpButtonProps {
    currentSection?: string;
    className?: string;
    variant?: 'floating' | 'inline';
}

export default function HelpButton({
    currentSection,
    className = '',
    variant = 'floating'
}: HelpButtonProps) {
    const [showHelpSystem, setShowHelpSystem] = useState(false);
    const [showUserGuide, setShowUserGuide] = useState(false);

    const buttonClasses = variant === 'floating'
        ? `fixed bottom-6 right-6 z-40 shadow-lg ${className}`
        : `${className}`;

    return (
        <>
            {/* Help Button */}
            <div className={buttonClasses}>
                <div className="flex items-center space-x-2">
                    {variant === 'inline' && (
                        <>
                            <Button
                                onClick={() => setShowUserGuide(true)}
                                variant="outline"
                                size="sm"
                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                                <Book className="w-4 h-4 mr-2" />
                                Hướng dẫn
                            </Button>
                            <Button
                                onClick={() => setShowHelpSystem(true)}
                                variant="outline"
                                size="sm"
                                className="text-blue-600 border-blue-200 hover:bg-blue-50"
                            >
                                <MessageCircle className="w-4 h-4 mr-2" />
                                Trợ giúp
                            </Button>
                        </>
                    )}

                    {variant === 'floating' && (
                        <div className="relative group">
                            <Button
                                onClick={() => setShowHelpSystem(true)}
                                className="w-12 h-12 rounded-full bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
                                title="Trợ giúp"
                            >
                                <HelpCircle className="w-6 h-6" />
                            </Button>

                            {/* Quick access menu */}
                            <div className="absolute bottom-full right-0 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none group-hover:pointer-events-auto">
                                <div className="bg-white rounded-lg shadow-lg border border-gray-200 p-2 space-y-1 min-w-[120px]">
                                    <Button
                                        onClick={() => setShowUserGuide(true)}
                                        variant="ghost"
                                        size="sm"
                                        className="w-full justify-start text-gray-700 hover:bg-gray-50"
                                    >
                                        <Book className="w-4 h-4 mr-2" />
                                        Hướng dẫn
                                    </Button>
                                    <Button
                                        onClick={() => setShowHelpSystem(true)}
                                        variant="ghost"
                                        size="sm"
                                        className="w-full justify-start text-gray-700 hover:bg-gray-50"
                                    >
                                        <MessageCircle className="w-4 h-4 mr-2" />
                                        FAQ & Trợ giúp
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Help System Modal */}
            <HelpSystem
                isOpen={showHelpSystem}
                onClose={() => setShowHelpSystem(false)}
                currentSection={currentSection}
            />

            {/* User Guide Modal */}
            {showUserGuide && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden">
                        <div className="flex items-center justify-between p-4 border-b">
                            <h2 className="text-lg font-semibold">Hướng dẫn sử dụng</h2>
                            <Button
                                onClick={() => setShowUserGuide(false)}
                                variant="ghost"
                                size="sm"
                            >
                                <X className="w-4 h-4" />
                            </Button>
                        </div>
                        <div className="p-4">
                            <p className="text-gray-600">
                                Hướng dẫn sử dụng admin panel sẽ được cập nhật sớm.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}