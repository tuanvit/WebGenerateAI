'use client';

import React from 'react';
import { TargetAITool } from '../../types/prompt';
import { AIToolIntegration } from '../../services/integration/AIToolIntegration';

interface ToolInstructionsProps {
    tool: TargetAITool;
    className?: string;
    showTitle?: boolean;
    variant?: 'default' | 'compact' | 'detailed';
}

/**
 * Component that displays usage instructions for a specific AI tool
 * Provides clear guidance on how to use generated prompts with each tool
 */
export const ToolInstructions: React.FC<ToolInstructionsProps> = ({
    tool,
    className = '',
    showTitle = true,
    variant = 'default'
}) => {
    const aiIntegration = new AIToolIntegration();
    const toolName = aiIntegration.getToolName(tool);
    const instructions = aiIntegration.getUsageInstructions(tool);
    const toolUrl = aiIntegration.getToolUrl(tool);

    const getVariantClasses = () => {
        switch (variant) {
            case 'compact':
                return 'p-3 text-sm';
            case 'detailed':
                return 'p-6 text-base';
            default:
                return 'p-4 text-sm';
        }
    };

    const getIconForTool = (tool: TargetAITool): string => {
        const icons = {
            [TargetAITool.CHATGPT]: '🤖',
            [TargetAITool.GEMINI]: '✨',
            [TargetAITool.COPILOT]: '🚁',
            [TargetAITool.CANVA_AI]: '🎨',
            [TargetAITool.GAMMA_APP]: '📊'
        };
        return icons[tool];
    };

    return (
        <div className={`bg-blue-50 border border-blue-200 rounded-lg ${getVariantClasses()} ${className}`}>
            {showTitle && (
                <div className="flex items-center space-x-2 mb-3">
                    <span className="text-xl">{getIconForTool(tool)}</span>
                    <h4 className="font-medium text-blue-900">
                        Hướng dẫn sử dụng với {toolName}
                    </h4>
                </div>
            )}

            <ol className="space-y-2 text-blue-800">
                {instructions.map((instruction, index) => (
                    <li key={index} className="flex items-start space-x-2">
                        <span className="shrink-0 w-6 h-6 bg-blue-200 text-blue-800 rounded-full flex items-center justify-center text-xs font-medium">
                            {index + 1}
                        </span>
                        <span className="flex-1">{instruction}</span>
                    </li>
                ))}
            </ol>

            {variant === 'detailed' && (
                <div className="mt-4 pt-4 border-t border-blue-200">
                    <div className="flex items-center justify-between">
                        <span className="text-blue-700 font-medium">Liên kết trực tiếp:</span>
                        <a
                            href={toolUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-blue-600 hover:text-blue-800 underline"
                        >
                            Mở {toolName} →
                        </a>
                    </div>
                </div>
            )}

            {variant !== 'compact' && (
                <div className="mt-3 p-2 bg-blue-100 rounded text-xs text-blue-700">
                    💡 <strong>Mẹo:</strong> Prompt đã được tối ưu hóa đặc biệt cho {toolName}
                    để đảm bảo kết quả tốt nhất cho giáo dục Việt Nam.
                </div>
            )}
        </div>
    );
};

export default ToolInstructions;