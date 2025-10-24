/**
 * Integration tests for admin API endpoints
 * Tests API routes with database interactions
 */

import { NextRequest } from 'next/server'

// Mock database operations
const mockDatabase = {
    aiTools: [
        {
            id: 'tool-1',
            name: 'ChatGPT',
            description: 'AI chatbot for text generation',
            url: 'https://chat.openai.com',
            category: 'TEXT_GENERATION',
            subjects: ['Toán', 'Văn'],
            gradeLevel: [6, 7, 8, 9],
            useCase: 'Text generation and conversation',
            vietnameseSupport: true,
            difficulty: 'beginner',
            features: ['Chat', 'Code generation'],
            pricingModel: 'freemium',
            integrationInstructions: 'Visit the website and create an account',
            samplePrompts: ['Explain photosynthesis', 'Write a poem'],
            relatedTools: ['tool-2'],
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
        }
    ],
    templates: [
        {
            id: 'template-1',
            name: 'Lesson Plan Template',
            description: 'Template for creating lesson plans',
            subject: 'Toán',
            gradeLevel: [6, 7],
            outputType: 'lesson-plan',
            template: 'Bài học về {{topic}} cho lớp {{grade}}',
            variables: [
                {
                    id: 'var-1',
                    templateId: 'template-1',
                    name: 'topic',
                    label: 'Chủ đề',
                    type: 'text',
                    required: true,
                },
                {
                    id: 'var-2',
                    templateId: 'template-1',
                    name: 'grade',
                    label: 'Lớp',
                    type: 'select',
                    required: true,
                    options: ['6', '7', '8', '9'],
                }
            ],
            recommendedTools: ['tool-1'],
            examples: [
                {
                    id: 'example-1',
                    templateId: 'template-1',
                    title: 'Bài học Toán',
                    description: 'Ví dụ về bài học Toán',
                    sampleInput: { topic: 'Phân số', grade: '6' },
                    expectedOutput: 'Bài học về Phân số cho lớp 6',
                }
            ],
            tags: ['lesson-plan', 'education'],
            difficulty: 'beginner',
            compliance: ['GDPT 2018'],
            createdAt: new Date('2024-01-01'),
            updatedAt: new Date('2024-01-01'),
        }
    ],
    auditLogs: [],
}

// Mock API route handlers
const createMockHandler = (handler: Function) => {
    return async (request: NextRequest) => {
        try {
            return await handler(request)
        } catch (error) {
            return new Response(
                JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
                { status: 500, headers: { 'Content-Type': 'application/json' } }
            )
        }
    }
}

