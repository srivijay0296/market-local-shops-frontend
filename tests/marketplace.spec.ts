import { test, expect } from '@playwright/test';

// 🔍 BTM Marketplace: Automated Nexus Health Check
test('🌌 Universal UI and Network Health Calibration', async ({ page }) => {
  const errors: string[] = [];
  const networkErrors: string[] = [];

  // 🛡️ Track Console Nodes
  page.on('console', msg => {
    if (msg.type() === 'error') {
      errors.push(`[Console Error] ${msg.text()}`);
      console.error(`🔴 Nexus Console Fault: ${msg.text()}`);
    }
  });

  // 📡 Propagate Network Probes
  page.on('requestfailed', request => {
    const url = request.url();
    if (url.includes('localhost') || url.includes('supabase.co')) {
      networkErrors.push(`${url} failed: ${request.failure()?.errorText}`);
      console.error(`🔴 Network Pulse Disruption: ${url} -> ${request.failure()?.errorText}`);
    }
  });

  page.on('response', response => {
    const url = response.url();
    if (response.status() >= 400 && (url.includes('localhost') || url.includes('supabase.co'))) {
      networkErrors.push(`${url} -> ${response.status()}`);
      console.error(`🔴 Nexus Resource Fault (4xx/5xx): ${url} returned ${response.status()}`);
    }
  });

  console.log('🚀 Initializing Deep Link Probe: /');
  await page.goto('/');

  // 🏁 Verify Base Hub Rendering
  const headerContent = page.locator('header');
  await expect(headerContent).toBeVisible();

  // 🔍 Specialized Node Checks: /api/products
  const productsResponse = await page.request.get('http://localhost:5000/api/products');
  console.log(`📦 /api/products Probe: ${productsResponse.ok() ? 'SUCCESS' : 'FAILED (' + productsResponse.status() + ')'}`);
  expect(productsResponse.ok()).toBeTruthy();

  // 🔍 Specialized Node Checks: /api/shops
  const shopsResponse = await page.request.get('http://localhost:5000/api/shops');
  console.log(`🏠 /api/shops Probe: ${shopsResponse.ok() ? 'SUCCESS' : 'FAILED (' + shopsResponse.status() + ')'}`);
  expect(shopsResponse.ok()).toBeTruthy();

  // 🛡️ Error Boundary Finality
  if (errors.length > 0 || networkErrors.length > 0) {
      console.error('🌌 SYSTEM DESTABILIZATION DETECTED:');
      console.error('- Console Faults:', errors);
      console.error('- Network Faults:', networkErrors);
      throw new Error(`Critical Nexus Failure: ${errors.length} Console errors, ${networkErrors.length} Network errors found.`);
  }

  console.log('✅ Nexus Stability Confirmed: All nodes active and reporting healthy pulses.');
});
