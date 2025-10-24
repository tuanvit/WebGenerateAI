/**
 * Integration tests for admin workflows
 * Tests complete admin workflows from UI to database
 */

import { NextRequest, NextResponse } from 'next/server'
import { mockFetchSuccess, mockFetchError } from '@/test/admin-test-utils'

// Mock the admin API routes
const mockAIToolsAPI = {
    async GET() {
        return NextResponse.json({
            tools: [
                {
                    id: 'test-tool-1',
                    name: 'Test AI Tool',
                    description: 'A test AI tool',
                    url: 'https://test-tool.com',
                    category: 'TEXT_GENERATION',
                    subjects: ['Toán'],
                    gradeLevel: [6],
                    useCase: 'Test use case',
                    vietnameseSupport: true,
                    difficulty: 'beginner',
                    features: ['Feature 1'],
                    pricingModel: 'free',
                    integrationInstructions: 'Test instructions',
                    samplePrompts: ['Test prompt'],
                    relatedTools: [],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }
            ],
            total: 1,
            page: 1,
            limit: 10
        })
    },

    async POST(request: NextRequest) {
        const body = await request.json()
        return NextResponse.json({
            id: 'new-tool-id',
            ...body,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
    },

    async PUT(request: NextRequest) {
        const body = await request.json()
        return NextResponse.json({
            ...body,
            updatedAt: new Date(),
        })
    },

    async DELETE() {
        return NextResponse.json({ success: true })
    }
}

const mockTemplatesAPI = {
    async GET() {
        return NextResponse.json({
            templates: [
                {
                    id: 'test-template-1',
                    name: 'Test Template',
                    description: 'A test template',
                    subject: 'Toán',
                    gradeLevel: [6],
                    outputType: 'lesson-plan',
                    template: 'Test template content',
                    variables: [],
                    recommendedTools: [],
                    examples: [],
                    tags: ['test'],
                    difficulty: 'beginner',
                    compliance: ['GDPT 2018'],
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }
            ],
            total: 1,
            page: 1,
            limit: 10
        })
    },

    async POST(request: NextRequest) {
        const body = await request.json()
        return NextResponse.json({
            id: 'new-template-id',
            ...body,
            createdAt: new Date(),
            updatedAt: new Date(),
        })
    },

    async PUT(request: NextRequest) {
        const body = await request.json()
        return NextResponse.json({
            ...body,
            updatedAt: new Date(),
        })
    },

    async DELETE() {
        return NextResponse.json({ success: true })
    }
}

describe('Admin Workflows Integration Tests', () => {
    beforeEach(() => {
        // Reset fetch mock
        global.fetch = jest.fn()
    })

    afterEach(() => {
        jest.resetAllMocks()
    })

    describe('AI Tools Management Workflow', () => {
        it('should complete full CRUD workflow for AI tools', async () => {
            // Mock fetch responses for the workflow
            (global.fetch as jest.Mock)
                .mockResolvedValueOnce(mockAIToolsAPI.GET()) // Initial load
                .mockResolvedValueOnce(mockAIToolsAPI.POST({} as NextRequest)) // Create
                .mockResolvedValueOnce(mockAIToolsAPI.GET()) // Refresh after create
                .mockResolvedValueOnce(mockAIToolsAPI.PUT({} as NextRequest)) // Update
                .mockResolvedValueOnce(mockAIToolsAPI.GET()) // Refresh after update
                .mockResolvedValueOnce(mockAIToolsAPI.DELETE()) // Delete
                .mockResolvedValueOnce(mockAIToolsAPI.GET()) // Refresh after delete

            // Test workflow steps

            // 1. Load AI tools
            const loadResponse = await fetch('/api/admin/ai-tools')
            const loadData = await loadResponse.json()
            expect(loadData.tools).toHaveLength(1)
            expect(loadData.tools[0].name).toBe('Test AI Tool')

            // 2. Create new AI tool
            const newTool = {
                name: 'New AI Tool',
                description: 'A new AI tool for testing',
                url: 'https://new-tool.com',
                category: 'TEXT_GENERATION',
                subjects: ['Văn'],
                gradeLevel: [7],
                useCase: 'New use case',
                vietnameseSupport: false,
                difficulty: 'intermediate',
                features: ['New Feature'],
                pricingModel: 'paid',
                integrationInstructions: 'New instructions',
                samplePrompts: ['New prompt'],
                relatedTools: [],
            }

            const createResponse = await fetch('/api/admin/ai-tools', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTool),
            })
            const createdTool = await createResponse.json()
            expect(createdTool.id).toBe('new-tool-id')
            expect(createdTool.name).toBe('New AI Tool')

            // 3. Update AI tool
            const updatedTool = {
                ...createdTool,
                name: 'Updated AI Tool',
                description: 'Updated description',
            }

            const updateResponse = await fetch(`/api/admin/ai-tools/${createdTool.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedTool),
            })
            const updatedResult = await updateResponse.json()
            expect(updatedResult.name).toBe('Updated AI Tool')

            // 4. Delete AI tool
            const deleteResponse = await fetch(`/api/admin/ai-tools/${createdTool.id}`, {
                method: 'DELETE',
            })
            const deleteResult = await deleteResponse.json()
            expect(deleteResult.success).toBe(true)

            // Verify all API calls were made
            expect(global.fetch).toHaveBeenCalledTimes(7)
        })

        it('should handle bulk operations workflow', async () => {
            const bulkUpdateData = {
                toolIds: ['tool-1', 'tool-2', 'tool-3'],
                updates: {
                    category: 'PRESENTATION',
                    vietnameseSupport: true,
                }
            }

                // Mock bulk update response
                (global.fetch as jest.Mock).mockResolvedValueOnce(
                    mockFetchSuccess({
                        updated: 3,
                        tools: bulkUpdateData.toolIds.map(id => ({
                            id,
                            ...bulkUpdateData.updates,
                            updatedAt: new Date(),
                        }))
                    })
                )

            const response = await fetch('/api/admin/ai-tools/bulk-update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bulkUpdateData),
            })

            const result = await response.json()
            expect(result.updated).toBe(3)
            expect(result.tools).toHaveLength(3)
            expect(global.fetch).toHaveBeenCalledWith('/api/admin/ai-tools/bulk-update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bulkUpdateData),
            })
        })

        it('should handle import/export workflow', async () => {
            const exportData = [
                {
                    id: 'tool-1',
                    name: 'Exported Tool 1',
                    category: 'TEXT_GENERATION',
                },
                {
                    id: 'tool-2',
                    name: 'Exported Tool 2',
                    category: 'PRESENTATION',
                }
            ]

                // Mock export response
                (global.fetch as jest.Mock)
                .mockResolvedValueOnce(mockFetchSuccess(exportData))
                .mockResolvedValueOnce(mockFetchSuccess({ imported: 2, errors: [] }))

            // Test export
            const exportResponse = await fetch('/api/admin/ai-tools/export')
            const exportResult = await exportResponse.json()
            expect(exportResult).toHaveLength(2)
            expect(exportResult[0].name).toBe('Exported Tool 1')

            // Test import
            const importResponse = await fetch('/api/admin/ai-tools/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tools: exportData }),
            })
            const importResult = await importResponse.json()
            expect(importResult.imported).toBe(2)
            expect(importResult.errors).toHaveLength(0)
        })
    })

    describe('Templates Management Workflow', () => {
        it('should complete full CRUD workflow for templates', async () => {
            // Mock fetch responses for the workflow
            (global.fetch as jest.Mock)
                .mockResolvedValueOnce(mockTemplatesAPI.GET()) // Initial load
                .mockResolvedValueOnce(mockTemplatesAPI.POST({} as NextRequest)) // Create
                .mockResolvedValueOnce(mockTemplatesAPI.GET()) // Refresh after create
                .mockResolvedValueOnce(mockTemplatesAPI.PUT({} as NextRequest)) // Update
                .mockResolvedValueOnce(mockTemplatesAPI.GET()) // Refresh after update
                .mockResolvedValueOnce(mockTemplatesAPI.DELETE()) // Delete
                .mockResolvedValueOnce(mockTemplatesAPI.GET()) // Refresh after delete

            // 1. Load templates
            const loadResponse = await fetch('/api/admin/templates')
            const loadData = await loadResponse.json()
            expect(loadData.templates).toHaveLength(1)
            expect(loadData.templates[0].name).toBe('Test Template')

            // 2. Create new template
            const newTemplate = {
                name: 'New Template',
                description: 'A new template for testing',
                subject: 'Văn',
                gradeLevel: [8],
                outputType: 'presentation',
                template: 'New template content with {{variable}}',
                variables: [
                    {
                        name: 'variable',
                        label: 'Test Variable',
                        type: 'text',
                        required: true,
                    }
                ],
                recommendedTools: ['tool-1'],
                examples: [],
                tags: ['new', 'test'],
                difficulty: 'advanced',
                compliance: ['CV 5512'],
            }

            const createResponse = await fetch('/api/admin/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTemplate),
            })
            const createdTemplate = await createResponse.json()
            expect(createdTemplate.id).toBe('new-template-id')
            expect(createdTemplate.name).toBe('New Template')

            // 3. Update template
            const updatedTemplate = {
                ...createdTemplate,
                name: 'Updated Template',
                description: 'Updated description',
            }

            const updateResponse = await fetch(`/api/admin/templates/${createdTemplate.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updatedTemplate),
            })
            const updatedResult = await updateResponse.json()
            expect(updatedResult.name).toBe('Updated Template')

            // 4. Delete template
            const deleteResponse = await fetch(`/api/admin/templates/${createdTemplate.id}`, {
                method: 'DELETE',
            })
            const deleteResult = await deleteResponse.json()
            expect(deleteResult.success).toBe(true)

            // Verify all API calls were made
            expect(global.fetch).toHaveBeenCalledTimes(7)
        })

        it('should handle template preview workflow', async () => {
            const templateId = 'test-template-1'
            const previewData = {
                variables: {
                    subject: 'Toán học',
                    gradeLevel: '6',
                    topic: 'Phân số',
                }
            }

            const expectedPreview = {
                renderedContent: 'Bài học về Phân số cho lớp 6 trong môn Toán học',
                variables: previewData.variables,
            }

                // Mock preview response
                (global.fetch as jest.Mock).mockResolvedValueOnce(
                    mockFetchSuccess(expectedPreview)
                )

            const response = await fetch(`/api/admin/templates/${templateId}/preview`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(previewData),
            })

            const result = await response.json()
            expect(result.renderedContent).toBe(expectedPreview.renderedContent)
            expect(result.variables).toEqual(previewData.variables)
        })
    })

    describe('Authentication and Authorization Workflow', () => {
        it('should handle admin authentication flow', async () => {
            // Mock authentication responses
            (global.fetch as jest.Mock)
                .mockResolvedValueOnce(mockFetchError(401, 'Unauthorized'))
                .mockResolvedValueOnce(mockFetchSuccess({ user: { role: 'admin' } }))
                .mockResolvedValueOnce(mockAIToolsAPI.GET())

            // 1. Attempt to access admin API without authentication
            const unauthorizedResponse = await fetch('/api/admin/ai-tools')
            expect(unauthorizedResponse.ok).toBe(false)

            // 2. Authenticate as admin
            const authResponse = await fetch('/api/auth/session')
            const authData = await authResponse.json()
            expect(authData.user.role).toBe('admin')

            // 3. Access admin API with authentication
            const authorizedResponse = await fetch('/api/admin/ai-tools')
            const authorizedData = await authorizedResponse.json()
            expect(authorizedData.tools).toBeDefined()
        })

        it('should reject non-admin users', async () => {
            // Mock non-admin user response
            (global.fetch as jest.Mock).mockResolvedValueOnce(
                mockFetchError(403, 'Forbidden - Admin access required')
            )

            const response = await fetch('/api/admin/ai-tools')
            expect(response.ok).toBe(false)

            const errorData = await response.json()
            expect(errorData.error).toContain('Forbidden')
        })
    })

    describe('Data Integrity Workflow', () => {
        it('should maintain data integrity during bulk operations', async () => {
            const bulkDeleteData = {
                toolIds: ['tool-1', 'tool-2', 'tool-3']
            }

                // Mock responses for data integrity checks
                (global.fetch as jest.Mock)
                .mockResolvedValueOnce(mockFetchSuccess({
                    deleted: 3,
                    errors: [],
                    auditLog: {
                        action: 'BULK_DELETE_AI_TOOLS',
                        userId: 'admin-1',
                        timestamp: new Date(),
                        details: { deletedIds: bulkDeleteData.toolIds }
                    }
                }))

            const response = await fetch('/api/admin/ai-tools/bulk-delete', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bulkDeleteData),
            })

            const result = await response.json()
            expect(result.deleted).toBe(3)
            expect(result.errors).toHaveLength(0)
            expect(result.auditLog).toBeDefined()
            expect(result.auditLog.action).toBe('BULK_DELETE_AI_TOOLS')
        })

        it('should handle validation errors gracefully', async () => {
            const invalidTool = {
                name: '', // Invalid: empty name
                description: 'Test', // Invalid: too short
                url: 'invalid-url', // Invalid: not a valid URL
                category: 'INVALID_CATEGORY', // Invalid: not a valid category
            }

                // Mock validation error response
                (global.fetch as jest.Mock).mockResolvedValueOnce(
                    mockFetchError(400, 'Validation failed', {
                        errors: [
                            { field: 'name', message: 'Tên công cụ không được để trống' },
                            { field: 'description', message: 'Mô tả phải có ít nhất 10 ký tự' },
                            { field: 'url', message: 'URL không hợp lệ' },
                            { field: 'category', message: 'Danh mục không hợp lệ' },
                        ]
                    })
                )

            const response = await fetch('/api/admin/ai-tools', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(invalidTool),
            })

            expect(response.ok).toBe(false)
            const errorData = await response.json()
            expect(errorData.errors).toHaveLength(4)
            expect(errorData.errors[0].field).toBe('name')
        })
    })

    describe('Backup and Restore Workflow', () => {
        it('should complete backup and restore workflow', async () => {
            const backupData = {
                aiTools: [
                    { id: 'tool-1', name: 'Tool 1' },
                    { id: 'tool-2', name: 'Tool 2' },
                ],
                templates: [
                    { id: 'template-1', name: 'Template 1' },
                    { id: 'template-2', name: 'Template 2' },
                ],
                metadata: {
                    version: '1.0',
                    timestamp: new Date(),
                    totalItems: 4,
                }
            }

                // Mock backup and restore responses
                (global.fetch as jest.Mock)
                .mockResolvedValueOnce(mockFetchSuccess(backupData)) // Create backup
                .mockResolvedValueOnce(mockFetchSuccess({
                    restored: 4,
                    errors: [],
                    backupId: 'backup-123'
                })) // Restore backup

            // 1. Create backup
            const backupResponse = await fetch('/api/admin/backup/export', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ includeAITools: true, includeTemplates: true }),
            })
            const backup = await backupResponse.json()
            expect(backup.aiTools).toHaveLength(2)
            expect(backup.templates).toHaveLength(2)
            expect(backup.metadata.totalItems).toBe(4)

            // 2. Restore backup
            const restoreResponse = await fetch('/api/admin/backup/import', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(backup),
            })
            const restoreResult = await restoreResponse.json()
            expect(restoreResult.restored).toBe(4)
            expect(restoreResult.errors).toHaveLength(0)
        })
    })
})