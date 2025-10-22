'use client';

import React, { useState } from 'react';
import { TargetAITool } from '../../types/prompt';
import { AIToolIntegration } from '../../services/integration/AIToolIntegration';

interface AIToolButtonProps {
    tool: TargetAITool;
    prompt: string;
    variant?: 'primary' | 'secondary' | 'outline';
    size?: 'sm' | 'md' | 'lg';
    showIcon?: boolean;
    showInstructions?: boolean;
    className?: string;
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

/**
 * Individual AI Tool Button Component
 * Renders a single button for a specific AI tool
 */
export const AIToolButton: React.FC<AIToolButtonProps> = ({
    tool,
    prompt,
    variant = 'primary',
    size = 'md',
    showIcon = true,
    showInstructions = false,
    className = '',
    onSuccess,
    onError
}) => {
    const [isLoading, setIsLoading] = useState(false);
    const aiIntegration = new AIToolIntegration();

    const toolConfig = {
        [TargetAITool.CHATGPT]: {
            name: 'ChatGPT',
            icon: '🤖',
            color: 'green'
        },
        [TargetAITool.GEMINI]: {
            name: 'Gemini',
            icon: '✨',
            color: 'blue'
        },
        [TargetAITool.COPILOT]: {
            name: 'Copilot',
            icon: '🚁',
            color: 'purple'
        },
        [TargetAITool.CANVA_AI]: {
            name: 'Canva AI',
            icon: '🎨',
            color: 'pink'
        },
        [TargetAITool.GAMMA_APP]: {
            name: 'Gamma',
            icon: '📊',
            color: 'indigo'
        }
    };

    const config = toolConfig[tool];

    const getVariantClasses = () => {
        const baseClasses = 'transition-all duration-200 font-medium rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2';

        switch (variant) {
            case 'primary':
                return `${baseClasses} text-white bg-${config.color}-600 hover:bg-${config.color}-700 focus:ring-${config.color}-500`;
            case 'secondary':
                return `${baseClasses} text-${config.color}-700 bg-${config.color}-100 hover:bg-${config.color}-200 focus:ring-${config.color}-500`;
            case 'outline':
                return `${baseClasses} text-${config.color}-700 border border-${config.color}-300 hover:bg-${config.color}-50 focus:ring-${config.color}-500`;
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

    const handleClick = async () => {
        if (!prompt.trim()) {
            const errorMsg = 'Vui lòng tạo prompt trước khi mở công cụ AI';
            onError?.(errorMsg);
            return;
        }

        setIsLoading(true);
        try {
            const formattedPrompt = aiIntegration.formatForTool(prompt, tool);
            await aiIntegration.openWithPrompt(tool, formattedPrompt);
            onSuccess?.();
        } catch (error) {
            const errorMsg = error instanceof Error ? error.message : 'Có lỗi xảy ra khi mở công cụ AI';
            onError?.(errorMsg);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="space-y-2">
            <button
                onClick={handleClick}
                disabled={!prompt.trim() || isLoading}
                className={`
                    ${getVariantClasses()}
                    ${getSizeClasses()}
                    ${className}
                    disabled:opacity-50 disabled:cursor-not-allowed
                    ${isLoading ? 'animate-pulse' : ''}
                    flex items-center justify-center space-x-2
                `}
            >
                {showIcon && <span className="text-lg">{config.icon}</span>}
                <span>
                    {isLoading ? 'Đang mở...' : `Mở ${config.name}`}
                </span>
                {isLoading && (
                    <div className="animate-spin rounded-full h-4 w-4 border-2 border-current border-t-transparent ml-2"></div>
                )}
            </button>

            {showInstructions && (
                <div className="text-xs text-gray-600 max-w-xs">
                    Nhấn để mở {config.name} trong tab mới với prompt đã được tối ưu
                </div>
            )}
        </div>
    );
};

export default AIToolButton;