/**
 * @file tests/checkout.spec.ts
 *
 * End-to-End Checkout Test for OtakuBazaar.
 *
 * Simulates complete buyer journey:
 * 1. Navigate to http://localhost:3000
 * 2. Locate and click first product thumbnail in grid to view details
 * 3. Click "Add to Cart" or "Buy Now" button
 * 4. Assert navigation to checkout/order page
 * 5. Click "Pay Securely" Razorpay checkout button
 * 6. Assert Razorpay checkout modal appears in DOM without Next.js hydration or console errors.
 */

import { test, expect } from '@playwright/test';

test.describe('End-to-End Checkout Flow', () => {
  test('complete buyer journey to Razorpay checkout modal without errors', async ({ page }) => {
    test.setTimeout(60000);
    const consoleErrors: string[] = [];
    const hydrationErrors: string[] = [];

    // Listen for console errors and Next.js hydration warnings
    page.on('console', (msg) => {
      const text = msg.text();
      if (msg.type() === 'error') {
        // Exclude standalone dev websocket background connection failures
        if (!text.includes('ERR_CONNECTION_REFUSED') && !text.includes('WebSocket')) {
          consoleErrors.push(text);
        }
      }
      if (text.toLowerCase().includes('hydration') || text.toLowerCase().includes('did not match')) {
        hydrationErrors.push(text);
      }
    });

    page.on('pageerror', (err) => {
      consoleErrors.push(err.message);
    });

    // Dismiss cookie consent banner so it does not intercept clicks
    await page.addInitScript(() => {
      try {
        localStorage.setItem('otaku_cookie_consent', 'accepted');
      } catch {}
    });

    // 1. Navigate to the local Next.js environment
    await page.goto('http://localhost:3000');

    // 2. Locate and click the first product thumbnail in the grid to view details
    const firstProductThumbnail = page
      .locator('[data-testid="product-thumbnail"], #product-grid a, .product-thumbnail')
      .first();
    await expect(firstProductThumbnail).toBeVisible({ timeout: 10000 });
    await firstProductThumbnail.click();

    // 3. Click the "Add to Cart" or "Buy Now" button
    const addToCartOrBuyNowBtn = page.getByRole('button', { name: /add to cart|buy now/i });
    await addToCartOrBuyNowBtn.click();

    // 4. Assert that the app successfully navigates to the checkout/order page
    await expect(page).toHaveURL(/.*(checkout|order).*/, { timeout: 10000 });

    // 5. Click the "Pay Securely" Razorpay checkout button
    const paySecurelyBtn = page
      .getByRole('button', { name: /pay securely/i })
      .or(page.locator('button:has-text("Pay Securely"), [data-testid="pay-securely-button"], button#pay-securely-btn'))
      .first();
    await expect(paySecurelyBtn).toBeVisible({ timeout: 10000 });
    await page.waitForFunction(() => typeof (window as any).Razorpay !== 'undefined', { timeout: 10000 }).catch(() => {});
    await paySecurelyBtn.click();

    // 6. Assert that the Razorpay checkout modal successfully appears in the DOM
    const razorpayModal = page
      .locator('.razorpay-checkout-frame, .razorpay-container, iframe[src*="razorpay"], iframe[name*="razorpay"], [data-testid="razorpay-modal"]')
      .first();
    await expect(razorpayModal).toBeAttached({ timeout: 15000 });

    // Assert that no Next.js hydration or console errors occurred
    expect(hydrationErrors).toHaveLength(0);
    expect(consoleErrors).toHaveLength(0);
  });
});
