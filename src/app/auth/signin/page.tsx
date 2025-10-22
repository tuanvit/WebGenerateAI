"use client"

import { signIn, getSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"

export default function SignIn() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        // Check if user is already signed in
        getSession().then((session) => {
            if (session) {
                router.push("/")
            }
        })
    }, [router])

    const handleGoogleSignIn = async () => {
        setIsLoading(true)
        try {
            await signIn("google", { callbackUrl: "/" })
        } catch (error) {
            console.error("Lỗi đăng nhập:", error)
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Đăng nhập vào hệ thống
                    </h2>
                    <p className="mt-2 text-center text-sm text-gray-600">
                        AI Prompt Generator for Teachers
                    </p>
                </div>
                <div className="mt-8 space-y-6">
                    <div>
                        <button
                            onClick={handleGoogleSignIn}
                            disabled={isLoading}
                            className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <span>Đang đăng nhập...</span>
                            ) : (
                                <span>Đăng nhập với Google</span>
                            )}
                        </button>
                    </div>
                    <div className="text-center space-y-2">
                        <p className="text-sm text-gray-600">
                            Dành cho giáo viên Việt Nam (lớp 6-9)
                        </p>
                        <div className="border-t pt-4">
                            <a
                                href="/auth/demo"
                                className="text-blue-600 hover:text-blue-500 text-sm underline"
                            >
                                Hoặc sử dụng tài khoản demo để test
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}