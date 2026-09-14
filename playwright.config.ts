import { defineConfig } from '@playwright/test';
import * as path from 'path';
import dotenv from 'dotenv';


// ─────────────────────────────────────────────
//  DYNAMIC CONFIGURATION – toggle via ENV VARS
// ─────────────────────────────────────────────


dotenv.config({
    path: path.resolve(__dirname, '.env'),
});

// ── Environment configuration ─────────────────

const BASE_URL = process.env.FUNEX_BASE_URL;

if (!BASE_URL) {
    throw new Error(
        'FUNEX_BASE_URL is not defined in .env'
    );
}

// Headless mode is controlled ONLY by .env
const isHeadless =
    process.env.FUNEX_HEADLESS?.toLowerCase() === 'true';

// ─────────────────────────────────────────────
//  FULL SCREEN
// ─────────────────────────────────────────────

const VIEWPORT = isHeadless
    ? { width: 1920, height: 1080 }
    : null;



// ─────────────────────────────────────────────
//  MAIN CONFIG
// ─────────────────────────────────────────────

export default defineConfig({

    testDir: './tests',



    // ── Parallelism ───────────────────────────
    fullyParallel: true,

    // ── Retries ───────────────────────────────
    retries: process.env.CI ? 2 : 0,

    // ── Timeouts ──────────────────────────────
    timeout: 180000,

    expect: {
        timeout: 10_000,
    },

    // ── Global use ────────────────────────────
    use: {
        baseURL: BASE_URL,

        trace: 'retain-on-failure',
        screenshot: 'only-on-failure',
        video: 'retain-on-failure',

        actionTimeout: 15_000,
        navigationTimeout: 30_000,
    },

    // ─────────────────────────────────────────
    //  BROWSER PROJECTS
    // ─────────────────────────────────────────

    projects: [

        // ── Chrome ────────────────────────────
        {
            name: 'chrome',

            use: {
                browserName: 'chromium',
                channel: 'chrome',
                viewport: VIEWPORT,

                launchOptions: {
                    headless: isHeadless,

                    args: [
                        '--start-maximized',
                        '--disable-infobars',
                        '--no-default-browser-check',
                    ],
                },
            },
        },

        // ── Firefox ───────────────────────────
        {
            name: 'firefox',

            use: {
                browserName: 'firefox',

                viewport: {
                    width: 1700,
                    height: 900,
                },

                launchOptions: {
                    headless: isHeadless,

                    firefoxUserPrefs: {
                        'browser.startup.maximized': true,
                    },
                },
            },
        },

        // ── Edge ──────────────────────────────
        {
            name: 'edge',

            use: {
                browserName: 'chromium',
                channel: 'msedge',
                viewport: VIEWPORT,

                launchOptions: {
                    headless: isHeadless,

                    args: [
                        '--start-maximized',
                        '--disable-infobars',
                        '--no-default-browser-check',
                    ],
                },
            },
        },

        // ── WebKit / Safari ───────────────────
        {
            name: 'webkit',

            use: {
                browserName: 'webkit',

                viewport: {
                    width: 1900,
                    height: 1000,
                },

                launchOptions: {
                    headless: isHeadless,
                },
            },
        },
    ],

    // ── Output ────────────────────────────────
    outputDir: path.join('test-results'),
});


