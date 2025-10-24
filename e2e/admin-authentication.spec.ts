import { test, expect } from '@playwright/test'

test.describe('Admin Authentication E2E Tests', () => {
    test('should redirect non-authenticated users to login', async ({ page }) => {
        // Try to access admin dashboard without authentication
        await page.goto('/admin/dashboard')

        // Should be redirected to login page
        await expect(page).toHaveURL(/.*\/auth\/signin/)
        await expect(page.locator('text=Đăng nhập')).toBeVisible()
    })

    test('should redirect non-admin users to unauthorized page', async ({ page }) => {
        // Mock non-admin user session
        await page.addInitScript(() => {
            window.localStorage.setItem('next-auth.session-token', JSON.stringify({
                user: { id: 'user-1', email: 'user@test.com', role: 'user' },
                expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            }))
        })

        await page.goto('/admin/dashboard')

        // Should show unauthorized message
        await expect(page.locator('text=Không có quyền truy cập')).toBeVisible()
        await expect(page.locator('text=Bạn không có quyền truy cập vào trang này')).toBeVisible()
    })

    test('should allow admin users to access admin dashboard', async ({ page }) => {
        // Mock admin user session
        await page.addInitScript(() => {
            window.localStorage.setItem('next-auth.session-token', JSON.stringify({
                user: { id: 'admin-1', email: 'admin@test.com', role: 'admin', name: 'Test Admin' },
                expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            }))
        })

        await page.goto('/admin/dashboard')

        // Should successfully load admin dashboard
        await expect(page.locator('h1')).toContainText('Admin Dashboard')
        await expect(page.locator('text=Test Admin')).toBeVisible()
        await expect(page.locator('text=admin@test.com')).toBeVisible()
    })

    test('should handle session expiration', async ({ page }) => {
        // Mock expired admin session
        await page.addInitScript(() => {
            window.localStorage.setItem('next-auth.session-token', JSON.stringify({
                user: { id: 'admin-1', email: 'admin@test.com', role: 'admin' },
                expires: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString() // Expired
            }))
        })

        await page.goto('/admin/dashboard')

        // Should be redirected to login due to expired session
        await expect(page).toHaveURL(/.*\/auth\/signin/)
        await expect(page.locator('text=Phiên đăng nhập đã hết hạn')).toBeVisible()
    })

    test('should allow admin to logout', async ({ page }) => {
        // Mock admin user session
        await page.addInitScript(() => {
            window.localStorage.setItem('next-auth.session-token', JSON.stringify({
                user: { id: 'admin-1', email: 'admin@test.com', role: 'admin', name: 'Test Admin' },
                expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            }))
        })

        await page.goto('/admin/dashboard')

        // Click logout button
        await page.click('button:has-text("Đăng xuất")')

        // Should be redirected to home page or login page
        await expect(page).toHaveURL(/.*\/(auth\/signin|$)/)

        // Try to access admin page again - should be redirected to login
        await page.goto('/admin/dashboard')
        await expect(page).toHaveURL(/.*\/auth\/signin/)
    })

    test('should validate admin role on API requests', async ({ page }) => {
        // Mock non-admin user session
        await page.addInitScript(() => {
            window.localStorage.setItem('next-auth.session-token', JSON.stringify({
                user: { id: 'user-1', email: 'user@test.com', role: 'user' },
                expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            }))
        })

        // Try to make API request to admin endpoint
        const response = await page.request.get('/api/admin/ai-tools')

        // Should return 403 Forbidden
        expect(response.status()).toBe(403)

        const responseBody = await response.json()
        expect(responseBody.error).toContain('Forbidden')
    })

    test('should allow admin API requests with valid session', async ({ page }) => {
        // Mock admin user session
        await page.addInitScript(() => {
            window.localStorage.setItem('next-auth.session-token', JSON.stringify({
                user: { id: 'admin-1', email: 'admin@test.com', role: 'admin' },
                expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            }))
        })

        // Make API request to admin endpoint
        const response = await page.request.get('/api/admin/ai-tools')

        // Should return 200 OK
        expect(response.status()).toBe(200)

        const responseBody = await response.json()
        expect(responseBody.tools).toBeDefined()
    })

    test('should handle concurrent admin sessions', async ({ browser }) => {
        // Create two browser contexts (simulate two admin users)
        const context1 = await browser.newContext()
        const context2 = await browser.newContext()

        const page1 = await context1.newPage()
        const page2 = await context2.newPage()

        // Mock different admin sessions
        await page1.addInitScript(() => {
            window.localStorage.setItem('next-auth.session-token', JSON.stringify({
                user: { id: 'admin-1', email: 'admin1@test.com', role: 'admin', name: 'Admin 1' },
                expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            }))
        })

        await page2.addInitScript(() => {
            window.localStorage.setItem('next-auth.session-token', JSON.stringify({
                user: { id: 'admin-2', email: 'admin2@test.com', role: 'admin', name: 'Admin 2' },
                expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            }))
        })

        // Both should be able to access admin dashboard
        await page1.goto('/admin/dashboard')
        await page2.goto('/admin/dashboard')

        await expect(page1.locator('text=Admin 1')).toBeVisible()
        await expect(page2.locator('text=Admin 2')).toBeVisible()

        // Both should be able to perform admin actions simultaneously
        await page1.goto('/admin/ai-tools')
        await page2.goto('/admin/templates')

        await expect(page1.locator('text=Quản lý AI Tools')).toBeVisible()
        await expect(page2.locator('text=Quản lý Templates')).toBeVisible()

        await context1.close()
        await context2.close()
    })

    test('should maintain session across page refreshes', async ({ page }) => {
        // Mock admin user session
        await page.addInitScript(() => {
            window.localStorage.setItem('next-auth.session-token', JSON.stringify({
                user: { id: 'admin-1', email: 'admin@test.com', role: 'admin', name: 'Test Admin' },
                expires: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
            }))
        })

        await page.goto('/admin/dashboard')
        await expect(page.locator('text=Test Admin')).toBeVisible()

        // Refresh the page
        await page.reload()

        // Should still be authenticated
        await expect(page.locator('text=Test Admin')).toBeVisible()
        await expect(page.locator('h1')).toContainText('Admin Dashboard')
    })

    test('should handle network errors during authentication', async ({ page }) => {
        // Mock network failure for auth requests
        await page.route('/api/auth/**', route => {
            route.abort('failed')
        })

        await page.goto('/admin/dashboard')

        // Should show appropriate error message
        await expect(page.locator('text=Lỗi kết nối')).toBeVisible()
        await expect(page.locator('text=Không thể xác thực người dùng')).toBeVisible()
    })
})