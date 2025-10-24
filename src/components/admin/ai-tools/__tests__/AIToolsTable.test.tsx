import { screen, fireEvent, waitFor } from '@testing-library/react'
import { render, mockAITool } from '@/test/admin-test-utils'
import { AIToolsTable } from './mocks'

const mockTools = [
    mockAITool,
    {
        ...mockAITool,
        id: 'test-tool-2',
        name: 'Second Test Tool',
        category: 'PRESENTATION' as const,
    }
]

const mockProps = {
    tools: mockTools,
    onEdit: jest.fn(),
    onDelete: jest.fn(),
    onBulkAction: jest.fn(),
    selectedTools: [],
    onSelectTool: jest.fn(),
    onSelectAll: jest.fn(),
}

describe('AIToolsTable', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    it('renders AI tools table with correct data', () => {
        render(<AIToolsTable {...mockProps} />)

        expect(screen.getByText('Test AI Tool')).toBeInTheDocument()
        expect(screen.getByText('Second Test Tool')).toBeInTheDocument()
        expect(screen.getByText('TEXT_GENERATION')).toBeInTheDocument()
        expect(screen.getByText('PRESENTATION')).toBeInTheDocument()
    })

    it('calls onEdit when edit button is clicked', () => {
        render(<AIToolsTable {...mockProps} />)

        const editButtons = screen.getAllByText('Chỉnh sửa')
        fireEvent.click(editButtons[0])

        expect(mockProps.onEdit).toHaveBeenCalledWith(mockTools[0])
    })

    it('calls onDelete when delete button is clicked', () => {
        render(<AIToolsTable {...mockProps} />)

        const deleteButtons = screen.getAllByText('Xóa')
        fireEvent.click(deleteButtons[0])

        expect(mockProps.onDelete).toHaveBeenCalledWith('test-tool-1')
    })

    it('handles tool selection correctly', () => {
        render(<AIToolsTable {...mockProps} />)

        const checkboxes = screen.getAllByRole('checkbox')
        fireEvent.click(checkboxes[1]) // First checkbox is select all

        expect(mockProps.onSelectTool).toHaveBeenCalledWith('test-tool-1')
    })

    it('handles select all functionality', () => {
        render(<AIToolsTable {...mockProps} />)

        const selectAllCheckbox = screen.getAllByRole('checkbox')[0]
        fireEvent.click(selectAllCheckbox)

        expect(mockProps.onSelectAll).toHaveBeenCalled()
    })

    it('displays Vietnamese support status correctly', () => {
        render(<AIToolsTable {...mockProps} />)

        expect(screen.getByText('Có')).toBeInTheDocument() // Vietnamese support: true
    })

    it('displays subjects and grade levels correctly', () => {
        render(<AIToolsTable {...mockProps} />)

        expect(screen.getByText('Toán, Văn')).toBeInTheDocument()
        expect(screen.getByText('6, 7')).toBeInTheDocument()
    })

    it('shows empty state when no tools provided', () => {
        render(<AIToolsTable {...mockProps} tools={[]} />)

        expect(screen.getByText('Không có công cụ AI nào')).toBeInTheDocument()
    })
})