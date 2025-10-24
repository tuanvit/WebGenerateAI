import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Settings - Admin Panel',
    description: 'Cấu hình hệ thống và các tùy chọn quản trị',
};

export default function AdminSettingsPage() {
    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="border-b border-gray-200 pb-4">
                <h1 className="text-2xl font-bold text-gray-900">Cài đặt hệ thống</h1>
                <p className="mt-2 text-gray-600">
                    Cấu hình hệ thống, backup/restore dữ liệu và các tùy chọn quản trị khác
                </p>
            </div>

            {/* Settings content will be implemented in later tasks */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Backup & Restore */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M9 19l3 3m0 0l3-3m-3 3V10" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Backup & Restore</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                        Sao lưu và khôi phục dữ liệu AI Tools và Templates
                    </p>
                    <div className="text-center py-4">
                        <p className="text-sm text-gray-500">Sẽ được triển khai trong task 7</p>
                    </div>
                </div>

                {/* Audit Logs */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Audit Logs</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                        Xem lịch sử hoạt động và thay đổi của admin
                    </p>
                    <div className="text-center py-4">
                        <p className="text-sm text-gray-500">Sẽ được triển khai trong task 9.3</p>
                    </div>
                </div>

                {/* System Configuration */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Cấu hình hệ thống</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                        Cài đặt chung cho hệ thống và tùy chọn admin
                    </p>
                    <div className="text-center py-4">
                        <p className="text-sm text-gray-500">Sẽ được triển khai trong các task tiếp theo</p>
                    </div>
                </div>

                {/* User Management */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center mb-4">
                        <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mr-3">
                            <svg className="w-5 h-5 text-orange-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197m13.5-9a2.5 2.5 0 11-5 0 2.5 2.5 0 015 0z" />
                            </svg>
                        </div>
                        <h3 className="text-lg font-medium text-gray-900">Quản lý người dùng</h3>
                    </div>
                    <p className="text-gray-600 text-sm mb-4">
                        Quản lý quyền admin và người dùng hệ thống
                    </p>
                    <div className="text-center py-4">
                        <p className="text-sm text-gray-500">Sẽ được triển khai trong task 9.1</p>
                    </div>
                </div>
            </div>
        </div>
    );
}