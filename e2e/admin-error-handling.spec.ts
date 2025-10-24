import { test, expect } from '@playwright/test'

test.describe('Admin Error Handling E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Mock admin authentication
        await page.addInitScript(() => {
            window.localStorage.setItem('next-auth.session-token', JSON.stringify({
                user: { id: 'admin-1', email: 'admin@test.com', role: 'admin', name: 'Test Admin' },
                expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            }))
        })
    })

    test('should handle API server errors gracefully', async ({ page }) => {
        // Mock server error for AI tools API
        await page.route('/api/admin/ai-tools', route => {
            route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Internal server error' })
            })
        })

        await page.goto('/admin/ai-tools')

        // Should display error message
        await expect(page.locator('text=Lỗi server')).toBeVisible()
        await expect(page.locator('text=Không thể tải dữ liệu AI tools')).toBeVisible()

        // Should show retry button
        await expect(page.locator('button:has-text("Thử lại")')).toBeVisible()
    })

    test('should handle network connectivity issues', async ({ page }) => {
        await page.goto('/admin/ai-tools')

        // Simulate network failure
        await page.route('/api/admin/ai-tools', route => {
            route.abort('failed')
        })

        // Try to create a new AI tool
        await page.click('text=Thêm AI Tool')
        await page.fill('input[name="name"]', 'Test Tool')
        await page.fill('textarea[name="description"]', 'Test description for network error')
        await page.fill('input[name="url"]', 'https://test.com')
        await page.selectOption('select[name="category"]', 'TEXT_GENERATION')
        await page.click('button[type="submit"]')

        // Should show network error message
        await expect(page.locator('text=Lỗi kết nối mạng')).toBeVisible()
        await expect(page.locator('text=Vui lòng kiểm tra kết nối internet')).toBeVisible()
    })

    test('should handle validation errors from server', async ({ page }) => {
        // Mock validation error response
        await page.route('/api/admin/ai-tools', route => {
            if (route.request().method() === 'POST') {
                route.fulfill({
                    status: 400,
                    contentType: 'application/json',
                    body: JSON.stringify({
                        error: 'Validation failed',
                        errors: [
                            { field: 'name', message: 'Tên công cụ đã tồn tại' },
                            { field: 'url', message: 'URL không hợp lệ' }
                        ]
                    })
                })
            } else {
                route.continue()
            }
        })

        await page.goto('/admin/ai-tools')
        await page.click('text=Thêm AI Tool')

        // Fill form with invalid data
        await page.fill('input[name="name"]', 'Duplicate Tool')
        await page.fill('textarea[name="description"]', 'Test description')
        await page.fill('input[name="url"]', 'invalid-url')
        await page.selectOption('select[name="category"]', 'TEXT_GENERATION')
        await page.click('button[type="submit"]')

        // Should display server validation errors
        await expect(page.locator('text=Tên công cụ đã tồn tại')).toBeVisible()
        await expect(page.locator('text=URL không hợp lệ')).toBeVisible()
    })

    test('should handle database connection errors', async ({ page }) => {
        // Mock database error
        await page.route('/api/admin/ai-tools', route => {
            route.fulfill({
                status: 503,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Database connection failed' })
            })
        })

        await page.goto('/admin/ai-tools')

        // Should show database error message
        await expect(page.locator('text=Lỗi cơ sở dữ liệu')).toBeVisible()
        await expect(page.locator('text=Không thể kết nối đến cơ sở dữ liệu')).toBeVisible()

        // Should provide contact information
        await expect(page.locator('text=Vui lòng liên hệ quản trị viên')).toBeVisible()
    })

    test('should handle timeout errors', async ({ page }) => {
        // Mock slow response that times out
        await page.route('/api/admin/ai-tools', route => {
            // Don't fulfill the request to simulate timeout
            setTimeout(() => {
                route.fulfill({
                    status: 408,
                    contentType: 'application/json',
                    body: JSON.stringify({ error: 'Request timeout' })
                })
            }, 30000) // 30 second delay
        })

        await page.goto('/admin/ai-tools')

        // Should show timeout error after reasonable wait
        await expect(page.locator('text=Yêu cầu quá thời gian')).toBeVisible({ timeout: 10000 })
        await expect(page.locator('text=Vui lòng thử lại sau')).toBeVisible()
    })

    test('should handle file upload errors', async ({ page }) => {
        await page.goto('/admin/ai-tools')
        await page.click('button:has-text("Nhập dữ liệu")')

        // Mock file upload error
        await page.route('/api/admin/ai-tools/import', route => {
            route.fulfill({
                status: 413,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'File too large' })
            })
        })

        // Try to upload a large file
        await page.setInputFiles('input[type="file"]', {
            name: 'large-file.json',
            mimeType: 'application/json',
            buffer: Buffer.from('{"data": "large file content"}')
        })

        await page.click('button:has-text("Nhập dữ liệu")')

        // Should show file size error
        await expect(page.locator('text=File quá lớn')).toBeVisible()
        await expect(page.locator('text=Vui lòng chọn file nhỏ hơn')).toBeVisible()
    })

    test('should handle malformed JSON import', async ({ page }) => {
        await page.goto('/admin/ai-tools')
        await page.click('button:has-text("Nhập dữ liệu")')

        // Mock malformed JSON error
        await page.route('/api/admin/ai-tools/import', route => {
            route.fulfill({
                status: 400,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Invalid JSON format' })
            })
        })

        // Upload malformed JSON
        await page.setInputFiles('input[type="file"]', {
            name: 'invalid.json',
            mimeType: 'application/json',
            buffer: Buffer.from('{ invalid json }')
        })

        await page.click('button:has-text("Nhập dữ liệu")')

        // Should show JSON format error
        await expect(page.locator('text=Định dạng JSON không hợp lệ')).toBeVisible()
        await expect(page.locator('text=Vui lòng kiểm tra lại file')).toBeVisible()
    })

    test('should handle permission errors', async ({ page }) => {
        // Mock permission error
        await page.route('/api/admin/ai-tools', route => {
            if (route.request().method() === 'DELETE') {
                route.fulfill({
                    status: 403,
                    contentType: 'application/json',
                    body: JSON.stringify({ error: 'Insufficient permissions' })
                })
            } else {
                route.continue()
            }
        })

        await page.goto('/admin/ai-tools')

        // Try to delete an AI tool
        await page.click('tbody tr:first-child button:has-text("Xóa")')
        await page.click('button:has-text("Xóa")') // Confirm deletion

        // Should show permission error
        await expect(page.locator('text=Không đủ quyền')).toBeVisible()
        await expect(page.locator('text=Bạn không có quyền thực hiện hành động này')).toBeVisible()
    })

    test('should handle concurrent modification errors', async ({ page }) => {
        // Mock conflict error (resource was modified by another user)
        await page.route('/api/admin/ai-tools/*', route => {
            if (route.request().method() === 'PUT') {
                route.fulfill({
                    status: 409,
                    contentType: 'application/json',
                    body: JSON.stringify({ error: 'Resource was modified by another user' })
                })
            } else {
                route.continue()
            }
        })

        await page.goto('/admin/ai-tools')

        // Try to edit an AI tool
        await page.click('tbody tr:first-child button:has-text("Chỉnh sửa")')
        await page.fill('input[name="name"]', 'Modified Name')
        await page.click('button[type="submit"]')

        // Should show conflict error
        await expect(page.locator('text=Xung đột dữ liệu')).toBeVisible()
        await expect(page.locator('text=Dữ liệu đã được người khác chỉnh sửa')).toBeVisible()
        await expect(page.locator('button:has-text("Tải lại")')).toBeVisible()
    })

    test('should handle rate limiting errors', async ({ page }) => {
        // Mock rate limit error
        await page.route('/api/admin/ai-tools', route => {
            route.fulfill({
                status: 429,
                contentType: 'application/json',
                body: JSON.stringify({
                    error: 'Too many requests',
                    retryAfter: 60
                })
            })
        })

        await page.goto('/admin/ai-tools')

        // Should show rate limit error
        await expect(page.locator('text=Quá nhiều yêu cầu')).toBeVisible()
        await expect(page.locator('text=Vui lòng thử lại sau 60 giây')).toBeVisible()
    })

    test('should provide error recovery options', async ({ page }) => {
        // Mock server error
        await page.route('/api/admin/ai-tools', route => {
            route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Internal server error' })
            })
        })

        await page.goto('/admin/ai-tools')

        // Should show error with recovery options
        await expect(page.locator('button:has-text("Thử lại")')).toBeVisible()
        await expect(page.locator('button:has-text("Báo cáo lỗi")')).toBeVisible()
        await expect(page.locator('button:has-text("Quay lại trang chủ")')).toBeVisible()

        // Test retry functionality
        let retryCount = 0
        await page.route('/api/admin/ai-tools', route => {
            retryCount++
            if (retryCount <= 2) {
                route.fulfill({
                    status: 500,
                    contentType: 'application/json',
                    body: JSON.stringify({ error: 'Internal server error' })
                })
            } else {
                route.fulfill({
                    status: 200,
                    contentType: 'application/json',
                    body: JSON.stringify({ tools: [], total: 0 })
                })
            }
        })

        await page.click('button:has-text("Thử lại")')

        // Should eventually succeed after retries
        await expect(page.locator('text=Không có công cụ AI nào')).toBeVisible({ timeout: 5000 })
    })

    test('should log errors for debugging', async ({ page }) => {
        // Listen for console errors
        const consoleErrors: string[] = []
        page.on('console', msg => {
            if (msg.type() === 'error') {
                consoleErrors.push(msg.text())
            }
        })

        // Mock server error
        await page.route('/api/admin/ai-tools', route => {
            route.fulfill({
                status: 500,
                contentType: 'application/json',
                body: JSON.stringify({ error: 'Internal server error' })
            })
        })

        await page.goto('/admin/ai-tools')

        // Wait for error to be logged
        await page.waitForTimeout(1000)

        // Should have logged the error
        expect(consoleErrors.some(error => error.includes('Internal server error'))).toBe(true)
    })
})