import fs from 'fs';
import path from 'path';
import { expect, Page } from '@playwright/test';

export type TicketData = {
    name: string;
    displayedPrice: number;
    regularPrice: number | null;
    ticketUrl: string;
};

export type Stage1Result = {
    attractionUrl: string;
    ticketCount: number;
    tickets: TicketData[];
};

// ─────────────────────────────────────────
// Currency parser
// Handles:
// "$12.75"
// "REG. $12.75"
// "$1,234.50"
// "USD 12.75"
// ─────────────────────────────────────────
function parseCurrency(value: string): number {
    const match = value.match(
        /(?:USD\s*)?\$?\s*([\d,]+(?:\.\d{2})?)/
    );

    if (!match) {
        throw new Error(
            `Unable to parse currency value: "${value}"`
        );
    }

    const amount = Number(
        match[1].replace(/,/g, '')
    );

    if (!Number.isFinite(amount)) {
        throw new Error(
            `Unable to parse currency value: "${value}"`
        );
    }

    return amount;
}

export async function captureStage1Listing(
    page: Page
): Promise<Stage1Result> {

    console.log('\n========================================');
    console.log('STAGE 1: Attraction listing page');
    console.log('========================================');

    // ─────────────────────────────────────────
    // Ticket container
    // ─────────────────────────────────────────

    const ticketContainer = page
        .locator('.col-12 > .row')
        .first();

    await expect(ticketContainer).toBeVisible();

    console.log('✓ Ticket container is visible');

    // ─────────────────────────────────────────
    // Find all rendered ticket cards
    // ─────────────────────────────────────────

    const ticketCards = ticketContainer.locator(
        '.ticket-cardbox'
    );

    const ticketCount = await ticketCards.count();

    console.log(
        `✓ Ticket cards rendered: ${ticketCount}`
    );

    // At least one ticket must exist.
    expect(
        ticketCount,
        'Stage 1 failed: No ticket options found.'
    ).toBeGreaterThan(0);

    const tickets: TicketData[] = [];

    // ─────────────────────────────────────────
    // Process every ticket
    // ─────────────────────────────────────────

    for (let i = 0; i < ticketCount; i++) {

        const card = ticketCards.nth(i);

        console.log(
            `\nProcessing ticket ${i + 1}/${ticketCount}`
        );

        // ─────────────────────────────────────
        // Ticket name
        // ─────────────────────────────────────

        const nameLocator = card
            .locator('.offer-title')
            .first();

        await expect(
            nameLocator,
            `Ticket ${i + 1}: ticket name element not found.`
        ).toBeVisible();

        const name = (
            await nameLocator.innerText()
        ).trim();

        expect(
            name,
            `Ticket ${i + 1}: ticket name is empty.`
        ).not.toBe('');

        // ─────────────────────────────────────
        // Displayed / selling price
        // ─────────────────────────────────────

        const priceLocator = card
            .locator('.price')
            .first();

        await expect(
            priceLocator,
            `Ticket "${name}": price element not found.`
        ).toBeVisible();

        const rawPriceText = (
            await priceLocator.innerText()
        ).trim();

        console.log(
            `Raw price text: "${rawPriceText}"`
        );

        // Some pages may put:
        //
        // $10.00
        // REG. $12.75
        //
        // inside the same .price element.
        //
        // Remove REG. price from the text before
        // extracting the displayed/selling price.

        const sellingPriceText = rawPriceText
            .split('\n')
            .map(text => text.trim())
            .filter(Boolean)
            .find(
                text => !/^REG\./i.test(text)
            );

        if (!sellingPriceText) {
            throw new Error(
                `Ticket "${name}": displayed selling price ` +
                `could not be identified. ` +
                `Raw value: "${rawPriceText}"`
            );
        }

        const displayedPrice = parseCurrency(
            sellingPriceText
        );

        console.log(
            `Displayed price: ${displayedPrice.toFixed(2)}`
        );

        // Positive price assertion.
        expect(
            displayedPrice,
            `Ticket "${name}": displayed price must be greater than 0. ` +
            `Actual: ${displayedPrice.toFixed(2)}`
        ).toBeGreaterThan(0);

        // Explicit 0.00 assertion.
        expect(
            displayedPrice,
            `Ticket "${name}": displayed price must not be 0.00.`
        ).not.toBe(0);

        // ─────────────────────────────────────
        // Regular / struck-through price
        // ─────────────────────────────────────

        const regularPriceLocator = card
            .locator('.reg-price')
            .first();

        let regularPrice: number | null = null;

        if (
            await regularPriceLocator.count() > 0 &&
            await regularPriceLocator.isVisible()
        ) {

            const regularPriceText = (
                await regularPriceLocator.innerText()
            ).trim();

            console.log(
                `Regular price text: "${regularPriceText}"`
            );

            if (regularPriceText) {

                regularPrice = parseCurrency(
                    regularPriceText
                );

                console.log(
                    `Regular price: ${regularPrice.toFixed(2)}`
                );

                expect(
                    regularPrice,
                    `Ticket "${name}": regular price ` +
                    `${regularPrice.toFixed(2)} must be greater ` +
                    `than displayed price ${displayedPrice.toFixed(2)}.`
                ).toBeGreaterThan(displayedPrice);
            }
        }

       // ─────────────────────────────────────
// Ticket URL
// ─────────────────────────────────────

// ─────────────────────────────────────
// Ticket URL
// ─────────────────────────────────────

const ticketLink = card.locator(
    'xpath=ancestor::a[@href][1]'
);

await expect(
    ticketLink,
    `Ticket "${name}": ticket link was not found.`
).toHaveCount(1);

const href = await ticketLink.getAttribute('href');

expect(
    href,
    `Ticket "${name}": ticket URL is missing.`
).not.toBeNull();

const ticketUrl = new URL(
    href!,
    page.url()
).href;

console.log(
    `Ticket URL: ${ticketUrl}`
);
        // ─────────────────────────────────────
        // Store ticket in baseline array
        // ─────────────────────────────────────

        const ticket: TicketData = {
            name,
            displayedPrice,
            regularPrice,
            ticketUrl,
        };

        tickets.push(ticket);

        // ─────────────────────────────────────
        // Console output
        // ─────────────────────────────────────

        console.log({
            ticketNumber: i + 1,
            name,
            displayedPrice,
            regularPrice,
            ticketUrl,
        });
    }

    // ─────────────────────────────────────────
    // Count assertion
    // ─────────────────────────────────────────

    expect(
        tickets.length,
        'Stage 1 failed: captured ticket count does not ' +
        'match the number of rendered ticket cards.'
    ).toBe(ticketCount);

    console.log(
        `\n✓ Captured ${tickets.length} ticket options`
    );

    // ─────────────────────────────────────────
    // Save Stage 1 baseline JSON
    // ─────────────────────────────────────────

    const dataDirectory = path.resolve(
        process.cwd(),
        'data'
    );

    fs.mkdirSync(dataDirectory, {
        recursive: true,
    });

    const jsonFilePath = path.join(
        dataDirectory,
        'stage1-baseline.json'
    );

    const result: Stage1Result = {
        attractionUrl: page.url(),
        ticketCount,
        tickets,
    };

    fs.writeFileSync(
        jsonFilePath,
        JSON.stringify(result, null, 2),
        'utf-8'
    );

    console.log(
        `✓ Stage 1 baseline saved to:\n${jsonFilePath}`
    );

    // ─────────────────────────────────────────
    // Final summary
    // ─────────────────────────────────────────

    console.log('\n========================================');
    console.log('STAGE 1 COMPLETE');
    console.log('========================================');

    console.log(
        `Total ticket options: ${ticketCount}`
    );

    console.table(tickets);

    return result;
}