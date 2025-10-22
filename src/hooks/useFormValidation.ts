import { useState, useCallback, useEffect } from 'react';
import {
    validateLessonPlanInput,
    validatePresentationInput,
    validateAssessmentInput,
    type ValidationResult
} from '@/lib/validation';

export type FormType = 'lesson-plan' | 'presentation' | 'assessment';

export interface UseFormValidationOptions {
    validateOnChange?: boolean;
    validateOnBlur?: boolean;
    debounceMs?: number;
}

export interface FormValidationState {
    errors: Record<string, string>;
    warnings: Record<string, string>;
    isValid: boolean;
    isValidating: boolean;
    touchedFields: Set<string>;
}

export function useFormValidation(
    formType: FormType,
    initialData: Record<string, any> = {},
    options: UseFormValidationOptions = {}
) {
    const {
        validateOnChange = true,
        validateOnBlur = true,
        debounceMs = 300
    } = options;

    const [validationState, setValidationState] = useState<FormValidationState>({
        errors: {},
        warnings: {},
        isValid: false,
        isValidating: false,
        touchedFields: new Set()
    });

    const [debounceTimer, setDebounceTimer] = useState<NodeJS.Timeout | null>(null);

    const getValidator = useCallback(() => {
        switch (formType) {
            case 'lesson-plan':
                return validateLessonPlanInput;
            case 'presentation':
                return validatePresentationInput;
            case 'assessment':
                return validateAssessmentInput;
            default:
                throw new Error(`Unknown form type: ${formType}`);
        }
    }, [formType]);

    const validateForm = useCallback((data: Record<string, any>): ValidationResult => {
        const validator = getValidator();
        return validator(data);
    }, [getValidator]);

    const performValidation = useCallback((data: Record<string, any>, immediate = false) => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }

        const validate = () => {
            setValidationState(prev => ({ ...prev, isValidating: true }));

            try {
                const result = validateForm(data);
                setValidationState(prev => ({
                    ...prev,
                    errors: result.errors,
                    warnings: result.warnings,
                    isValid: result.isValid,
                    isValidating: false
                }));
            } catch (error) {
                console.error('Validation error:', error);
                setValidationState(prev => ({
                    ...prev,
                    errors: { general: 'Lỗi xác thực dữ liệu' },
                    warnings: {},
                    isValid: false,
                    isValidating: false
                }));
            }
        };

        if (immediate) {
            validate();
        } else {
            const timer = setTimeout(validate, debounceMs);
            setDebounceTimer(timer);
        }
    }, [validateForm, debounceTimer, debounceMs]);

    const validateField = useCallback((
        fieldName: string,
        fieldValue: any,
        allData: Record<string, any>
    ) => {
        const updatedData = { ...allData, [fieldName]: fieldValue };

        if (validateOnChange) {
            performValidation(updatedData);
        }

        // Mark field as touched
        setValidationState(prev => ({
            ...prev,
            touchedFields: new Set([...prev.touchedFields, fieldName])
        }));
    }, [validateOnChange, performValidation]);

    const validateOnFieldBlur = useCallback((
        fieldName: string,
        allData: Record<string, any>
    ) => {
        if (validateOnBlur) {
            performValidation(allData, true);
        }

        // Mark field as touched
        setValidationState(prev => ({
            ...prev,
            touchedFields: new Set([...prev.touchedFields, fieldName])
        }));
    }, [validateOnBlur, performValidation]);

    const validateEntireForm = useCallback((data: Record<string, any>) => {
        performValidation(data, true);
    }, [performValidation]);

    const clearValidation = useCallback(() => {
        if (debounceTimer) {
            clearTimeout(debounceTimer);
        }
        setValidationState({
            errors: {},
            warnings: {},
            isValid: false,
            isValidating: false,
            touchedFields: new Set()
        });
    }, [debounceTimer]);

    const getFieldError = useCallback((fieldName: string): string | undefined => {
        return validationState.touchedFields.has(fieldName)
            ? validationState.errors[fieldName]
            : undefined;
    }, [validationState.errors, validationState.touchedFields]);

    const getFieldWarning = useCallback((fieldName: string): string | undefined => {
        return validationState.touchedFields.has(fieldName)
            ? validationState.warnings[fieldName]
            : undefined;
    }, [validationState.warnings, validationState.touchedFields]);

    const hasFieldError = useCallback((fieldName: string): boolean => {
        return validationState.touchedFields.has(fieldName) &&
            !!validationState.errors[fieldName];
    }, [validationState.errors, validationState.touchedFields]);

    const hasFieldWarning = useCallback((fieldName: string): boolean => {
        return validationState.touchedFields.has(fieldName) &&
            !!validationState.warnings[fieldName];
    }, [validationState.warnings, validationState.touchedFields]);

    // Initial validation
    useEffect(() => {
        if (Object.keys(initialData).length > 0) {
            performValidation(initialData);
        }
    }, [initialData, performValidation]);

    // Cleanup on unmount
    useEffect(() => {
        return () => {
            if (debounceTimer) {
                clearTimeout(debounceTimer);
            }
        };
    }, [debounceTimer]);

    return {
        // Validation state
        errors: validationState.errors,
        warnings: validationState.warnings,
        isValid: validationState.isValid,
        isValidating: validationState.isValidating,
        touchedFields: validationState.touchedFields,

        // Validation methods
        validateField,
        validateOnFieldBlur,
        validateEntireForm,
        clearValidation,

        // Field-specific helpers
        getFieldError,
        getFieldWarning,
        hasFieldError,
        hasFieldWarning,

        // Direct validation function
        validateForm
    };
}

