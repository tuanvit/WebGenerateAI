import { test, expect } from '@playwright/test'

test.describe('AI Tools Management E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Navigate to AI Tools management page
        await page.goto('/admin/ai-tools')
    })

    test('should display AI tools table with data', async ({ page }) => {
        // Wait for the table to load
        await page.waitForSelector('[data-testid="ai-tools-table"]', { timeout: 10000 })

        // Check table headers
        await expect(page.locator('th')).toContainText(['Tên', 'Danh mục', 'Môn học', 'Lớp', 'Hỗ trợ tiếng Việt'])

        // Check if at least one AI tool is displayed
        await expect(page.locator('tbody tr')).toHaveCount({ min: 1 })
    })

    test('should open create AI tool modal', async ({ page }) => {
        // Click create button
        await page.click('text=Thêm AI Tool')

        // Check if modal is opened
        await expect(page.locator('[data-testid="ai-tool-modal"]')).toBeVisible()
        await expect(page.locator('text=Thêm AI Tool mới')).toBeVisible()

        // Check form fields
        await expect(page.locator('input[name="name"]')).toBeVisible()
        await expect(page.locator('textarea[name="description"]')).toBeVisible()
        await expect(page.locator('input[name="url"]')).toBeVisible()
        await expect(page.locator('select[name="category"]')).toBeVisible()
    })

    test('should create a new AI tool', async ({ page }) => {
        // Click create button
        await page.click('text=Thêm AI Tool')

        // Fill form
        await page.fill('input[name="name"]', 'Test AI Tool E2E')
        await page.fill('textarea[name="description"]', 'This is a test AI tool created via E2E testing')
        await page.fill('input[name="url"]', 'https://test-ai-tool.com')
        await page.selectOption('select[name="category"]', 'TEXT_GENERATION')
        await page.fill('textarea[name="useCase"]', 'Testing purposes')

        // Select subjects
        await page.check('input[value="Toán"]')
        await page.check('input[value="Văn"]')

        // Select grade levels
        await page.check('input[value="6"]')
        await page.check('input[value="7"]')

        // Submit form
        await page.click('button[type="submit"]')

        // Wait for success message or table update
        await expect(page.locator('text=Thêm thành công')).toBeVisible({ timeout: 5000 })

        // Check if new tool appears in table
        await expect(page.locator('text=Test AI Tool E2E')).toBeVisible()
    })

    test('should edit an existing AI tool', async ({ page }) => {
        // Wait for table to load
        await page.waitForSelector('[data-testid="ai-tools-table"]')

        // Click edit button on first row
        await page.click('tbody tr:first-child button:has-text("Chỉnh sửa")')

        // Check if edit modal is opened
        await expect(page.locator('[data-testid="ai-tool-modal"]')).toBeVisible()
        await expect(page.locator('text=Chỉnh sửa AI Tool')).toBeVisible()

        // Update name
        await page.fill('input[name="name"]', 'Updated AI Tool Name')

        // Submit form
        await page.click('button[type="submit"]')

        // Wait for success message
        await expect(page.locator('text=Cập nhật thành công')).toBeVisible({ timeout: 5000 })
    })

    test('should delete an AI tool', async ({ page }) => {
        // Wait for table to load
        await page.waitForSelector('[data-testid="ai-tools-table"]')

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

    test('should filter AI tools by category', async ({ page }) => {
        // Wait for table to load
        await page.waitForSelector('[data-testid="ai-tools-table"]')

        // Select category filter
        await page.selectOption('select[name="categoryFilter"]', 'TEXT_GENERATION')

        // Wait for filtered results
        await page.waitForTimeout(1000)

        // Check if all visible tools have the selected category
        const categoryTexts = await page.locator('tbody tr td:nth-child(2)').allTextContents()
        for (const text of categoryTexts) {
            expect(text).toBe('TEXT_GENERATION')
        }
    })

    test('should search AI tools by name', async ({ page }) => {
        // Wait for table to load
        await page.waitForSelector('[data-testid="ai-tools-table"]')

        // Enter search term
        await page.fill('input[placeholder="Tìm kiếm AI tools..."]', 'ChatGPT')

        // Wait for search results
        await page.waitForTimeout(1000)

        // Check if search results contain the search term
        const toolNames = await page.locator('tbody tr td:first-child').allTextContents()
        for (const name of toolNames) {
            expect(name.toLowerCase()).toContain('chatgpt')
        }
    })

    test('should handle bulk operations', async ({ page }) => {
        // Wait for table to load
        await page.waitForSelector('[data-testid="ai-tools-table"]')

        // Select multiple tools
        await page.check('thead input[type="checkbox"]') // Select all

        // Click bulk actions dropdown
        await page.click('button:has-text("Hành động hàng loạt")')

        // Select bulk edit
        await page.click('text=Chỉnh sửa hàng loạt')

        // Check if bulk edit modal is opened
        await expect(page.locator('[data-testid="bulk-edit-modal"]')).toBeVisible()

        // Update Vietnamese support
        await page.check('input[name="vietnameseSupport"]')

        // Submit bulk update
        await page.click('button:has-text("Cập nhật")')

        // Wait for success message
        await expect(page.locator('text=Cập nhật hàng loạt thành công')).toBeVisible({ timeout: 5000 })
    })

    test('should export AI tools data', async ({ page }) => {
        // Wait for table to load
        await page.waitForSelector('[data-testid="ai-tools-table"]')

        // Click export button
        await page.click('button:has-text("Xuất dữ liệu")')

        // Check export options
        await expect(page.locator('text=Xuất JSON')).toBeVisible()
        await expect(page.locator('text=Xuất CSV')).toBeVisible()

        // Start download by clicking JSON export
        const downloadPromise = page.waitForEvent('download')
        await page.click('text=Xuất JSON')
        const download = await downloadPromise

        // Check if file was downloaded
        expect(download.suggestedFilename()).toContain('ai-tools')
        expect(download.suggestedFilename()).toContain('.json')
    })

    test('should import AI tools data', async ({ page }) => {
        // Click import button
        await page.click('button:has-text("Nhập dữ liệu")')

        // Check if import modal is opened
        await expect(page.locator('[data-testid="import-modal"]')).toBeVisible()

        // Create a test file content
        const testData = JSON.stringify([
            {
                name: 'Imported AI Tool',
                description: 'This tool was imported via E2E test',
                url: 'https://imported-tool.com',
                category: 'TEXT_GENERATION',
                subjects: ['Toán'],
                gradeLevel: [6],
                useCase: 'Import testing',
                vietnameseSupport: true,
                difficulty: 'beginner',
                features: ['Import feature'],
                pricingModel: 'free',
            }
        ])

        // Upload file (simulate file upload)
        await page.setInputFiles('input[type="file"]', {
            name: 'test-import.json',
            mimeType: 'application/json',
            buffer: Buffer.from(testData)
        })

        // Submit import
        await page.click('button:has-text("Nhập dữ liệu")')

        // Wait for success message
        await expect(page.locator('text=Nhập dữ liệu thành công')).toBeVisible({ timeout: 5000 })

        // Check if imported tool appears in table
        await expect(page.locator('text=Imported AI Tool')).toBeVisible()
    })

    test('should validate form inputs', async ({ page }) => {
        // Click create button
        await page.click('text=Thêm AI Tool')

        // Try to submit empty form
        await page.click('button[type="submit"]')

        // Check for validation errors
        await expect(page.locator('text=Tên công cụ không được để trống')).toBeVisible()
        await expect(page.locator('text=Mô tả không được để trống')).toBeVisible()
        await expect(page.locator('text=URL không được để trống')).toBeVisible()

        // Fill invalid URL
        await page.fill('input[name="url"]', 'invalid-url')
        await page.click('button[type="submit"]')

        // Check for URL validation error
        await expect(page.locator('text=URL không hợp lệ')).toBeVisible()
    })
})