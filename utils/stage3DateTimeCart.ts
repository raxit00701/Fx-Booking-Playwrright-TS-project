import { expect, Locator, Page } from '@playwright/test';

export type Stage3Result = {
    selectedDate: string;
    selectedDatePrice: number;
    selectedTime: string | null;
    hasTimeSelection: boolean;
    adultQuantity: number;
    childQuantity: number | null;
    orderSummaryPrice: number;
    priceDifference: number;
    priceDiffersFromListing: boolean;
    addedToCart: boolean;
};

function parseCurrency(value: string): number {
    const match = value.match(
        /(?:USD\s*)?\$?\s*([\d,]+(?:\.\d{2})?)/
    );

    if (!match) {
        throw new Error(
            `Stage 3: Unable to parse currency value: "${value}"`
        );
    }

    const amount = Number(
        match[1].replace(/,/g, '')
    );

    if (!Number.isFinite(amount)) {
        throw new Error(
            `Stage 3: Invalid currency value: "${value}"`
        );
    }

    return amount;
}

export async function selectFirstAvailableDateAndTime(
    page: Page,
    listingPrice: number
): Promise<Stage3Result> {

    console.log('\n========================================');
    console.log('STAGE 3: Date and time selection');
    console.log('========================================');

    // Maximum number of calendar months to inspect.
    // This prevents an infinite calendar loop.
    const MAX_MONTH_ATTEMPTS = 6;

    // ════════════════════════════════════════
    // STEP 15: Find an available date
    // ════════════════════════════════════════

    console.log('\nSTEP 15: Find first available date');

    type AvailableDate = {
        cell: Locator;
        date: string;
        price: number;
    };

    let availableDates: AvailableDate[] = [];
    let selectedCalendar: Locator | null = null;

    // ─────────────────────────────────────────
    // Search current month, then advance month
    // if no dates are available.
    // ─────────────────────────────────────────

    for (
        let monthAttempt = 1;
        monthAttempt <= MAX_MONTH_ATTEMPTS;
        monthAttempt++
    ) {

        console.log(
            `Checking calendar month ${monthAttempt}/${MAX_MONTH_ATTEMPTS}`
        );

        const calendar = page.locator(
            'div.mbsc-calendar-table.mbsc-calendar-table-active'
        );

        await expect(
            calendar,
            'Stage 3: Active calendar is not visible.'
        ).toBeVisible();

        await calendar.scrollIntoViewIfNeeded();

        selectedCalendar = calendar;

        console.log(
            '✓ Active calendar is visible'
        );

        const dateCells = calendar.locator(
            '[class*="mbsc-calendar-cell"]'
        );

        const cellCount = await dateCells.count();

        console.log(
            `Calendar date cells found: ${cellCount}`
        );

        availableDates = [];

        // ─────────────────────────────────────
        // Inspect date cells
        // ─────────────────────────────────────

        for (let i = 0; i < cellCount; i++) {

            const cell = dateCells.nth(i);

            // Dynamic price.
            const priceLocator = cell
                .locator(
                    'div.mbsc-calendar-label-text'
                )
                .filter({
                    hasText: /\$\s*\d+(?:\.\d{2})?/,
                })
                .first();

            if (await priceLocator.count() === 0) {
                continue;
            }

            const priceText = (
                await priceLocator.innerText()
            ).trim();

            let price: number;

            try {
                price = parseCurrency(priceText);
            } catch {
                console.log(
                    `Skipping cell ${i}: invalid price "${priceText}"`
                );
                continue;
            }

            if (price <= 0) {
                continue;
            }

            const ariaLabel =
                await cell.getAttribute('aria-label');

            const dataDate =
                await cell.getAttribute('data-date');

            const actualDate =
                dataDate ?? ariaLabel;

            if (!actualDate) {
                console.log(
                    `Skipping cell ${i}: date attribute not found`
                );
                continue;
            }

            // Avoid duplicate DOM representations.
            if (
                availableDates.some(
                    item => item.date === actualDate
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
            `Available dates in current month: ${availableDates.length}`
        );

        // ════════════════════════════════════════
        // Available date found
        // ════════════════════════════════════════

        if (availableDates.length > 0) {
            break;
        }

        // ════════════════════════════════════════
        // No availability in visible month
        // ════════════════════════════════════════

        console.log(
            `INFO: No available dates found in visible month ` +
            `(attempt ${monthAttempt}).`
        );

        if (monthAttempt === MAX_MONTH_ATTEMPTS) {
            throw new Error(
                `Stage 3: No availability found after checking ` +
                `${MAX_MONTH_ATTEMPTS} calendar months.`
            );
        }

        // ─────────────────────────────────────
        // Find next-month button
        // ─────────────────────────────────────

        const nextMonthButtons = page.locator(
            'button:visible'
        );

        let nextMonthButton: Locator | null = null;

        const nextButtonCount =
            await nextMonthButtons.count();

        for (let i = 0; i < nextButtonCount; i++) {

            const button = nextMonthButtons.nth(i);

            const ariaLabel =
                await button.getAttribute('aria-label');

            const title =
                await button.getAttribute('title');

            const text = (
                await button.innerText()
            ).trim();

            const buttonIdentifier =
                `${ariaLabel ?? ''} ${title ?? ''} ${text}`;

            if (
                /next|next month|following month/i.test(
                    buttonIdentifier
                )
            ) {
                nextMonthButton = button;
                break;
            }
        }

        if (!nextMonthButton) {
            throw new Error(
                'Stage 3: No available dates found in the visible month, ' +
                'and the next-month calendar control could not be located.'
            );
        }

        const disabled =
            await nextMonthButton
                .isDisabled()
                .catch(() => false);

        const ariaDisabled =
            await nextMonthButton.getAttribute(
                'aria-disabled'
            );

        if (
            disabled ||
            ariaDisabled === 'true'
        ) {
            throw new Error(
                'Stage 3: No availability found. ' +
                'The calendar cannot advance to another month.'
            );
        }

        console.log(
            'Advancing to next calendar month...'
        );

        await nextMonthButton.click();

        // Wait for the active calendar to settle.
        await expect(
            page.locator(
                'div.mbsc-calendar-table.mbsc-calendar-table-active'
            )
        ).toBeVisible();

        console.log(
            '✓ Advanced to next calendar month'
        );
    }

    // ════════════════════════════════════════
    // Verify availability
    // ════════════════════════════════════════

    if (
        !selectedCalendar ||
        availableDates.length === 0
    ) {
        throw new Error(
            'Stage 3: No availability found for this ticket.'
        );
    }

    console.log(
        'Available dates:',
        availableDates.map(item => ({
            date: item.date,
            price: item.price.toFixed(2),
        }))
    );

    // ════════════════════════════════════════
    // STEP 16: Select FIRST available date
    // ════════════════════════════════════════

    console.log(
        '\nSTEP 16: Select first available date'
    );

    const firstAvailableDate =
        availableDates[0];

    console.log(
        `Selecting first available date: ${firstAvailableDate.date}`
    );

    await expect(
        firstAvailableDate.cell
    ).toBeVisible();

    await firstAvailableDate.cell.click();

    console.log(
        `✓ STEP 16: First available date selected: ` +
        `${firstAvailableDate.date}`
    );

    // ════════════════════════════════════════
    // Verify date selection
    // ════════════════════════════════════════

    const selectedState =
        await firstAvailableDate.cell.getAttribute(
            'aria-selected'
        );

    if (selectedState !== null) {

        expect(
            selectedState,
            `Stage 3: Date "${firstAvailableDate.date}" ` +
            `was not marked as selected.`
        ).toBe('true');

        console.log(
            '✓ Date selection reflected in UI'
        );

    } else {

        console.log(
            'INFO: Date cell does not expose aria-selected.'
        );
    }

    const selectedDatePrice =
        firstAvailableDate.price;

    console.log(
        `Selected date price: ` +
        `${selectedDatePrice.toFixed(2)}`
    );

    // ════════════════════════════════════════
    // STEP 17: Select time if available
    // ════════════════════════════════════════

    console.log(
        '\nSTEP 17: Check for time selection'
    );

    const hoursContainer = page.locator(
        'div.buy-tickets-body:visible'
    );

    const minuteSection = page.locator(
        '#minuteSection'
    );

    let selectedTime: string | null = null;
    let hasTimeSelection = false;

    const hoursCount =
        await hoursContainer.count();

    // ─────────────────────────────────────────
    // Date-only ticket
    // ─────────────────────────────────────────

    if (hoursCount === 0) {

        console.log(
            'INFO: This ticket is date-only; no time selection required.'
        );

    } else {

        hasTimeSelection = true;

        console.log(
            '✓ Ticket offers time selection'
        );

        // ════════════════════════════════════════
        // STEP 17A: Select first available hour
        // ════════════════════════════════════════

        const hourButtons =
            hoursContainer.getByRole('button');

        const hourCount =
            await hourButtons.count();

        console.log(
            `Hour buttons found: ${hourCount}`
        );

        let selectedHourButton: Locator | null = null;
        let selectedHour: string | null = null;

        for (let i = 0; i < hourCount; i++) {

            const button =
                hourButtons.nth(i);

            const disabled =
                await button
                    .isDisabled()
                    .catch(() => false);

            if (disabled) {
                continue;
            }

            const ariaDisabled =
                await button.getAttribute(
                    'aria-disabled'
                );

            if (ariaDisabled === 'true') {
                continue;
            }

            const text = (
                await button.innerText()
            ).trim();

            if (
                !/^\d{1,2}:\d{2}\s?(AM|PM)$/i.test(text)
            ) {
                continue;
            }

            selectedHourButton = button;
            selectedHour = text;
            break;
        }

        // ════════════════════════════════════════
        // Sold-out hours
        // ════════════════════════════════════════

        if (!selectedHourButton) {

            throw new Error(
                'Stage 3: Time selection is available, ' +
                'but no selectable hour was found. ' +
                'Possible sold-out time slots.'
            );
        }

        console.log(
            `Selecting first available hour: ${selectedHour}`
        );

        await expect(
            selectedHourButton
        ).toBeVisible();

        await selectedHourButton.click();

        console.log(
            `✓ Hour selected: ${selectedHour}`
        );

        // ════════════════════════════════════════
        // STEP 17B: Minute section
        // ════════════════════════════════════════

        console.log(
            'Checking #minuteSection...'
        );

        const visibleMinuteSection =
            page.locator('#minuteSection:visible');

        if (
            await visibleMinuteSection.count() === 0
        ) {

            // Hour itself is the final time.
            selectedTime = selectedHour;

            console.log(
                `✓ Final time selected: ${selectedTime}`
            );

        } else {

            console.log(
                '✓ #minuteSection is visible'
            );

            // ════════════════════════════════════════
            // STEP 17C: Find minute/time options
            // ════════════════════════════════════════

            const minuteSlots =
                page.locator('#minuteSlots:visible');

            const minuteCount =
                await minuteSlots.count();

            console.log(
                `Minute slots containers found: ${minuteCount}`
            );

            if (minuteCount === 0) {

                throw new Error(
                    'Stage 3: #minuteSection is visible, ' +
                    'but #minuteSlots was not found. ' +
                    'Possible sold-out time slots.'
                );
            }

            // Use text/label dynamically.
            const minuteOptions =
                minuteSlots.getByText(
                    /^\d{1,2}:\d{2}\s?(AM|PM)$/i
                );

            const optionCount =
                await minuteOptions.count();

            console.log(
                `Minute/time options found: ${optionCount}`
            );

            let selectedMinuteOption:
                Locator | null = null;

            for (
                let i = 0;
                i < optionCount;
                i++
            ) {

                const option =
                    minuteOptions.nth(i);

                const text = (
                    await option.innerText()
                ).trim();

                if (
                    !/^\d{1,2}:\d{2}\s?(AM|PM)$/i.test(text)
                ) {
                    continue;
                }

                selectedMinuteOption = option;
                selectedTime = text;
                break;
            }

            // ════════════════════════════════════════
            // Sold-out minute slots
            // ════════════════════════════════════════

            if (!selectedMinuteOption) {

                throw new Error(
                    'Stage 3: #minuteSection is visible, ' +
                    'but all minute/time slots are unavailable ' +
                    'or sold out.'
                );
            }

            console.log(
                `Selecting first available final time: ${selectedTime}`
            );

            await expect(
                selectedMinuteOption
            ).toBeVisible();

            await selectedMinuteOption.click();

            console.log(
                `✓ Final time selected: ${selectedTime}`
            );
        }
    }

    // ════════════════════════════════════════
    // Final time verification
    // ════════════════════════════════════════

    if (hasTimeSelection) {

        expect(
            selectedTime,
            'Stage 3: Time selection was available, but no time was selected.'
        ).not.toBeNull();

        console.log(
            `✓ STEP 17: Time selected: ${selectedTime}`
        );

    } else {

        console.log(
            'INFO: Ticket is date-only; no time selection required.'
        );
    }
    
    ;
// Scroll down to order summary 
   
const orderSummaryHeading = page.getByRole('heading', {
    name: 'Order summary'
})
await orderSummaryHeading.scrollIntoViewIfNeeded();

await expect(orderSummaryHeading).toBeVisible();


// ════════════════════════════════════════
// STEP 18: Set ticket quantity
// ════════════════════════════════════════

console.log('\nSTEP 18: Set ticket quantity');

const configuredQuantity = Number(
    process.env.FUNEX_QUANTITY ?? '1'
);

if (
    !Number.isInteger(configuredQuantity) ||
    configuredQuantity < 1
) {
    throw new Error(
        `Stage 3: Invalid FUNEX_QUANTITY ` +
        `"${process.env.FUNEX_QUANTITY}". ` +
        `Quantity must be a positive integer.`
    );
}

console.log(
    `Configured quantity: ${configuredQuantity}`
);


// ─────────────────────────────────────────
// Quantity container
// ─────────────────────────────────────────

const ticketContainer = page.locator(
    '//div[contains(@class, "buy-tickets-body") and contains(@class, "ticket-catg-body")]'
);

const ticketContainerCount =
    await ticketContainer.count();

console.log(
    `Ticket quantity containers found: ${ticketContainerCount}`
);

if (ticketContainerCount === 0) {
    throw new Error(
        'Stage 3: Ticket quantity controls were not found.'
    );
}


// ─────────────────────────────────────────
// Increment controls
// ─────────────────────────────────────────

const adultIncrementButton = page.locator(
    "div[data-product-id='ADULT'] div[class='qtyplus']"
);

const childIncrementButton = page.locator(
    "div[data-product-id='CHILD'] div[class='qtyplus']"
);

if (await adultIncrementButton.count() === 0) {
    throw new Error(
        'Stage 3: ADULT increment button was not found.'
    );
}




// ════════════════════════════════════════
// IMPORTANT
// Do not assume Adult and Child start
// at the same quantity.
// ════════════════════════════════════════

const adultCategory = page.locator(
    "div[data-product-id='ADULT']"
);



// ─────────────────────────────────────────
// Helper: read current quantity
// ─────────────────────────────────────────

async function getCurrentQuantity(
    category: Locator
): Promise<number> {

    // Try number input first.
    const input = category.locator(
        'input[type="number"]'
    ).first();

    if (await input.count() > 0) {

        const value = await input.inputValue();

        const quantity = Number(value);

        if (
            Number.isInteger(quantity) &&
            quantity >= 0
        ) {
            return quantity;
        }
    }

    // Try common quantity elements.
    const quantityElements = category.locator(
        '[class*="qty"]:not(.qtyplus):not(.qtyminus)'
    );

    const count =
        await quantityElements.count();

    for (let i = 0; i < count; i++) {

        const element =
            quantityElements.nth(i);

        const text = (
            await element.innerText()
        ).trim();

        if (/^\d+$/.test(text)) {
            return Number(text);
        }
    }

    throw new Error(
        'Stage 3: Unable to determine current ticket quantity.'
    );
}


// ════════════════════════════════════════
// ADULT quantity
// ════════════════════════════════════════

let adultQuantity =
    await getCurrentQuantity(adultCategory);

console.log(
    `Adult initial quantity: ${adultQuantity}`
);


// Increase Adult until configured quantity.
while (adultQuantity < configuredQuantity) {

    await adultIncrementButton.first().click();

    adultQuantity =
        await getCurrentQuantity(adultCategory);
}


// Decrease Adult if it started above target.
if (adultQuantity > configuredQuantity) {

    const adultDecrementButton =
        adultCategory.locator(
            "div[class='qtyminus']"
        );

    if (
        await adultDecrementButton.count() === 0
    ) {
        throw new Error(
            `Stage 3: Adult quantity is ${adultQuantity}, ` +
            `but target is ${configuredQuantity} ` +
            `and no decrement button was found.`
        );
    }

    while (adultQuantity > configuredQuantity) {

        await adultDecrementButton.first().click();

        adultQuantity =
            await getCurrentQuantity(adultCategory);
    }
}

console.log(
    `✓ Adult quantity: ${adultQuantity}`
);

// ════════════════════════════════════════
// CHILD quantity - OPTIONAL
// ════════════════════════════════════════

const childCategory = page.locator(
    "div[data-product-id='CHILD']"
);



let childQuantity: number | null = null;

// Check whether CHILD option exists
const childCategoryCount =
    await childCategory.count();

const childPlusCount =
    await childIncrementButton.count();

if (
    childCategoryCount === 0 ||
    childPlusCount === 0
) {
    console.log(
        'INFO: CHILD quantity option/button not available. ' +
        'Skipping child quantity and continuing.'
    );

} else {

    console.log(
        '✓ CHILD quantity option detected'
    );

    // Read current quantity
    childQuantity =
        await getCurrentQuantity(childCategory);

    console.log(
        `Child initial quantity: ${childQuantity}`
    );

    // Do NOT use qtyminus.
    // Increment only.
    for (
        let i = 0;
        i < configuredQuantity;
        i++
    ) {
        await childIncrementButton
            .first()
            .click();
    }

    // Read actual resulting quantity
    childQuantity =
        await getCurrentQuantity(childCategory);

    console.log(
        `✓ Child quantity after increment: ${childQuantity}`
    );

    console.log(
        `✓ Child increment clicked ` +
        `${configuredQuantity} time(s)`
    );
}


// ════════════════════════════════════════
// Final quantity verification
// ════════════════════════════════════════

expect(
    adultQuantity,
    `Stage 3: Adult quantity mismatch. ` +
    `Expected ${configuredQuantity}, ` +
    `actual ${adultQuantity}.`
).toBe(configuredQuantity);

if (childQuantity !== null) {

    expect(
        childQuantity,
        `Stage 3: Child quantity must be greater than 0. ` +
        `Actual: ${childQuantity}.`
    ).toBeGreaterThan(0);

    console.log(
        `✓ Child quantity verified: ${childQuantity}`
    );

} else {

    console.log(
        'INFO: Child quantity not available; continuing flow.'
    );
}


// ════════════════════════════════════════
// Quantity summary
// ════════════════════════════════════════

console.log({
    configuredQuantity,
    adultQuantity,
    childQuantity:
        childQuantity ?? 'N/A',
});

console.log(
    '✓ STEP 18: Available ticket quantities processed successfully'
);
// ════════════════════════════════════════
// STEP 19: Capture price after date,
// time and quantity selection
// ════════════════════════════════════════

console.log(
    '\nSTEP 19: Capture price after date, time and quantity'
);

const orderSummary = page.locator(
    'div.order-card'
);

await expect(
    orderSummary,
    'Stage 3: Order summary container was not found.'
).toBeVisible();

await orderSummary.scrollIntoViewIfNeeded();

console.log(
    '✓ Order summary container is visible'
);


// ─────────────────────────────────────────
// Capture complete order summary
// ─────────────────────────────────────────

const orderSummaryText = (
    await orderSummary.innerText()
).trim();

console.log(
    '\n----- ORDER SUMMARY -----'
);

console.log(
    orderSummaryText
);

console.log(
    '-------------------------'
);


// ════════════════════════════════════════
// Capture all prices shown in summary
// ════════════════════════════════════════

const currencyMatches = [
    ...orderSummaryText.matchAll(
        /\$?\s*([\d,]+\.\d{2})/g
    ),
];

if (currencyMatches.length === 0) {
    throw new Error(
        'Stage 3: Order summary is visible, ' +
        'but no currency amount was found.'
    );
}

const summaryPrices = currencyMatches.map(
    match =>
        Number(
            match[1].replace(/,/g, '')
        )
);

console.log(
    'Prices found in order summary:',
    summaryPrices.map(
        price => price.toFixed(2)
    )
);


// ════════════════════════════════════════
// Capture order-summary total
// ════════════════════════════════════════
//
// The final monetary value is treated as the
// order-summary total for now.
// ════════════════════════════════════════

const orderSummaryPrice =
    summaryPrices[summaryPrices.length - 1];

if (
    !Number.isFinite(orderSummaryPrice) ||
    orderSummaryPrice <= 0
) {
    throw new Error(
        `Stage 3: Invalid order summary total: ` +
        `${orderSummaryPrice}`
    );
}

console.log(
    `✓ Order summary total: ` +
    `${orderSummaryPrice.toFixed(2)}`
);


// ════════════════════════════════════════
// Compare comparable prices
// ════════════════════════════════════════
//
// Listing price = Stage 1 selling/unit price
// Selected-date price = price after date
//
// These are comparable.
// ════════════════════════════════════════



const selectedDatePriceValue =
    Number(selectedDatePrice);

const priceDifference =
    selectedDatePriceValue - listingPrice;

const priceDiffersFromListing =
    selectedDatePriceValue !== listingPrice;


// ─────────────────────────────────────────
// Report price difference
// ─────────────────────────────────────────

console.log(
    '\n===== PRICE COMPARISON ====='
);

console.log(
    `Listing price:       ${listingPrice.toFixed(2)}`
);

console.log(
    `Selected date price: ${selectedDatePriceValue.toFixed(2)}`
);

console.log(
    `Order summary total: ${orderSummaryPrice.toFixed(2)}`
);

if (priceDiffersFromListing) {

    const direction =
        priceDifference > 0
            ? 'higher'
            : 'lower';

    console.log(
        `PRICE DIFFERENCE: ${Math.abs(priceDifference).toFixed(2)} ` +
        `(${direction} than listing price)`
    );

    console.log(
        `Difference calculation: ` +
        `${selectedDatePriceValue.toFixed(2)} - ` +
        `${listingPrice.toFixed(2)} = ` +
        `${priceDifference.toFixed(2)}`
    );

} else {

    console.log(
        'PRICE DIFFERENCE: 0.00 (no difference)'
    );
}

console.log(
    '============================'
);
    // ════════════════════════════════════════
// STEP 20: Add item to cart
// ════════════════════════════════════════

console.log('\nSTEP 20: Add item to cart');

const addToCartButton = page.locator(
    '#summary-cart-btn'
);

// ─────────────────────────────────────────
// Verify Add to Cart button is available
// ─────────────────────────────────────────

await expect(
    addToCartButton,
    'Stage 3: Add to cart button was not found.'
).toBeVisible();

console.log(
    '✓ Add to cart button is visible'
);


// ─────────────────────────────────────────
// Click Add to Cart
// ─────────────────────────────────────────

await addToCartButton.click();

console.log(
    '✓ Add to cart button clicked'
);


// ─────────────────────────────────────────
// Verify Add to Cart succeeded
// ─────────────────────────────────────────
//
// The cart badge is currently unreliable,
// so we intentionally do NOT use it as a
// success indicator.
//
// Success is verified by the appearance of
// the "Pre-Booking Details" heading.
// ─────────────────────────────────────────

const preBookingHeading = page.getByRole(
    'heading',
    {
        name: 'Pre-Booking Details',
    }
);

await expect(
    preBookingHeading,
    'Stage 3: Add to cart failed. ' +
    '"Pre-Booking Details" was not displayed after clicking Add to Cart.'
).toBeVisible();

console.log(
    '✓ "Pre-Booking Details" is visible'
);

console.log(
    '✓ STEP 20: Item added to cart successfully'
);

const addedToCart = true;

 console.log('\n========================================');
console.log('STAGE 3 COMPLETE');
console.log('========================================');

console.log({
    selectedDate: firstAvailableDate.date,
    selectedDatePrice:
        selectedDatePrice.toFixed(2),
    selectedTime,
    hasTimeSelection,
    adultQuantity,
    childQuantity,
    orderSummaryPrice:
        orderSummaryPrice.toFixed(2),
    priceDiffersFromListing,
    addedToCart,
});

return {
    selectedDate: firstAvailableDate.date,
    selectedDatePrice,
    selectedTime,
    hasTimeSelection,
    adultQuantity,
    childQuantity,
    orderSummaryPrice,
    priceDifference,
    priceDiffersFromListing,
    addedToCart,
};

} // --> ADDED THE CLOSING BRACE HERE FOR THE MAIN ASYNC FUNCTION <--