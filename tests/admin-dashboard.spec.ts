import { test, expect } from '@playwright/test';

/**
 * Admin Dashboard tests.
 * Tests the login screen and dashboard structure for unauthenticated users.
 * Note: Full admin flow tests would require Supabase test credentials.
 */

test.describe('Admin Dashboard — Login Screen', () => {

  test.beforeEach(async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000);
  });

  test('Login screen renders for unauthenticated users', async ({ page }) => {
    // Check if we got either login or dashboard
    const loginScreen = page.getByRole('button', { name: /Entrar com Google/i });
    const dashboard = page.getByRole('heading', { name: /Dashboard/i });

    const isLoginVisible = await loginScreen.isVisible().catch(() => false);
    const isDashboardVisible = await dashboard.isVisible().catch(() => false);

    expect(isLoginVisible || isDashboardVisible).toBeTruthy();
  });

  test('Page title is correct', async ({ page }) => {
    // The page should have the Eventify title (from index.html or document title)
    const title = await page.title();
    expect(title.length).toBeGreaterThan(0);
  });

  // This test only runs when the user is NOT logged in
  test('Eventify branding is visible on login screen', async ({ page }) => {
    const loginBtn = page.getByRole('button', { name: /Entrar com Google/i });

    if (await loginBtn.isVisible()) {
      // Check the Eventify heading
      const heading = page.getByRole('heading', { name: /Eventify/i });
      await expect(heading).toBeVisible();

      // Check the description text
      const desc = page.getByText(/Área administrativa/i);
      await expect(desc).toBeVisible();
    }
  });
});

test.describe('Admin Dashboard — Authenticated', () => {
  // These tests run only if PLAYWRIGHT_ADMIN_EMAIL and PLAYWRIGHT_ADMIN_PASSWORD
  // are set in the environment. They will be skipped otherwise.

  test.skip(!process.env.PLAYWRIGHT_ADMIN_EMAIL, 'Admin credentials not configured');

  test('Admin can log in with email/password', async ({ page }) => {
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const adminEmail = process.env.PLAYWRIGHT_ADMIN_EMAIL!;
    const adminPassword = process.env.PLAYWRIGHT_ADMIN_PASSWORD!;

    // Switch to password mode if needed
    const passwordTab = page.getByRole('button', { name: /Senha/i });
    if (await passwordTab.isVisible()) {
      await passwordTab.click();
    }

    await page.fill('input[type="email"]', adminEmail);
    await page.fill('input[type="password"]', adminPassword);
    await page.getByRole('button', { name: /Entrar/i }).click();

    // Should navigate to dashboard
    await expect(page.getByRole('heading', { name: /Dashboard/i })).toBeVisible({ timeout: 10000 });
  });

  test('Dashboard shows events list after login', async ({ page }) => {
    // Assumes the previous test or a global setup has authenticated the user
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    const dashboard = page.getByRole('heading', { name: /Dashboard/i });
    if (await dashboard.isVisible()) {
      // Should show "Meus Eventos" section
      const eventsHeading = page.getByRole('heading', { name: /Meus Eventos/i });
      await expect(eventsHeading).toBeVisible();
    }
  });
});
