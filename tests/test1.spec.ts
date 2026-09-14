import { test, expect, Locator } from '@playwright/test';

import { e2e } from '../page/e2e';
import { CsvReport } from '../utils/csvReport';


test(
    'FunEx E2E WORKFLOW with API Login Bypass',
    async ({ page, context, baseURL }) => {

        const attractionUrl =
            process.env.FUNEX_ATTRACTION_URL;

        if (!attractionUrl) {
            throw new Error(
                'FUNEX_ATTRACTION_URL is not defined in .env'
            );
        }

        // Initialize Page Factory
        const app = new e2e(page);


        // ═══════════════════════════════════════
        // CSV REPORT
        // ═══════════════════════════════════════

        const csvReport =
            new CsvReport(
                attractionUrl
            );

        console.log(
            `✓ CSV report initialized: ${csvReport.getPath()}`
        );


        try {

            // ═══════════════════════════════════════
            // STEP 1
            // Authenticate via API Bypass
            // ═══════════════════════════════════════

            console.log(
                '\n========================================'
            );

            console.log(
                'STEP 1: Authenticating via API'
            );

            console.log(
                '========================================'
            );

            await app.bypassLogin();


            // ═══════════════════════════════════════
            // STEP 2
            // Verify successful login
            // ═══════════════════════════════════════

            console.log(
                '\nSTEP 2: Verify successful login'
            );

            const loginText =
                page.locator(
                    'div.navbar-tool-userlogin'
                );

            await expect(
                loginText
            ).toBeVisible({
                timeout: 15000,
            });

            console.log(
                '✓ "Hello, Automation" my account is visible'
            );

            console.log(
                '✓ Login successful'
            );


            // CSV: LOGIN
            csvReport.recordLogin(
                true,
                'API login bypass completed successfully.'
            );


            // ═══════════════════════════════════════
            // STEP 3
            // Open attraction URL
            // ═══════════════════════════════════════

            console.log(
                '\nSTEP 3: Open Attraction Listing URL'
            );

            console.log(
                `Attraction URL: ${attractionUrl}`
            );

            await page.goto(
                attractionUrl
            );

            console.log(
                '✓ Attraction listing opened in the same browser tab'
            );

            console.log(
                `✓ Current URL: ${page.url()}`
            );


            // ═══════════════════════════════════════
            // STEP 4
            // Scroll to Select your ticket
            // ═══════════════════════════════════════

            console.log(
                '\nSTEP 4: Scroll to "Select your ticket"'
            );

            const ticketSection =
                page.getByRole(
                    'heading',
                    {
                        name: 'Select your ticket',
                    }
                );

            await ticketSection
                .scrollIntoViewIfNeeded();

            console.log(
                '✓ "Select your ticket" section located'
            );

            console.log(
                '✓ Scrolled to ticket section'
            );


            // ═══════════════════════════════════════
            // STEP 5
            // Capture listing
            // ═══════════════════════════════════════

            console.log(
                '\nSTEP 5: Capture attraction listing'
            );

            const stage1 =
                await app.captureStage1Listing();

            console.log(
                `✓ Stage 1 captured ${stage1.ticketCount} tickets`
            );

            console.table(
                stage1.tickets
            );


            // CSV: LISTING
            csvReport.recordListing(
                stage1
            );


            // ═══════════════════════════════════════
            // STEP 6
            // Select ticket
            // ═══════════════════════════════════════

            console.log(
                '\nSTEP 6: Select ticket and navigate to ticket page'
            );

            const stage2 =
                await app.selectAndVerifyTicketPage(
                    stage1.tickets
                );

            console.log(
                `✓ Selected ticket: ${stage2.selectedTicket.name}`
            );

            console.log(
                `✓ Ticket page URL: ${stage2.ticketUrl}`
            );

            console.log(
                `✓ Ticket page title: ${stage2.ticketPageTitle}`
            );


            // CSV: TICKET PAGE
            csvReport.recordTicketPage(
                stage2
            );


            // ═══════════════════════════════════════
            // STEP 7
            // Ticket page verification summary
            // ═══════════════════════════════════════

            console.log(
                '\nSTEP 7: Ticket page verification summary'
            );

            console.log(
                `Ticket selected: ${stage2.selectedTicket.name}`
            );

            console.log(
                `Ticket page title: ${stage2.ticketPageTitle}`
            );

            if (
                stage2.ticketPagePrice !== null
            ) {

                console.log(
                    `Ticket page price: ` +
                    `${stage2.ticketPagePrice.toFixed(2)}`
                );

            } else {

                console.log(
                    'INFO: No generic ticket-page price found; ' +
                    'date-specific pricing will be handled in Stage 3.'
                );
            }

            console.log(
                `✓ URL verification: ${stage2.ticketUrl !== ''}`
            );

            console.log(
                `✓ Ticket name verification: ` +
                `${stage2.ticketNameVerified}`
            );

            console.log(
                `✓ Ticket price verification: ` +
                `${stage2.priceVerified}`
            );


            // ═══════════════════════════════════════
            // STEP 8
            // Verify booking page
            // ═══════════════════════════════════════

            console.log(
                '\nSTEP 8: Verify booking page'
            );

            const selectDate =
                page.getByText(
                    'Select Date',
                    {
                        exact: true,
                    }
                );

            await expect(
                selectDate,
                'Stage 3: "Select Date" was not found.'
            ).toBeVisible();

            console.log(
                '✓ "Select Date" is visible'
            );


            // ═══════════════════════════════════════
            // STEP 9
            // Wait for active calendar
            // ═══════════════════════════════════════

            console.log(
                '\nSTEP 9: Wait for active calendar'
            );

            const calendar =
                page.locator(
                    'div.mbsc-calendar-table.mbsc-calendar-table-active'
                );

            await expect(
                calendar,
                'Stage 3: Active calendar was not found.'
            ).toBeVisible();

            await calendar
                .scrollIntoViewIfNeeded();

            console.log(
                '✓ Active calendar is visible'
            );


            // ═══════════════════════════════════════
            // STEP 10
            // Select first available date dynamically
            // ═══════════════════════════════════════

            console.log(
                '\nSTEP 10: Select first available date'
            );

            const dateCells =
                calendar.locator(
                    '[class*="mbsc-calendar-cell"]'
                );

            const cellCount =
                await dateCells.count();

            console.log(
                `Calendar date cells found: ${cellCount}`
            );

            type AvailableDate = {
                cell: Locator;
                date: string;
                price: number;
            };

            const availableDates: AvailableDate[] = [];

            for (
                let i = 0;
                i < cellCount;
                i++
            ) {

                const cell =
                    dateCells.nth(i);

                const priceLocator =
                    cell.locator(
                        'div.mbsc-calendar-label-text'
                    ).filter({
                        hasText:
                            /\$\s*\d+(?:\.\d{2})?/,
                    }).first();

                if (
                    await priceLocator.count() === 0
                ) {
                    continue;
                }

                const priceText =
                    (
                        await priceLocator.innerText()
                    ).trim();

                const priceMatch =
                    priceText.match(
                        /\$\s*([\d,]+(?:\.\d{2})?)/
                    );

                if (!priceMatch) {
                    continue;
                }

                const price =
                    Number(
                        priceMatch[1]
                            .replace(/,/g, '')
                    );

                if (
                    !Number.isFinite(price) ||
                    price <= 0
                ) {
                    continue;
                }

                const ariaLabel =
                    await cell.getAttribute(
                        'aria-label'
                    );

                const dataDate =
                    await cell.getAttribute(
                        'data-date'
                    );

                const actualDate =
                    dataDate ?? ariaLabel;

                if (!actualDate) {

                    console.log(
                        `Skipping cell ${i}: date not found`
                    );

                    continue;
                }

                if (
                    availableDates.some(
                        item =>
                            item.date === actualDate
                    )
                ) {
                    continue;
                }

                availableDates.push({
                    cell,
                    date: actualDate,
                    price,
                });
            }


            console.log(
                `Unique available dates found: ` +
                `${availableDates.length}`
            );

            if (
                availableDates.length === 0
            ) {

                throw new Error(
                    'Stage 3: No availability found in the current calendar.'
                );
            }


            console.log(
                'Available dates:',
                availableDates.map(
                    item => ({
                        date:
                            item.date,
                        price:
                            item.price.toFixed(2),
                    })
                )
            );


            const firstAvailableDate =
                availableDates[0];

            console.log(
                `Selecting first available date: ` +
                `${firstAvailableDate.date}`
            );

            await expect(
                firstAvailableDate.cell
            ).toBeVisible();

            await firstAvailableDate
                .cell
                .click();

            console.log(
                `✓ STEP 10: First available date selected: ` +
                `${firstAvailableDate.date}`
            );

            console.log(
                `✓ Selected date price: ` +
                `${firstAvailableDate.price.toFixed(2)}`
            );


            // ═══════════════════════════════════════
            // STEP 11
            // Run Stage 3 utility
            // ═══════════════════════════════════════

            console.log(
                '\nSTEP 11: Run Stage 3 Utility'
            );

            const stage3 =
                await app.selectFirstAvailableDateAndTime(
                    stage2.selectedTicket.displayedPrice
                );


            // CSV: STAGE 3
            csvReport.recordStage3(
                stage3,
                stage2.selectedTicket.name
            );


            console.log(
                `✓ Selected date: ${stage3.selectedDate}`
            );

            if (
                stage3.hasTimeSelection
            ) {

                console.log(
                    `✓ Selected time: ${stage3.selectedTime}`
                );

            } else {

                console.log(
                    'INFO: Ticket is date-only; ' +
                    'no time selection required.'
                );
            }


            // ═══════════════════════════════════════
            // STEP 12
            // Quantity verification
            // ═══════════════════════════════════════

            console.log(
                '\nSTEP 12: Verify ticket quantity'
            );

            console.log(
                `✓ Adult quantity: ` +
                `${stage3.adultQuantity}`
            );

            console.log(
                `✓ Child quantity: ` +
                `${stage3.childQuantity}`
            );

            console.log(
                `✓ Configured quantity: ` +
                `${process.env.FUNEX_QUANTITY ?? '1'}`
            );


            const configuredQuantity =
                Number(
                    process.env.FUNEX_QUANTITY ?? '1'
                );

            expect(
                Number.isInteger(configuredQuantity),
                'STEP 12: FUNEX_QUANTITY must be an integer.'
            ).toBe(true);

            expect(
                configuredQuantity,
                'STEP 12: FUNEX_QUANTITY must be greater than 0.'
            ).toBeGreaterThan(0);

            expect(
                stage3.adultQuantity,
                `STEP 12: Adult quantity is invalid. ` +
                `Actual: ${stage3.adultQuantity}`
            ).toBeGreaterThan(0);


            if (
                stage3.childQuantity !== null
            ) {

                expect(
                    stage3.childQuantity,
                    `STEP 12: Child quantity is invalid. ` +
                    `Actual: ${stage3.childQuantity}`
                ).toBeGreaterThan(0);

                console.log(
                    `✓ Child quantity verified: ` +
                    `${stage3.childQuantity}`
                );

            } else {

                console.log(
                    'INFO: Child quantity is not available for this ticket. ' +
                    'Skipping child quantity verification.'
                );
            }


            // ═══════════════════════════════════════
            // STEP 13
            // Price verification
            // ═══════════════════════════════════════

            console.log(
                '\nSTEP 13: Verify post-selection price'
            );

            console.log(
                `Listing price: ` +
                `${stage2.selectedTicket.displayedPrice.toFixed(2)}`
            );

            console.log(
                `Selected date price: ` +
                `${stage3.selectedDatePrice.toFixed(2)}`
            );

            console.log(
                `Order summary price: ` +
                `${stage3.orderSummaryPrice.toFixed(2)}`
            );


            const priceDifference =
                stage3.selectedDatePrice -
                stage2.selectedTicket.displayedPrice;

            console.log(
                `Price difference: ` +
                `${priceDifference.toFixed(2)}`
            );

            if (
                priceDifference > 0
            ) {

                console.log(
                    `INFO: Selected-date price is ` +
                    `${priceDifference.toFixed(2)} higher than listing price.`
                );

            } else if (
                priceDifference < 0
            ) {

                console.log(
                    `INFO: Selected-date price is ` +
                    `${Math.abs(priceDifference).toFixed(2)} lower than listing price.`
                );

            } else {

                console.log(
                    '✓ Selected-date price matches listing price.'
                );
            }

            console.log(
                '✓ STEP 13: Post-selection price captured'
            );


            // ═══════════════════════════════════════
            // STEP 14
            // Verify item added to cart
            // ═══════════════════════════════════════

            console.log(
                '\nSTEP 14: Verify item was added to cart'
            );

            expect(
                stage3.addedToCart,
                'STEP 14: Item was not successfully added to cart.'
            ).toBe(true);

            console.log(
                '✓ STEP 14: Item added to cart successfully'
            );


            console.log(
                '\n========================================'
            );

            console.log(
                'STAGE 3 COMPLETE'
            );

            console.log(
                '========================================'
            );

            console.log({
                selectedDate:
                    stage3.selectedDate,

                selectedDatePrice:
                    stage3.selectedDatePrice
                        .toFixed(2),

                selectedTime:
                    stage3.selectedTime ?? 'N/A',

                hasTimeSelection:
                    stage3.hasTimeSelection,

                adultQuantity:
                    stage3.adultQuantity,

                childQuantity:
                    stage3.childQuantity,

                orderSummaryPrice:
                    stage3.orderSummaryPrice
                        .toFixed(2),

                priceDifference:
                    priceDifference.toFixed(2),

                priceDiffersFromListing:
                    priceDifference !== 0,

                addedToCart:
                    stage3.addedToCart,
            });


            // ═══════════════════════════════════════
            // STEP 15
            // Cart
            // ═══════════════════════════════════════

            console.log(
                '\nSTEP 15: Capture cart details'
            );

            await page.getByRole(
                'button',
                {
                    name: 'Continue to Cart',
                }
            ).click();

            const cartResult =
                await app.captureCartPage(
                    stage3.orderSummaryPrice
                );


            // CSV: CART
            csvReport.recordCart(
                cartResult
            );


            console.log(
                `✓ Cart items: ${cartResult.items.length}`
            );

            console.log(
                `✓ Cart subtotal: ` +
                `${cartResult.subtotal.toFixed(2)}`
            );

            console.log(
                `✓ Cart net saving: ` +
                `${cartResult.netSaving.toFixed(2)}`
            );


            // ═══════════════════════════════════════
            // STEP 16
            // Checkout
            // ═══════════════════════════════════════

            console.log(
                '\nSTEP 16: Capture checkout details'
            );

            const checkoutResult =
                await app.captureCheckoutPage();


            // CSV: CHECKOUT
            csvReport.recordCheckout(
                checkoutResult
            );


            console.log(
                `✓ Checkout items: ` +
                `${checkoutResult.items.length}`
            );

            console.log(
                `✓ Checkout order total: ` +
                `${checkoutResult.orderTotal.toFixed(2)}`
            );

            console.log(
                `✓ Checkout subtotal: ` +
                `${checkoutResult.subtotal.toFixed(2)}`
            );

            console.log(
                `✓ Checkout taxes & surcharge: ` +
                `${checkoutResult.taxesAndSurcharge.toFixed(2)}`
            );

            console.log(
                `✓ Checkout processing fees: ` +
                `${checkoutResult.processingFees.toFixed(2)}`
            );

            console.log(
                `✓ Checkout refundable option: ` +
                `${checkoutResult.refundableOption.toFixed(2)}`
            );

            console.log(
                `✓ Checkout discounts: ` +
                `${checkoutResult.discounts.toFixed(2)}`
            );


            // ═══════════════════════════════════════
            // STEP 17
            // Stage 5 Verification
            // ═══════════════════════════════════════

            console.log(
                '\nSTEP 17: Run Stage 5 verification'
            );

            const stage5 =
                await app.verifyStage5(
                    stage1,
                    stage2,
                    stage3,
                    cartResult,
                    checkoutResult
                );


            // CSV: VERIFICATION
            csvReport.recordVerification(
                stage5
            );


            console.log(
                `✓ Stage 5 completed with ` +
                `${stage5.checks.length} verification checks`
            );

            console.log(
                `✓ Stage 5 mismatches: ` +
                `${stage5.mismatches.length}`
            );



            // ═══════════════════════════════════════
            // CSV COMPLETE
            // ═══════════════════════════════════════

            console.log(
                '\n========================================'
            );

            console.log(
                'CSV REPORT GENERATED'
            );

            console.log(
                `Path: ${csvReport.getPath()}`
            );

            console.log(
                '========================================'
            );


        } catch (error) {

            // ═══════════════════════════════════════
            // FAILURE REPORTING
            // ═══════════════════════════════════════

            const message =
                error instanceof Error
                    ? error.message
                    : String(error);

            /*
             * The reporter writes immediately after
             * each row, so everything captured before
             * the failure remains in report.csv.
             *
             * Add the failure as a final row.
             */

            csvReport.recordFailure(
                'verification',
                message
            );

            console.log(
                `✗ Test failed: ${message}`
            );

            console.log(
                `✓ Partial CSV report preserved: ` +
                `${csvReport.getPath()}`
            );

            throw error;
        }
         // ═══════════════════════════════════════
            // CLEAR CART
            // ═══════════════════════════════════════

            console.log(
                '\nCLEAR CART'
            );

            /*
             * Intentionally disabled because checkout
             * is the required stopping point and the
             * verification data is already captured.
             */

            
            await page.getByText(
                'Back to Cart',
                {
                    exact: true,
                }
            ).click();

            console.log(
                '✓ Navigated back to Cart'
            );

            await page.getByRole(
                'link',
                {
                    name: 'Clear Cart',
                }
            ).click();

            console.log(
                '✓ Cart cleared'
            );
            
    }
    
);