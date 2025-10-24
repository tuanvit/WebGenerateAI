import CategoryChart from './CategoryChart';
import DashboardStats from './DashboardStats';
import RecentActivity from './RecentActivity';
import SystemHealth from './SystemHealth';

async function fetchDashboardData() {
    const response = await fetch(`${process.env.NEXTAUTH_URL || "http://localhost:3000"}/api/admin/dashboard`, {
        cache: 'no-store'
    });

    if (!response.ok) {
        throw new Error('Failed to fetch dashboard data');
    }

    const result = await response.json();
    return result.data;
}

export default async function DashboardContent() {
    const data = await fetchDashboardData();

    // Mock recent activity data
    const mockRecentActivity = [
        {
            id: '1',
            action: 'CREATE_AI_TOOL',
            resource: 'ChatGPT-4',
            description: 'Đã thêm AI Tool mới: ChatGPT-4',
            userName: 'Admin User',
            timestamp: new Date()
        },
        {
            id: '2',
            action: 'UPDATE_TEMPLATE',
            resource: 'Lesson Plan',
            description: 'Đã cập nhật Template: Lesson Plan',
            userName: 'Admin User',
            timestamp: new Date(Date.now() - 3600000)
        },
        {
            id: '3',
            action: 'USER_REGISTER',
            resource: 'User',
            description: 'Người dùng mới đăng ký',
            userName: 'System',
            timestamp: new Date(Date.now() - 7200000)
        }
    ];

    // Convert arrays to objects for CategoryChart
    const aiToolsByCategory = data.content.topCategories.reduce((acc: Record<string, number>, item: any) => {
        acc[item.category] = item.count;
        return acc;
    }, {});

    const templatesBySubject = data.content.topSubjects.reduce((acc: Record<string, number>, item: any) => {
        acc[item.subject] = item.count;
        return acc;
    }, {});

    return (
        <div className="space-y-6">
            {/* Page Header */}
            <div className="mb-8">
                <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard</h1>
                <p className="text-gray-600">Tổng quan hệ thống quản lý AI Tools và Templates</p>
            </div>

            {/* Statistics Cards */}
            <DashboardStats
                stats={data.stats}
                contentStats={data.content}
            />

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Left Column - 2/3 width */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Charts */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <CategoryChart
                            title="AI Tools theo danh mục"
                            data={aiToolsByCategory}
                            colorScheme="blue"
                        />
                        <CategoryChart
                            title="Templates theo môn học"
                            data={templatesBySubject}
                            colorScheme="green"
                        />
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Thao tác nhanh</h3>
                        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                            <button className="flex flex-col items-center p-4 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors">
                                <div className="w-8 h-8 bg-blue-500 rounded-lg flex items-center justify-center mb-2">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-gray-900">Thêm AI Tool</span>
                            </button>

                            <button className="flex flex-col items-center p-4 bg-green-50 hover:bg-green-100 rounded-lg transition-colors">
                                <div className="w-8 h-8 bg-green-500 rounded-lg flex items-center justify-center mb-2">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-gray-900">Tạo Template</span>
                            </button>

                            <button className="flex flex-col items-center p-4 bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors">
                                <div className="w-8 h-8 bg-purple-500 rounded-lg flex items-center justify-center mb-2">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-gray-900">Báo cáo</span>
                            </button>

                            <button className="flex flex-col items-center p-4 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors">
                                <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center mb-2">
                                    <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <span className="text-sm font-medium text-gray-900">Cài đặt</span>
                            </button>
                        </div>
                    </div>
                </div>

                {/* Right Column - 1/3 width */}
                <div className="space-y-6">
                    <SystemHealth health={data.systemHealth} />
                    <RecentActivity activities={mockRecentActivity} />
                </div>
            </div>
        </div>
    );
}