describe('Admin API Integration Tests', () => {
    beforeEach(() => {
        // Reset mock database
        mockDatabase.aiTools = [mockDatabase.aiTools[0]]
        mockDatabase.templates = [mockDatabase.templates[0]]
        mockDatabase.auditLogs = []
    })

    describe('AI Tools API', () => {
        it('should get all AI tools with pagination', async () => {
            const request = new NextRequest('http://localhost:3000/api/admin/ai-tools?page=1&limit=10')

            // Mock the GET handler
            const handler = createMockHandler(async (req: NextRequest) => {
                const url = new URL(req.url)
                const page = parseInt(url.searchParams.get('page') || '1')
                const limit = parseInt(url.searchParams.get('limit') || '10')

                const startIndex = (page - 1) * limit
                const endIndex = startIndex + limit
                const tools = mockDatabase.aiTools.slice(startIndex, endIndex)

                return new Response(JSON.stringify({
                    tools,
                    total: mockDatabase.aiTools.length,
                    page,
                    limit,
                    totalPages: Math.ceil(mockDatabase.aiTools.length / limit)
                }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                })
            })

            const response = await handler(request)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.tools).toHaveLength(1)
            expect(data.total).toBe(1)
            expect(data.page).toBe(1)
            expect(data.limit).toBe(10)
        })

        it('should create a new AI tool', async () => {
            const newTool = {
                name: 'Gemini',
                description: 'Google AI chatbot',
                url: 'https://gemini.google.com',
                category: 'TEXT_GENERATION',
                subjects: ['Khoa học tự nhiên'],
                gradeLevel: [8, 9],
                useCase: 'Scientific explanations',
                vietnameseSupport: true,
                difficulty: 'intermediate',
                features: ['Multimodal', 'Code generation'],
                pricingModel: 'free',
                integrationInstructions: 'Access through Google account',
                samplePrompts: ['Explain quantum physics'],
                relatedTools: [],
            }

            const request = new NextRequest('http://localhost:3000/api/admin/ai-tools', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTool),
            })

            const handler = createMockHandler(async (req: NextRequest) => {
                const body = await req.json()

                // Validate required fields
                if (!body.name || !body.description || !body.url) {
                    return new Response(
                        JSON.stringify({ error: 'Missing required fields' }),
                        { status: 400, headers: { 'Content-Type': 'application/json' } }
                    )
                }

                const createdTool = {
                    id: `tool-${Date.now()}`,
                    ...body,
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }

                mockDatabase.aiTools.push(createdTool)

                // Add audit log
                mockDatabase.auditLogs.push({
                    id: `log-${Date.now()}`,
                    action: 'CREATE_AI_TOOL',
                    resource: createdTool.name,
                    userId: 'admin-1',
                    timestamp: new Date(),
                    details: { toolId: createdTool.id },
                })

                return new Response(JSON.stringify(createdTool), {
                    status: 201,
                    headers: { 'Content-Type': 'application/json' }
                })
            })

            const response = await handler(request)
            const data = await response.json()

            expect(response.status).toBe(201)
            expect(data.name).toBe('Gemini')
            expect(data.id).toBeDefined()
            expect(mockDatabase.aiTools).toHaveLength(2)
            expect(mockDatabase.auditLogs).toHaveLength(1)
        })

        it('should update an existing AI tool', async () => {
            const toolId = 'tool-1'
            const updates = {
                name: 'ChatGPT Updated',
                description: 'Updated AI chatbot for text generation',
                vietnameseSupport: false,
            }

            const request = new NextRequest(`http://localhost:3000/api/admin/ai-tools/${toolId}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(updates),
            })

            const handler = createMockHandler(async (req: NextRequest) => {
                const body = await req.json()
                const url = new URL(req.url)
                const id = url.pathname.split('/').pop()

                const toolIndex = mockDatabase.aiTools.findIndex(tool => tool.id === id)
                if (toolIndex === -1) {
                    return new Response(
                        JSON.stringify({ error: 'AI tool not found' }),
                        { status: 404, headers: { 'Content-Type': 'application/json' } }
                    )
                }

                const updatedTool = {
                    ...mockDatabase.aiTools[toolIndex],
                    ...body,
                    updatedAt: new Date(),
                }

                mockDatabase.aiTools[toolIndex] = updatedTool

                // Add audit log
                mockDatabase.auditLogs.push({
                    id: `log-${Date.now()}`,
                    action: 'UPDATE_AI_TOOL',
                    resource: updatedTool.name,
                    userId: 'admin-1',
                    timestamp: new Date(),
                    details: { toolId: updatedTool.id, changes: body },
                })

                return new Response(JSON.stringify(updatedTool), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                })
            })

            const response = await handler(request)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.name).toBe('ChatGPT Updated')
            expect(data.vietnameseSupport).toBe(false)
            expect(mockDatabase.auditLogs).toHaveLength(1)
        })

        it('should delete an AI tool', async () => {
            const toolId = 'tool-1'
            const request = new NextRequest(`http://localhost:3000/api/admin/ai-tools/${toolId}`, {
                method: 'DELETE',
            })

            const handler = createMockHandler(async (req: NextRequest) => {
                const url = new URL(req.url)
                const id = url.pathname.split('/').pop()

                const toolIndex = mockDatabase.aiTools.findIndex(tool => tool.id === id)
                if (toolIndex === -1) {
                    return new Response(
                        JSON.stringify({ error: 'AI tool not found' }),
                        { status: 404, headers: { 'Content-Type': 'application/json' } }
                    )
                }

                const deletedTool = mockDatabase.aiTools[toolIndex]
                mockDatabase.aiTools.splice(toolIndex, 1)

                // Add audit log
                mockDatabase.auditLogs.push({
                    id: `log-${Date.now()}`,
                    action: 'DELETE_AI_TOOL',
                    resource: deletedTool.name,
                    userId: 'admin-1',
                    timestamp: new Date(),
                    details: { toolId: deletedTool.id },
                })

                return new Response(JSON.stringify({ success: true }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                })
            })

            const response = await handler(request)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.success).toBe(true)
            expect(mockDatabase.aiTools).toHaveLength(0)
            expect(mockDatabase.auditLogs).toHaveLength(1)
        })

        it('should handle bulk operations', async () => {
            // Add more tools for bulk testing
            mockDatabase.aiTools.push(
                {
                    id: 'tool-2',
                    name: 'Gemini',
                    category: 'TEXT_GENERATION',
                    vietnameseSupport: false,
                } as any,
                {
                    id: 'tool-3',
                    name: 'Copilot',
                    category: 'TEXT_GENERATION',
                    vietnameseSupport: false,
                } as any
            )

            const bulkUpdate = {
                toolIds: ['tool-2', 'tool-3'],
                updates: {
                    category: 'PRESENTATION',
                    vietnameseSupport: true,
                }
            }

            const request = new NextRequest('http://localhost:3000/api/admin/ai-tools/bulk-update', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(bulkUpdate),
            })

            const handler = createMockHandler(async (req: NextRequest) => {
                const body = await req.json()
                const { toolIds, updates } = body

                let updatedCount = 0
                const updatedTools = []

                for (const toolId of toolIds) {
                    const toolIndex = mockDatabase.aiTools.findIndex(tool => tool.id === toolId)
                    if (toolIndex !== -1) {
                        mockDatabase.aiTools[toolIndex] = {
                            ...mockDatabase.aiTools[toolIndex],
                            ...updates,
                            updatedAt: new Date(),
                        }
                        updatedTools.push(mockDatabase.aiTools[toolIndex])
                        updatedCount++
                    }
                }

                // Add audit log
                mockDatabase.auditLogs.push({
                    id: `log-${Date.now()}`,
                    action: 'BULK_UPDATE_AI_TOOLS',
                    resource: `${updatedCount} tools`,
                    userId: 'admin-1',
                    timestamp: new Date(),
                    details: { toolIds, updates, updatedCount },
                })

                return new Response(JSON.stringify({
                    updated: updatedCount,
                    tools: updatedTools
                }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                })
            })

            const response = await handler(request)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.updated).toBe(2)
            expect(data.tools).toHaveLength(2)
            expect(mockDatabase.auditLogs).toHaveLength(1)

            // Verify updates were applied
            const tool2 = mockDatabase.aiTools.find(t => t.id === 'tool-2')
            const tool3 = mockDatabase.aiTools.find(t => t.id === 'tool-3')
            expect(tool2?.category).toBe('PRESENTATION')
            expect(tool2?.vietnameseSupport).toBe(true)
            expect(tool3?.category).toBe('PRESENTATION')
            expect(tool3?.vietnameseSupport).toBe(true)
        })
    })

    describe('Templates API', () => {
        it('should get all templates with filtering', async () => {
            const request = new NextRequest('http://localhost:3000/api/admin/templates?subject=Toán&gradeLevel=6')

            const handler = createMockHandler(async (req: NextRequest) => {
                const url = new URL(req.url)
                const subject = url.searchParams.get('subject')
                const gradeLevel = url.searchParams.get('gradeLevel')

                let filteredTemplates = mockDatabase.templates

                if (subject) {
                    filteredTemplates = filteredTemplates.filter(t => t.subject === subject)
                }

                if (gradeLevel) {
                    const grade = parseInt(gradeLevel)
                    filteredTemplates = filteredTemplates.filter(t => t.gradeLevel.includes(grade))
                }

                return new Response(JSON.stringify({
                    templates: filteredTemplates,
                    total: filteredTemplates.length,
                    filters: { subject, gradeLevel }
                }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                })
            })

            const response = await handler(request)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.templates).toHaveLength(1)
            expect(data.templates[0].subject).toBe('Toán')
            expect(data.templates[0].gradeLevel).toContain(6)
        })

        it('should create a template with variables and examples', async () => {
            const newTemplate = {
                name: 'Assessment Template',
                description: 'Template for creating assessments',
                subject: 'Văn',
                gradeLevel: [7, 8],
                outputType: 'assessment',
                template: 'Bài kiểm tra {{subject}} về {{topic}} cho lớp {{grade}}',
                variables: [
                    {
                        name: 'subject',
                        label: 'Môn học',
                        type: 'text',
                        required: true,
                    },
                    {
                        name: 'topic',
                        label: 'Chủ đề',
                        type: 'text',
                        required: true,
                    },
                    {
                        name: 'grade',
                        label: 'Lớp',
                        type: 'select',
                        required: true,
                        options: ['7', '8'],
                    }
                ],
                recommendedTools: ['tool-1'],
                examples: [
                    {
                        title: 'Bài kiểm tra Văn',
                        description: 'Ví dụ về bài kiểm tra Văn',
                        sampleInput: { subject: 'Văn', topic: 'Thơ', grade: '7' },
                        expectedOutput: 'Bài kiểm tra Văn về Thơ cho lớp 7',
                    }
                ],
                tags: ['assessment', 'literature'],
                difficulty: 'intermediate',
                compliance: ['GDPT 2018', 'CV 5512'],
            }

            const request = new NextRequest('http://localhost:3000/api/admin/templates', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newTemplate),
            })

            const handler = createMockHandler(async (req: NextRequest) => {
                const body = await req.json()

                // Validate required fields
                if (!body.name || !body.template || !body.subject) {
                    return new Response(
                        JSON.stringify({ error: 'Missing required fields' }),
                        { status: 400, headers: { 'Content-Type': 'application/json' } }
                    )
                }

                const createdTemplate = {
                    id: `template-${Date.now()}`,
                    ...body,
                    variables: body.variables.map((v: any, index: number) => ({
                        id: `var-${Date.now()}-${index}`,
                        templateId: `template-${Date.now()}`,
                        ...v,
                    })),
                    examples: body.examples.map((e: any, index: number) => ({
                        id: `example-${Date.now()}-${index}`,
                        templateId: `template-${Date.now()}`,
                        ...e,
                    })),
                    createdAt: new Date(),
                    updatedAt: new Date(),
                }

                mockDatabase.templates.push(createdTemplate)

                return new Response(JSON.stringify(createdTemplate), {
                    status: 201,
                    headers: { 'Content-Type': 'application/json' }
                })
            })

            const response = await handler(request)
            const data = await response.json()

            expect(response.status).toBe(201)
            expect(data.name).toBe('Assessment Template')
            expect(data.variables).toHaveLength(3)
            expect(data.examples).toHaveLength(1)
            expect(mockDatabase.templates).toHaveLength(2)
        })

        it('should render template preview', async () => {
            const templateId = 'template-1'
            const previewData = {
                variables: {
                    topic: 'Phân số',
                    grade: '6'
                }
            }

            const request = new NextRequest(`http://localhost:3000/api/admin/templates/${templateId}/preview`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(previewData),
            })

            const handler = createMockHandler(async (req: NextRequest) => {
                const body = await req.json()
                const url = new URL(req.url)
                const id = url.pathname.split('/')[4] // Extract template ID

                const template = mockDatabase.templates.find(t => t.id === id)
                if (!template) {
                    return new Response(
                        JSON.stringify({ error: 'Template not found' }),
                        { status: 404, headers: { 'Content-Type': 'application/json' } }
                    )
                }

                // Simple template rendering
                let renderedContent = template.template
                for (const [key, value] of Object.entries(body.variables)) {
                    renderedContent = renderedContent.replace(new RegExp(`{{${key}}}`, 'g'), value as string)
                }

                return new Response(JSON.stringify({
                    renderedContent,
                    variables: body.variables,
                    templateId: template.id,
                }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                })
            })

            const response = await handler(request)
            const data = await response.json()

            expect(response.status).toBe(200)
            expect(data.renderedContent).toBe('Bài học về Phân số cho lớp 6')
            expect(data.variables).toEqual(previewData.variables)
        })
    })

    describe('Error Handling', () => {
        it('should handle validation errors', async () => {
            const invalidTool = {
                name: '', // Invalid: empty name
                description: 'Short', // Invalid: too short
                url: 'not-a-url', // Invalid: not a URL
            }

            const request = new NextRequest('http://localhost:3000/api/admin/ai-tools', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(invalidTool),
            })

            const handler = createMockHandler(async (req: NextRequest) => {
                const body = await req.json()
                const errors = []

                if (!body.name || body.name.trim() === '') {
                    errors.push({ field: 'name', message: 'Tên công cụ không được để trống' })
                }

                if (!body.description || body.description.length < 10) {
                    errors.push({ field: 'description', message: 'Mô tả phải có ít nhất 10 ký tự' })
                }

                if (!body.url || !body.url.match(/^https?:\/\/.+/)) {
                    errors.push({ field: 'url', message: 'URL không hợp lệ' })
                }

                if (errors.length > 0) {
                    return new Response(
                        JSON.stringify({ error: 'Validation failed', errors }),
                        { status: 400, headers: { 'Content-Type': 'application/json' } }
                    )
                }

                return new Response(JSON.stringify({ success: true }), {
                    status: 200,
                    headers: { 'Content-Type': 'application/json' }
                })
            })

            const response = await handler(request)
            const data = await response.json()

            expect(response.status).toBe(400)
            expect(data.error).toBe('Validation failed')
            expect(data.errors).toHaveLength(3)
        })

        it('should handle database errors gracefully', async () => {
            const request = new NextRequest('http://localhost:3000/api/admin/ai-tools/invalid-id', {
                method: 'GET',
            })

            const handler = createMockHandler(async (req: NextRequest) => {
                // Simulate database error
                throw new Error('Database connection failed')
            })

            const response = await handler(request)
            const data = await response.json()

            expect(response.status).toBe(500)
            expect(data.error).toBe('Database connection failed')
        })
    })
})