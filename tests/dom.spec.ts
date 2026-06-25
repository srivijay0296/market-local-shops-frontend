import { test, expect } from '@playwright/test';

test('print DOM of seller dashboard', async ({ page }) => {
  test.setTimeout(120000);
  page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER PAGE ERROR:', err.message));

  const testEmail = 'srivijay0296@gmail.com';
  const testPassword = 'vijayraj143@';
  
  await page.goto('/');
  await page.click('button:has-text("Login")');
  await page.fill('input[type="email"]', testEmail);
  await page.fill('input[type="password"]', testPassword);
  await page.click('button:has-text("VERIFY ACCESS")');
  
  // Wait for login to complete and redirect to the admin panel
  await expect(page.locator('text=NammaHQ')).toBeVisible({ timeout: 15000 });

  console.log('Navigating to /seller-dashboard...');
  await page.goto('/seller-dashboard');

  // Wait 15 seconds to let dashboard data load
  await page.waitForTimeout(15000);

  console.log('Current URL:', page.url());
  const bodyHtml = await page.evaluate(() => document.body.innerHTML);
  console.log('DOM length:', bodyHtml.length);
  console.log('DOM Snippet (first 1000 chars):', bodyHtml.substring(0, 1000));
  
  // Take a screenshot to verify
  await page.screenshot({ path: 'tests/seller-dashboard-debug.png' });
});
