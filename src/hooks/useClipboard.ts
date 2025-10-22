'use client';

import { useState, useCallback } from 'react';

interface UseClipboardOptions {
    successDuration?: number;
    onSuccess?: () => void;
    onError?: (error: string) => void;
}

interface UseClipboardReturn {
    copy: (text: string) => Promise<void>;
    isLoading: boolean;
    isSuccess: boolean;
    error: string | null;
}

/**
 * Custom hook for clipboard operations
 * Provides copy functionality with loading states and error handling
 */
export const useClipboard = (options: UseClipboardOptions = {}): UseClipboardReturn => {
    const { successDuration = 3000, onSuccess, onError } = options;

    const [isLoading, setIsLoading] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const copy = useCallback(async (text: string) => {
        if (!text.trim()) {
            const errorMsg = 'Không có nội dung để sao chép';
            setError(errorMsg);
            onError?.(errorMsg);
            return;
        }

        setIsLoading(true);
        setError(null);
        setIsSuccess(false);

        try {
            if (!navigator.clipboard) {
                // Fallback for older browsers
                const textArea = document.createElement('textarea');
                textArea.value = text;
                textArea.style.position = 'fixed';
                textArea.style.left = '-999999px';
                textArea.style.top = '-999999px';
                document.body.appendChild(textArea);
                textArea.focus();
                textArea.select();

                const successful = document.execCommand('copy');
                document.body.removeChild(textArea);

                if (!successful) {
                    throw new Error('Không thể sao chép bằng phương pháp fallback');
                }
            } else {
                await navigator.clipboard.writeText(text);
            }

            setIsSuccess(true);
            onSuccess?.();

            // Reset success state after specified duration
            setTimeout(() => {
                setIsSuccess(false);
            }, successDuration);

        } catch (err) {
            const errorMsg = err instanceof Error
                ? err.message
                : 'Không thể sao chép nội dung. Vui lòng thử lại.';

            setError(errorMsg);
            onError?.(errorMsg);
            console.error('Clipboard copy failed:', err);
        } finally {
            setIsLoading(false);
        }
    }, [successDuration, onSuccess, onError]);

    return {
        copy,
        isLoading,
        isSuccess,
        error
    };
};

export default useClipboard;