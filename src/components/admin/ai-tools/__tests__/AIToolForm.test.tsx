import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render, mockAITool } from '@/test/admin-test-utils'
import { AIToolForm } from './mocks'

const mockProps = {
    onSave: jest.fn(),
    onCancel: jest.fn(),
}

describe('AIToolForm', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders form fields correctly', () => {
        render(<AIToolForm {...mockProps} />)

        expect(screen.getByLabelText('Tên công cụ')).toBeInTheDocument()
        expect(screen.getByLabelText('Mô tả')).toBeInTheDocument()
        expect(screen.getByLabelText('URL')).toBeInTheDocument()
        expect(screen.getByLabelText('Danh mục')).toBeInTheDocument()
        expect(screen.getByLabelText('Môn học')).toBeInTheDocument()
        expect(screen.getByLabelText('Lớp')).toBeInTheDocument()
    })

    it('populates form with existing tool data when editing', () => {
        render(<AIToolForm {...mockProps} tool={mockAITool} />)

        expect(screen.getByDisplayValue('Test AI Tool')).toBeInTheDocument()
        expect(screen.getByDisplayValue('A test AI tool for unit testing')).toBeInTheDocument()
        expect(screen.getByDisplayValue('https://test-tool.com')).toBeInTheDocument()
    })

    it('validates required fields', async () => {
        const user = userEvent.setup()
        render(<AIToolForm {...mockProps} />)

        const submitButton = screen.getByText('Lưu')
        await user.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText('Tên công cụ không được để trống')).toBeInTheDocument()
        })
    })

    it('validates URL format', async () => {
        const user = userEvent.setup()
        render(<AIToolForm {...mockProps} />)

        const urlInput = screen.getByLabelText('URL')
        await user.type(urlInput, 'invalid-url')

        const submitButton = screen.getByText('Lưu')
        await user.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText('URL không hợp lệ')).toBeInTheDocument()
        })
    })

    it('calls onSave with correct data when form is submitted', async () => {
        const user = userEvent.setup()
        render(<AIToolForm {...mockProps} />)

        // Fill in required fields
        await user.type(screen.getByLabelText('Tên công cụ'), 'New AI Tool')
        await user.type(screen.getByLabelText('Mô tả'), 'A new AI tool for testing')
        await user.type(screen.getByLabelText('URL'), 'https://new-tool.com')
        await user.type(screen.getByLabelText('Trường hợp sử dụng'), 'Test use case')

        // Select category
        const categorySelect = screen.getByLabelText('Danh mục')
        await user.selectOptions(categorySelect, 'TEXT_GENERATION')

        // Select subjects
        const subjectCheckboxes = screen.getAllByRole('checkbox')
        await user.click(subjectCheckboxes.find(cb => cb.getAttribute('value') === 'Toán')!)

        // Select grade levels
        await user.click(subjectCheckboxes.find(cb => cb.getAttribute('value') === '6')!)

        const submitButton = screen.getByText('Lưu')
        await user.click(submitButton)

        await waitFor(() => {
            expect(mockProps.onSave).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'New AI Tool',
                    description: 'A new AI tool for testing',
                    url: 'https://new-tool.com',
                    category: 'TEXT_GENERATION',
                })
            )
        })
    })

    it('calls onCancel when cancel button is clicked', async () => {
        const user = userEvent.setup()
        render(<AIToolForm {...mockProps} />)

        const cancelButton = screen.getByText('Hủy')
        await user.click(cancelButton)

        expect(mockProps.onCancel).toHaveBeenCalled()
    })

    it('handles dynamic arrays for features and sample prompts', async () => {
        const user = userEvent.setup()
        render(<AIToolForm {...mockProps} />)

        // Add feature
        const addFeatureButton = screen.getByText('Thêm tính năng')
        await user.click(addFeatureButton)

        const featureInput = screen.getByPlaceholderText('Nhập tính năng')
        await user.type(featureInput, 'New Feature')

        expect(featureInput).toHaveValue('New Feature')
    })

    it('toggles Vietnamese support correctly', async () => {
        const user = userEvent.setup()
        render(<AIToolForm {...mockProps} />)

        const vietnameseSupportCheckbox = screen.getByLabelText('Hỗ trợ tiếng Việt')
        await user.click(vietnameseSupportCheckbox)

        expect(vietnameseSupportCheckbox).toBeChecked()
    })
})