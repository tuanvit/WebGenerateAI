"use client"

import { useState } from 'react'
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

interface PromptGenerationFormProps {
    type: 'lesson-plan' | 'presentation' | 'assessment'
    onSubmit: (data: LessonPlanInput | PresentationInput | AssessmentInput) => Promise<void>
    isLoading?: boolean
}

export default function PromptGenerationForm({ type, onSubmit, isLoading = false }: PromptGenerationFormProps) {
    const { data: session } = useSession()
    const router = useRouter()

    // Common form state
    const [subject, setSubject] = useState('')
    const [gradeLevel, setGradeLevel] = useState<6 | 7 | 8 | 9>(6)
    const [targetTool, setTargetTool] = useState<TargetAITool>(TargetAITool.CHATGPT)
    const [errors, setErrors] = useState<Record<string, string>>({})

    // Lesson plan specific state
    const [lessonName, setLessonName] = useState('')
    const [pedagogicalStandard, setPedagogicalStandard] = useState('')
    const [outputFormat, setOutputFormat] = useState<'four-column' | 'five-column'>('four-column')

    // Presentation specific state
    const [curriculumContent, setCurriculumContent] = useState('')
    const [slideCount, setSlideCount] = useState(9)

    // Assessment specific state
    const [topic, setTopic] = useState('')
    const [questionCount, setQuestionCount] = useState(10)
    const [bloomLevels, setBloomLevels] = useState<BloomTaxonomyLevel[]>([BloomTaxonomyLevel.COMPREHENSION])
    const [questionType, setQuestionType] = useState<'multiple-choice' | 'short-answer' | 'essay'>('multiple-choice')

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {}

        // Common validation
        if (!subject) newErrors.subject = 'Vui lòng chọn môn học'
        if (!targetTool) newErrors.targetTool = 'Vui lòng chọn công cụ AI'

        // Type-specific validation
        if (type === 'lesson-plan') {
            if (!lessonName.trim()) newErrors.lessonName = 'Tên bài học không được để trống'
            if (lessonName.length > 200) newErrors.lessonName = 'Tên bài học quá dài (tối đa 200 ký tự)'
            if (!pedagogicalStandard) newErrors.pedagogicalStandard = 'Vui lòng chọn chuẩn sư phạm'
        }

        if (type === 'presentation') {
            if (!lessonName.trim()) newErrors.lessonName = 'Tên bài học không được để trống'
            if (!curriculumContent.trim()) newErrors.curriculumContent = 'Nội dung chương trình không được để trống'
            if (curriculumContent.length < 10) newErrors.curriculumContent = 'Nội dung chương trình quá ngắn (tối thiểu 10 ký tự)'
            if (curriculumContent.length > 5000) newErrors.curriculumContent = 'Nội dung chương trình quá dài (tối đa 5000 ký tự)'
            if (slideCount < 3 || slideCount > 20) newErrors.slideCount = 'Số slide phải từ 3 đến 20'
        }

        if (type === 'assessment') {
            if (!topic.trim()) newErrors.topic = 'Chủ đề không được để trống'
            if (topic.length > 200) newErrors.topic = 'Chủ đề quá dài (tối đa 200 ký tự)'
            if (questionCount < 1 || questionCount > 50) newErrors.questionCount = 'Số câu hỏi phải từ 1 đến 50'
            if (bloomLevels.length === 0) newErrors.bloomLevels = 'Phải chọn ít nhất một mức độ tư duy'
        }

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!session) {
            router.push('/auth/signin')
            return
        }

        if (!validateForm()) return

        try {
            let formData: LessonPlanInput | PresentationInput | AssessmentInput

            if (type === 'lesson-plan') {
                formData = {
                    subject,
                    gradeLevel,
                    lessonName,
                    pedagogicalStandard,
                    outputFormat,
                    targetTool
                } as LessonPlanInput
            } else if (type === 'presentation') {
                formData = {
                    subject,
                    gradeLevel,
                    lessonName,
                    curriculumContent,
                    slideCount,
                    targetTool
                } as PresentationInput
            } else {
                formData = {
                    subject,
                    gradeLevel,
                    topic,
                    questionCount,
                    bloomLevels,
                    questionType,
                    targetTool
                } as AssessmentInput
            }

            await onSubmit(formData)
        } catch (error) {
            console.error('Form submission error:', error)
            setErrors({ submit: 'Có lỗi xảy ra khi tạo prompt. Vui lòng thử lại.' })
        }
    }

    const handleBloomLevelChange = (level: BloomTaxonomyLevel, checked: boolean) => {
        if (checked) {
            setBloomLevels([...bloomLevels, level])
        } else {
            setBloomLevels(bloomLevels.filter(l => l !== level))
        }
    }

    const getFormTitle = () => {
        switch (type) {
            case 'lesson-plan': return 'Tạo prompt kế hoạch bài dạy'
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

    return (
        <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-md p-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">{getFormTitle()}</h2>

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
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.subject ? 'border-red-500' : 'border-gray-300'
                                }`}
                        >
                            <option value="">Chọn môn học</option>
                            {VIETNAMESE_SUBJECTS.map((subj) => (
                                <option key={subj} value={subj}>{subj}</option>
                            ))}
                        </select>
                        {errors.subject && <p className="mt-1 text-sm text-red-600">{errors.subject}</p>}
                    </div>

                    {/* Grade Level */}
                    <div>
                        <label htmlFor="gradeLevel" className="block text-sm font-medium text-gray-700 mb-2">
                            Khối lớp *
                        </label>
                        <select
                            id="gradeLevel"
                            value={gradeLevel}
                            onChange={(e) => setGradeLevel(Number(e.target.value) as 6 | 7 | 8 | 9)}
                            className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            {GRADE_LEVELS.map((grade) => (
                                <option key={grade} value={grade}>Lớp {grade}</option>
                            ))}
                        </select>
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
                                value={lessonName}
                                onChange={(e) => setLessonName(e.target.value)}
                                placeholder="Ví dụ: Phương trình bậc nhất một ẩn"
                                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.lessonName ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.lessonName && <p className="mt-1 text-sm text-red-600">{errors.lessonName}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="pedagogicalStandard" className="block text-sm font-medium text-gray-700 mb-2">
                                    Chuẩn sư phạm *
                                </label>
                                <select
                                    id="pedagogicalStandard"
                                    value={pedagogicalStandard}
                                    onChange={(e) => setPedagogicalStandard(e.target.value)}
                                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.pedagogicalStandard ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                >
                                    <option value="">Chọn chuẩn sư phạm</option>
                                    {PEDAGOGICAL_STANDARDS.map((standard) => (
                                        <option key={standard} value={standard}>{standard}</option>
                                    ))}
                                </select>
                                {errors.pedagogicalStandard && <p className="mt-1 text-sm text-red-600">{errors.pedagogicalStandard}</p>}
                            </div>

                            <div>
                                <label htmlFor="outputFormat" className="block text-sm font-medium text-gray-700 mb-2">
                                    Định dạng kế hoạch bài dạy
                                </label>
                                <select
                                    id="outputFormat"
                                    value={outputFormat}
                                    onChange={(e) => setOutputFormat(e.target.value as 'four-column' | 'five-column')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                value={lessonName}
                                onChange={(e) => setLessonName(e.target.value)}
                                placeholder="Ví dụ: Phương trình bậc nhất một ẩn"
                                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.lessonName ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.lessonName && <p className="mt-1 text-sm text-red-600">{errors.lessonName}</p>}
                        </div>

                        <div>
                            <label htmlFor="curriculumContent" className="block text-sm font-medium text-gray-700 mb-2">
                                Nội dung chương trình *
                            </label>
                            <textarea
                                id="curriculumContent"
                                value={curriculumContent}
                                onChange={(e) => setCurriculumContent(e.target.value)}
                                rows={6}
                                placeholder="Nhập nội dung chương trình cần tạo slide thuyết trình..."
                                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.curriculumContent ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            <p className="mt-1 text-sm text-gray-500">
                                {curriculumContent.length}/5000 ký tự
                            </p>
                            {errors.curriculumContent && <p className="mt-1 text-sm text-red-600">{errors.curriculumContent}</p>}
                        </div>

                        <div>
                            <label htmlFor="slideCount" className="block text-sm font-medium text-gray-700 mb-2">
                                Số slide mong muốn
                            </label>
                            <input
                                type="number"
                                id="slideCount"
                                value={slideCount}
                                onChange={(e) => setSlideCount(Number(e.target.value))}
                                min="3"
                                max="20"
                                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.slideCount ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            <p className="mt-1 text-sm text-gray-500">Từ 3 đến 20 slide</p>
                            {errors.slideCount && <p className="mt-1 text-sm text-red-600">{errors.slideCount}</p>}
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
                                value={topic}
                                onChange={(e) => setTopic(e.target.value)}
                                placeholder="Ví dụ: Phương trình bậc nhất một ẩn"
                                className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.topic ? 'border-red-500' : 'border-gray-300'
                                    }`}
                            />
                            {errors.topic && <p className="mt-1 text-sm text-red-600">{errors.topic}</p>}
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label htmlFor="questionCount" className="block text-sm font-medium text-gray-700 mb-2">
                                    Số câu hỏi
                                </label>
                                <input
                                    type="number"
                                    id="questionCount"
                                    value={questionCount}
                                    onChange={(e) => setQuestionCount(Number(e.target.value))}
                                    min="1"
                                    max="50"
                                    className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.questionCount ? 'border-red-500' : 'border-gray-300'
                                        }`}
                                />
                                {errors.questionCount && <p className="mt-1 text-sm text-red-600">{errors.questionCount}</p>}
                            </div>

                            <div>
                                <label htmlFor="questionType" className="block text-sm font-medium text-gray-700 mb-2">
                                    Loại câu hỏi
                                </label>
                                <select
                                    id="questionType"
                                    value={questionType}
                                    onChange={(e) => setQuestionType(e.target.value as 'multiple-choice' | 'short-answer' | 'essay')}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                            checked={bloomLevels.includes(level as BloomTaxonomyLevel)}
                                            onChange={(e) => handleBloomLevelChange(level as BloomTaxonomyLevel, e.target.checked)}
                                            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                                        />
                                        <span className="ml-2 text-sm text-gray-700">{label}</span>
                                    </label>
                                ))}
                            </div>
                            {errors.bloomLevels && <p className="mt-1 text-sm text-red-600">{errors.bloomLevels}</p>}
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
                        value={targetTool}
                        onChange={(e) => setTargetTool(e.target.value as TargetAITool)}
                        className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.targetTool ? 'border-red-500' : 'border-gray-300'
                            }`}
                    >
                        {Object.entries(toolLabels).map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                        ))}
                    </select>
                    {errors.targetTool && <p className="mt-1 text-sm text-red-600">{errors.targetTool}</p>}
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
                        disabled={isLoading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {isLoading ? 'Đang tạo...' : 'Tạo prompt'}
                    </button>
                </div>

                {errors.submit && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600">{errors.submit}</p>
                    </div>
                )}
            </form>
        </div>
    )
}