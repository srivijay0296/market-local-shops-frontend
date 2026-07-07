import { test, expect } from '@playwright/test';

test.describe('Authentication Flow', () => {
    test.beforeEach(async ({}) => {
        test.setTimeout(60000);
    });

    test('Successful login with demo admin account', async ({ page }) => {
        await page.goto('/');
        
        // Open Auth Modal
        await page.click('button:has-text("Login")');
        
        // Wait for modal and find input
        await page.waitForSelector('input[type="email"]');
        
        const testEmail = process.env.E2E_TEST_EMAIL || 'srivijay0296@gmail.com';
        const testPassword = process.env.E2E_TEST_PASSWORD || 'vijayraj143@';

        await page.fill('input[type="email"]', testEmail);
        await page.fill('input[type="password"]', testPassword);
        
        // Submit
        await page.click('button:has-text("VERIFY ACCESS")');
        
        // Verify we are logged in - admin redirects to /admin which shows NammaHQ
        await expect(page.locator('text=NammaHQ')).toBeVisible({ timeout: 15000 });
    });

    test('Access Denied for non-admin user on admin route', async ({ page }) => {
        await page.goto('/admin');
        // Since we are not logged in, we should see the access restriction screen on the /admin route itself
        await expect(page.locator('text=Access Restricted')).toBeVisible({ timeout: 15000 });
    });
});
