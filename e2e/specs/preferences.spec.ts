import { test, expect } from '../fixtures';
import { dismissCookieBanner } from '../helpers/cookie-banner';
import { password } from '../helpers/test-user';
import { createTestUser, loginAs, TestUser } from '../helpers/auth';

test.describe('preferences', () => {
  let testUser: TestUser;

  test.beforeAll(async ({ request }) => {
    testUser = await createTestUser(request);
  });

  test.beforeEach(async ({ page }) => {
    await page.goto('/login');
    await dismissCookieBanner(page);
    await loginAs(page, testUser);
  });

  test('persists user preferences (theme, font size, line numbers) across reload ', async ({
    page
  }) => {
    await expect(page.locator('.cm-lineNumbers')).toBeVisible();

    await page.getByRole('button', { name: 'Open Preferences' }).click();
    await expect(page.locator('.preferences')).toBeVisible();

    await page.getByRole('radio', { name: 'Dark Theme' }).check();
    await expect(page.locator('body')).toHaveClass(/dark/);

    await page.getByRole('button', { name: 'Decrease font size' }).click();
    const fontSizeInput = page.locator('#font-size-value');
    await expect(fontSizeInput).toHaveValue('16');

    await page.getByRole('tab', { name: 'Accessibility' }).click();
    await page.locator('#line-numbers-off').check();

    await page.keyboard.press('Escape');
    await expect(page.locator('.preferences')).toBeHidden();

    await page.waitForTimeout(500);

    await expect(page.locator('.cm-lineNumbers')).toHaveCount(0);
    // After page reload
    await page.reload();
    await expect(page.locator('.editor-holder')).toBeVisible({
      timeout: 15_000
    });

    await expect(page.locator('body')).toHaveClass(/dark/);

    await expect(page.locator('.cm-lineNumbers')).toHaveCount(0);

    await page.getByRole('button', { name: 'Open Preferences' }).click();
    await expect(page.locator('#font-size-value')).toHaveValue('16');
  });
});
