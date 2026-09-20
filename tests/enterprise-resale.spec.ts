import { test, expect } from '@playwright/test';

test.describe('Enterprise Resale Flow: 24h Bidding, Auto-Reject, & Cart Drawer', () => {
  test.setTimeout(60000);

  test('full user flow: price tap offer, auto-rejection, cart drawer negotiation, and escrow unlock', async ({ page }) => {
    // Dismiss cookie banner
    await page.addInitScript(() => {
      try {
        localStorage.setItem('otaku_cookie_consent', 'accepted');
      } catch {}
    });

    // 1. Navigate to home
    await page.goto('http://localhost:3000');

    // 2. Verify interactive price badge is present and tapping it opens the Bargain Modal
    const pricePill = page.locator('[aria-label*="Tap asking price to make an offer"]').first();
    await expect(pricePill).toBeVisible({ timeout: 15000 });
    await pricePill.click();

    // 3. Verify Bargain modal appears
    const bargainModalTitle = page.locator('#bargain-modal-title, #bargain-drawer-title');
    await expect(bargainModalTitle).toBeVisible({ timeout: 10000 });

    // 4. Test lowball auto-rejection: enter a low offer like ₹100
    const offerInput = page.locator('#offer-amount');
    await offerInput.fill('100');
    const submitBidBtn = page.getByRole('button', { name: /send bargain offer|submit 24-hour bid/i });
    await submitBidBtn.click();

    // 5. Verify auto-rejection banner appears
    const autoRejectMsg = page.locator('text=/Offer auto-rejected: Bid is too low/i');
    await expect(autoRejectMsg).toBeVisible({ timeout: 10000 });

    // 6. Close the modal
    const closeModalBtn = page.getByRole('button', { name: /close modal/i }).first();
    await closeModalBtn.click();
    await expect(bargainModalTitle).not.toBeVisible();

    // 7. Add item to cart via Quick Cart button
    const quickCartBtn = page.locator('button[aria-label="Quick Cart"]').first();
    await expect(quickCartBtn).toBeVisible({ timeout: 10000 });
    await quickCartBtn.click();

    // 8. Verify Cart Drawer is visible
    const cartDrawerTitle = page.locator('#cart-drawer-title');
    await expect(cartDrawerTitle).toBeVisible({ timeout: 15000 });

    // 9. Verify carted item appears in the cart drawer
    const cartItem = page.locator('[role="dialog"] h3, dialog h3, #cart-drawer-title ~ div h3').first();
    await expect(cartItem).toBeVisible({ timeout: 20000 });

    // 10. Click cart item to open negotiation drawer
    await cartItem.click();

    // 11. Verify negotiation drawer opens with 24-hour timer
    const countdownBadge = page.locator('text=/⏱️/i').first();
    await expect(countdownBadge).toBeVisible({ timeout: 15000 });

    // 12. Verify escrow payment button state
    const acceptDemoBtn = page.getByRole('button', { name: /accept offer|seller accepts/i }).first();
    if (await acceptDemoBtn.isVisible({ timeout: 3000 }).catch(() => false)) {
      const lockedPaymentBtn = page.getByRole('button', { name: /awaiting seller acceptance|razorpay escrow locked/i });
      await expect(lockedPaymentBtn).toBeDisabled();

      await acceptDemoBtn.click();
    }

    // 13. Verify payment button is UNLOCKED
    const unlockedPaymentBtn = page.getByRole('button', { name: /pay.*via escrow/i });
    await expect(unlockedPaymentBtn).toBeVisible({ timeout: 15000 });
    await expect(unlockedPaymentBtn).toBeEnabled();

    console.log('✓ Enterprise Resale E2E test completed successfully!');
  });
});
