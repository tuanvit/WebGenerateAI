import { test, expect } from '@playwright/test'

test.describe('Admin Dashboard E2E Tests', () => {
    test.beforeEach(async ({ page }) => {
        // Mock authentication - in a real scenario, you'd handle login
        await page.goto('/admin/dashboard')
    })

    test('should display admin dashboard with navigation', async ({ page }) => {
        // Check if the admin dashboard loads
        await expect(page.locator('h1')).toContainText('Admin Dashboard')

        // Check navigation items
        await expect(page.locator('nav')).toContainText('Tổng quan')
        await expect(page.locator('nav')).toContainText('AI Tools')
        await expect(page.locator('nav')).toContainText('Templates')
        await expect(page.locator('nav')).toContainText('Cài đặt')
    })

    test('should display dashboard statistics', async ({ page }) => {
        // Wait for statistics to load
        await page.waitForSelector('[data-testid="dashboard-stats"]', { timeout: 10000 })

        // Check for stat cards
        await expect(page.locator('text=Tổng số AI Tools')).toBeVisible()
        await expect(page.locator('text=Tổng số Templates')).toBeVisible()
        await expect(page.locator('text=Người dùng hoạt động')).toBeVisible()
        await expect(page.locator('text=Tổng số Prompts')).toBeVisible()
    })

    test('should navigate to AI Tools management', async ({ page }) => {
        // Click on AI Tools navigation
        await page.click('text=AI Tools')

        // Check URL and page content
        await expect(page).toHaveURL('/admin/ai-tools')
        await expect(page.locator('h1')).toContainText('Quản lý AI Tools')
    })

    test('should navigate to Templates management', async ({ page }) => {
        // Click on Templates navigation
        await page.click('text=Templates')

        // Check URL and page content
        await expect(page).toHaveURL('/admin/templates')
        await expect(page.locator('h1')).toContainText('Quản lý Templates')
    })

    test('should be responsive on mobile devices', async ({ page }) => {
        // Set mobile viewport
        await page.setViewportSize({ width: 375, height: 667 })

        // Check if mobile menu toggle is visible
        await expect(page.locator('[aria-label="Toggle menu"]')).toBeVisible()

        // Click mobile menu toggle
        await page.click('[aria-label="Toggle menu"]')

        // Check if navigation is visible after toggle
        await expect(page.locator('nav')).toBeVisible()
    })
})