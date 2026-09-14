import { expect, Page } from '@playwright/test';

import { Stage1Result } from './stage1Listing';
import { Stage2Result } from './stage2TicketPage';
import { Stage3Result } from './stage3DateTimeCart';
import {
    CartResult,
    CartItem,
    CheckoutResult,
    CheckoutItem,
} from './stage4CartCheckout';


// ═══════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════

export type VerificationCheck = {
    field: string;
    ticketName?: string;
    expected: string;
    actual: string;
    status: 'PASS' | 'FAIL' | 'INFO';
    message: string;
};



export type Stage5Result = {
    passed: boolean;
    checks: VerificationCheck[];
    mismatches: string[];
};


// ═══════════════════════════════════════════
// NORMALIZE CURRENCY
// ═══════════════════════════════════════════

function normalizeCurrency(
    value: number | string | null | undefined
): number | null {

    if (
        value === null ||
        value === undefined
    ) {
        return null;
    }

    if (typeof value === 'number') {

        if (!Number.isFinite(value)) {
            return null;
        }

        return Number(
            value.toFixed(2)
        );
    }

    const cleaned =
        value
            .replace(/,/g, '')
            .replace(/[^\d.-]/g, '');

    if (!cleaned) {
        return null;
    }

    const parsed =
        Number(cleaned);

    if (!Number.isFinite(parsed)) {
        return null;
    }

    return Number(
        parsed.toFixed(2)
    );
}


function currencyEquals(
    a: number | string | null | undefined,
    b: number | string | null | undefined
): boolean {

    const left =
        normalizeCurrency(a);

    const right =
        normalizeCurrency(b);

    return (
        left !== null &&
        right !== null &&
        left === right
    );
}


// ═══════════════════════════════════════════
// NORMALIZE NAME
// ═══════════════════════════════════════════

function normalizeName(
    value: string | null | undefined
): string {

    return (value ?? '')
        .replace(/\s+/g, ' ')
        .trim()
        .toLowerCase();
}


// ═══════════════════════════════════════════
// EXTRACT CORE ATTRACTION NAME
// ═══════════════════════════════════════════

function normalizeAttractionTitle(
    value: string | null | undefined
): string {

    return normalizeName(value)
        .replace(
            /\s*(discount\s+tickets?|tickets?)\s*$/i,
            ''
        )
        .trim();
}


// ═══════════════════════════════════════════
// ADD CHECK
// ═══════════════════════════════════════════

function addCheck(
    checks: VerificationCheck[],
    mismatches: string[],
    ticketName: string,
    field: string,
    expected: string,
    actual: string,
    passed: boolean,
    message?: string
): void {

    const finalMessage =
        message ??
        (
            passed
                ? `${field} matches.`
                : `${field} mismatch: expected "${expected}", actual "${actual}".`
        );

    checks.push({
        field,
        ticketName,
        expected,
        actual,
        status: passed
            ? 'PASS'
            : 'FAIL',
        message: finalMessage,
    });

    if (!passed) {
        mismatches.push(
            finalMessage
        );
    }
}


// ═══════════════════════════════════════════
// FIND CART ITEM
// ═══════════════════════════════════════════

function findCartItem(
    cartItems: CartItem[],
    checkoutItems: CheckoutItem[],
    selectedTicket: string
): CartItem | undefined {

    const selectedName =
        normalizeName(
            selectedTicket
        );

    // Find the checkout item containing
    // the selected Stage 1 ticket option.
    const matchingCheckoutItem =
        checkoutItems.find(
            item => {

                const checkoutName =
                    normalizeName(
                        item.name
                    );

                return (
                    checkoutName.includes(
                        selectedName
                    ) ||
                    selectedName.includes(
                        checkoutName
                    )
                );
            }
        );

    if (!matchingCheckoutItem) {
        return undefined;
    }

    const checkoutName =
        normalizeName(
            matchingCheckoutItem.name
        );

    // Find the cart item whose name is represented
    // inside the checkout booking name.
    return cartItems.find(
        item => {

            const cartName =
                normalizeName(
                    item.name
                );

            return (
                checkoutName.includes(
                    cartName
                ) ||
                cartName.includes(
                    checkoutName
                )
            );
        }
    );
}


// ═══════════════════════════════════════════
// FIND CHECKOUT ITEM
// ═══════════════════════════════════════════

