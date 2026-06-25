import { test, expect } from '@playwright/test';
import path from 'path';

test('Capture application UI screenshots', async ({ page }) => {
  page.on('console', msg => console.log('BROWSER LOG:', msg.type(), msg.text()));
  page.on('pageerror', err => console.log('BROWSER PAGE ERROR:', err.message));

  // Set viewport to a nice standard desktop size
  await page.setViewportSize({ width: 1280, height: 800 });

  const artifactDir = 'C:/Users/srivi/.gemini/antigravity/brain/54f764bd-5b2c-4113-a835-36a2231e2070';
  const testEmail = 'srivijay0296@gmail.com';
  const testPassword = 'vijayraj143@';

  console.log('1. Navigating to Home Page...');
  await page.goto('/');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: path.join(artifactDir, 'home_page.png') });

  console.log('2. Opening Login Modal...');
  const loginButton = page.locator('button:has-text("Login")');
  if (await loginButton.isVisible()) {
    await loginButton.click();
    await page.waitForTimeout(1000);
    await page.screenshot({ path: path.join(artifactDir, 'login_modal.png') });

    console.log('3. Logging in...');
    await page.fill('input[type="email"]', testEmail);
    await page.fill('input[type="password"]', testPassword);
    await page.click('button:has-text("VERIFY ACCESS")');
  } else {
    console.log('Login button not visible, attempting direct navigation or already logged in.');
  }

  // Wait for login redirection / authentication sync
  console.log('4. Waiting for authenticated landing page...');
  await page.waitForTimeout(5000);
  await page.screenshot({ path: path.join(artifactDir, 'logged_in_home.png') });

  console.log('5. Navigating to /seller-dashboard...');
  await page.goto('/seller-dashboard');
  await page.waitForTimeout(4000);
  await page.screenshot({ path: path.join(artifactDir, 'seller_dashboard.png') });

  console.log('6. Navigating to /admin...');
  await page.goto('/admin');
  await page.waitForTimeout(4000);
  await page.screenshot({ path: path.join(artifactDir, 'admin_dashboard.png') });

  console.log('Screenshots captured successfully!');
});
