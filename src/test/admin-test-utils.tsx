import React from 'react'
import { render, RenderOptions } from '@testing-library/react'

// Mock SessionProvider
const SessionProvider = ({ children, session }: any) => {
    return <div data-testid="session-provider">{children}</div>
}

// Mock admin session
export const mockAdminSession = {
    user: {
        id: 'test-admin-id',
        email: 'admin@test.com',
        role: 'admin',
        name: 'Test Admin',
    },
    expires: '2024-12-31',
}

// Mock regular user session
export const mockUserSession = {
    user: {
        id: 'test-user-id',
        email: 'user@test.com',
        role: 'user',
        name: 'Test User',
    },
    expires: '2024-12-31',
}

interface CustomRenderOptions extends Omit<RenderOptions, 'wrapper'> {
    session?: any
}

// Custom render function with providers
export const renderWithProviders = (
    ui: React.ReactElement,
    { session = mockAdminSession, ...renderOptions }: CustomRenderOptions = {}
) => {
    function Wrapper({ children }: { children: React.ReactNode }) {
        return (
            <SessionProvider session={session}>
                {children}
            </SessionProvider>
        )
    }

    return render(ui, { wrapper: Wrapper, ...renderOptions })
}

// Mock AI tool data
export const mockAITool = {
    id: 'test-tool-1',
    name: 'Test AI Tool',
    description: 'A test AI tool for unit testing',
    url: 'https://test-tool.com',
    category: 'TEXT_GENERATION' as const,
    subjects: ['Toán', 'Văn'],
    gradeLevel: [6, 7] as (6 | 7 | 8 | 9)[],
    useCase: 'Test use case',
    vietnameseSupport: true,
    difficulty: 'beginner' as const,
    features: ['Feature 1', 'Feature 2'],
    pricingModel: 'free' as const,
    integrationInstructions: 'Test integration instructions',
    samplePrompts: ['Test prompt 1', 'Test prompt 2'],
    relatedTools: ['tool-2', 'tool-3'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
}

// Mock template data
export const mockTemplate = {
    id: 'test-template-1',
    name: 'Test Template',
    description: 'A test template for unit testing',
    subject: 'Toán',
    gradeLevel: [6, 7] as (6 | 7 | 8 | 9)[],
    outputType: 'lesson-plan' as const,
    template: 'Test template content with {{variable}}',
    variables: [
        {
            id: 'var-1',
            templateId: 'test-template-1',
            name: 'variable',
            label: 'Test Variable',
            description: 'A test variable',
            type: 'text',
            required: true,
            placeholder: 'Enter test value',
            options: null,
            defaultValue: null,
        }
    ],
    recommendedTools: ['test-tool-1'],
    examples: [
        {
            id: 'example-1',
            templateId: 'test-template-1',
            title: 'Test Example',
            description: 'A test example',
            sampleInput: { variable: 'test value' },
            expectedOutput: 'Test template content with test value',
        }
    ],
    tags: ['test', 'unit-testing'],
    difficulty: 'beginner' as const,
    compliance: ['GDPT 2018'],
    createdAt: new Date('2024-01-01'),
    updatedAt: new Date('2024-01-01'),
}

// Mock fetch responses
export const mockFetchSuccess = (data: any) => {
    return Promise.resolve({
        ok: true,
        status: 200,
        json: () => Promise.resolve(data),
    } as Response)
}

export const mockFetchError = (status: number, message: string) => {
    return Promise.resolve({
        ok: false,
        status,
        json: () => Promise.resolve({ error: message }),
    } as Response)
}

// Re-export everything from testing-library
export * from '@testing-library/react'
export { renderWithProviders as render }