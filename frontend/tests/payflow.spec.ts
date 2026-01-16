import { test, expect } from '@playwright/test';

test('Payflow shows confirm modal when clicking unlock', async ({ page }) => {
  await page.goto('/v2');

  // Wait for the pay button to be present
  const payButton = page.locator('button:has-text("Unlock Content")').first();
  await expect(payButton).toBeVisible({ timeout: 10000 });

  // Click the button to open confirm modal
  await payButton.click();

  // Assert confirm modal appears
  const modal = page.locator('text=Confirm Payment').first();
  await expect(modal).toBeVisible({ timeout: 5000 });
});
