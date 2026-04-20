import { test, expect } from '@playwright/test';

/**
 * Smoke tests: verify that pages load and render their basic structure.
 * These tests do NOT require authentication and do NOT depend on real Supabase data.
 */

const TEST_SLUG = 'fe2026'; // Update this to a slug that exists in your test environment

test.describe('Public Pages — Smoke Tests', () => {

  test('Homepage redirects to login or dashboard when auth state resolves', async ({ page }) => {
    await page.goto('/');
    // Wait for Vite + React to fully hydrate
    await page.waitForLoadState('networkidle');

    // Should show EITHER the Eventify login screen OR the admin dashboard
    const hasLoginButton = await page.getByRole('button', { name: /Entrar com Google/i }).isVisible().catch(() => false);
    const hasDashboardHeading = await page.getByRole('heading', { name: /Dashboard/i }).isVisible().catch(() => false);

    expect(hasLoginButton || hasDashboardHeading).toBeTruthy();
  });

  test('Event page loads without crashing', async ({ page }) => {
    await page.goto(`/event/${TEST_SLUG}`);
    await page.waitForLoadState('networkidle');

    // Should NOT show a blank page or Vite error overlay
    const viteError = page.locator('vite-error-overlay');
    await expect(viteError).not.toBeVisible();

    // Should show SOMETHING — either a loader, the event content, or "not found" message
    const body = page.locator('body');
    await expect(body).not.toBeEmpty();
  });

  test('Event page shows event name or loading indicator', async ({ page }) => {
    await page.goto(`/event/${TEST_SLUG}`);
    // Allow up to 10s for data to load
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // Accept either: a loading spinner text, the event name, or an error message
    const loadingText = page.getByText(/Carregando evento/i);
    const errorText = page.getByText(/Evento não encontrado/i);
    const eventHeader = page.locator('header');

    const isLoading = await loadingText.isVisible().catch(() => false);
    const isError = await errorText.isVisible().catch(() => false);
    const hasHeader = await eventHeader.isVisible().catch(() => false);

    expect(isLoading || isError || hasHeader).toBeTruthy();
  });

  test('TV view page loads without crashing', async ({ page }) => {
    await page.goto(`/tv/${TEST_SLUG}`);
    await page.waitForLoadState('networkidle');

    const viteError = page.locator('vite-error-overlay');
    await expect(viteError).not.toBeVisible();

    // Should show either "loading" text or the TV header
    const body = page.locator('body');
    await expect(body).not.toBeEmpty();
  });

  test('Unknown route redirects to home', async ({ page }) => {
    await page.goto('/this-route-does-not-exist-12345');
    await page.waitForLoadState('networkidle');

    // Should be redirected to '/' (login or dashboard)
    expect(page.url()).toMatch(/localhost:3000\/?$/);
  });
});
