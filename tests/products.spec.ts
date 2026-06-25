import { test, expect } from '@playwright/test';

test.describe('Product Management', () => {
    test.beforeEach(async ({ page }) => {
        test.setTimeout(60000);

        // Log all console errors/messages from the browser
        page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
        page.on('pageerror', err => console.log('BROWSER PAGE ERROR:', err.message));

        // Login setup: Use environment variables for credentials
        const testEmail = process.env.E2E_TEST_EMAIL?.trim() || 'srivijay0296@gmail.com';
        const testPassword = process.env.E2E_TEST_PASSWORD?.trim() || 'vijayraj143@';
        
        await page.goto('/');
        await page.click('button:has-text("Login")');
        await page.fill('input[type="email"]', testEmail);
        await page.fill('input[type="password"]', testPassword);
        await page.click('button:has-text("VERIFY ACCESS")');
        
        // Wait for login to complete and redirect to the admin panel
        await expect(page.locator('text=NammaHQ')).toBeVisible({ timeout: 15000 });
    });

    test('Add a new product through seller dashboard', async ({ page }) => {
        // Go to seller-dashboard
        await page.goto('/seller-dashboard');
        
        // Open form
        await page.click('button:has-text("PROVISION NEW ASSET")', { timeout: 15000 });

        // Fill form
        await page.fill('input[placeholder="E.G. HAND-WOVEN SILK SAREE"]', 'Test Automaton Saree');
        await page.fill('input[placeholder="0.00"]', '4999');
        await page.selectOption('select', 'Silk');
        await page.fill('textarea[placeholder="DESCRIBE THE ASSET QUALITY, WEAVE, AND CRAFTSMANSHIP..."]', 'High quality silk for automation testing.');

        // Submit
        await page.click('button:has-text("COMMENCE LISTING")');

        // Check for toast
        await page.waitForSelector('text=provisioned successfully', { timeout: 15000 });
        await expect(page.locator('text=Test Automaton Saree')).toBeVisible({ timeout: 15000 });
    });
});
