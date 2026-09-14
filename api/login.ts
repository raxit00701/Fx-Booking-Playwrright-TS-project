import { Page } from '@playwright/test';

/**
 * Bypasses UI interaction for login by:
 * 1. Navigating to the login page to clear Cloudflare and extract the CSRF token.
 * 2. Executing a direct API POST request with the credentials and token.
 * 3. Navigating directly to the authenticated target country page.
 */
export async function bypassLogin(page: Page) {
    const username = process.env.FUNEX_USERNAME;
    const password = process.env.FUNEX_PASSWORD;
    const baseUrl = process.env.FUNEX_BASE_URL || 'https://example.com';

    if (!username || !password) {
        throw new Error('FUNEX_USERNAME or FUNEX_PASSWORD is not defined in .env');
    }

    const loginUrl = `${baseUrl}/Account/Login?returnUrl=......`;

    await page.goto(loginUrl);

    const tokenLocator = page.locator('input[name="__RequestVerificationToken"]').first();
    await tokenLocator.waitFor({ state: 'attached' });
    const verificationToken = await tokenLocator.inputValue();

    if (!verificationToken) {
        throw new Error('Could not find __RequestVerificationToken on the page.');
    }

    const postResponse = await page.request.post(loginUrl, {
        form: {
            'Input.Email': username,
            'Input.Password': password,
            'Input.RememberMe': 'true',
            '__RequestVerificationToken': verificationToken
        },
        maxRedirects: 0,
    });

    if (postResponse.status() !== 302) {
        throw new Error(`API Login failed. Expected status 302, got ${postResponse.status()}`);
    }

    await page.goto(`${baseUrl}/home/country/india`);
}