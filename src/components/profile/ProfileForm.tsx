"use client"

import { useState, useEffect } from "react"
import { User, VIETNAMESE_SUBJECTS, GRADE_LEVELS } from "@/types/user"

interface ProfileFormProps {
    user: User | null
    onUpdate: (user: User) => void
}

export default function ProfileForm({ user, onUpdate }: ProfileFormProps) {
    const [formData, setFormData] = useState({
        name: "",
        email: "",
        school: "",
        subjects: [] as string[],
        gradeLevel: [] as number[]
    })
    const [isLoading, setIsLoading] = useState(false)
    const [message, setMessage] = useState<{ type: "success" | "error", text: string } | null>(null)

    useEffect(() => {
        if (user) {
            setFormData({
                name: user.name || "",
                email: user.email || "",
                school: user.school || "",
                subjects: user.subjects || [],
                gradeLevel: user.gradeLevel || []
            })
        }
    }, [user])

    const handleSubjectChange = (subject: string, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            subjects: checked
                ? [...prev.subjects, subject]
                : prev.subjects.filter(s => s !== subject)
        }))
    }

    const handleGradeLevelChange = (grade: number, checked: boolean) => {
        setFormData(prev => ({
            ...prev,
            gradeLevel: checked
                ? [...prev.gradeLevel, grade]
                : prev.gradeLevel.filter(g => g !== grade)
        }))
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)
        setMessage(null)

        // Validation
        if (!formData.name.trim()) {
            setMessage({ type: "error", text: "Vui lòng nhập họ tên" })
            setIsLoading(false)
            return
        }

        if (formData.subjects.length === 0) {
            setMessage({ type: "error", text: "Vui lòng chọn ít nhất một môn học" })
            setIsLoading(false)
            return
        }

        if (formData.gradeLevel.length === 0) {
            setMessage({ type: "error", text: "Vui lòng chọn ít nhất một khối lớp" })
            setIsLoading(false)
            return
        }

        try {
            const response = await fetch(`/api/users/by-email/${encodeURIComponent(user?.email || '')}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify(formData)
            })

            if (response.ok) {
                const updatedUser = await response.json()
                onUpdate(updatedUser)
                setMessage({ type: "success", text: "Cập nhật thông tin thành công!" })
            } else {
                const errorData = await response.json()
                setMessage({ type: "error", text: errorData.message || "Có lỗi xảy ra" })
            }
        } catch {
            setMessage({ type: "error", text: "Có lỗi xảy ra khi cập nhật thông tin" })
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-6">
            {message && (
                <div className={`p-4 rounded-md ${message.type === "success"
                    ? "bg-green-50 border border-green-200 text-green-700"
                    : "bg-red-50 border border-red-200 text-red-700"
                    }`}>
                    {message.text}
                </div>
            )}

            <div>
                <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                    Họ và tên *
                </label>
                <input
                    type="text"
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    required
                />
            </div>

            <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                    Email
                </label>
                <input
                    type="email"
                    id="email"
                    value={formData.email}
                    disabled
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 bg-gray-50 text-gray-500"
                />
                <p className="mt-1 text-sm text-gray-500">Email không thể thay đổi</p>
            </div>

            <div>
                <label htmlFor="school" className="block text-sm font-medium text-gray-700">
                    Trường học
                </label>
                <input
                    type="text"
                    id="school"
                    value={formData.school}
                    onChange={(e) => setFormData(prev => ({ ...prev, school: e.target.value }))}
                    className="mt-1 block w-full border border-gray-300 rounded-md px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Tên trường học của bạn"
                />
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Môn học giảng dạy *
                </label>
                <div className="grid grid-cols-2 gap-3">
                    {VIETNAMESE_SUBJECTS.map((subject) => (
                        <label key={subject} className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.subjects.includes(subject)}
                                onChange={(e) => handleSubjectChange(subject, e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">{subject}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                    Khối lớp giảng dạy * (Chỉ hỗ trợ lớp 6-9)
                </label>
                <div className="flex gap-4">
                    {GRADE_LEVELS.map((grade) => (
                        <label key={grade} className="flex items-center">
                            <input
                                type="checkbox"
                                checked={formData.gradeLevel.includes(grade)}
                                onChange={(e) => handleGradeLevelChange(grade, e.target.checked)}
                                className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                            />
                            <span className="ml-2 text-sm text-gray-700">Lớp {grade}</span>
                        </label>
                    ))}
                </div>
            </div>

            <div className="flex justify-end">
                <button
                    type="submit"
                    disabled={isLoading}
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {isLoading ? "Đang cập nhật..." : "Cập nhật thông tin"}
                </button>
            </div>
        </form>
    )
}