import { screen, fireEvent } from '@testing-library/react'
import { render, mockUserSession } from '@/test/admin-test-utils'
import { AdminLayout } from './mocks'

const mockChildren = <div>Test Content</div>

describe('AdminLayout', () => {
    it('renders admin layout with navigation', () => {
        render(
            <AdminLayout currentSection="dashboard">
                {mockChildren}
            </AdminLayout>
        )

        expect(screen.getByText('Admin Dashboard')).toBeInTheDocument()
        expect(screen.getByText('Tổng quan')).toBeInTheDocument()
        expect(screen.getByText('AI Tools')).toBeInTheDocument()
        expect(screen.getByText('Templates')).toBeInTheDocument()
        expect(screen.getByText('Cài đặt')).toBeInTheDocument()
    })

    it('renders children content', () => {
        render(
            <AdminLayout currentSection="dashboard">
                {mockChildren}
            </AdminLayout>
        )

        expect(screen.getByText('Test Content')).toBeInTheDocument()
    })

    it('highlights current section in navigation', () => {
        render(
            <AdminLayout currentSection="ai-tools">
                {mockChildren}
            </AdminLayout>
        )

        const aiToolsLink = screen.getByText('AI Tools').closest('a')
        expect(aiToolsLink).toHaveClass('bg-blue-100') // Active state class
    })

    it('displays user profile information', () => {
        render(
            <AdminLayout currentSection="dashboard">
                {mockChildren}
            </AdminLayout>
        )

        expect(screen.getByText('Test Admin')).toBeInTheDocument()
        expect(screen.getByText('admin@test.com')).toBeInTheDocument()
    })

    it('shows logout button', () => {
        render(
            <AdminLayout currentSection="dashboard">
                {mockChildren}
            </AdminLayout>
        )

        expect(screen.getByText('Đăng xuất')).toBeInTheDocument()
    })

    it('redirects non-admin users', () => {
        render(
            <AdminLayout currentSection="dashboard">
                {mockChildren}
            </AdminLayout>,
            { session: mockUserSession }
        )

        expect(screen.getByText('Không có quyền truy cập')).toBeInTheDocument()
    })

    it('shows mobile menu toggle on small screens', () => {
        // Mock window.innerWidth for mobile
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 640,
        })

        render(
            <AdminLayout currentSection="dashboard">
                {mockChildren}
            </AdminLayout>
        )

        const menuToggle = screen.getByLabelText('Toggle menu')
        expect(menuToggle).toBeInTheDocument()
    })

    it('toggles mobile menu when menu button is clicked', () => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 640,
        })

        render(
            <AdminLayout currentSection="dashboard">
                {mockChildren}
            </AdminLayout>
        )

        const menuToggle = screen.getByLabelText('Toggle menu')
        fireEvent.click(menuToggle)

        // Check if mobile menu is visible
        expect(screen.getByRole('navigation')).toHaveClass('block')
    })

    it('displays breadcrumb navigation', () => {
        render(
            <AdminLayout currentSection="ai-tools">
                {mockChildren}
            </AdminLayout>
        )

        expect(screen.getByText('Admin')).toBeInTheDocument()
        expect(screen.getByText('AI Tools')).toBeInTheDocument()
    })
})