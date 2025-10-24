import { screen, fireEvent } from '@testing-library/react'
import { render, mockTemplate } from '@/test/admin-test-utils'
import { TemplatesTable } from './mocks'

const mockTemplates = [
    mockTemplate,
    {
        ...mockTemplate,
        id: 'test-template-2',
        name: 'Second Test Template',
        subject: 'Văn',
    }
]

const mockProps = {
    templates: mockTemplates,
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onPreview: jest.fn(),
    onBulkAction: jest.fn(),
    selectedTemplates: [],
    onSelectTemplate: jest.fn(),
    onSelectAll: jest.fn(),
}

describe('TemplatesTable', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders templates table with correct data', () => {
        render(<TemplatesTable {...mockProps} />)

        expect(screen.getByText('Test Template')).toBeInTheDocument()
        expect(screen.getByText('Second Test Template')).toBeInTheDocument()
        expect(screen.getByText('Toán')).toBeInTheDocument()
        expect(screen.getByText('Văn')).toBeInTheDocument()
    })

    it('calls onEdit when edit button is clicked', () => {
        render(<TemplatesTable {...mockProps} />)

        const editButtons = screen.getAllByText('Chỉnh sửa')
        fireEvent.click(editButtons[0])

        expect(mockProps.onEdit).toHaveBeenCalledWith(mockTemplates[0])
    })

    it('calls onDelete when delete button is clicked', () => {
        render(<TemplatesTable {...mockProps} />)

        const deleteButtons = screen.getAllByText('Xóa')
        fireEvent.click(deleteButtons[0])

        expect(mockProps.onDelete).toHaveBeenCalledWith('test-template-1')
    })

    it('calls onPreview when preview button is clicked', () => {
        render(<TemplatesTable {...mockProps} />)

        const previewButtons = screen.getAllByText('Xem trước')
        fireEvent.click(previewButtons[0])

        expect(mockProps.onPreview).toHaveBeenCalledWith(mockTemplates[0])
    })

    it('handles template selection correctly', () => {
        render(<TemplatesTable {...mockProps} />)

        const checkboxes = screen.getAllByRole('checkbox')
        fireEvent.click(checkboxes[1]) // First checkbox is select all

        expect(mockProps.onSelectTemplate).toHaveBeenCalledWith('test-template-1')
    })

    it('displays template metadata correctly', () => {
        render(<TemplatesTable {...mockProps} />)

        expect(screen.getByText('lesson-plan')).toBeInTheDocument()
        expect(screen.getByText('beginner')).toBeInTheDocument()
        expect(screen.getByText('6, 7')).toBeInTheDocument()
    })

    it('shows template tags', () => {
        render(<TemplatesTable {...mockProps} />)

        expect(screen.getByText('test')).toBeInTheDocument()
        expect(screen.getByText('unit-testing')).toBeInTheDocument()
    })

    it('shows empty state when no templates provided', () => {
        render(<TemplatesTable {...mockProps} templates={[]} />)

        expect(screen.getByText('Không có template nào')).toBeInTheDocument()
    })

    it('displays compliance information', () => {
        render(<TemplatesTable {...mockProps} />)

        expect(screen.getByText('GDPT 2018')).toBeInTheDocument()
    })
})