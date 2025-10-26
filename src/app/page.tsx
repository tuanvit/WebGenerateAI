"use client"

import { useSession } from "next-auth/react"
import Link from "next/link"
import Header from "@/components/layout/Header"

export default function Home() {
  const { data: session, status } = useSession()

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      <Header />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Hero Section */}
        <div className="text-center mb-20">
          <div className="mb-8">
            <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-medium bg-gradient-to-r from-blue-100 to-purple-100 text-blue-800 mb-4">
              🎯 Dành riêng cho giáo viên Việt Nam
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6">
            <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-blue-800 bg-clip-text text-transparent">
              PromptEdu
            </span>
            <span className="block text-3xl md:text-4xl text-gray-700 font-normal mt-2">
              Tạo prompt AI chuyên nghiệp
            </span>
          </h1>

          <p className="mt-6 max-w-3xl mx-auto text-lg md:text-xl text-gray-600 leading-relaxed">
            Hệ thống thông minh giúp giáo viên tạo prompt AI cho kế hoạch bài dạy, slide thuyết trình và đánh giá.
            <span className="font-semibold text-blue-600">Tuân thủ chuẩn GDPT 2018 và Công văn 5512.</span>
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center items-center">
            {status === "loading" ? (
              <div className="animate-pulse flex space-x-4">
                <div className="h-14 w-40 bg-gray-200 rounded-xl"></div>
                <div className="h-14 w-32 bg-gray-200 rounded-xl"></div>
              </div>
            ) : session ? (
              <>
                <Link
                  href="/create-prompt"
                  className="group relative px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-purple-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <span className="flex items-center">
                    ✨ Tạo Prompt Chuyên Nghiệp
                    <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>
                <Link
                  href="/templates"
                  className="px-6 py-4 text-gray-700 font-medium rounded-xl border-2 border-gray-200 hover:border-purple-300 hover:bg-purple-50 transition-all duration-200"
                >
                  📚 Xem Prompt Mẫu
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth/simple"
                  className="group relative px-8 py-4 bg-gradient-to-r  from-green-500 to-emerald-600 text-white font-semibold rounded-xl  hover:from-green-600 hover:to-emerald-700 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
                >
                  <span className="flex items-center">
                    🔐 Đăng nhập tới trang Admin
                    <svg className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </span>
                </Link>
                <Link
                  href="/auth/signin"
                  className="px-6 py-4 text-gray-700 font-medium rounded-xl border-2 border-gray-200 hover:border-blue-300 hover:bg-blue-50 transition-all duration-200"
                >
                  Google OAuth
                </Link>
              </>
            )}
          </div>
        </div>

        {/* Features section */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          <div className="group p-8 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 hover:shadow-xl hover:shadow-blue-100/50 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">📝 Kế hoạch bài dạy chuyên nghiệp</h3>
            <p className="text-gray-600 leading-relaxed">
              Tạo prompt AI để sinh kế hoạch bài dạy 4-5 cột theo chuẩn Công văn 5512, phù hợp với từng môn học và lớp
            </p>
          </div>

          <div className="group p-8 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 hover:shadow-xl hover:shadow-purple-100/50 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-purple-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 4V2a1 1 0 011-1h8a1 1 0 011 1v2h4a1 1 0 110 2h-1v12a2 2 0 01-2 2H6a2 2 0 01-2-2V6H3a1 1 0 110-2h4z" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">🎨 Slide thuyết trình</h3>
            <p className="text-gray-600 leading-relaxed">
              Tạo dàn ý slide với hình ảnh gợi ý cho bài giảng sinh động, phù hợp với độ tuổi học sinh
            </p>
          </div>

          <div className="group p-8 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 hover:shadow-xl hover:shadow-green-100/50 transition-all duration-300">
            <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-green-600 rounded-2xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
              <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="text-xl font-bold text-gray-900 mb-3">📊 Câu hỏi đánh giá</h3>
            <p className="text-gray-600 leading-relaxed">
              Tạo câu hỏi theo thang Bloom với đáp án và thang điểm, đánh giá năng lực học sinh toàn diện
            </p>
          </div>
        </div>

        {/* Supported tools */}
        <div className="text-center">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">
            Tích hợp với các công cụ AI hàng đầu
          </h2>
          <p className="text-gray-600 mb-12 max-w-2xl mx-auto">
            Mở trực tiếp và sử dụng prompt với các nền tảng AI phổ biến nhất
          </p>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-6">
            {[
              { name: 'ChatGPT', icon: '🤖', color: 'from-green-400 to-green-600' },
              { name: 'Gemini', icon: '✨', color: 'from-blue-400 to-blue-600' },
              { name: 'Copilot', icon: '🚀', color: 'from-purple-400 to-purple-600' },
              { name: 'Canva AI', icon: '🎨', color: 'from-pink-400 to-pink-600' },
              { name: 'Gamma', icon: '📊', color: 'from-indigo-400 to-indigo-600' }
            ].map((tool, index) => (
              <div key={index} className="group p-6 bg-white/60 backdrop-blur-sm rounded-2xl border border-gray-200/50 hover:shadow-lg transition-all duration-300">
                <div className={`w-12 h-12 bg-gradient-to-br ${tool.color} rounded-xl flex items-center justify-center mb-3 mx-auto group-hover:scale-110 transition-transform duration-300`}>
                  <span className="text-2xl">{tool.icon}</span>
                </div>
                <h3 className="font-semibold text-gray-900">{tool.name}</h3>
              </div>
            ))}
          </div>
        </div>
      </main>
    </div>
  )
}