// Hook for educational standards compliance checking
export function useEducationalStandardsValidation() {
    const [complianceResults, setComplianceResults] = useState<{
        gdpt2018?: { isCompliant: boolean; suggestions: string[] };
        cv5512?: { isCompliant: boolean; suggestions: string[] };
        terminology?: { isValid: boolean; suggestions: string[] };
    }>({});

    const checkCompliance = useCallback(async (content: string, standards: ('gdpt2018' | 'cv5512' | 'terminology')[]) => {
        // Import validation functions dynamically to avoid circular dependencies
        const { validateGDPT2018Compliance, validateCV5512Compliance, validatePedagogicalTerminology } = await import('@/lib/validation');

        const results: typeof complianceResults = {};

        if (standards.includes('gdpt2018')) {
            results.gdpt2018 = validateGDPT2018Compliance(content);
        }

        if (standards.includes('cv5512')) {
            results.cv5512 = validateCV5512Compliance(content);
        }

        if (standards.includes('terminology')) {
            results.terminology = validatePedagogicalTerminology(content);
        }

        setComplianceResults(results);
        return results;
    }, []);

    const clearCompliance = useCallback(() => {
        setComplianceResults({});
    }, []);

    return {
        complianceResults,
        checkCompliance,
        clearCompliance
    };
}

// Hook for real-time character count and limits
export function useInputLimits(maxLength: number, minLength = 0) {
    const [value, setValue] = useState('');
    const [isValid, setIsValid] = useState(true);
    const [warning, setWarning] = useState<string | null>(null);

    const updateValue = useCallback((newValue: string) => {
        setValue(newValue);

        const length = newValue.length;
        const isCurrentlyValid = length >= minLength && length <= maxLength;
        setIsValid(isCurrentlyValid);

        // Set warnings
        if (length > maxLength * 0.9 && length <= maxLength) {
            setWarning(`Còn ${maxLength - length} ký tự`);
        } else if (length > maxLength) {
            setWarning(`Vượt quá ${length - maxLength} ký tự`);
        } else if (length < minLength && length > 0) {
            setWarning(`Cần thêm ${minLength - length} ký tự`);
        } else {
            setWarning(null);
        }
    }, [maxLength, minLength]);

    const reset = useCallback(() => {
        setValue('');
        setIsValid(true);
        setWarning(null);
    }, []);

    return {
        value,
        setValue: updateValue,
        isValid,
        warning,
        characterCount: value.length,
        remainingCharacters: maxLength - value.length,
        progress: Math.min((value.length / maxLength) * 100, 100),
        reset
    };
}