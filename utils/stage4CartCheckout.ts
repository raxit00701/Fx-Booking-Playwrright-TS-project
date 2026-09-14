import { expect, Page } from '@playwright/test';


// ═══════════════════════════════════════════
// Types
// ═══════════════════════════════════════════

export type CartItem = {
    name: string;
    unitPrice: number;
    quantity: number;
    lineTotal: number;
    calculatedLineTotal: number;
    selectedDate: string | null;
    selectedTime: string | null;
};

export type CartResult = {
    items: CartItem[];
    subtotal: number;
    netSaving: number;
};

export type CheckoutItem = {
    name: string;
    unitPrice: number;
    quantity: number;
};

export type CheckoutResult = {
    items: CheckoutItem[];
    subtotal: number;
    taxesAndSurcharge: number;
    processingFees: number;
    refundableOption: number;
    discounts: number;
    orderTotal: number;
};


// ═══════════════════════════════════════════
// Currency parser
// ═══════════════════════════════════════════

function parseCurrency(value: string): number {

    const match = value.match(
        /(?:USD\s*)?\$?\s*([\d,]+(?:\.\d{2})?)/
    );

    if (!match) {
        throw new Error(
            `Cart: Unable to parse currency value: "${value}"`
        );
    }

    const amount = Number(
        match[1].replace(/,/g, '')
    );

    if (!Number.isFinite(amount)) {
        throw new Error(
            `Cart: Invalid currency value: "${value}"`
        );
    }

    return amount;
}


// ═══════════════════════════════════════════
// Extract currency
// ═══════════════════════════════════════════

function extractCurrency(
    value: string
): number | null {

    const match = value.match(
        /\$?\s*([\d,]+\.\d{2})/
    );

    if (!match) {
        return null;
    }

    const amount = Number(
        match[1].replace(/,/g, '')
    );

    return Number.isFinite(amount)
        ? amount
        : null;
}


// ═══════════════════════════════════════════
// Quantity parser
// ═══════════════════════════════════════════

function parseQuantity(
    value: string
): number {

    const match = value.match(
        /\b(\d+)\b/
    );

    if (!match) {
        throw new Error(
            `Cart: Unable to parse quantity from "${value}"`
        );
    }

    const quantity = Number(match[1]);

    if (
        !Number.isInteger(quantity) ||
        quantity < 1
    ) {
        throw new Error(
            `Cart: Invalid quantity "${value}"`
        );
    }

    return quantity;
}


// ═══════════════════════════════════════════
// Extract date
// ═══════════════════════════════════════════

function extractDate(
    value: string
): string | null {

    const patterns = [
        /\b(?:Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday),?\s+[A-Za-z]+\s+\d{1,2}(?:,\s*\d{4})?/i,
        /\b\d{1,2}[\/-]\d{1,2}[\/-]\d{2,4}\b/,
        /\b\d{4}-\d{2}-\d{2}\b/,
    ];

    for (const pattern of patterns) {

        const match = value.match(pattern);

        if (match) {
            return match[0].trim();
        }
    }

    return null;
}


// ═══════════════════════════════════════════
// Extract time
// ═══════════════════════════════════════════

function extractTime(
    value: string
): string | null {

    const match = value.match(
        /\b\d{1,2}:\d{2}(?::\d{2})?\s*(?:AM|PM)\b/i
    );

    return match
        ? match[0]
            .trim()
            .replace(/\s+/g, ' ')
        : null;
}


// ═══════════════════════════════════════════
// CART PAGE
// ═══════════════════════════════════════════

