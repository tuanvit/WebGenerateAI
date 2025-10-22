'use client';

import React, { useState } from 'react';
import { TargetAITool } from '../../types/prompt';
import { AIToolIntegration } from '../../services/integration/AIToolIntegration';

interface AIToolButtonsProps {
    prompt: string;
    selectedTool?: TargetAITool;
    onToolSelect?: (tool: TargetAITool) => void;
    className?: string;
}

/**
 * Component that renders buttons for each supported AI tool
 * Allows users to directly access AI tools with pre-filled prompts
 */
export const AIToolButtons: React.FC<AIToolButtonsProps> = ({
    prompt,
    selectedTool,
    onToolSelect,
    className = ''
}) => {
    const [isLoading, setIsLoading] = useState<TargetAITool | null>(null);
    const [copySuccess, setCopySuccess] = useState<boolean>(false);
    const aiIntegration = new AIToolIntegration();

    const tools = [
        {
            tool: TargetAITool.CHATGPT,
            name: 'ChatGPT',
            icon: '🤖',
            color: 'bg-green-600 hover:bg-green-700',
            description: 'Mở ChatGPT với prompt'
        },
        {
            tool: TargetAITool.GEMINI,
            name: 'Gemini',
            icon: '✨',
            color: 'bg-blue-600 hover:bg-blue-700',
            description: 'Mở Google Gemini với prompt'
        },
        {
            tool: TargetAITool.COPILOT,
            name: 'Copilot',
            icon: '🚁',
            color: 'bg-purple-600 hover:bg-purple-700',
            description: 'Mở Microsoft Copilot với prompt'
        },
        {
            tool: TargetAITool.CANVA_AI,
            name: 'Canva AI',
            icon: '🎨',
            color: 'bg-pink-600 hover:bg-pink-700',
            description: 'Mở Canva AI với prompt'
        },
        {
            tool: TargetAITool.GAMMA_APP,
            name: 'Gamma',
            icon: '📊',
            color: 'bg-indigo-600 hover:bg-indigo-700',
            description: 'Mở Gamma App với prompt'
        }
    ];

    const handleToolClick = async (tool: TargetAITool) => {
        if (!prompt.trim()) {
            alert('Vui lòng tạo prompt trước khi mở công cụ AI');
            return;
        }

        setIsLoading(tool);
        try {
            const formattedPrompt = aiIntegration.formatForTool(prompt, tool);
            await aiIntegration.openWithPrompt(tool, formattedPrompt);

            // Show success message
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 3000);

            // Notify parent component about tool selection
            onToolSelect?.(tool);
        } catch (error) {
            console.error('Error opening AI tool:', error);
            alert(error instanceof Error ? error.message : 'Có lỗi xảy ra khi mở công cụ AI');
        } finally {
            setIsLoading(null);
        }
    };

    const handleCopyPrompt = async () => {
        if (!prompt.trim()) {
            alert('Không có prompt để sao chép');
            return;
        }

        try {
            const formattedPrompt = selectedTool
                ? aiIntegration.formatForTool(prompt, selectedTool)
                : prompt;
            await aiIntegration.copyToClipboard(formattedPrompt);
            setCopySuccess(true);
            setTimeout(() => setCopySuccess(false), 3000);
        } catch (error) {
            console.error('Error copying prompt:', error);
            alert(error instanceof Error ? error.message : 'Có lỗi xảy ra khi sao chép prompt');
        }
    };

    return (
        <div className={`space-y-4 ${className}`}>
            {/* Copy to Clipboard Button */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div>
                    <h3 className="font-medium text-gray-900">Sao chép Prompt</h3>
                    <p className="text-sm text-gray-600">
                        Sao chép prompt để dán vào bất kỳ công cụ AI nào
                    </p>
                </div>
                <button
                    onClick={handleCopyPrompt}
                    disabled={!prompt.trim()}
                    className="px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                    📋 Sao chép
                </button>
            </div>

            {/* Success Message */}
            {copySuccess && (
                <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded-md">
                    ✅ Đã sao chép prompt vào clipboard!
                </div>
            )}

            {/* AI Tool Buttons */}
            <div>
                <h3 className="font-medium text-gray-900 mb-3">Mở trực tiếp với công cụ AI</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {tools.map(({ tool, name, icon, color, description }) => (
                        <button
                            key={tool}
                            onClick={() => handleToolClick(tool)}
                            disabled={!prompt.trim() || isLoading === tool}
                            className={`
                                flex items-center space-x-3 p-4 rounded-lg text-white transition-all
                                ${color}
                                ${selectedTool === tool ? 'ring-2 ring-offset-2 ring-blue-500' : ''}
                                disabled:opacity-50 disabled:cursor-not-allowed
                                ${isLoading === tool ? 'animate-pulse' : ''}
                            `}
                            title={description}
                        >
                            <span className="text-2xl">{icon}</span>
                            <div className="flex-1 text-left">
                                <div className="font-medium">{name}</div>
                                <div className="text-sm opacity-90">
                                    {isLoading === tool ? 'Đang mở...' : 'Nhấn để mở'}
                                </div>
                            </div>
                            {isLoading === tool && (
                                <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Usage Instructions */}
            <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-900 mb-2">💡 Hướng dẫn sử dụng</h4>
                <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Nhấn vào nút công cụ AI để mở trong tab mới</li>
                    <li>• Prompt sẽ được tự động sao chép vào clipboard</li>
                    <li>• Dán prompt vào công cụ AI và nhấn Enter</li>
                    <li>• Mỗi công cụ có định dạng prompt được tối ưu riêng</li>
                </ul>
            </div>
        </div>
    );
};

export default AIToolButtons;