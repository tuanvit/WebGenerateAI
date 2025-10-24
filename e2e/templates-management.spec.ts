import { test, expect } from '@playwright/test'

test.describe('Templates Management E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to Templates management page
        await page.goto('/admin/templates')
    })

    test('should display templates table with data', async ({ page }) => {
        // Wait for the table to load
        await page.waitForSelector('[data-testid="templates-table"]', { timeout: 10000 })

        // Check table headers
        await expect(page.locator('th')).toContainText(['Tên', 'Môn học', 'Lớp', 'Loại đầu ra', 'Độ khó'])

        // Check if at least one template is displayed
        await expect(page.locator('tbody tr')).toHaveCount({ min: 1 })
    })

    test('should open create template modal', async ({ page }) => {
        // Click create button
        await page.click('text=Thêm Template')

        // Check if modal is opened
        await expect(page.locator('[data-testid="template-modal"]')).toBeVisible()
        await expect(page.locator('text=Thêm Template mới')).toBeVisible()

        // Check form fields
        await expect(page.locator('input[name="name"]')).toBeVisible()
        await expect(page.locator('textarea[name="description"]')).toBeVisible()
        await expect(page.locator('select[name="subject"]')).toBeVisible()
        await expect(page.locator('select[name="outputType"]')).toBeVisible()
        await expect(page.locator('textarea[name="template"]')).toBeVisible()
    })

    test('should create a new template with variables', async ({ page }) => {
        // Click create button
        await page.click('text=Thêm Template')

        // Fill basic information
        await page.fill('input[name="name"]', 'Test Template E2E')
        await page.fill('textarea[name="description"]', 'This is a test template created via E2E testing')
        await page.selectOption('select[name="subject"]', 'Toán')
        await page.selectOption('select[name="outputType"]', 'lesson-plan')
        await page.fill('textarea[name="template"]', 'Bài học về {{topic}} cho lớp {{grade}} với mục tiêu {{objective}}')

        // Select grade levels
        await page.check('input[value="6"]')
        await page.check('input[value="7"]')

        // Add template variables
        await page.click('button:has-text("Thêm biến")')

        // Fill first variable
        await page.fill('input[name="variables[0].name"]', 'topic')
        await page.fill('input[name="variables[0].label"]', 'Chủ đề')
        await page.selectOption('select[name="variables[0].type"]', 'text')
        await page.check('input[name="variables[0].required"]')

        // Add second variable
        await page.click('button:has-text("Thêm biến")')
        await page.fill('input[name="variables[1].name"]', 'grade')
        await page.fill('input[name="variables[1].label"]', 'Lớp')
        await page.selectOption('select[name="variables[1].type"]', 'select')
        await page.fill('textarea[name="variables[1].options"]', '6\n7\n8\n9')

        // Add third variable
        await page.click('button:has-text("Thêm biến")')
        await page.fill('input[name="variables[2].name"]', 'objective')
        await page.fill('input[name="variables[2].label"]', 'Mục tiêu')
        await page.selectOption('select[name="variables[2].type"]', 'textarea')

        // Add tags
        await page.fill('input[name="tags"]', 'test, e2e, lesson-plan')

        // Submit form
        await page.click('button[type="submit"]')

        // Wait for success message
        await expect(page.locator('text=Thêm thành công')).toBeVisible({ timeout: 5000 })

        // Check if new template appears in table
        await expect(page.locator('text=Test Template E2E')).toBeVisible()
    })

    test('should preview template with variables', async ({ page }) => {
        // Wait for table to load
        await page.waitForSelector('[data-testid="templates-table"]')

        // Click preview button on first row
        await page.click('tbody tr:first-child button:has-text("Xem trước")')

        // Check if preview modal is opened
        await expect(page.locator('[data-testid="template-preview-modal"]')).toBeVisible()
        await expect(page.locator('text=Xem trước Template')).toBeVisible()

        // Fill variable values
        await page.fill('input[name="topic"]', 'Phân số')
        await page.selectOption('select[name="grade"]', '6')
        await page.fill('textarea[name="objective"]', 'Hiểu khái niệm phân số và cách thực hiện phép tính')

        // Click preview button
        await page.click('button:has-text("Xem trước")')

        // Check if rendered content is displayed
        await expect(page.locator('[data-testid="rendered-content"]')).toContainText('Bài học về Phân số cho lớp 6')
        await expect(page.locator('[data-testid="rendered-content"]')).toContainText('Hiểu khái niệm phân số')
    })

    test('should edit an existing template', async ({ page }) => {
        // Wait for table to load
        await page.waitForSelector('[data-testid="templates-table"]')

        // Click edit button on first row
        await page.click('tbody tr:first-child button:has-text("Chỉnh sửa")')

        // Check if edit modal is opened
        await expect(page.locator('[data-testid="template-modal"]')).toBeVisible()
        await expect(page.locator('text=Chỉnh sửa Template')).toBeVisible()

        // Update name
        await page.fill('input[name="name"]', 'Updated Template Name')

        // Update template content
        await page.fill('textarea[name="template"]', 'Bài học cập nhật về {{topic}} cho lớp {{grade}}')

        // Submit form
        await page.click('button[type="submit"]')

        // Wait for success message
        await expect(page.locator('text=Cập nhật thành công')).toBeVisible({ timeout: 5000 })
    })

    test('should delete a template', async ({ page }) => {
        // Wait for table to load
        await page.waitForSelector('[data-testid="templates-table"]')

        // Get initial row count
        const initialRowCount = await page.locator('tbody tr').count()

        // Click delete button on first row
        await page.click('tbody tr:first-child button:has-text("Xóa")')

        // Confirm deletion in dialog
        await expect(page.locator('text=Xác nhận xóa')).toBeVisible()
        await page.click('button:has-text("Xóa")')

        // Wait for success message
        await expect(page.locator('text=Xóa thành công')).toBeVisible({ timeout: 5000 })

        // Check if row count decreased
        await expect(page.locator('tbody tr')).toHaveCount(initialRowCount - 1)
    })

    test('should filter templates by subject', async ({ page }) => {
        // Wait for table to load
        await page.waitForSelector('[data-testid="templates-table"]')

        // Select subject filter
        await page.selectOption('select[name="subjectFilter"]', 'Toán')

        // Wait for filtered results
        await page.waitForTimeout(1000)

        // Check if all visible templates have the selected subject
        const subjectTexts = await page.locator('tbody tr td:nth-child(2)').allTextContents()
        for (const text of subjectTexts) {
            expect(text).toBe('Toán')
        }
    })

    test('should filter templates by grade level', async ({ page }) => {
        // Wait for table to load
        await page.waitForSelector('[data-testid="templates-table"]')

        // Select grade level filter
        await page.selectOption('select[name="gradeLevelFilter"]', '6')

        // Wait for filtered results
        await page.waitForTimeout(1000)

        // Check if all visible templates include the selected grade level
        const gradeLevelTexts = await page.locator('tbody tr td:nth-child(3)').allTextContents()
        for (const text of gradeLevelTexts) {
            expect(text).toContain('6')
        }
    })

    test('should search templates by name', async ({ page }) => {
        // Wait for table to load
        await page.waitForSelector('[data-testid="templates-table"]')

        // Enter search term
        await page.fill('input[placeholder="Tìm kiếm templates..."]', 'Lesson')

        // Wait for search results
        await page.waitForTimeout(1000)

        // Check if search results contain the search term
        const templateNames = await page.locator('tbody tr td:first-child').allTextContents()
        for (const name of templateNames) {
            expect(name.toLowerCase()).toContain('lesson')
        }
    })

    test('should handle template examples', async ({ page }) => {
        // Click create button
        await page.click('text=Thêm Template')

        // Fill basic information
        await page.fill('input[name="name"]', 'Template with Examples')
        await page.fill('textarea[name="description"]', 'Template with example usage')
        await page.selectOption('select[name="subject"]', 'Văn')
        await page.selectOption('select[name="outputType"]', 'assessment')
        await page.fill('textarea[name="template"]', 'Câu hỏi về {{topic}}: {{question}}')

        // Add template variable
        await page.click('button:has-text("Thêm biến")')
        await page.fill('input[name="variables[0].name"]', 'topic')
        await page.fill('input[name="variables[0].label"]', 'Chủ đề')

        await page.click('button:has-text("Thêm biến")')
        await page.fill('input[name="variables[1].name"]', 'question')
        await page.fill('input[name="variables[1].label"]', 'Câu hỏi')

        // Add example
        await page.click('button:has-text("Thêm ví dụ")')
        await page.fill('input[name="examples[0].title"]', 'Ví dụ về thơ')
        await page.fill('textarea[name="examples[0].description"]', 'Ví dụ tạo câu hỏi về thơ')
        await page.fill('textarea[name="examples[0].sampleInput"]', '{"topic": "Thơ", "question": "Phân tích tác phẩm Tràng Giang"}')
        await page.fill('textarea[name="examples[0].expectedOutput"]', 'Câu hỏi về Thơ: Phân tích tác phẩm Tràng Giang')

        // Submit form
        await page.click('button[type="submit"]')

        // Wait for success message
        await expect(page.locator('text=Thêm thành công')).toBeVisible({ timeout: 5000 })
    })

    test('should validate template form inputs', async ({ page }) => {
        // Click create button
        await page.click('text=Thêm Template')

        // Try to submit empty form
        await page.click('button[type="submit"]')

        // Check for validation errors
        await expect(page.locator('text=Tên template không được để trống')).toBeVisible()
        await expect(page.locator('text=Mô tả không được để trống')).toBeVisible()
        await expect(page.locator('text=Nội dung template không được để trống')).toBeVisible()

        // Fill template content that's too short
        await page.fill('textarea[name="template"]', 'Short')
        await page.click('button[type="submit"]')

        // Check for length validation error
        await expect(page.locator('text=Nội dung template phải có ít nhất 50 ký tự')).toBeVisible()
    })

    test('should handle bulk operations for templates', async ({ page }) => {
        // Wait for table to load
        await page.waitForSelector('[data-testid="templates-table"]')

        // Select multiple templates
        await page.check('thead input[type="checkbox"]') // Select all

        // Click bulk actions dropdown
        await page.click('button:has-text("Hành động hàng loạt")')

        // Select bulk edit
        await page.click('text=Chỉnh sửa hàng loạt')

        // Check if bulk edit modal is opened
        await expect(page.locator('[data-testid="bulk-edit-modal"]')).toBeVisible()

        // Update difficulty level
        await page.selectOption('select[name="difficulty"]', 'intermediate')

        // Add tags
        await page.fill('input[name="tags"]', 'updated, bulk-edit')

        // Submit bulk update
        await page.click('button:has-text("Cập nhật")')

        // Wait for success message
        await expect(page.locator('text=Cập nhật hàng loạt thành công')).toBeVisible({ timeout: 5000 })
    })

    test('should export and import templates', async ({ page }) => {
        // Wait for table to load
        await page.waitForSelector('[data-testid="templates-table"]')

        // Test export
        await page.click('button:has-text("Xuất dữ liệu")')

        const downloadPromise = page.waitForEvent('download')
        await page.click('text=Xuất JSON')
        const download = await downloadPromise

        expect(download.suggestedFilename()).toContain('templates')
        expect(download.suggestedFilename()).toContain('.json')

        // Test import
        await page.click('button:has-text("Nhập dữ liệu")')

        const testTemplateData = JSON.stringify([
            {
                name: 'Imported Template',
                description: 'This template was imported via E2E test',
                subject: 'Khoa học tự nhiên',
                gradeLevel: [8, 9],
                outputType: 'interactive',
                template: 'Thí nghiệm về {{experiment}} với mục tiêu {{goal}} cho lớp {{grade}}',
                variables: [
                    { name: 'experiment', label: 'Thí nghiệm', type: 'text', required: true },
                    { name: 'goal', label: 'Mục tiêu', type: 'textarea', required: true },
                    { name: 'grade', label: 'Lớp', type: 'select', options: ['8', '9'], required: true }
                ],
                tags: ['science', 'experiment'],
                difficulty: 'intermediate',
                compliance: ['GDPT 2018']
            }
        ])

        await page.setInputFiles('input[type="file"]', {
            name: 'test-templates.json',
            mimeType: 'application/json',
            buffer: Buffer.from(testTemplateData)
        })

        await page.click('button:has-text("Nhập dữ liệu")')

        await expect(page.locator('text=Nhập dữ liệu thành công')).toBeVisible({ timeout: 5000 })
        await expect(page.locator('text=Imported Template')).toBeVisible()
    })
})