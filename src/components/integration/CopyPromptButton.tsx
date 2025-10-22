'use client';

import React, { useState } from 'react';
import { TargetAITool } from '../../types/prompt';
import { AIToolIntegration } from '../../services/integration/AIToolIntegration';

interface CopyPromptButtonProps {
    prompt: string;
    targetTool?: TargetAITool;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    showIcon?: boolean;
    showSuccessMessage?: boolean;
    className?: string;
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

/**
 * Copy Prompt Button Component
 * Provides one-click copy functionality for generated prompts
 * Maintains formatting compatibility for each target tool
 */
export const CopyPromptButton: React.FC<CopyPromptButtonProps> = ({
    prompt,
    targetTool,
    variant = 'secondary',
    size = 'md',
    showIcon = true,
    showSuccessMessage = true,
    className = '',
    onSuccess,
    onError
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);
    const aiIntegration = new AIToolIntegration();

    const getVariantClasses = () => {
        const baseClasses = 'transition-all duration-200 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2';

        switch (variant) {
            case 'primary':
                return `${baseClasses} text-white bg-blue-600 hover:bg-blue-700 focus:ring-blue-500`;
            case 'secondary':
                return `${baseClasses} text-gray-700 bg-gray-100 hover:bg-gray-200 focus:ring-gray-500`;
            case 'outline':
                return `${baseClasses} text-gray-700 border border-gray-300 hover:bg-gray-50 focus:ring-gray-500`;
            default:
                return baseClasses;
        }
    };

    const getSizeClasses = () => {
        switch (size) {
            case 'sm':
                return 'px-3 py-1.5 text-sm';
            case 'md':
                return 'px-4 py-2 text-base';
            case 'lg':
                return 'px-6 py-3 text-lg';
            default:
                return 'px-4 py-2 text-base';
        }
    };

    const handleCopy = async () => {
        if (!prompt.trim()) {
            const errorMsg = 'Không có prompt để sao chép';
            onError?.(errorMsg);
            return;
        }

        setIsLoading(true);
        try {
            // Format prompt for specific tool if specified
            const formattedPrompt = targetTool
                ? aiIntegration.formatForTool(prompt, targetTool)
                : prompt;

            await aiIntegration.copyToClipboard(formattedPrompt);

            // Show success state
            setShowSuccess(true);
            onSuccess?.();

            // Hide success message after 3 seconds
            if (showSuccessMessage) {
                setTimeout(() => setShowSuccess(false), 3000);
            }
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Có lỗi xảy ra khi sao chép prompt';
            onError?.(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    const getButtonText = () => {
        if (isLoading) return 'Đang sao chép...';
        if (showSuccess) return 'Đã sao chép!';
        return 'Sao chép Prompt';
    };

    const getButtonIcon = () => {
        if (isLoading) return '⏳';
        if (showSuccess) return '✅';
        return '📋';
    };

    return (
        <div className="space-y-2">
            <button
                onClick={handleCopy}
                disabled={!prompt.trim() || isLoading}
                className={`
                    ${getVariantClasses()}
                    ${getSizeClasses()}
                    ${className}
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${showSuccess ? 'bg-green-100 text-green-700 border-green-300' : ''}
                    flex items-center justify-center space-x-2
                `}
            >
                {showIcon && <span>{getButtonIcon()}</span>}
                <span>{getButtonText()}</span>
                {isLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent ml-2"></div>
                )}
            </button>

            {/* Success Message */}
            {showSuccess && showSuccessMessage && (
                <div className="text-sm text-green-600 flex items-center space-x-1">
                    <span>✅</span>
                    <span>
                        Đã sao chép prompt
                        {targetTool && ` (tối ưu cho ${aiIntegration.getToolName(targetTool)})`}
                        vào clipboard!
                    </span>
                </div>
            )}

            {/* Tool-specific formatting note */}
            {targetTool && (
                <div className="text-xs text-gray-500">
                    Prompt đã được tối ưu cho {aiIntegration.getToolName(targetTool)}
                </div>
            )}
        </div>
    );
};

export default CopyPromptButton;