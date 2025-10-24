import { screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { render, mockTemplate } from '@/test/admin-test-utils'
import { TemplateForm } from './mocks'

const mockProps = {
    onSave: jest.fn(),
    onCancel: jest.fn(),
}

describe('TemplateForm', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders form fields correctly', () => {
        render(<TemplateForm {...mockProps} />)

        expect(screen.getByLabelText('Tên template')).toBeInTheDocument()
        expect(screen.getByLabelText('Mô tả')).toBeInTheDocument()
        expect(screen.getByLabelText('Môn học')).toBeInTheDocument()
        expect(screen.getByLabelText('Lớp')).toBeInTheDocument()
        expect(screen.getByLabelText('Loại đầu ra')).toBeInTheDocument()
        expect(screen.getByLabelText('Nội dung template')).toBeInTheDocument()
    })

    it('populates form with existing template data when editing', () => {
        render(<TemplateForm {...mockProps} template={mockTemplate} />)

        expect(screen.getByDisplayValue('Test Template')).toBeInTheDocument()
        expect(screen.getByDisplayValue('A test template for unit testing')).toBeInTheDocument()
        expect(screen.getByDisplayValue('Test template content with {{variable}}')).toBeInTheDocument()
    })

    it('validates required fields', async () => {
        const user = userEvent.setup()
        render(<TemplateForm {...mockProps} />)

        const submitButton = screen.getByText('Lưu')
        await user.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText('Tên template không được để trống')).toBeInTheDocument()
        })
    })

    it('validates template content length', async () => {
        const user = userEvent.setup()
        render(<TemplateForm {...mockProps} />)

        const templateInput = screen.getByLabelText('Nội dung template')
        await user.type(templateInput, 'Short')

        const submitButton = screen.getByText('Lưu')
        await user.click(submitButton)

        await waitFor(() => {
            expect(screen.getByText('Nội dung template phải có ít nhất 50 ký tự')).toBeInTheDocument()
        })
    })

    it('calls onSave with correct data when form is submitted', async () => {
        const user = userEvent.setup()
        render(<TemplateForm {...mockProps} />)

        // Fill in required fields
        await user.type(screen.getByLabelText('Tên template'), 'New Template')
        await user.type(screen.getByLabelText('Mô tả'), 'A new template for testing')
        await user.type(screen.getByLabelText('Nội dung template'), 'This is a long template content with more than fifty characters for testing purposes')

        // Select subject
        const subjectSelect = screen.getByLabelText('Môn học')
        await user.selectOptions(subjectSelect, 'Toán')

        // Select output type
        const outputTypeSelect = screen.getByLabelText('Loại đầu ra')
        await user.selectOptions(outputTypeSelect, 'lesson-plan')

        // Select grade levels
        const gradeCheckboxes = screen.getAllByRole('checkbox')
        await user.click(gradeCheckboxes.find(cb => cb.getAttribute('value') === '6')!)

        const submitButton = screen.getByText('Lưu')
        await user.click(submitButton)

        await waitFor(() => {
            expect(mockProps.onSave).toHaveBeenCalledWith(
                expect.objectContaining({
                    name: 'New Template',
                    description: 'A new template for testing',
                    subject: 'Toán',
                    outputType: 'lesson-plan',
                })
            )
        })
    })

    it('calls onCancel when cancel button is clicked', async () => {
        const user = userEvent.setup()
        render(<TemplateForm {...mockProps} />)

        const cancelButton = screen.getByText('Hủy')
        await user.click(cancelButton)

        expect(mockProps.onCancel).toHaveBeenCalled()
    })

    it('handles template variables management', async () => {
        const user = userEvent.setup()
        render(<TemplateForm {...mockProps} />)

        // Add variable
        const addVariableButton = screen.getByText('Thêm biến')
        await user.click(addVariableButton)

        const variableNameInput = screen.getByPlaceholderText('Tên biến')
        await user.type(variableNameInput, 'newVariable')

        expect(variableNameInput).toHaveValue('newVariable')
    })

    it('handles template examples management', async () => {
        const user = userEvent.setup()
        render(<TemplateForm {...mockProps} />)

        // Add example
        const addExampleButton = screen.getByText('Thêm ví dụ')
        await user.click(addExampleButton)

        const exampleTitleInput = screen.getByPlaceholderText('Tiêu đề ví dụ')
        await user.type(exampleTitleInput, 'New Example')

        expect(exampleTitleInput).toHaveValue('New Example')
    })

    it('handles tags input correctly', async () => {
        const user = userEvent.setup()
        render(<TemplateForm {...mockProps} />)

        const tagsInput = screen.getByLabelText('Tags')
        await user.type(tagsInput, 'tag1, tag2, tag3')

        expect(tagsInput).toHaveValue('tag1, tag2, tag3')
    })
})