export async function captureCartPage(
    page: Page,
    stage3OrderSummaryPrice: number
): Promise<CartResult> {

    console.log('\n========================================');
    console.log('STAGE 4: CART PAGE');
    console.log('========================================');


    // ═══════════════════════════════════════
    // Cart container
    // ═══════════════════════════════════════

    const cartContainer = page.locator(
        'div.card-body.p-3.p-md-4'
    );

    await expect(
        cartContainer,
        'Cart: Cart container was not found.'
    ).toBeVisible();

    console.log(
        '✓ Cart container is visible'
    );


    // ═══════════════════════════════════════
    // Raw cart text
    // ═══════════════════════════════════════

    const cartText = (
        await cartContainer.innerText()
    ).trim();

    console.log(
        '\n----- CART CONTAINER -----'
    );

    console.log(cartText);

    console.log(
        '--------------------------'
    );


    // ═══════════════════════════════════════
    // ACTUAL TICKET ITEM LOCATOR
    // ═══════════════════════════════════════

    const itemBlocks = page.locator(
        'div.shopping-cart-item'
    );

    const itemBlockCount =
        await itemBlocks.count();

    console.log(
        `shopping-cart-item elements found: ${itemBlockCount}`
    );

    if (itemBlockCount === 0) {

        throw new Error(
            'Cart: No shopping-cart-item elements were found.'
        );
    }


    // ═══════════════════════════════════════
    // Extract ALL cart items
    // ═══════════════════════════════════════

    const items: CartItem[] = [];

    for (
        let itemIndex = 0;
        itemIndex < itemBlockCount;
        itemIndex++
    ) {

        const item =
            itemBlocks.nth(itemIndex);

        console.log(
            `\nProcessing cart item ` +
            `${itemIndex + 1}/${itemBlockCount}`
        );


        // ════════════════════════════════════
        // Complete item text
        // ════════════════════════════════════

        const itemText = (
            await item.innerText()
        ).trim();

        console.log(
            '\n----- CART ITEM -----'
        );

        console.log(itemText);

        console.log(
            '---------------------'
        );


        // ════════════════════════════════════
        // LINE ITEM NAME
        // ════════════════════════════════════

        let name = '';

        const nameCandidates = [

            item.locator('.offer-title').first(),

            item.locator('.ticket-title').first(),

            item.locator('.product-title').first(),

            item.locator('h1').first(),

            item.locator('h2').first(),

            item.locator('h3').first(),

            item.locator('h4').first(),

            item.locator('h5').first(),
        ];

        for (
            const candidate of nameCandidates
        ) {

            if (
                await candidate.count() > 0
            ) {

                const text = (
                    await candidate.innerText()
                ).trim();

                if (text) {

                    name = text;

                    break;
                }
            }
        }


        // ─────────────────────────────────────
        // Fallback name extraction
        // ─────────────────────────────────────

        if (!name) {

            const lines = itemText
                .split('\n')
                .map(
                    line => line.trim()
                )
                .filter(Boolean);

            const ignoredLines = new Set([
                'MOBILE_ONLY',
                'Price',
                'Save',
                'Qty',
                'Remove',
                'Refundable',
            ]);

            const candidateName =
                lines.find(
                    line =>
                        !ignoredLines.has(line) &&
                        !/^\d+\s+(Adult|Child)/i.test(line) &&
                        !/^\$[\d,.]+$/.test(line) &&
                        !/^Total\s+\d+$/i.test(line) &&
                        !/^\d{1,2}:\d{2}(?::\d{2})?\s*(AM|PM)$/i.test(line)
                );

            if (candidateName) {
                name = candidateName;
            }
        }

        if (!name) {

            throw new Error(
                `Cart: Line item ${itemIndex + 1} ` +
                `name could not be found.`
            );
        }

        console.log(
            `Line item name: ${name}`
        );


        // ════════════════════════════════════
        // UNIT PRICE
        // ════════════════════════════════════

        let unitPrice: number | null = null;

        const priceElements =
            item.locator(
                'p.price, .price, [class*="unit-price"], [class*="item-price"]'
            );

        const priceCount =
            await priceElements.count();

        for (
            let i = 0;
            i < priceCount;
            i++
        ) {

            const priceElement =
                priceElements.nth(i);

            const text = (
                await priceElement.innerText()
            ).trim();

            const value =
                extractCurrency(text);

            if (
                value !== null &&
                value > 0
            ) {

                unitPrice = value;

                break;
            }
        }


        // Fallback to first currency value
        // in this cart item.
        if (unitPrice === null) {

            const prices = [
                ...itemText.matchAll(
                    /\$?\s*([\d,]+\.\d{2})/g
                ),
            ];

            if (prices.length > 0) {

                unitPrice =
                    Number(
                        prices[0][1]
                            .replace(/,/g, '')
                    );
            }
        }

        if (unitPrice === null) {

            throw new Error(
                `Cart: Unit price could not be found ` +
                `for "${name}".`
            );
        }

        console.log(
            `Unit price: ${unitPrice.toFixed(2)}`
        );


        // ════════════════════════════════════
        // QUANTITY
        // ════════════════════════════════════

        let quantity: number | null = null;

        /*
         * Your cart displays:
         *
         * Total 1
         * Total 3
         *
         * Use this as the primary source.
         */

        const totalMatch =
            itemText.match(
                /Total\s+(\d+)/i
            );

        if (totalMatch) {

            quantity =
                Number(totalMatch[1]);
        }


        // Fallback:
        // 1 Adult
        // 1 Adult 2 Child

        if (quantity === null) {

            const quantityMatch =
                itemText.match(
                    /(\d+)\s+Adult(?:\s+(\d+)\s+Child)?/i
                );

            if (quantityMatch) {

                const adultQuantity =
                    Number(quantityMatch[1]);

                const childQuantity =
                    quantityMatch[2]
                        ? Number(quantityMatch[2])
                        : 0;

                quantity =
                    adultQuantity +
                    childQuantity;
            }
        }


        // Fallback to number input
        if (quantity === null) {

            const quantityInput =
                item.locator(
                    'input[type="number"]'
                ).first();

            if (
                await quantityInput.count() > 0
            ) {

                const value =
                    await quantityInput.inputValue();

                if (value) {

                    quantity =
                        parseQuantity(value);
                }
            }
        }

        if (quantity === null) {

            throw new Error(
                `Cart: Quantity could not be found ` +
                `for "${name}".`
            );
        }

        console.log(
            `Quantity: ${quantity}`
        );


        // ════════════════════════════════════
        // LINE TOTAL
        // ════════════════════════════════════

        let lineTotal: number | null = null;

        const lineTotalCandidates = [

            item.locator(
                '[class*="line-total"]'
            ).first(),

            item.locator(
                '[class*="total-price"]'
            ).first(),

            item.locator(
                '[class*="item-total"]'
            ).first(),
        ];

        for (
            const candidate of lineTotalCandidates
        ) {

            if (
                await candidate.count() === 0
            ) {
                continue;
            }

            const text = (
                await candidate.innerText()
            ).trim();

            const value =
                extractCurrency(text);

            if (
                value !== null &&
                value > 0
            ) {

                lineTotal = value;

                break;
            }
        }


        // ════════════════════════════════════
        // CALCULATED LINE TOTAL
        // ════════════════════════════════════

        const calculatedLineTotal =
    Number(
        stage3OrderSummaryPrice.toFixed(2)
    );

       console.log(
    `Calculated line total from Stage 3: ` +
    `${calculatedLineTotal.toFixed(2)}`
);


        if (lineTotal === null) {

            lineTotal =
                calculatedLineTotal;

            console.log(
                'INFO: Displayed line total not found; ' +
                'using calculated line total.'
            );

        } else {

            console.log(
                `Displayed line total: ` +
                `${lineTotal.toFixed(2)}`
            );
        }


        // ════════════════════════════════════
        // SELECTED DATE
        // ════════════════════════════════════

        const selectedDate =
            extractDate(itemText);

        console.log(
            `Selected date: ` +
            `${selectedDate ?? 'N/A'}`
        );


        // ════════════════════════════════════
        // SELECTED TIME
        // ════════════════════════════════════

        const selectedTime =
            extractTime(itemText);

        console.log(
            `Selected time: ` +
            `${selectedTime ?? 'N/A'}`
        );


        // ════════════════════════════════════
        // STORE ITEM
        // ════════════════════════════════════

        items.push({
            name,
            unitPrice,
            quantity,
            lineTotal,
            calculatedLineTotal,
            selectedDate,
            selectedTime,
        });

        console.log(
            `✓ Cart item ${itemIndex + 1} captured`
        );
    }


    // ═══════════════════════════════════════
    // SUBTOTAL
    // ═══════════════════════════════════════

    console.log(
        '\nCapturing subtotal'
    );

    const subtotalLocator = page.locator(
        '.card-body.pb-0 .row .col-6.text-right label'
    );

    await expect(
        subtotalLocator,
        'Cart: Subtotal element was not found.'
    ).toBeVisible();

    const subtotalText = (
        await subtotalLocator.innerText()
    ).trim();

    console.log(
        `Subtotal text: "${subtotalText}"`
    );

    const subtotal =
        parseCurrency(subtotalText);

    if (subtotal <= 0) {

        throw new Error(
            `Cart: Invalid subtotal: "${subtotalText}"`
        );
    }

    console.log(
        `✓ Subtotal: ${subtotal.toFixed(2)}`
    );


    // ═══════════════════════════════════════
    // NET SAVING
    // ═══════════════════════════════════════

    console.log(
        '\nCapturing net saving'
    );

    const netSavingLocator = page.locator(
        '.order-summary .card-footer .saving .text-right label'
    );

    await expect(
        netSavingLocator,
        'Cart: Net saving element was not found.'
    ).toBeVisible();

    const netSavingText = (
        await netSavingLocator.innerText()
    ).trim();

    console.log(
        `Net saving text: "${netSavingText}"`
    );

    const netSavingValue =
        extractCurrency(netSavingText);

    const netSaving =
        netSavingValue ?? 0;

    console.log(
        `✓ Net saving: ${netSaving.toFixed(2)}`
    );


    // ═══════════════════════════════════════
    // FINAL RESULT
    // ═══════════════════════════════════════

    const result: CartResult = {
        items,
        subtotal,
        netSaving,
    };

    console.log(
        '\n========================================'
    );

    console.log(
        'CART CAPTURE COMPLETE'
    );

    console.log(
        '========================================'
    );

    console.log(
        JSON.stringify(
            result,
            null,
            2
        )
    );

    return result;
    
}
// ═══════════════════════════════════════════
// CHECKOUT PAGE
// ═══════════════════════════════════════════

