import { TargetAITool } from '../../types/prompt';
import type { AIToolIntegration as IAIToolIntegration } from '../../types/services';
import {
    ChatGPTFormatter,
    GeminiFormatter,
    CopilotFormatter,
    CanvaAIFormatter,
    GammaAppFormatter,
    BaseFormatter
} from './formatters';

/**
 * AI Tool Integration Manager
 * Handles direct integration with various AI platforms for Vietnamese educators
 */
export class AIToolIntegration implements IAIToolIntegration {
    private readonly formatters: Record<TargetAITool, BaseFormatter> = {
        [TargetAITool.CHATGPT]: new ChatGPTFormatter(),
        [TargetAITool.GEMINI]: new GeminiFormatter(),
        [TargetAITool.COPILOT]: new CopilotFormatter(),
        [TargetAITool.CANVA_AI]: new CanvaAIFormatter(),
        [TargetAITool.GAMMA_APP]: new GammaAppFormatter()
    };

    /**
     * Opens the specified AI tool in a new tab with the prompt pre-filled (where possible)
     */
    async openWithPrompt(tool: TargetAITool, prompt: string): Promise<void> {
        try {
            const formatter = this.formatters[tool];
            const targetUrl = formatter.getToolUrl();
            const formattedPrompt = formatter.formatPrompt(prompt);

            // Open in new tab
            window.open(targetUrl, '_blank', 'noopener,noreferrer');

            // Copy formatted prompt to clipboard for easy pasting
            await this.copyToClipboard(formattedPrompt);

        } catch (error) {
            console.error(`Lỗi khi mở ${this.getToolName(tool)}:`, error);
            throw new Error(`Không thể mở ${this.getToolName(tool)}. Vui lòng thử lại.`);
        }
    }

    /**
     * Copies the prompt to clipboard with proper formatting
     */
    async copyToClipboard(prompt: string): Promise<void> {
        try {
            if (!navigator.clipboard) {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = prompt;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();
                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);

                if (!successful) {
                    throw new Error('Fallback copy method failed');
                }
            } else {
                await navigator.clipboard.writeText(prompt);
            }
        } catch (error) {
            console.error('Lỗi khi sao chép prompt:', error);
            throw new Error('Không thể sao chép prompt. Vui lòng thử lại.');
        }
    }

    /**
     * Formats the prompt specifically for the target AI tool
     */
    formatForTool(prompt: string, tool: TargetAITool): string {
        const formatter = this.formatters[tool];
        return formatter.formatPrompt(prompt);
    }

    /**
     * Gets the base URL for the specified AI tool
     */
    getToolUrl(tool: TargetAITool): string {
        const formatter = this.formatters[tool];
        return formatter.getToolUrl();
    }

    /**
     * Gets the display name for the specified AI tool
     */
    getToolName(tool: TargetAITool): string {
        const formatter = this.formatters[tool];
        return formatter.getToolName();
    }

    /**
     * Gets usage instructions for the specified AI tool
     */
    getUsageInstructions(tool: TargetAITool): string[] {
        const formatter = this.formatters[tool];
        return formatter.getUsageInstructions();
    }

    /**
     * Gets all available AI tools with their metadata
     */
    getAllTools(): Array<{
        tool: TargetAITool;
        name: string;
        url: string;
        instructions: string[];
    }> {
        return Object.entries(this.formatters).map(([tool, formatter]) => ({
            tool: tool as TargetAITool,
            name: formatter.getToolName(),
            url: formatter.getToolUrl(),
            instructions: formatter.getUsageInstructions()
        }));
    }
}