function findCheckoutItem(
    checkoutItems: CheckoutItem[],
    selectedTicket: string
): CheckoutItem | undefined {

    const selectedName =
        normalizeName(
            selectedTicket
        );

    return checkoutItems.find(
        item => {

            const checkoutName =
                normalizeName(
                    item.name
                );

            return (
                checkoutName.includes(
                    selectedName
                ) ||
                selectedName.includes(
                    checkoutName
                )
            );
        }
    );
}


// ═══════════════════════════════════════════
// STAGE 5
// ═══════════════════════════════════════════

export async function verifyStage5(
    page: Page,
    stage1: Stage1Result,
    stage2: Stage2Result,
    stage3: Stage3Result,
    cart: CartResult,
    checkout: CheckoutResult
): Promise<Stage5Result> {

    console.log('\n========================================');
    console.log('STAGE 5: VERIFICATION');
    console.log('========================================');


    const checks: VerificationCheck[] = [];
    const mismatches: string[] = [];


    // ═══════════════════════════════════════
    // SELECTED TICKET
    // ═══════════════════════════════════════

    const selectedTicket =
        stage2.selectedTicket;

    if (!selectedTicket) {

        throw new Error(
            'Stage 5: Stage 2 did not provide selected ticket.'
        );
    }


    const listingTicket =
        stage1.tickets.find(
            ticket =>
                normalizeName(ticket.name) ===
                normalizeName(selectedTicket.name)
        );

    if (!listingTicket) {
        throw new Error(
            `Stage 5: Selected ticket "${selectedTicket.name}" ` +
            `was not found in Stage 1.`
        );
    }


    console.log(
        `Selected ticket: ${selectedTicket.name}`
    );


    // ═══════════════════════════════════════
    // CART ITEM
    // ═══════════════════════════════════════

    const cartItem =
        findCartItem(
            cart.items,
            checkout.items,
            selectedTicket.name
        );


    // ═══════════════════════════════════════
    // CHECKOUT ITEM
    // ═══════════════════════════════════════

    const checkoutItem =
        findCheckoutItem(
            checkout.items,
            selectedTicket.name
        );


    // ═══════════════════════════════════════
    // 1. LISTING -> TICKET PAGE
    // ═══════════════════════════════════════

    if (
        stage2.ticketNameVerified
    ) {

        addCheck(
            checks,
            mismatches,
            selectedTicket.name,
            'Ticket name (listing = ticket page)',
            selectedTicket.name,
            selectedTicket.name,
            true
        );

    } else {

        checks.push({
            field:
                'Ticket name (listing = ticket page)',

            ticketName:
                selectedTicket.name,

            expected:
                selectedTicket.name,

            actual:
                stage2.ticketPageTitle,

            status:
                'INFO',

            message:
                `Ticket-option name "${selectedTicket.name}" ` +
                `was not displayed on the ticket page. ` +
                `Generic page title "${stage2.ticketPageTitle}" ` +
                `was not incorrectly treated as the ticket option.`,
        });
    }


  // ═══════════════════════════════════════
// 2. LISTING -> CART
// ═══════════════════════════════════════

if (!cartItem) {

    addCheck(
        checks,
        mismatches,
        selectedTicket.name,
        'Ticket name (listing = cart)',
        selectedTicket.name,
        'No matching cart item',
        false,
        `Ticket name mismatch: listing "${selectedTicket.name}", ` +
        `cart item could not be linked through checkout.`
    );

} else if (!checkoutItem) {

    addCheck(
        checks,
        mismatches,
        selectedTicket.name,
        'Ticket name (listing = cart)',
        selectedTicket.name,
        cartItem.name,
        false,
        `Ticket name mismatch: listing "${selectedTicket.name}", ` +
        `cart "${cartItem.name}", ` +
        `but no matching checkout item was available to establish ` +
        `the ticket-to-cart relationship.`
    );

} else {

    const selectedName =
        normalizeName(
            selectedTicket.name
        );

    const checkoutName =
        normalizeName(
            checkoutItem.name
        );

    const cartName =
        normalizeName(
            cartItem.name
        );

    const listingExistsInCheckout =
        checkoutName.includes(
            selectedName
        );

    const cartExistsInCheckout =
        checkoutName.includes(
            cartName
        ) ||
        cartName.includes(
            checkoutName
        );

    const matches =
        listingExistsInCheckout &&
        cartExistsInCheckout;

    addCheck(
        checks,
        mismatches,
        selectedTicket.name,
        'Ticket name (listing = cart)',
        selectedTicket.name,
        cartItem.name,
        matches,
        matches
            ? undefined
            : `Ticket name mismatch: listing "${selectedTicket.name}", ` +
              `checkout "${checkoutItem.name}", ` +
              `cart "${cartItem.name}".`
    );
}


    // ═══════════════════════════════════════
    // 3. LISTING -> CHECKOUT
    // ═══════════════════════════════════════

    if (!checkoutItem) {

        addCheck(
            checks,
            mismatches,
            selectedTicket.name,
            'Ticket name (listing = checkout)',
            selectedTicket.name,
            'No matching checkout item',
            false,
            `Ticket name mismatch: listing "${selectedTicket.name}", ` +
            `checkout item was not found.`
        );

    } else {

        const checkoutName =
            normalizeName(
                checkoutItem.name
            );

        const listingName =
            normalizeName(
                selectedTicket.name
            );

        const matches =
            checkoutName.includes(
                listingName
            ) ||
            listingName.includes(
                checkoutName
            );

        addCheck(
            checks,
            mismatches,
            selectedTicket.name,
            'Ticket name (listing = checkout)',
            selectedTicket.name,
            checkoutItem.name,
            matches,
            matches
                ? undefined
                : `Ticket name mismatch: listing "${selectedTicket.name}", ` +
                  `checkout "${checkoutItem.name}".`
        );
    }


// ═══════════════════════════════════════
// 4. UNIT PRICE
// ═══════════════════════════════════════
//
// Stage 2 generic ticket price may not exist.
// In that case, Stage 3's selected-date price
// becomes the authoritative dated ticket price.
//
// Verification:
//
// Generic ticket page price -> Cart -> Checkout
// OR
// Stage 3 selected-date price -> Cart
//
// Checkout unitPrice is currently the booking
// subtotal, so it is NOT treated as a per-ticket
// unit price.
// ═══════════════════════════════════════

if (stage2.ticketPagePrice === null) {

    checks.push({
        field:
            'Unit price (ticket page)',

        ticketName:
            selectedTicket.name,

        expected:
            'Generic ticket-page price',

        actual:
            'Not exposed on ticket page',

        status:
            'INFO',

        message:
            `Ticket page did not expose a generic ticket price. ` +
            `Date-specific pricing from Stage 3 will be used for ` +
            `the Cart comparison.`,
    });

} else {

    const ticketPagePrice =
        normalizeCurrency(
            stage2.ticketPagePrice
        );

    if (cartItem) {

        const cartPrice =
            normalizeCurrency(
                cartItem.unitPrice
            );

        const matches =
            currencyEquals(
                ticketPagePrice,
                cartPrice
            );

        addCheck(
            checks,
            mismatches,
            selectedTicket.name,
            'Unit price (ticket page = cart)',
            ticketPagePrice?.toFixed(2) ?? 'N/A',
            cartPrice?.toFixed(2) ?? 'N/A',
            matches,
            matches
                ? undefined
                : `Unit price mismatch: ticket page ` +
                  `${ticketPagePrice?.toFixed(2) ?? 'N/A'}, ` +
                  `cart ${cartPrice?.toFixed(2) ?? 'N/A'} ` +
                  `(ticket: ${selectedTicket.name})`
        );
    }
}


// ═══════════════════════════════════════
// DATE-SPECIFIC UNIT PRICE
// Stage 3 -> Cart
// ═══════════════════════════════════════

if (cartItem) {

    const stage3DatePrice =
        normalizeCurrency(
            stage3.selectedDatePrice
        );

    const cartUnitPrice =
        normalizeCurrency(
            cartItem.unitPrice
        );

    const matches =
        currencyEquals(
            stage3DatePrice,
            cartUnitPrice
        );

    addCheck(
        checks,
        mismatches,
        selectedTicket.name,
        'Unit price (selected date = cart)',
        stage3DatePrice?.toFixed(2) ?? 'N/A',
        cartUnitPrice?.toFixed(2) ?? 'N/A',
        matches,
        matches
            ? undefined
            : `Unit price mismatch: selected-date price ` +
              `${stage3DatePrice?.toFixed(2) ?? 'N/A'}, ` +
              `cart ${cartUnitPrice?.toFixed(2) ?? 'N/A'} ` +
              `(ticket: ${selectedTicket.name})`
    );
}


// ═══════════════════════════════════════
// Checkout price information
// ═══════════════════════════════════════

if (checkoutItem) {

    checks.push({
        field:
            'Unit price (checkout)',

        ticketName:
            selectedTicket.name,

        expected:
            'Per-ticket unit price',

        actual:
            checkoutItem.unitPrice.toFixed(2),

        status:
            'INFO',

        message:
            `Checkout unitPrice (${checkoutItem.unitPrice.toFixed(2)}) ` +
            `represents the checkout booking subtotal, not a confirmed ` +
            `per-ticket unit price, so it is not asserted against the cart ` +
            `unit price.`,
    });
}

    // ═══════════════════════════════════════
    // 5. QUANTITY
    // ═══════════════════════════════════════

    const selectedAdultQuantity =
        Number(
            stage3.adultQuantity ?? 0
        );

    const selectedChildQuantity =
        stage3.childQuantity === null ||
        stage3.childQuantity === undefined
            ? 0
            : Number(
                stage3.childQuantity
            );

    const selectedQuantity =
        selectedAdultQuantity +
        selectedChildQuantity;


    console.log(
        `Selected total quantity: ${selectedQuantity}`
    );


    if (cartItem) {

        addCheck(
            checks,
            mismatches,
            selectedTicket.name,
            'Quantity (selected = cart)',
            String(selectedQuantity),
            String(cartItem.quantity),
            selectedQuantity === cartItem.quantity,
            selectedQuantity === cartItem.quantity
                ? undefined
                : `Quantity mismatch: selected ${selectedQuantity}, ` +
                  `cart ${cartItem.quantity} ` +
                  `(ticket: ${selectedTicket.name})`
        );
    }


    if (checkoutItem) {

        if (
            checkoutItem.quantity > 0
        ) {

            addCheck(
                checks,
                mismatches,
                selectedTicket.name,
                'Quantity (selected = checkout)',
                String(selectedQuantity),
                String(checkoutItem.quantity),
                selectedQuantity === checkoutItem.quantity,
                selectedQuantity === checkoutItem.quantity
                    ? undefined
                    : `Quantity mismatch: selected ${selectedQuantity}, ` +
                      `checkout ${checkoutItem.quantity} ` +
                      `(ticket: ${selectedTicket.name})`
            );

        } else {

            checks.push({
                field:
                    'Quantity (selected = checkout)',

                ticketName:
                    selectedTicket.name,

                expected:
                    String(selectedQuantity),

                actual:
                    'Not exposed by checkout summary',

                status:
                    'INFO',

                message:
                    `Checkout quantity was not exposed by the captured ` +
                    `checkout summary, so no false quantity assertion was made.`
            });
        }
    }


    // ═══════════════════════════════════════
    // 6. LINE TOTAL
    // ═══════════════════════════════════════
    //
    // Stage 3 captured the real booking total after:
    //
    // Date + Time + Adult quantity + Child quantity
    //
    // Adult and Child can have different prices, so:
    //
    // unitPrice × totalQuantity
    //
    // is NOT valid for mixed-ticket bookings.
    //
    // Example:
    //
    // Adult (1): $14.64
    // Child (2): $14.66
    // Total:     $29.30
    //
    // Therefore Stage 3 order-summary total is the
    // expected booking line total.
    //
    // The actual Cart lineTotal is then verified
    // against that value.
    // ═══════════════════════════════════════

    if (cartItem) {

        const expectedLineTotal =
            normalizeCurrency(
                stage3.orderSummaryPrice
            );

        const actualCartLineTotal =
            normalizeCurrency(
                cartItem.lineTotal
            );

        if (expectedLineTotal === null) {

            checks.push({

                field:
                    'Line total (Stage 3 = cart)',

                ticketName:
                    selectedTicket.name,

                expected:
                    'Valid Stage 3 booking total',

                actual:
                    actualCartLineTotal?.toFixed(2) ?? 'N/A',

                status:
                    'INFO',

                message:
                    `Stage 3 booking total was not available, ` +
                    `so cart line total could not be independently verified.`,
            });

        } else {

            const matches =
                currencyEquals(
                    expectedLineTotal,
                    actualCartLineTotal
                );

            addCheck(
                checks,
                mismatches,
                selectedTicket.name,
                'Line total (Stage 3 = cart)',

                expectedLineTotal.toFixed(2),

                actualCartLineTotal?.toFixed(2) ?? 'N/A',

                matches,

                matches
                    ? undefined
                    : `Line total mismatch: Stage 3 booking total ` +
                      `${expectedLineTotal.toFixed(2)}, ` +
                      `cart line total ` +
                      `${actualCartLineTotal?.toFixed(2) ?? 'N/A'} ` +
                      `(ticket: ${selectedTicket.name})`
            );
        }

        // ------------------------------------------------
        // Calculation reference only
        // ------------------------------------------------

        const calculatedCartLineTotal =
            normalizeCurrency(
                cartItem.calculatedLineTotal
            );

        console.log(
            '\n----- LINE TOTAL CALCULATION -----'
        );

        console.log(
            `Stage 3 booking total: ` +
            `${expectedLineTotal?.toFixed(2) ?? 'N/A'}`
        );

        console.log(
            `Cart displayed line total: ` +
            `${actualCartLineTotal?.toFixed(2) ?? 'N/A'}`
        );

        console.log(
            `Cart calculated line total: ` +
            `${calculatedCartLineTotal?.toFixed(2) ?? 'N/A'}`
        );

        console.log(
            '----------------------------------'
        );
    }


    // ═══════════════════════════════════════
    // 7. DATE
    // ═══════════════════════════════════════

    if (cartItem) {

        const selectedDate =
            normalizeDate(
                stage3.selectedDate
            );

        const cartDate =
            normalizeDate(
                cartItem.selectedDate
            );

        addCheck(
            checks,
            mismatches,
            selectedTicket.name,
            'Date (selected = cart)',
            selectedDate ?? 'N/A',
            cartDate ?? 'N/A',
            selectedDate !== null &&
            cartDate !== null &&
            selectedDate === cartDate,
            selectedDate !== null &&
            cartDate !== null &&
            selectedDate === cartDate
                ? undefined
                : `Date mismatch: selected "${stage3.selectedDate}", ` +
                  `cart "${cartItem.selectedDate}" ` +
                  `(ticket: ${selectedTicket.name})`
        );
    }


    // ═══════════════════════════════════════
    // 8. TIME
    // ═══════════════════════════════════════

    if (stage3.hasTimeSelection) {

        if (cartItem) {

            const selectedTime =
                normalizeTime(
                    stage3.selectedTime
                );

            const cartTime =
                normalizeTime(
                    cartItem.selectedTime
                );

            addCheck(
                checks,
                mismatches,
                selectedTicket.name,
                'Time (selected = cart)',
                selectedTime ?? 'N/A',
                cartTime ?? 'N/A',
                selectedTime !== null &&
                cartTime !== null &&
                selectedTime === cartTime,
                selectedTime !== null &&
                cartTime !== null &&
                selectedTime === cartTime
                    ? undefined
                    : `Time mismatch: selected "${stage3.selectedTime}", ` +
                      `cart "${cartItem.selectedTime}" ` +
                      `(ticket: ${selectedTicket.name})`
            );
        }


        // Checkout date/time
        const checkoutSummary =
            page.locator(
                'div.fx-checkout__booking-details-container'
            );

        if (
            await checkoutSummary.count() > 0
        ) {

            const checkoutText =
                (
                    await checkoutSummary.innerText()
                ).trim();


            const checkoutDateText =
                extractDateFromText(
                    checkoutText
                );

            const checkoutTimeText =
                extractTimeFromText(
                    checkoutText
                );


            const expectedDate =
                normalizeDate(
                    stage3.selectedDate
                );

            const actualCheckoutDate =
                normalizeDate(
                    checkoutDateText
                );


            addCheck(
                checks,
                mismatches,
                selectedTicket.name,
                'Date (selected = checkout)',
                expectedDate ?? 'N/A',
                actualCheckoutDate ?? 'N/A',
                expectedDate !== null &&
                actualCheckoutDate !== null &&
                expectedDate === actualCheckoutDate,
                expectedDate !== null &&
                actualCheckoutDate !== null &&
                expectedDate === actualCheckoutDate
                    ? undefined
                    : `Date mismatch: selected "${stage3.selectedDate}", ` +
                      `checkout "${checkoutDateText ?? 'N/A'}" ` +
                      `(ticket: ${selectedTicket.name})`
            );


            const expectedTime =
                normalizeTime(
                    stage3.selectedTime
                );

            const actualCheckoutTime =
                normalizeTime(
                    checkoutTimeText
                );


            addCheck(
                checks,
                mismatches,
                selectedTicket.name,
                'Time (selected = checkout)',
                expectedTime ?? 'N/A',
                actualCheckoutTime ?? 'N/A',
                expectedTime !== null &&
                actualCheckoutTime !== null &&
                expectedTime === actualCheckoutTime,
                expectedTime !== null &&
                actualCheckoutTime !== null &&
                expectedTime === actualCheckoutTime
                    ? undefined
                    : `Time mismatch: selected "${stage3.selectedTime}", ` +
                      `checkout "${checkoutTimeText ?? 'N/A'}" ` +
                      `(ticket: ${selectedTicket.name})`
            );
        }

    } else {

        checks.push({
            field:
                'Time',

            ticketName:
                selectedTicket.name,

            expected:
                'No time selection',

            actual:
                'No time selection',

            status:
                'PASS',

            message:
                'Ticket is date-only.',
        });
    }


    // ═══════════════════════════════════════
    // 9. ORDER TOTAL
    // ═══════════════════════════════════════

    /*
     * Use CART SUBTOTAL as the cart-side base.
     *
     * The cart lineTotal currently cannot be trusted for
     * Adult + Child tickets because those ticket types
     * have different unit prices.
     *
     * Checkout:
     *
     * Cart subtotal
     * + Taxes & Surcharge
     * + Processing Fees
     * + Refundable Option
     * - Discounts
     * = Checkout order total
     */

    const cartBase =
        normalizeCurrency(
            cart.subtotal
        );

    const taxes =
        normalizeCurrency(
            checkout.taxesAndSurcharge
        ) ?? 0;

    const processingFees =
        normalizeCurrency(
            checkout.processingFees
        ) ?? 0;

    const refundableOption =
        normalizeCurrency(
            checkout.refundableOption
        ) ?? 0;

    const discounts =
        normalizeCurrency(
            checkout.discounts
        ) ?? 0;

    const expectedCheckoutTotal =
        Number(
            (
                (cartBase ?? 0) +
                taxes +
                processingFees +
                refundableOption -
                discounts
            ).toFixed(2)
        );

    const actualCheckoutTotal =
        normalizeCurrency(
            checkout.orderTotal
        );


    addCheck(
        checks,
        mismatches,
        selectedTicket.name,
        'Order total',
        expectedCheckoutTotal.toFixed(2),
        actualCheckoutTotal?.toFixed(2) ?? 'N/A',
        currencyEquals(
            expectedCheckoutTotal,
            actualCheckoutTotal
        ),
        currencyEquals(
            expectedCheckoutTotal,
            actualCheckoutTotal
        )
            ? undefined
            : `Order total mismatch: cart subtotal ` +
              `${cartBase?.toFixed(2) ?? 'N/A'} + ` +
              `taxes & surcharge ${taxes.toFixed(2)} + ` +
              `processing fees ${processingFees.toFixed(2)} + ` +
              `refundable option ${refundableOption.toFixed(2)} - ` +
              `discounts ${discounts.toFixed(2)} = ` +
              `${expectedCheckoutTotal.toFixed(2)}, ` +
              `checkout total ${actualCheckoutTotal?.toFixed(2) ?? 'N/A'}`
    );


    console.log(
        '\n----- ORDER TOTAL VERIFICATION -----'
    );

    console.log(
        `Cart subtotal:         ${cartBase?.toFixed(2) ?? 'N/A'}`
    );

    console.log(
        `Taxes & Surcharge:     ${taxes.toFixed(2)}`
    );

    console.log(
        `Processing Fees:       ${processingFees.toFixed(2)}`
    );

    console.log(
        `Refundable Option:     ${refundableOption.toFixed(2)}`
    );

    console.log(
        `Discounts:             ${discounts.toFixed(2)}`
    );

    console.log(
        `Expected total:        ${expectedCheckoutTotal.toFixed(2)}`
    );

    console.log(
        `Checkout total:        ${actualCheckoutTotal?.toFixed(2) ?? 'N/A'}`
    );

    console.log(
        '-----------------------------------'
    );


    // ═══════════════════════════════════════
    // FINAL REPORT
    // ═══════════════════════════════════════

    console.log(
        '\n========================================'
    );

    console.log(
        'STAGE 5 VERIFICATION RESULTS'
    );

    console.log(
        '========================================'
    );


    console.table(
        checks.map(
            check => ({
                Field:
                    check.field,

                Expected:
                    check.expected,

                Actual:
                    check.actual,

                Status:
                    check.status,
            })
        )
    );


    if (
        mismatches.length > 0
    ) {

        console.log(
            '\n--------- MISMATCHES ---------'
        );

        for (
            const mismatch of mismatches
        ) {

            console.log(
                `✗ ${mismatch}`
            );
        }

        console.log(
            '------------------------------'
        );

    } else {

        console.log(
            '\n✓ No Stage 5 mismatches found.'
        );
    }


    // ═══════════════════════════════════════
    // FINAL ASSERTION
    // ═══════════════════════════════════════

    expect(
        mismatches,
        mismatches.length === 0
            ? 'Stage 5 verification passed.'
            : `Stage 5 verification failed with ` +
              `${mismatches.length} mismatch(es):\n` +
              mismatches
                .map(
                    mismatch =>
                        `- ${mismatch}`
                )
                .join('\n')
    ).toEqual([]);


    return {
        passed:
            mismatches.length === 0,

        checks,

        mismatches,
    };
}