export async function captureCheckoutPage(
    page: Page
): Promise<CheckoutResult> {

    console.log('\n========================================');
    console.log('STAGE 4: CHECKOUT PAGE');
    console.log('========================================');


    // ═══════════════════════════════════════
    // STEP 22: Click Checkout
    // ═══════════════════════════════════════

    console.log('\nSTEP 22: Click Checkout');

    const checkoutButton = page.getByRole(
        'link',
        {
            name: 'Checkout',
        }
    );

    await expect(
        checkoutButton,
        'Checkout: Checkout button was not found.'
    ).toBeVisible();

    const urlBeforeCheckout = page.url();

    await Promise.all([
        page.waitForURL(
            url => url.toString() !== urlBeforeCheckout
        ),
        checkoutButton.click(),
    ]);

    console.log(
        '✓ Checkout clicked'
    );

    console.log(
        `Checkout URL: ${page.url()}`
    );


    // ═══════════════════════════════════════
    // STEP 23: Checkout summary
    // ═══════════════════════════════════════

    const checkoutSummary = page.locator(
        'div.fx-checkout__booking-details-container'
    );

    await expect(
        checkoutSummary,
        'Checkout: Booking details container was not found.'
    ).toBeVisible();

    const checkoutText = (
        await checkoutSummary.innerText()
    ).trim();

    console.log(
        '\n----- CHECKOUT SUMMARY -----'
    );

    console.log(checkoutText);

    console.log(
        '----------------------------'
    );


    // ═══════════════════════════════════════
    // Ticket name
    // ═══════════════════════════════════════

    const lines = checkoutText
        .split('\n')
        .map(line => line.trim())
        .filter(Boolean);

    const ignoredCheckoutLines = new Set([
        'Order Summary',
        'Reserved for',
        'Your Cart',
        'Edit',
        'Subtotal',
        'Taxes & Surcharge',
        'Processing Fees:',
        'Refundable Option',
        'Total',
    ]);

    let checkoutItemName = '';

    for (const line of lines) {

        if (
            ignoredCheckoutLines.has(line)
        ) {
            continue;
        }

        if (
            /terms and conditions/i.test(line)
        ) {
            continue;
        }

        if (
            /select a payment method/i.test(line)
        ) {
            continue;
        }

        if (
            /^\*/.test(line)
        ) {
            continue;
        }

        if (
            /^\$?\s*[\d,]+\.\d{2}$/.test(line)
        ) {
            continue;
        }

        if (
            /^\d{1,2}:\d{2}(?::\d{2})?\s*(AM|PM)$/i.test(line)
        ) {
            continue;
        }

        if (
            /^(Monday|Tuesday|Wednesday|Thursday|Friday|Saturday|Sunday)/i.test(line)
        ) {
            continue;
        }

        if (
            line.length > 3 &&
            !/^\d+$/.test(line)
        ) {
            checkoutItemName = line;
            break;
        }
    }

    if (!checkoutItemName) {
        throw new Error(
            'Checkout: Ticket line item name could not be identified.'
        );
    }

    console.log(
        `Checkout ticket name: ${checkoutItemName}`
    );


    // ═══════════════════════════════════════
    // Unit price + quantity
    // ═══════════════════════════════════════

    let unitPrice = 0;
    let quantity = 0;

    const subtotalIndex =
        lines.findIndex(
            line => line === 'Subtotal'
        );

    const beforeSubtotalLines =
        subtotalIndex >= 0
            ? lines.slice(0, subtotalIndex)
            : lines;

    const itemPrices = beforeSubtotalLines
        .map(
            line => extractCurrency(line)
        )
        .filter(
            (value): value is number =>
                value !== null &&
                value > 0
        );

    if (itemPrices.length > 0) {
        unitPrice =
            itemPrices[itemPrices.length - 1];
    }

    const quantityMatch =
        checkoutText.match(
            /(?:Qty|Quantity|Total)\s*:?\s*(\d+)/i
        );

    if (quantityMatch) {

        quantity =
            Number(quantityMatch[1]);

    } else {

        const adultChildMatch =
            checkoutText.match(
                /(\d+)\s+Adult(?:\s+(\d+)\s+Child)?/i
            );

        if (adultChildMatch) {

            const adultQuantity =
                Number(adultChildMatch[1]);

            const childQuantity =
                adultChildMatch[2]
                    ? Number(adultChildMatch[2])
                    : 0;

            quantity =
                adultQuantity +
                childQuantity;
        }
    }

    console.log({
        name: checkoutItemName,
        unitPrice: unitPrice.toFixed(2),
        quantity,
    });

    const items: CheckoutItem[] = [
        {
            name: checkoutItemName,
            unitPrice,
            quantity,
        },
    ];


    // ═══════════════════════════════════════
    // STEP 24: Subtotal
    // ═══════════════════════════════════════

    const subtotalMatch =
        checkoutText.match(
            /Subtotal\s*\r?\n\s*\$?\s*([\d,]+\.\d{2})/i
        );

    if (!subtotalMatch) {
        throw new Error(
            'Checkout: Subtotal could not be captured.'
        );
    }

    const subtotal =
        Number(
            subtotalMatch[1]
                .replace(/,/g, '')
        );

    console.log(
        `✓ Checkout subtotal: ${subtotal.toFixed(2)}`
    );


    // ═══════════════════════════════════════
    // STEP 25: Taxes & Surcharge
    // ═══════════════════════════════════════

    const taxesMatch =
        checkoutText.match(
            /Taxes\s*&\s*Surcharge\s*\r?\n\s*\$?\s*([\d,]+\.\d{2})/i
        );

    const taxesAndSurcharge =
        taxesMatch
            ? Number(
                taxesMatch[1]
                    .replace(/,/g, '')
            )
            : 0;

    console.log(
        `✓ Taxes & Surcharge: ` +
        `${taxesAndSurcharge.toFixed(2)}`
    );


    // ═══════════════════════════════════════
    // STEP 26: Processing Fees
    // ═══════════════════════════════════════

    const processingFeesMatch =
        checkoutText.match(
            /Processing Fees:?\s*\r?\n\s*\$?\s*([\d,]+\.\d{2})/i
        );

    const processingFees =
        processingFeesMatch
            ? Number(
                processingFeesMatch[1]
                    .replace(/,/g, '')
            )
            : 0;

    console.log(
        `✓ Processing Fees: ` +
        `${processingFees.toFixed(2)}`
    );


    // ═══════════════════════════════════════
    // STEP 27: Refundable Option
    // ═══════════════════════════════════════

    const refundableMatch =
        checkoutText.match(
            /Refundable Option\s*\r?\n\s*\$?\s*([\d,]+\.\d{2})/i
        );

    const refundableOption =
        refundableMatch
            ? Number(
                refundableMatch[1]
                    .replace(/,/g, '')
            )
            : 0;

    console.log(
        `✓ Refundable Option: ` +
        `${refundableOption.toFixed(2)}`
    );


    // ═══════════════════════════════════════
    // STEP 28: Discounts
    // ═══════════════════════════════════════

    let discounts = 0;

    const discountMatches = [
        ...checkoutText.matchAll(
            /(?:Discount|Saving|Savings)\s*:?\s*-?\$?\s*([\d,]+\.\d{2})/gi
        ),
    ];

    for (const match of discountMatches) {

        discounts += Number(
            match[1].replace(/,/g, '')
        );
    }

    console.log(
        `✓ Discounts: ${discounts.toFixed(2)}`
    );


    // ═══════════════════════════════════════
    // STEP 29: Order total
    // ═══════════════════════════════════════

    const totalMatch =
        checkoutText.match(
            /(?:^|\n)Total\s*\r?\n\s*\$?\s*([\d,]+\.\d{2})/i
        );

    if (!totalMatch) {
        throw new Error(
            'Checkout: Order total could not be captured.'
        );
    }

    const orderTotal =
        Number(
            totalMatch[1]
                .replace(/,/g, '')
        );

    if (
        !Number.isFinite(orderTotal) ||
        orderTotal <= 0
    ) {
        throw new Error(
            `Checkout: Invalid order total: ${orderTotal}`
        );
    }

    console.log(
        `✓ Order total: ${orderTotal.toFixed(2)}`
    );


    // ═══════════════════════════════════════
    // Price reconciliation
    // ═══════════════════════════════════════

    const expectedTotal =
        Number(
            (
                subtotal +
                taxesAndSurcharge +
                processingFees +
                refundableOption -
                discounts
            ).toFixed(2)
        );

    console.log(
        '\n----- CHECKOUT PRICE BREAKDOWN -----'
    );

    console.log(
        `Subtotal:             ${subtotal.toFixed(2)}`
    );

    console.log(
        `Taxes & Surcharge:    ${taxesAndSurcharge.toFixed(2)}`
    );

    console.log(
        `Processing Fees:      ${processingFees.toFixed(2)}`
    );

    console.log(
        `Refundable Option:    ${refundableOption.toFixed(2)}`
    );

    console.log(
        `Discounts:            ${discounts.toFixed(2)}`
    );

    console.log(
        `Calculated Total:     ${expectedTotal.toFixed(2)}`
    );

    console.log(
        `Displayed Total:      ${orderTotal.toFixed(2)}`
    );


    // ═══════════════════════════════════════
    // Total assertion
    // ═══════════════════════════════════════

    expect(
        orderTotal,
        `Checkout total mismatch: ` +
        `calculated ${expectedTotal.toFixed(2)}, ` +
        `displayed ${orderTotal.toFixed(2)}`
    ).toBe(expectedTotal);


    console.log(
        '✓ Checkout total reconciled successfully'
    );


    // ═══════════════════════════════════════
    // FINAL RESULT
    // ═══════════════════════════════════════

    const result: CheckoutResult = {
        items,
        subtotal,
        taxesAndSurcharge,
        processingFees,
        refundableOption,
        discounts,
        orderTotal,
    };


    console.log(
        '\n========================================'
    );

    console.log(
        'CHECKOUT CAPTURE COMPLETE'
    );

    console.log(
        '========================================'
    );

    console.log(
        JSON.stringify(
            result,
            null,
            2
        )
    );


    // IMPORTANT:
    // Stop here.
    // Do NOT submit the order.
    // Do NOT enter payment details.

    console.log(
        '\n✓ STOPPING AT CHECKOUT PAGE'
    );

    console.log(
        '✓ No order submitted'
    );

    console.log(
        '✓ No payment details entered'
    );


   
    return result;

}