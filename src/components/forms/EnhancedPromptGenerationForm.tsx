"use client"

import { useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useSession } from 'next-auth/react'
import {
    LessonPlanInput,
    PresentationInput,
    AssessmentInput,
    TargetAITool,
    BloomTaxonomyLevel,
    PEDAGOGICAL_STANDARDS
} from '@/types/prompt'
import { VIETNAMESE_SUBJECTS, GRADE_LEVELS } from '@/types/user'
import { useFormValidation, useEducationalStandardsValidation, useInputLimits } from '@/hooks/useFormValidation'
import { useEducationalValidation } from '@/hooks/useEducationalValidation'
import { handleClientError } from '@/lib/error-handling'
import ComplianceIndicator from '@/components/validation/ComplianceIndicator'

interface EnhancedPromptGenerationFormProps {
    type: 'lesson-plan' | 'presentation' | 'assessment'
    onSubmit: (data: LessonPlanInput | PresentationInput | AssessmentInput) => Promise<void>
    isLoading?: boolean
}

export default function EnhancedPromptGenerationForm({
    type,
    onSubmit,
    isLoading = false
}: EnhancedPromptGenerationFormProps) {
    const { data: session } = useSession()
    const router = useRouter()

    // Form state
    const [formData, setFormData] = useState<Record<string, any>>({
        subject: '',
        gradeLevel: 6,
        targetTool: TargetAITool.CHATGPT,
        // Lesson plan specific
        lessonName: '',
        pedagogicalStandard: '',
        outputFormat: 'four-column',
        // Presentation specific
        curriculumContent: '',
        slideCount: 9,
        // Assessment specific
        topic: '',
        questionCount: 10,
        bloomLevels: [BloomTaxonomyLevel.COMPREHENSION],
        questionType: 'multiple-choice'
    })

    // Validation hooks
    const {
        errors,
        warnings,
        isValid,
        isValidating,
        validateField,
        validateOnFieldBlur,
        validateEntireForm,
        getFieldError,
        getFieldWarning,
        hasFieldError,
        hasFieldWarning
    } = useFormValidation(type, formData)

    const { complianceResults, checkCompliance } = useEducationalStandardsValidation()
    const { validateLessonPlan, validatePresentation, validateAssessment } = useEducationalValidation()

    // Input limits for text fields
    const lessonNameLimits = useInputLimits(200, 1)
    const curriculumContentLimits = useInputLimits(5000, 10)
    const topicLimits = useInputLimits(200, 1)

    // Form submission state
    const [submitError, setSubmitError] = useState<string | null>(null)

    const updateFormData = useCallback((field: string, value: any) => {
        const newFormData = { ...formData, [field]: value }
        setFormData(newFormData)
        validateField(field, value, newFormData)

        // Update input limits
        if (field === 'lessonName') {
            lessonNameLimits.setValue(value)
        } else if (field === 'curriculumContent') {
            curriculumContentLimits.setValue(value)
            // Check educational standards compliance
            if (value.length > 50) {
                checkCompliance(value, ['gdpt2018', 'cv5512', 'terminology'])
            }
        } else if (field === 'topic') {
            topicLimits.setValue(value)
        }
    }, [formData, validateField, lessonNameLimits, curriculumContentLimits, topicLimits, checkCompliance])

    const handleFieldBlur = useCallback((field: string) => {
        validateOnFieldBlur(field, formData)
    }, [validateOnFieldBlur, formData])

    const handleBloomLevelChange = useCallback((level: BloomTaxonomyLevel, checked: boolean) => {
        const currentLevels = formData.bloomLevels || []
        const newLevels = checked
            ? [...currentLevels, level]
            : currentLevels.filter((l: BloomTaxonomyLevel) => l !== level)

        updateFormData('bloomLevels', newLevels)
    }, [formData.bloomLevels, updateFormData])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setSubmitError(null)

        if (!session) {
            router.push('/auth/signin')
            return
        }

        // Final validation
        validateEntireForm(formData)

        if (!isValid) {
            setSubmitError('Vui lòng kiểm tra và sửa các lỗi trong biểu mẫu')
            return
        }

        // Educational standards validation
        let educationalValidation;
        if (type === 'lesson-plan') {
            educationalValidation = await validateLessonPlan({
                subject: formData.subject,
                gradeLevel: formData.gradeLevel,
                lessonName: formData.lessonName,
                pedagogicalStandard: formData.pedagogicalStandard
            });
        } else if (type === 'presentation') {
            educationalValidation = await validatePresentation({
                subject: formData.subject,
                gradeLevel: formData.gradeLevel,
                lessonName: formData.lessonName,
                curriculumContent: formData.curriculumContent,
                slideCount: formData.slideCount
            });
        } else if (type === 'assessment') {
            educationalValidation = await validateAssessment({
                subject: formData.subject,
                gradeLevel: formData.gradeLevel,
                topic: formData.topic,
                questionCount: formData.questionCount,
                bloomLevels: formData.bloomLevels,
                questionType: formData.questionType
            });
        }

        if (educationalValidation && !educationalValidation.isValid) {
            setSubmitError(`Chuẩn giáo dục: ${educationalValidation.errors.join(', ')}`);
            return;
        }

        try {
            let submitData: LessonPlanInput | PresentationInput | AssessmentInput

            if (type === 'lesson-plan') {
                submitData = {
                    subject: formData.subject,
                    gradeLevel: formData.gradeLevel,
                    lessonName: formData.lessonName,
                    pedagogicalStandard: formData.pedagogicalStandard,
                    outputFormat: formData.outputFormat,
                    targetTool: formData.targetTool
                } as LessonPlanInput
            } else if (type === 'presentation') {
                submitData = {
                    subject: formData.subject,
                    gradeLevel: formData.gradeLevel,
                    lessonName: formData.lessonName,
                    curriculumContent: formData.curriculumContent,
                    slideCount: formData.slideCount,
                    targetTool: formData.targetTool
                } as PresentationInput
            } else {
                submitData = {
                    subject: formData.subject,
                    gradeLevel: formData.gradeLevel,
                    topic: formData.topic,
                    questionCount: formData.questionCount,
                    bloomLevels: formData.bloomLevels,
                    questionType: formData.questionType,
                    targetTool: formData.targetTool
                } as AssessmentInput
            }

            await onSubmit(submitData)
        } catch (error) {
            const errorMessage = handleClientError(error)
            setSubmitError(errorMessage)
        }
    }

    const getFormTitle = () => {
        switch (type) {
            case 'lesson-plan': return 'Tạo prompt giáo án'
            case 'presentation': return 'Tạo prompt slide thuyết trình'
            case 'assessment': return 'Tạo prompt câu hỏi đánh giá'
            default: return 'Tạo prompt'
        }
    }

    const bloomLevelLabels = {
        [BloomTaxonomyLevel.RECOGNITION]: 'Nhận biết',
        [BloomTaxonomyLevel.COMPREHENSION]: 'Thông hiểu',
        [BloomTaxonomyLevel.APPLICATION]: 'Vận dụng',
        [BloomTaxonomyLevel.ANALYSIS]: 'Phân tích',
        [BloomTaxonomyLevel.SYNTHESIS]: 'Tổng hợp',
        [BloomTaxonomyLevel.EVALUATION]: 'Đánh giá'
    }

    const toolLabels = {
        [TargetAITool.CHATGPT]: 'ChatGPT',
        [TargetAITool.GEMINI]: 'Gemini',
        [TargetAITool.COPILOT]: 'Microsoft Copilot',
        [TargetAITool.CANVA_AI]: 'Canva AI',
        [TargetAITool.GAMMA_APP]: 'Gamma App'
    }

    const getFieldClassName = (fieldName: string) => {
        const baseClass = "w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
        if (hasFieldError(fieldName)) {
            return `${baseClass} border-red-500 focus:ring-red-500 focus:border-red-500`
        }
        if (hasFieldWarning(fieldName)) {
            return `${baseClass} border-yellow-500 focus:ring-yellow-500 focus:border-yellow-500`
        }
        return `${baseClass} border-gray-300`
    }

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{getFormTitle()}</h2>

            {isValidating && (
                <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
                    <p className="text-sm text-blue-600">Đang kiểm tra dữ liệu...</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
                {/* Common Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Subject */}
                    <div>
                        <label htmlFor="subject" className="block text-sm font-medium text-gray-700 mb-2">
                            Môn học *
                        </label>
                        <select
                            id="subject"
                            value={formData.subject}
                            onChange={(e) => updateFormData('subject', e.target.value)}
                            onBlur={() => handleFieldBlur('subject')}
                            className={getFieldClassName('subject')}
                        >
                            <option value="">Chọn môn học</option>
                            {VIETNAMESE_SUBJECTS.map((subj) => (
                                <option key={subj} value={subj}>{subj}</option>
                            ))}
                        </select>
                        {getFieldError('subject') && (
                            <p className="mt-1 text-sm text-red-600">{getFieldError('subject')}</p>
                        )}
                        {getFieldWarning('subject') && (
                            <p className="mt-1 text-sm text-yellow-600">{getFieldWarning('subject')}</p>
                        )}
                    </div>

                    {/* Grade Level */}
                    <div>
                        <label htmlFor="gradeLevel" className="block text-sm font-medium text-gray-700 mb-2">
                            Khối lớp *
                        </label>
                        <select
                            id="gradeLevel"
                            value={formData.gradeLevel}
                            onChange={(e) => updateFormData('gradeLevel', Number(e.target.value))}
                            onBlur={() => handleFieldBlur('gradeLevel')}
                            className={getFieldClassName('gradeLevel')}
                        >
                            {GRADE_LEVELS.map((grade) => (
                                <option key={grade} value={grade}>Lớp {grade}</option>
                            ))}
                        </select>
                        {getFieldError('gradeLevel') && (
                            <p className="mt-1 text-sm text-red-600">{getFieldError('gradeLevel')}</p>
                        )}
                    </div>
                </div>

                {/* Type-specific Fields */}
                {type === 'lesson-plan' && (
                    <>
                        <div>
                            <label htmlFor="lessonName" className="block text-sm font-medium text-gray-700 mb-2">
                                Tên bài học *
                            </label>
                            <input
                                type="text"
                                id="lessonName"
                                value={formData.lessonName}
                                onChange={(e) => updateFormData('lessonName', e.target.value)}
                                onBlur={() => handleFieldBlur('lessonName')}
                                placeholder="Ví dụ: Phương trình bậc nhất một ẩn"
                                className={getFieldClassName('lessonName')}
                            />
                            <div className="flex justify-between items-center mt-1">
                                <div>
                                    {getFieldError('lessonName') && (
                                        <p className="text-sm text-red-600">{getFieldError('lessonName')}</p>
                                    )}
                                    {getFieldWarning('lessonName') && (
                                        <p className="text-sm text-yellow-600">{getFieldWarning('lessonName')}</p>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500">
                                    {formData.lessonName.length}/200
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="pedagogicalStandard" className="block text-sm font-medium text-gray-700 mb-2">
                                    Chuẩn sư phạm *
                                </label>
                                <select
                                    id="pedagogicalStandard"
                                    value={formData.pedagogicalStandard}
                                    onChange={(e) => updateFormData('pedagogicalStandard', e.target.value)}
                                    onBlur={() => handleFieldBlur('pedagogicalStandard')}
                                    className={getFieldClassName('pedagogicalStandard')}
                                >
                                    <option value="">Chọn chuẩn sư phạm</option>
                                    {PEDAGOGICAL_STANDARDS.map((standard) => (
                                        <option key={standard} value={standard}>{standard}</option>
                                    ))}
                                </select>
                                {getFieldError('pedagogicalStandard') && (
                                    <p className="mt-1 text-sm text-red-600">{getFieldError('pedagogicalStandard')}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="outputFormat" className="block text-sm font-medium text-gray-700 mb-2">
                                    Định dạng giáo án
                                </label>
                                <select
                                    id="outputFormat"
                                    value={formData.outputFormat}
                                    onChange={(e) => updateFormData('outputFormat', e.target.value)}
                                    className={getFieldClassName('outputFormat')}
                                >
                                    <option value="four-column">4 cột</option>
                                    <option value="five-column">5 cột</option>
                                </select>
                            </div>
                        </div>
                    </>
                )}

                {type === 'presentation' && (
                    <>
                        <div>
                            <label htmlFor="lessonName" className="block text-sm font-medium text-gray-700 mb-2">
                                Tên bài học *
                            </label>
                            <input
                                type="text"
                                id="lessonName"
                                value={formData.lessonName}
                                onChange={(e) => updateFormData('lessonName', e.target.value)}
                                onBlur={() => handleFieldBlur('lessonName')}
                                placeholder="Ví dụ: Phương trình bậc nhất một ẩn"
                                className={getFieldClassName('lessonName')}
                            />
                            {getFieldError('lessonName') && (
                                <p className="mt-1 text-sm text-red-600">{getFieldError('lessonName')}</p>
                            )}
                        </div>

                        <div>
                            <label htmlFor="curriculumContent" className="block text-sm font-medium text-gray-700 mb-2">
                                Nội dung chương trình *
                            </label>
                            <textarea
                                id="curriculumContent"
                                value={formData.curriculumContent}
                                onChange={(e) => updateFormData('curriculumContent', e.target.value)}
                                onBlur={() => handleFieldBlur('curriculumContent')}
                                rows={6}
                                placeholder="Nhập nội dung chương trình cần tạo slide thuyết trình..."
                                className={getFieldClassName('curriculumContent')}
                            />
                            <div className="flex justify-between items-start mt-1">
                                <div className="flex-1">
                                    {getFieldError('curriculumContent') && (
                                        <p className="text-sm text-red-600">{getFieldError('curriculumContent')}</p>
                                    )}
                                    {getFieldWarning('curriculumContent') && (
                                        <p className="text-sm text-yellow-600">{getFieldWarning('curriculumContent')}</p>
                                    )}

                                    {/* Educational standards compliance */}
                                    {complianceResults.gdpt2018 && !complianceResults.gdpt2018.isCompliant && (
                                        <div className="mt-2 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                            <p className="text-sm text-yellow-800 font-medium">Gợi ý GDPT 2018:</p>
                                            <ul className="text-sm text-yellow-700 mt-1">
                                                {complianceResults.gdpt2018.suggestions.map((suggestion, index) => (
                                                    <li key={index}>• {suggestion}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}

                                    {complianceResults.cv5512 && !complianceResults.cv5512.isCompliant && (
                                        <div className="mt-2 p-2 bg-blue-50 border border-blue-200 rounded">
                                            <p className="text-sm text-blue-800 font-medium">Gợi ý CV 5512:</p>
                                            <ul className="text-sm text-blue-700 mt-1">
                                                {complianceResults.cv5512.suggestions.map((suggestion, index) => (
                                                    <li key={index}>• {suggestion}</li>
                                                ))}
                                            </ul>
                                        </div>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500 ml-4">
                                    {formData.curriculumContent.length}/5000
                                </p>
                            </div>

                            {/* Real-time compliance indicator */}
                            <ComplianceIndicator
                                content={formData.curriculumContent}
                                gradeLevel={formData.gradeLevel}
                                subject={formData.subject}
                            />
                        </div>

                        <div>
                            <label htmlFor="slideCount" className="block text-sm font-medium text-gray-700 mb-2">
                                Số slide mong muốn
                            </label>
                            <input
                                type="number"
                                id="slideCount"
                                value={formData.slideCount}
                                onChange={(e) => updateFormData('slideCount', Number(e.target.value))}
                                onBlur={() => handleFieldBlur('slideCount')}
                                min="3"
                                max="20"
                                className={getFieldClassName('slideCount')}
                            />
                            <p className="mt-1 text-sm text-gray-500">Từ 3 đến 20 slide</p>
                            {getFieldError('slideCount') && (
                                <p className="mt-1 text-sm text-red-600">{getFieldError('slideCount')}</p>
                            )}
                        </div>
                    </>
                )}

                {type === 'assessment' && (
                    <>
                        <div>
                            <label htmlFor="topic" className="block text-sm font-medium text-gray-700 mb-2">
                                Chủ đề *
                            </label>
                            <input
                                type="text"
                                id="topic"
                                value={formData.topic}
                                onChange={(e) => updateFormData('topic', e.target.value)}
                                onBlur={() => handleFieldBlur('topic')}
                                placeholder="Ví dụ: Phương trình bậc nhất một ẩn"
                                className={getFieldClassName('topic')}
                            />
                            <div className="flex justify-between items-center mt-1">
                                <div>
                                    {getFieldError('topic') && (
                                        <p className="text-sm text-red-600">{getFieldError('topic')}</p>
                                    )}
                                </div>
                                <p className="text-sm text-gray-500">
                                    {formData.topic.length}/200
                                </p>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="questionCount" className="block text-sm font-medium text-gray-700 mb-2">
                                    Số câu hỏi
                                </label>
                                <input
                                    type="number"
                                    id="questionCount"
                                    value={formData.questionCount}
                                    onChange={(e) => updateFormData('questionCount', Number(e.target.value))}
                                    onBlur={() => handleFieldBlur('questionCount')}
                                    min="1"
                                    max="50"
                                    className={getFieldClassName('questionCount')}
                                />
                                {getFieldError('questionCount') && (
                                    <p className="mt-1 text-sm text-red-600">{getFieldError('questionCount')}</p>
                                )}
                            </div>

                            <div>
                                <label htmlFor="questionType" className="block text-sm font-medium text-gray-700 mb-2">
                                    Loại câu hỏi
                                </label>
                                <select
                                    id="questionType"
                                    value={formData.questionType}
                                    onChange={(e) => updateFormData('questionType', e.target.value)}
                                    className={getFieldClassName('questionType')}
                                >
                                    <option value="multiple-choice">Trắc nghiệm</option>
                                    <option value="short-answer">Tự luận ngắn</option>
                                    <option value="essay">Tự luận dài</option>
                                </select>
                            </div>
                        </div>

                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Mức độ tư duy (Bloom's Taxonomy) *
                            </label>
                            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                {Object.entries(bloomLevelLabels).map(([level, label]) => (
                                    <label key={level} className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.bloomLevels?.includes(level as BloomTaxonomyLevel) || false}
                                            onChange={(e) => handleBloomLevelChange(level as BloomTaxonomyLevel, e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">{label}</span>
                                    </label>
                                ))}
                            </div>
                            {getFieldError('bloomLevels') && (
                                <p className="mt-1 text-sm text-red-600">{getFieldError('bloomLevels')}</p>
                            )}
                            {getFieldWarning('bloomLevels') && (
                                <p className="mt-1 text-sm text-yellow-600">{getFieldWarning('bloomLevels')}</p>
                            )}
                        </div>
                    </>
                )}

                {/* Target AI Tool */}
                <div>
                    <label htmlFor="targetTool" className="block text-sm font-medium text-gray-700 mb-2">
                        Công cụ AI đích *
                    </label>
                    <select
                        id="targetTool"
                        value={formData.targetTool}
                        onChange={(e) => updateFormData('targetTool', e.target.value)}
                        className={getFieldClassName('targetTool')}
                    >
                        {Object.entries(toolLabels).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                    {getFieldError('targetTool') && (
                        <p className="mt-1 text-sm text-red-600">{getFieldError('targetTool')}</p>
                    )}
                </div>

                {/* Submit Button */}
                <div className="flex justify-end space-x-4">
                    <button
                        type="button"
                        onClick={() => router.back()}
                        className="px-6 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                        Hủy
                    </button>
                    <button
                        type="submit"
                        disabled={isLoading || !isValid}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Đang tạo...' : 'Tạo prompt'}
                    </button>
                </div>

                {/* Error Messages */}
                {submitError && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600">{submitError}</p>
                    </div>
                )}

                {/* Form validation summary */}
                {!isValid && Object.keys(errors).length > 0 && (
                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-md">
                        <p className="text-sm text-yellow-800 font-medium mb-2">
                            Vui lòng kiểm tra các trường sau:
                        </p>
                        <ul className="text-sm text-yellow-700">
                            {Object.entries(errors).map(([field, error]) => (
                                <li key={field}>• {error}</li>
                            ))}
                        </ul>
                    </div>
                )}
            </form>
        </div>
    )
}