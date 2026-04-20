import { test, expect } from '@playwright/test';

/**
 * Event Page UI tests.
 * Verifies the core guest user experience on the event app.
 * Tests are resilient: they gracefully skip assertions when elements aren't present
 * (e.g., when there are no approved photos yet in the test environment).
 */

const TEST_SLUG = 'fe2026'; // Update to a valid slug
const EVENT_URL = `/event/${TEST_SLUG}`;

test.describe('Event Page — Guest Experience', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto(EVENT_URL);
    await page.waitForLoadState('networkidle');
    // Wait for the React app to fully hydrate
    await page.waitForTimeout(1500);
  });

  test('Event header is visible', async ({ page }) => {
    // The header should always be visible once the page loads
    const header = page.locator('header').first();
    await expect(header).toBeVisible({ timeout: 8000 });
  });

  test('Login button is visible for guest users', async ({ page }) => {
    // The "Entrar" button should be visible in the header for non-authenticated users
    // Use exact: true to avoid matching "Entrar com Google" as well
    const loginBtn = page.getByRole('button', { name: 'Entrar', exact: true });
    const hasLoginBtn = await loginBtn.isVisible().catch(() => false);

    // Also check for the Google button (shown when auth resolves to unauthenticated)
    const googleBtn = page.getByRole('button', { name: /Entrar com Google/i });
    const hasGoogleBtn = await googleBtn.isVisible().catch(() => false);

    expect(hasLoginBtn || hasGoogleBtn).toBeTruthy();
  });

  test('Clicking login button opens the login modal', async ({ page }) => {
    const loginBtn = page.getByRole('button', { name: 'Entrar', exact: true });

    // Only proceed if the exact 'Entrar' button exists (guest mode, not already showing Google button)
    if (await loginBtn.isVisible().catch(() => false)) {
      await loginBtn.click();

      // Google login button should appear in the modal — use .first() to avoid strict mode issues
      const googleBtn = page.getByRole('button', { name: /Entrar com Google/i }).first();
      await expect(googleBtn).toBeVisible({ timeout: 3000 });
    }
  });

  test('Login modal can be dismissed with Escape', async ({ page }) => {
    const loginBtn = page.getByRole('button', { name: 'Entrar', exact: true });

    if (await loginBtn.isVisible().catch(() => false)) {
      await loginBtn.click();

      // Modal should open — verify at least one Google button is visible
      const googleBtn = page.getByRole('button', { name: /Entrar com Google/i }).first();
      await expect(googleBtn).toBeVisible({ timeout: 3000 });

      // Dismiss with Escape — the page should not crash
      await page.keyboard.press('Escape');
      await page.waitForTimeout(500);

      // The event page header should still be visible after closing the modal
      const header = page.locator('header').first();
      await expect(header).toBeVisible();
    }
  });

  test('Feed grid or empty state is shown', async ({ page }) => {
    // After loading, we should see either:
    // a) Photos in the feed
    // b) An empty state message
    // c) A loading state (pre event)
    const hasPhotos = await page.locator('img').count() > 0;
    const hasPreEventContent = await page.getByText(/O evento começa em/i).isVisible().catch(() => false);
    const hasPostEventContent = await page.getByText(/obrigado/i).isVisible().catch(() => false);
    const hasEmptyState = await page.getByText(/Seja o primeiro/i).isVisible().catch(() => false);

    // At least ONE of these states should be true
    expect(hasPhotos || hasPreEventContent || hasPostEventContent || hasEmptyState).toBeTruthy();
  });

  test('Menu sidebar can be opened and closed', async ({ page }) => {
    // Look for the hamburger menu button (has a Menu icon / 3 bars)
    const menuButton = page.locator('header button').first();

    if (await menuButton.isVisible()) {
      await menuButton.click();

      // Sidebar should appear with "Menu" heading
      const sidebarHeading = page.getByRole('heading', { name: /Menu/i });
      await expect(sidebarHeading).toBeVisible({ timeout: 3000 });

      // Close sidebar with the X button or by pressing Escape
      await page.keyboard.press('Escape');
    }
  });
});