// ═══════════════════════════════════════════
// DATE HELPERS
// ═══════════════════════════════════════════

function normalizeDate(
    value: string | null | undefined
): string | null {

    if (!value) {
        return null;
    }

    let text =
        value
            .replace(/\u202f/g, ' ')
            .replace(/\u00a0/g, ' ')
            .replace(/\s+/g, ' ')
            .trim();

    text =
        text.replace(
            /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s*/i,
            ''
        );


    const iso =
        text.match(
            /^(\d{4})-(\d{1,2})-(\d{1,2})/
        );

    if (iso) {

        return `${iso[1]}-${String(
            Number(iso[2])
        ).padStart(2, '0')}-${String(
            Number(iso[3])
        ).padStart(2, '0')}`;
    }


    const monthDate =
        text.match(
            /^([A-Za-z]+)\s+(\d{1,2})(?:,\s*(\d{4}))?/i
        );

    if (monthDate) {

        const year =
            monthDate[3]
                ? Number(monthDate[3])
                : new Date().getFullYear();

        const date =
            new Date(
                `${monthDate[1]} ${monthDate[2]}, ${year}`
            );

        if (!Number.isNaN(date.getTime())) {

            return `${date.getFullYear()}-${String(
                date.getMonth() + 1
            ).padStart(2, '0')}-${String(
                date.getDate()
            ).padStart(2, '0')}`;
        }
    }


    const numeric =
        text.match(
            /^(\d{1,2})[\/-](\d{1,2})[\/-](\d{2,4})/
        );

    if (numeric) {

        let year =
            Number(numeric[3]);

        if (year < 100) {
            year += 2000;
        }

        return `${year}-${String(
            Number(numeric[1])
        ).padStart(2, '0')}-${String(
            Number(numeric[2])
        ).padStart(2, '0')}`;
    }

    return null;
}


