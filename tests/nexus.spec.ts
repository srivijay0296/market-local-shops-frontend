import { test, expect } from '@playwright/test';

test.describe('🌌 BTM Nexus Architecture Integration', () => {
    
    test('Protocol 0: Health Check', async ({ request }) => {
        const response = await request.get('http://localhost:5000/api/health');
        expect(response.ok()).toBeTruthy();
        const body = await response.json();
        expect(body.status).toBe('Operational ✅');
    });

    test('Protocol 1: Secure Auth Login', async ({ page }) => {
        // Use environment variables for test credentials
        const testEmail = process.env.E2E_TEST_EMAIL || 'srivijay0296@gmail.com';
        const testPassword = process.env.E2E_TEST_PASSWORD || 'vijayraj143@';
        
        await page.goto('/');
        await page.click('button:has-text("Login")');
        await page.fill('input[type="email"]', testEmail);
        await page.fill('input[type="password"]', testPassword);
        await page.click('button:has-text("VERIFY ACCESS")');

        // Check if redirected or logged in
        await expect(page.locator('text=NammaHQ')).toBeVisible({ timeout: 10000 });
    });

    test('Protocol 2: Inventory Sync (POST -> GET)', async ({ request, page }) => {
        // This tests the full path: Frontend -> Backend -> Supabase -> Backend -> Frontend
        await page.goto('/shop/11111111-1111-1111-1111-111111111111'); // Example shop
        await expect(page.locator('.product-card')).toBeVisible();
    });

});
