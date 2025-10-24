import { NextResponse } from 'next/server';

export async function GET() {
    try {
        // Mock dashboard data for testing
        const mockData = {
            stats: {
                totalAITools: 42,
                totalTemplates: 28,
                totalUsers: 156,
                systemHealth: 'healthy'
            },
            recentActivity: [
                {
                    id: '1',
                    type: 'ai_tool_created',
                    description: 'Đã thêm AI Tool mới: ChatGPT-4',
                    timestamp: new Date().toISOString(),
                    user: 'Admin User'
                },
                {
                    id: '2',
                    type: 'template_updated',
                    description: 'Đã cập nhật Template: Lesson Plan',
                    timestamp: new Date(Date.now() - 3600000).toISOString(),
                    user: 'Admin User'
                }
            ],
            systemHealth: {
                status: 'healthy',
                uptime: '99.9%',
                lastCheck: new Date().toISOString()
            }
        };

        return NextResponse.json({
            success: true,
            data: mockData
        });
    } catch (error) {
        console.error('Error in dashboard test:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to fetch dashboard data'
        }, { status: 500 });
    }
}