import { useState, useCallback } from 'react';
import { handleClientError } from '@/lib/error-handling';

export interface ValidationRequest {
    type: 'lesson-plan' | 'presentation' | 'assessment' | 'content-compliance';
    data: Record<string, any>;
}

export interface ValidationResponse {
    isValid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
    complianceScore: number;
    detailedReport?: any;
}

export interface ValidationState {
    isValidating: boolean;
    lastValidation: ValidationResponse | null;
    error: string | null;
}

export function useEducationalValidation() {
    const [validationState, setValidationState] = useState<ValidationState>({
        isValidating: false,
        lastValidation: null,
        error: null
    });

    const validateEducationalStandards = useCallback(async (
        request: ValidationRequest
    ): Promise<ValidationResponse | null> => {
        setValidationState(prev => ({
            ...prev,
            isValidating: true,
            error: null
        }));

        try {
            const response = await fetch('/api/validation/educational-standards', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(request)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Lỗi xác thực chuẩn giáo dục');
            }

            const result = await response.json();
            const validationResult = result.data as ValidationResponse;

            setValidationState(prev => ({
                ...prev,
                isValidating: false,
                lastValidation: validationResult,
                error: null
            }));

            return validationResult;

        } catch (error) {
            const errorMessage = handleClientError(error);
            setValidationState(prev => ({
                ...prev,
                isValidating: false,
                error: errorMessage
            }));
            return null;
        }
    }, []);

    const validateLessonPlan = useCallback(async (data: {
        subject: string;
        gradeLevel: number;
        lessonName: string;
        pedagogicalStandard: string;
    }) => {
        return validateEducationalStandards({
            type: 'lesson-plan',
            data
        });
    }, [validateEducationalStandards]);

    const validatePresentation = useCallback(async (data: {
        subject: string;
        gradeLevel: number;
        lessonName: string;
        curriculumContent: string;
        slideCount: number;
    }) => {
        return validateEducationalStandards({
            type: 'presentation',
            data
        });
    }, [validateEducationalStandards]);

    const validateAssessment = useCallback(async (data: {
        subject: string;
        gradeLevel: number;
        topic: string;
        questionCount: number;
        bloomLevels: string[];
        questionType: string;
    }) => {
        return validateEducationalStandards({
            type: 'assessment',
            data
        });
    }, [validateEducationalStandards]);

    const validateContentCompliance = useCallback(async (data: {
        content: string;
        gradeLevel: number;
        subject: string;
    }) => {
        return validateEducationalStandards({
            type: 'content-compliance',
            data
        });
    }, [validateEducationalStandards]);

    const clearValidation = useCallback(() => {
        setValidationState({
            isValidating: false,
            lastValidation: null,
            error: null
        });
    }, []);

    return {
        // State
        isValidating: validationState.isValidating,
        lastValidation: validationState.lastValidation,
        error: validationState.error,

        // Methods
        validateLessonPlan,
        validatePresentation,
        validateAssessment,
        validateContentCompliance,
        clearValidation,

        // Generic method
        validateEducationalStandards
    };
}

// Hook for fetching validation guidelines
export function useValidationGuidelines() {
    const [guidelines, setGuidelines] = useState<any>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const fetchGuidelines = useCallback(async (type?: string) => {
        setIsLoading(true);
        setError(null);

        try {
            const url = type
                ? `/api/validation/educational-standards?type=${type}`
                : '/api/validation/educational-standards';

            const response = await fetch(url);

            if (!response.ok) {
                throw new Error('Không thể tải hướng dẫn xác thực');
            }

            const result = await response.json();
            setGuidelines(result.data);

        } catch (error) {
            const errorMessage = handleClientError(error);
            setError(errorMessage);
        } finally {
            setIsLoading(false);
        }
    }, []);

    return {
        guidelines,
        isLoading,
        error,
        fetchGuidelines
    };
}

// Hook for real-time compliance checking
export function useComplianceChecker() {
    const [complianceResults, setComplianceResults] = useState<{
        gdpt2018?: { score: number; suggestions: string[] };
        cv5512?: { score: number; suggestions: string[] };
        terminology?: { score: number; suggestions: string[] };
        overall?: { score: number; grade: string; recommendations: string[] };
    }>({});

    const [isChecking, setIsChecking] = useState(false);

    const checkCompliance = useCallback(async (
        content: string,
        gradeLevel: number,
        subject: string
    ) => {
        if (content.length < 10) {
            setComplianceResults({});
            return;
        }

        setIsChecking(true);

        try {
            const response = await fetch('/api/validation/educational-standards', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    type: 'content-compliance',
                    data: { content, gradeLevel, subject }
                })
            });

            if (response.ok) {
                const result = await response.json();
                const detailedReport = result.data.detailedReport;

                setComplianceResults({
                    gdpt2018: {
                        score: detailedReport.gdpt2018.score,
                        suggestions: detailedReport.gdpt2018.suggestions
                    },
                    cv5512: {
                        score: detailedReport.cv5512.score,
                        suggestions: detailedReport.cv5512.suggestions
                    },
                    terminology: {
                        score: detailedReport.terminology.score,
                        suggestions: detailedReport.terminology.suggestions
                    },
                    overall: {
                        score: detailedReport.overall.score,
                        grade: detailedReport.overall.grade,
                        recommendations: detailedReport.overall.recommendations
                    }
                });
            }
        } catch (error) {
            console.error('Compliance check error:', error);
        } finally {
            setIsChecking(false);
        }
    }, []);

    const clearResults = useCallback(() => {
        setComplianceResults({});
    }, []);

    return {
        complianceResults,
        isChecking,
        checkCompliance,
        clearResults
    };
}