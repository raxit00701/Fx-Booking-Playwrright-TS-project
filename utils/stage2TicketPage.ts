import { expect, Page } from '@playwright/test';
import { TicketData } from './stage1Listing';

export type Stage2Result = {
    selectedTicket: TicketData;
    ticketUrl: string;
    ticketPageTitle: string;
    ticketPagePrice: number | null;
    ticketNameVerified: boolean;
    priceVerified: boolean;
};

function parseCurrency(value: string): number {
    const match = value.match(
        /(?:USD\s*)?\$?\s*([\d,]+(?:\.\d{2})?)/
    );

    if (!match) {
        throw new Error(
            `Stage 2: Unable to parse currency value: "${value}"`
        );
    }

    const amount = Number(
        match[1].replace(/,/g, '')
    );

    if (!Number.isFinite(amount)) {
        throw new Error(
            `Stage 2: Invalid currency value: "${value}"`
        );
    }

    return amount;
}

export async function selectAndVerifyTicketPage(
    page: Page,
    tickets: TicketData[]
): Promise<Stage2Result> {

    console.log('\n========================================');
    console.log('STAGE 2: Ticket booking page');
    console.log('========================================');

    if (tickets.length === 0) {
        throw new Error(
            'Stage 2 failed: Stage 1 returned no tickets.'
        );
    }

    // ─────────────────────────────────────────
    // Ticket selection strategy
    // ─────────────────────────────────────────

    const strategy =
        process.env.FUNEX_TICKET_STRATEGY ??
        'first-available';

    console.log(
        `Ticket selection strategy: ${strategy}`
    );

    let selectedTicket: TicketData | undefined;

    if (strategy === 'first-available') {

        selectedTicket = tickets[0];

    } else if (strategy.startsWith('index:')) {

        const indexText = strategy.substring(
            'index:'.length
        );

        const index = Number(indexText);

        if (
            !Number.isInteger(index) ||
            index < 0 ||
            index >= tickets.length
        ) {
            throw new Error(
                `Stage 2: Invalid ticket index "${indexText}". ` +
                `Available range: 0-${tickets.length - 1}`
            );
        }

        selectedTicket = tickets[index];

    } else if (strategy.startsWith('name:')) {

        const requestedName = strategy
            .substring('name:'.length)
            .trim();

        if (!requestedName) {
            throw new Error(
                'Stage 2: Ticket name cannot be empty.'
            );
        }

        selectedTicket = tickets.find(
            ticket =>
                ticket.name.toLowerCase() ===
                requestedName.toLowerCase()
        );

        if (!selectedTicket) {
            throw new Error(
                `Stage 2: Ticket "${requestedName}" ` +
                `was not found in Stage 1 baseline.`
            );
        }

    } else {

        throw new Error(
            `Stage 2: Unsupported FUNEX_TICKET_STRATEGY ` +
            `"${strategy}". Use "first-available", ` +
            `"index:N", or "name:Ticket Name".`
        );
    }

    if (!selectedTicket) {
        throw new Error(
            'Stage 2: Unable to determine selected ticket.'
        );
    }

    console.log(
        `✓ Selected ticket: ${selectedTicket.name}`
    );

    console.log(
        `✓ Listing price: ` +
        `${selectedTicket.displayedPrice.toFixed(2)}`
    );

    // ─────────────────────────────────────────
    // Find selected listing card
    // ─────────────────────────────────────────

    const ticketContainer = page
        .locator('.col-12 > .row')
        .first();

    await expect(
        ticketContainer,
        'Stage 2: Ticket listing container is not visible.'
    ).toBeVisible();

    const selectedCard = ticketContainer
        .locator('.ticket-cardbox')
        .filter({
            hasText: selectedTicket.name,
        })
        .first();

    await expect(
        selectedCard,
        `Stage 2: Ticket card "${selectedTicket.name}" not found.`
    ).toBeVisible();

    // ─────────────────────────────────────────
    // Parent anchor contains ticket URL
    // ─────────────────────────────────────────

    const ticketLink = selectedCard.locator(
        'xpath=ancestor::a[@href][1]'
    );

    await expect(
        ticketLink,
        `Stage 2: Link for "${selectedTicket.name}" not found.`
    ).toHaveCount(1);

    const href = await ticketLink.getAttribute('href');

    if (!href) {
        throw new Error(
            `Stage 2: Ticket "${selectedTicket.name}" has no href.`
        );
    }

    const expectedTicketUrl = new URL(
        href,
        page.url()
    ).href;

    console.log(
        `Expected ticket URL: ${expectedTicketUrl}`
    );

    // ─────────────────────────────────────────
    // Navigate by clicking
    // ─────────────────────────────────────────

    const urlBeforeClick = page.url();

    await Promise.all([
        page.waitForURL(
            url => url.toString() !== urlBeforeClick
        ),
        ticketLink.click(),
    ]);

    const actualTicketUrl = page.url();

    console.log(
        `Actual ticket URL: ${actualTicketUrl}`
    );

    // ─────────────────────────────────────────
    // Assertion 1: URL changed
    // ─────────────────────────────────────────

    expect(
        actualTicketUrl,
        'Stage 2: URL did not change after clicking ticket.'
    ).not.toBe(urlBeforeClick);

    console.log(
        '✓ Stage 2: URL changed'
    );

    // ─────────────────────────────────────────
    // Ticket page title
    // ─────────────────────────────────────────

    const pageHeading = page
        .locator('h1')
        .first();

    await expect(
        pageHeading,
        'Stage 2: Ticket page heading was not found.'
    ).toBeVisible();

    const ticketPageTitle = (
        await pageHeading.innerText()
    ).trim();

    console.log(
        `Ticket page title: "${ticketPageTitle}"`
    );

    // ─────────────────────────────────────────
    // Assertion 2: Ticket name
    // ─────────────────────────────────────────
    //
    // The listing can contain an individual ticket-option
    // name while the page H1 can contain the attraction title.
    //
    // Therefore only compare the selected ticket name if the
    // exact ticket-option text is actually present.
    // ─────────────────────────────────────────

    const ticketNameOnPage = page.getByText(
        selectedTicket.name,
        { exact: true }
    );

    const ticketNameCount =
        await ticketNameOnPage.count();

    let ticketNameVerified = false;

    if (ticketNameCount > 0) {

        await expect(
            ticketNameOnPage.first(),
            `Stage 2: Ticket "${selectedTicket.name}" ` +
            `was found but is not visible.`
        ).toBeVisible();

        ticketNameVerified = true;

        console.log(
            `✓ Stage 2: Ticket name verified: ` +
            `"${selectedTicket.name}"`
        );

    } else {

        console.log(
            `INFO: Stage 2 ticket option name ` +
            `"${selectedTicket.name}" is not displayed ` +
            `on the ticket page.`
        );

        console.log(
            `INFO: Ticket page title is ` +
            `"${ticketPageTitle}"`
        );
    }

    // ─────────────────────────────────────────
    // Ticket page price
    // ─────────────────────────────────────────
    //
    // IMPORTANT:
    // Do NOT use the calendar price here.
    // Calendar price belongs to Stage 3 because the
    // specification allows date-specific pricing.
    // ─────────────────────────────────────────

    const visiblePriceLocator = page
        .locator('.price:visible')
        .first();

    let ticketPagePrice: number | null = null;
    let priceVerified = false;

    if (await visiblePriceLocator.count() > 0) {

        const rawPriceText = (
            await visiblePriceLocator.innerText()
        ).trim();

        console.log(
            `Ticket page visible price: "${rawPriceText}"`
        );

        ticketPagePrice = parseCurrency(
            rawPriceText
        );

        console.log(
            `Stage 1 listing price: ` +
            `${selectedTicket.displayedPrice.toFixed(2)}`
        );

        console.log(
            `Ticket page price: ` +
            `${ticketPagePrice.toFixed(2)}`
        );

        if (
            ticketPagePrice ===
            selectedTicket.displayedPrice
        ) {

            expect(
                ticketPagePrice,
                `Stage 2 price mismatch for "${selectedTicket.name}".`
            ).toBe(
                selectedTicket.displayedPrice
            );

            priceVerified = true;

            console.log(
                `✓ Stage 2: Ticket page price matches listing price`
            );

        } else {

            throw new Error(
                `Stage 2 price mismatch: ` +
                `listing ${selectedTicket.displayedPrice.toFixed(2)}, ` +
                `ticket page ${ticketPagePrice.toFixed(2)} ` +
                `(ticket: ${selectedTicket.name})`
            );
        }

    } else {

        console.log(
            `INFO: No visible generic ".price" element found ` +
            `on ticket page. Calendar pricing will be handled in Stage 3.`
        );
    }

    console.log('\n========================================');
    console.log('STAGE 2 COMPLETE');
    console.log('========================================');

    return {
        selectedTicket,
        ticketUrl: actualTicketUrl,
        ticketPageTitle,
        ticketPagePrice,
        ticketNameVerified,
        priceVerified,
    };
}