// ═══════════════════════════════════════════
// TIME HELPERS
// ═══════════════════════════════════════════

function normalizeTime(
    value: string | null | undefined
): string | null {

    if (!value) {
        return null;
    }

    const match =
        value
            .replace(/\u202f/g, ' ')
            .replace(/\u00a0/g, ' ')
            .replace(/\s+/g, ' ')
            .trim()
            .match(
                /^(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)$/i
            );

    if (!match) {
        return null;
    }

    let hour =
        Number(match[1]);

    const minute =
        Number(match[2]);

    const period =
        match[4].toUpperCase();

    if (
        period === 'PM' &&
        hour !== 12
    ) {
        hour += 12;
    }

    if (
        period === 'AM' &&
        hour === 12
    ) {
        hour = 0;
    }

    return `${String(hour).padStart(2, '0')}:${String(
        minute
    ).padStart(2, '0')}`;
}


// ═══════════════════════════════════════════
// EXTRACT DATE FROM TEXT
// ═══════════════════════════════════════════

function extractDateFromText(
    text: string
): string | null {

    const match =
        text.match(
            /\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s+[A-Za-z]+\s+\d{1,2}(?:,\s*\d{4})?/i
        );

    return match
        ? match[0].trim()
        : null;
}


// ═══════════════════════════════════════════
// EXTRACT TIME FROM TEXT
// ═══════════════════════════════════════════

function extractTimeFromText(
    text: string
): string | null {

    const match =
        text.match(
            /\b\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)\b/i
        );

    return match
        ? match[0].trim()
        : null;
}