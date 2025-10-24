"use client"

import { useSearchParams } from "next/navigation"
import Link from "next/link"
import { Suspense } from "react"

function AuthErrorContent() {
    const searchParams = useSearchParams()
    const error = searchParams.get("error")

    const getErrorMessage = (error: string | null) => {
        switch (error) {
            case "Configuration":
                return "Có lỗi cấu hình hệ thống. Vui lòng liên hệ quản trị viên."
            case "AccessDenied":
                return "Truy cập bị từ chối. Bạn không có quyền truy cập vào hệ thống này."
            case "Verification":
                return "Không thể xác minh tài khoản. Vui lòng thử lại."
            case "OAuthCallback":
                return "Lỗi OAuth callback. Kiểm tra cấu hình Google Cloud Console."
            case "OAuthSignin":
                return "Lỗi OAuth signin. Kiểm tra GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET."
            case "OAuthCreateAccount":
                return "Không thể tạo tài khoản OAuth."
            case "Default":
            default:
                return "Có lỗi xảy ra trong quá trình đăng nhập. Vui lòng thử lại."
        }
    }

    const getErrorDetails = (error: string | null) => {
        switch (error) {
            case "OAuthCallback":
                return "Kiểm tra Authorized redirect URIs trong Google Cloud Console phải có: http://localhost:3001/api/auth/callback/google"
            case "OAuthSignin":
                return "Kiểm tra GOOGLE_CLIENT_ID và GOOGLE_CLIENT_SECRET trong file .env"
            default:
                return null
        }
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-md w-full space-y-8">
                <div>
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Lỗi đăng nhập
                    </h2>
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md">
                        <p className="text-sm text-red-600">
                            {getErrorMessage(error)}
                        </p>
                        {error && (
                            <p className="mt-2 text-xs text-red-500">
                                Mã lỗi: {error}
                            </p>
                        )}
                        {getErrorDetails(error) && (
                            <div className="mt-3 p-2 bg-yellow-50 border border-yellow-200 rounded">
                                <p className="text-xs text-yellow-800">
                                    <strong>Hướng dẫn khắc phục:</strong><br />
                                    {getErrorDetails(error)}
                                </p>
                            </div>
                        )}
                    </div>
                </div>
                <div className="mt-8 space-y-4">
                    <Link
                        href="/auth/demo"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                        Sử dụng tài khoản Demo
                    </Link>
                    <Link
                        href="/auth/signin"
                        className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Thử lại đăng nhập Google
                    </Link>
                    <Link
                        href="/"
                        className="w-full flex justify-center py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                        Về trang chủ
                    </Link>
                </div>
            </div>
        </div>
    )
}

export default function AuthError() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <AuthErrorContent />
        </Suspense>
    )
}