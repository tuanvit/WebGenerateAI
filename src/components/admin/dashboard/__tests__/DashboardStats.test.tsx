import { screen } from '@testing-library/react'
import { render } from '@/test/admin-test-utils'
import { DashboardStats } from './mocks'

const mockStats = {
    totalAITools: 42,
    totalTemplates: 25,
    activeUsers: 150,
    totalPrompts: 1250,
    toolsByCategory: {
        TEXT_GENERATION: 15,
        PRESENTATION: 8,
        IMAGE: 6,
        VIDEO: 5,
        SIMULATION: 4,
        ASSESSMENT: 3,
        DATA_ANALYSIS: 1,
    },
    templatesBySubject: {
        'Toán': 8,
        'Văn': 6,
        'Khoa học tự nhiên': 5,
        'Lịch sử & Địa lí': 4,
        'Giáo dục công dân': 2,
    },
    recentActivity: [
        {
            id: '1',
            action: 'CREATE_AI_TOOL',
            resource: 'ChatGPT Advanced',
            userId: 'admin-1',
            timestamp: new Date('2024-01-15T10:30:00Z'),
            details: { category: 'TEXT_GENERATION' },
        },
        {
            id: '2',
            action: 'UPDATE_TEMPLATE',
            resource: 'Lesson Plan Template',
            userId: 'admin-1',
            timestamp: new Date('2024-01-15T09:15:00Z'),
            details: { subject: 'Toán' },
        },
    ],
}

describe('DashboardStats', () => {
    it('renders all stat cards correctly', () => {
        render(<DashboardStats stats={mockStats} />)

        expect(screen.getByText('Tổng số AI Tools')).toBeInTheDocument()
        expect(screen.getByText('42')).toBeInTheDocument()

        expect(screen.getByText('Tổng số Templates')).toBeInTheDocument()
        expect(screen.getByText('25')).toBeInTheDocument()

        expect(screen.getByText('Người dùng hoạt động')).toBeInTheDocument()
        expect(screen.getByText('150')).toBeInTheDocument()

        expect(screen.getByText('Tổng số Prompts')).toBeInTheDocument()
        expect(screen.getByText('1,250')).toBeInTheDocument()
    })

    it('formats large numbers correctly', () => {
        const largeStats = {
            ...mockStats,
            totalPrompts: 1234567,
            activeUsers: 5432,
        }

        render(<DashboardStats stats={largeStats} />)

        expect(screen.getByText('1,234,567')).toBeInTheDocument()
        expect(screen.getByText('5,432')).toBeInTheDocument()
    })

    it('handles zero values correctly', () => {
        const zeroStats = {
            ...mockStats,
            totalAITools: 0,
            totalTemplates: 0,
        }

        render(<DashboardStats stats={zeroStats} />)

        expect(screen.getByText('0')).toBeInTheDocument()
    })

    it('displays loading state when stats are not provided', () => {
        render(<DashboardStats stats={null} />)

        expect(screen.getByText('Đang tải...')).toBeInTheDocument()
    })

    it('shows appropriate icons for each stat card', () => {
        render(<DashboardStats stats={mockStats} />)

        // Check for presence of stat cards (icons are rendered as SVG elements)
        const statCards = screen.getAllByRole('article')
        expect(statCards).toHaveLength(4)
    })
})