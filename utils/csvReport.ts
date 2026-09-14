import fs from 'fs';
import path from 'path';

import { Stage1Result } from './stage1Listing';
import { Stage2Result } from './stage2TicketPage';
import { Stage3Result } from './stage3DateTimeCart';
import {
    CartResult,
    CheckoutResult,
} from './stage4CartCheckout';

import {
    Stage5Result,
    VerificationCheck,
} from './stage5Verification';


// ═══════════════════════════════════════════
// CSV TYPES
// ═══════════════════════════════════════════

export type CsvStage =
    | 'login'
    | 'listing'
    | 'ticket_page'
    | 'cart'
    | 'checkout'
    | 'verification';


export type CsvRow = {
    run_timestamp: string;
    attraction_url: string;
    stage: CsvStage;
    ticket_name: string;
    field: string;
    expected: string;
    actual: string;
    status: 'PASS' | 'FAIL' | 'INFO';
    notes: string;
};


// ═══════════════════════════════════════════
// CSV REPORT
// ═══════════════════════════════════════════

export class CsvReport {

    private readonly rows: CsvRow[] = [];

    private readonly runTimestamp: string;

    private readonly attractionUrl: string;

    private readonly reportPath: string;


    constructor(
        attractionUrl: string
    ) {

        // ISO 8601 run timestamp.
        this.runTimestamp =
            new Date().toISOString();

        this.attractionUrl =
            attractionUrl;

        /*
         * Required location:
         *
         * C:\Projects\PLAYWRIGHT TS\data\report.csv
         */
        this.reportPath =
            path.resolve(
                process.cwd(),
                'data',
                'report.csv'
            );

        // Create data directory if it does not exist.
        fs.mkdirSync(
            path.dirname(this.reportPath),
            {
                recursive: true,
            }
        );

        // Start a fresh report for this run.
        this.writeFile();
    }


    // ═══════════════════════════════════════
    // GET REPORT PATH
    // ═══════════════════════════════════════

    getPath(): string {

        return this.reportPath;
    }


    // ═══════════════════════════════════════
    // ADD GENERIC ROW
    // ═══════════════════════════════════════

    addRow(
        row: Omit<
            CsvRow,
            'run_timestamp' | 'attraction_url'
        >
    ): void {

        const completeRow: CsvRow = {

            run_timestamp:
                this.runTimestamp,

            attraction_url:
                this.attractionUrl,

            ...row,
        };

        this.rows.push(
            completeRow
        );

        /*
         * Write immediately.
         *
         * This is important because if the test fails
         * later, the CSV still contains everything that
         * was captured before the failure.
         */
        this.writeFile();
    }


    // ═══════════════════════════════════════
    // LOGIN
    // ═══════════════════════════════════════

    recordLogin(
        success: boolean,
        notes = ''
    ): void {

        this.addRow({

            stage: 'login',

            ticket_name: '',

            field:
                'login_success',

            expected:
                'true',

            actual:
                String(success),

            status:
                success
                    ? 'PASS'
                    : 'FAIL',

            notes,
        });
    }


    // ═══════════════════════════════════════
    // LISTING
    // ═══════════════════════════════════════

    recordListing(
        stage1: Stage1Result
    ): void {

        // ─────────────────────────────────────
        // Required ticket_count row
        // ─────────────────────────────────────

        this.addRow({

            stage:
                'listing',

            ticket_name:
                '',

            field:
                'ticket_count',

            expected:
                '',

            actual:
                String(
                    stage1.tickets.length
                ),

            status:
                'INFO',

            notes:
                'Number of ticket options found on listing page.',
        });


        // ─────────────────────────────────────
        // One row per ticket option
        // ─────────────────────────────────────

        for (
            const ticket of stage1.tickets
        ) {

            // Displayed price.
            this.addRow({

                stage:
                    'listing',

                ticket_name:
                    ticket.name,

                field:
                    'displayed_price',

                expected:
                    '',

                actual:
                    ticket.displayedPrice
                        .toFixed(2),

                status:
                    'INFO',

                notes:
                    'Listing displayed price.',
            });


            // Regular price can be null.
            if (
                ticket.regularPrice !== null &&
                ticket.regularPrice !== undefined
            ) {

                this.addRow({

                    stage:
                        'listing',

                    ticket_name:
                        ticket.name,

                    field:
                        'regular_price',

                    expected:
                        '',

                    actual:
                        ticket.regularPrice
                            .toFixed(2),

                    status:
                        'INFO',

                    notes:
                        'Listing regular price.',
                });

            } else {

                this.addRow({

                    stage:
                        'listing',

                    ticket_name:
                        ticket.name,

                    field:
                        'regular_price',

                    expected:
                        '',

                    actual:
                        '',

                    status:
                        'INFO',

                    notes:
                        'Regular price is not available for this ticket option.',
                });
            }
        }
    }


    // ═══════════════════════════════════════
    // TICKET PAGE
    // ═══════════════════════════════════════

    recordTicketPage(
        stage2: Stage2Result
    ): void {

        const ticket =
            stage2.selectedTicket;


        // ─────────────────────────────────────
        // URL
        // ─────────────────────────────────────

        this.addRow({

            stage:
                'ticket_page',

            ticket_name:
                ticket.name,

            field:
                'url_changed',

            expected:
                'true',

            actual:
                'true',

            status:
                'PASS',

            notes:
                `Ticket page URL: ${stage2.ticketUrl}`,
        });


        // ─────────────────────────────────────
        // Page title
        // ─────────────────────────────────────

        this.addRow({

            stage:
                'ticket_page',

            ticket_name:
                ticket.name,

            field:
                'page_title',

            expected:
                '',

            actual:
                stage2.ticketPageTitle,

            status:
                'INFO',

            notes:
                'Ticket page heading captured.',
        });


        // ─────────────────────────────────────
        // Ticket name
        // ─────────────────────────────────────

        if (
            stage2.ticketNameVerified
        ) {

            this.addRow({

                stage:
                    'ticket_page',

                ticket_name:
                    ticket.name,

                field:
                    'ticket_name',

                expected:
                    ticket.name,

                actual:
                    ticket.name,

                status:
                    'PASS',

                notes:
                    'Ticket option name was visible on ticket page.',
            });

        } else {

            this.addRow({

                stage:
                    'ticket_page',

                ticket_name:
                    ticket.name,

                field:
                    'ticket_name',

                expected:
                    ticket.name,

                actual:
                    stage2.ticketPageTitle,

                status:
                    'INFO',

                notes:
                    'Ticket option name was not directly exposed on the ticket page.',
            });
        }


        // ─────────────────────────────────────
        // Generic ticket-page price
        // ─────────────────────────────────────

        if (
            stage2.ticketPagePrice !== null &&
            stage2.ticketPagePrice !== undefined
        ) {

            this.addRow({

                stage:
                    'ticket_page',

                ticket_name:
                    ticket.name,

                field:
                    'unit_price',

                expected:
                    '',

                actual:
                    stage2.ticketPagePrice
                        .toFixed(2),

                status:
                    'INFO',

                notes:
                    'Generic ticket-page unit price.',
            });

        } else {

            this.addRow({

                stage:
                    'ticket_page',

                ticket_name:
                    ticket.name,

                field:
                    'unit_price',

                expected:
                    '',

                actual:
                    '',

                status:
                    'INFO',

                notes:
                    'Generic ticket-page price was not exposed. Date-specific pricing is handled in Stage 3.',
            });
        }
    }


    // ═══════════════════════════════════════
    // STAGE 3
    // ═══════════════════════════════════════

    recordStage3(
        stage3: Stage3Result,
        ticketName: string
    ): void {

        // ─────────────────────────────────────
        // Selected date
        // ─────────────────────────────────────

        this.addRow({

            stage:
                'ticket_page',

            ticket_name:
                ticketName,

            field:
                'selected_date',

            expected:
                '',

            actual:
                stage3.selectedDate,

            status:
                'INFO',

            notes:
                'First available date selected.',
        });


        // ─────────────────────────────────────
        // Selected time
        // ─────────────────────────────────────

        if (
            stage3.hasTimeSelection &&
            stage3.selectedTime
        ) {

            this.addRow({

                stage:
                    'ticket_page',

                ticket_name:
                    ticketName,

                field:
                    'selected_time',

                expected:
                    '',

                actual:
                    stage3.selectedTime,

                status:
                    'INFO',

                notes:
                    'First available time selected.',
            });

        } else {

            this.addRow({

                stage:
                    'ticket_page',

                ticket_name:
                    ticketName,

                field:
                    'selected_time',

                expected:
                    '',

                actual:
                    '',

                status:
                    'INFO',

                notes:
                    'Ticket is date-only; no time selection was required.',
            });
        }


        // ─────────────────────────────────────
        // Adult quantity
        // ─────────────────────────────────────

        this.addRow({

            stage:
                'ticket_page',

            ticket_name:
                ticketName,

            field:
                'adult_quantity',

            expected:
                '',

            actual:
                String(
                    stage3.adultQuantity
                ),

            status:
                'INFO',

            notes:
                'Adult quantity selected.',
        });


        // ─────────────────────────────────────
        // Child quantity
        // Child is optional.
        // ─────────────────────────────────────

        if (
            stage3.childQuantity !== null &&
            stage3.childQuantity !== undefined
        ) {

            this.addRow({

                stage:
                    'ticket_page',

                ticket_name:
                    ticketName,

                field:
                    'child_quantity',

                expected:
                    '',

                actual:
                    String(
                        stage3.childQuantity
                    ),

                status:
                    'INFO',

                notes:
                    'Child quantity selected.',
            });

        } else {

            this.addRow({

                stage:
                    'ticket_page',

                ticket_name:
                    ticketName,

                field:
                    'child_quantity',

                expected:
                    '',

                actual:
                    '',

                status:
                    'INFO',

                notes:
                    'Child quantity option was not available.',
            });
        }


        // ─────────────────────────────────────
        // Date-specific unit price
        // ─────────────────────────────────────

        this.addRow({

            stage:
                'ticket_page',

            ticket_name:
                ticketName,

            field:
                'unit_price',

            expected:
                '',

            actual:
                stage3.selectedDatePrice
                    .toFixed(2),

            status:
                'INFO',

            notes:
                'Price shown for the selected date.',
        });


        // ─────────────────────────────────────
        // Post-selection total
        // ─────────────────────────────────────

        this.addRow({

            stage:
                'ticket_page',

            ticket_name:
                ticketName,

            field:
                'order_total',

            expected:
                '',

            actual:
                stage3.orderSummaryPrice
                    .toFixed(2),

            status:
                'INFO',

            notes:
                'Order summary total after date, time and quantity selection.',
        });
    }


    // ═══════════════════════════════════════
    // CART
    // ═══════════════════════════════════════

    recordCart(
        cart: CartResult
    ): void {

        for (
            const item of cart.items
        ) {

            // ─────────────────────────────────
            // Ticket name
            // ─────────────────────────────────

            this.addRow({

                stage:
                    'cart',

                ticket_name:
                    item.name,

                field:
                    'ticket_name',

                expected:
                    '',

                actual:
                    item.name,

                status:
                    'INFO',

                notes:
                    'Cart line item name.',
            });


            // ─────────────────────────────────
            // Unit price
            // ─────────────────────────────────

            this.addRow({

                stage:
                    'cart',

                ticket_name:
                    item.name,

                field:
                    'unit_price',

                expected:
                    '',

                actual:
                    item.unitPrice
                        .toFixed(2),

                status:
                    'INFO',

                notes:
                    'Cart unit price.',
            });


            // ─────────────────────────────────
            // Quantity
            // ─────────────────────────────────

            this.addRow({

                stage:
                    'cart',

                ticket_name:
                    item.name,

                field:
                    'quantity',

                expected:
                    '',

                actual:
                    String(
                        item.quantity
                    ),

                status:
                    'INFO',

                notes:
                    'Cart quantity.',
            });


            // ─────────────────────────────────
            // Line total
            // ─────────────────────────────────

            this.addRow({

                stage:
                    'cart',

                ticket_name:
                    item.name,

                field:
                    'line_total',

                expected:
                    '',

                actual:
                    item.lineTotal
                        .toFixed(2),

                status:
                    'INFO',

                notes:
                    `Calculated line total: ${item.calculatedLineTotal.toFixed(2)}`,
            });


            // ─────────────────────────────────
            // Date
            // ─────────────────────────────────

            this.addRow({

                stage:
                    'cart',

                ticket_name:
                    item.name,

                field:
                    'selected_date',

                expected:
                    '',

                actual:
                    item.selectedDate ?? '',

                status:
                    'INFO',

                notes:
                    'Selected date shown in cart.',
            });


            // ─────────────────────────────────
            // Time
            // ─────────────────────────────────

            this.addRow({

                stage:
                    'cart',

                ticket_name:
                    item.name,

                field:
                    'selected_time',

                expected:
                    '',

                actual:
                    item.selectedTime ?? '',

                status:
                    'INFO',

                notes:
                    'Selected time shown in cart.',
            });
        }


        // ─────────────────────────────────────
        // Cart subtotal
        // ─────────────────────────────────────

        this.addRow({

            stage:
                'cart',

            ticket_name:
                '',

            field:
                'subtotal',

            expected:
                '',

            actual:
                cart.subtotal
                    .toFixed(2),

            status:
                'INFO',

            notes:
                'Cart subtotal.',
        });


        // ─────────────────────────────────────
        // Net saving
        // ─────────────────────────────────────

        this.addRow({

            stage:
                'cart',

            ticket_name:
                '',

            field:
                'net_saving',

            expected:
                '',

            actual:
                cart.netSaving
                    .toFixed(2),

            status:
                'INFO',

            notes:
                'Cart net saving.',
        });
    }


    // ═══════════════════════════════════════
    // CHECKOUT
    // ═══════════════════════════════════════

    recordCheckout(
        checkout: CheckoutResult
    ): void {

        for (
            const item of checkout.items
        ) {

            // Ticket name.
            this.addRow({

                stage:
                    'checkout',

                ticket_name:
                    item.name,

                field:
                    'ticket_name',

                expected:
                    '',

                actual:
                    item.name,

                status:
                    'INFO',

                notes:
                    'Checkout booking item name.',
            });


            // Unit price.
            this.addRow({

                stage:
                    'checkout',

                ticket_name:
                    item.name,

                field:
                    'unit_price',

                expected:
                    '',

                actual:
                    item.unitPrice
                        .toFixed(2),

                status:
                    'INFO',

                notes:
                    'Captured checkout booking subtotal; not necessarily a confirmed per-ticket unit price.',
            });


            // Quantity.
            this.addRow({

                stage:
                    'checkout',

                ticket_name:
                    item.name,

                field:
                    'quantity',

                expected:
                    '',

                actual:
                    item.quantity > 0
                        ? String(item.quantity)
                        : '',

                status:
                    'INFO',

                notes:
                    item.quantity > 0
                        ? 'Checkout quantity captured.'
                        : 'Checkout summary did not expose quantity.',
            });
        }


        // ─────────────────────────────────────
        // Checkout subtotal
        // ─────────────────────────────────────

        this.addRow({

            stage:
                'checkout',

            ticket_name:
                '',

            field:
                'subtotal',

            expected:
                '',

            actual:
                checkout.subtotal
                    .toFixed(2),

            status:
                'INFO',

            notes:
                'Checkout subtotal.',
        });


        // ─────────────────────────────────────
        // Taxes & Surcharge
        // ─────────────────────────────────────

        this.addRow({

            stage:
                'checkout',

            ticket_name:
                '',

            field:
                'taxes_and_surcharge',

            expected:
                '',

            actual:
                checkout.taxesAndSurcharge
                    .toFixed(2),

            status:
                'INFO',

            notes:
                'Taxes & Surcharge.',
        });


        // ─────────────────────────────────────
        // Processing fees
        // ─────────────────────────────────────

        this.addRow({

            stage:
                'checkout',

            ticket_name:
                '',

            field:
                'processing_fees',

            expected:
                '',

            actual:
                checkout.processingFees
                    .toFixed(2),

            status:
                'INFO',

            notes:
                'Processing Fees.',
        });


        // ─────────────────────────────────────
        // Refundable Option
        // ─────────────────────────────────────

        this.addRow({

            stage:
                'checkout',

            ticket_name:
                '',

            field:
                'refundable_option',

            expected:
                '',

            actual:
                checkout.refundableOption
                    .toFixed(2),

            status:
                'INFO',

            notes:
                'Refundable Option.',
        });


        // ─────────────────────────────────────
        // Discounts
        // ─────────────────────────────────────

        this.addRow({

            stage:
                'checkout',

            ticket_name:
                '',

            field:
                'discounts',

            expected:
                '',

            actual:
                checkout.discounts
                    .toFixed(2),

            status:
                'INFO',

            notes:
                'Checkout discounts.',
        });


        // ─────────────────────────────────────
        // Final order total
        // ─────────────────────────────────────

        this.addRow({

            stage:
                'checkout',

            ticket_name:
                '',

            field:
                'order_total',

            expected:
                '',

            actual:
                checkout.orderTotal
                    .toFixed(2),

            status:
                'INFO',

            notes:
                'Final checkout order total.',
        });
    }


    // ═══════════════════════════════════════
    // VERIFICATION
    // ═══════════════════════════════════════

    recordVerification(
        verification: Stage5Result
    ): void {

        for (
            const check of verification.checks
        ) {

            this.addVerificationCheck(
                check
            );
        }
    }


    private addVerificationCheck(
        check: VerificationCheck
    ): void {

        this.addRow({

            stage:
                'verification',

            ticket_name:
                this.extractTicketName(
                    check.message
                ),

            field:
                this.mapVerificationField(
                    check.field
                ),

            expected:
                this.cleanValue(
                    check.expected
                ),

            actual:
                this.cleanValue(
                    check.actual
                ),

            status:
                check.status,

            notes:
                check.message,
        });
    }


    // ═══════════════════════════════════════
    // EXTRACT TICKET NAME FROM MESSAGE
    // ═══════════════════════════════════════

    private extractTicketName(
        message: string
    ): string {

        /*
         * Stage 5 mismatch messages generally contain:
         *
         * (ticket: ArtVo Family A Ticket)
         *
         * Capture that when available.
         */
        const ticketMatch =
            message.match(
                /\(ticket:\s*(.*?)\)/i
            );

        if (ticketMatch) {
            return ticketMatch[1].trim();
        }


        /*
         * Name mismatch messages may instead contain:
         *
         * listing "ArtVo Family A Ticket"
         */
        const listingMatch =
            message.match(
                /listing\s+"([^"]+)"/i
            );

        if (listingMatch) {
            return listingMatch[1].trim();
        }


        return '';
    }


    // ═══════════════════════════════════════
    // MAP VERIFICATION FIELD
    // ═══════════════════════════════════════

    private mapVerificationField(
        field: string
    ): string {

        const normalized =
            field
                .toLowerCase()
                .trim();


        if (
            normalized.includes(
                'ticket name'
            )
        ) {

            return 'ticket_name';
        }


        if (
            normalized.includes(
                'unit price'
            )
        ) {

            return 'unit_price';
        }


        if (
            normalized.includes(
                'quantity'
            )
        ) {

            return 'quantity';
        }


        if (
            normalized.includes(
                'line total'
            )
        ) {

            return 'line_total';
        }


        if (
            normalized.includes(
                'date'
            )
        ) {

            return 'selected_date';
        }


        if (
            normalized.includes(
                'time'
            )
        ) {

            return 'selected_time';
        }


        if (
            normalized.includes(
                'order total'
            )
        ) {

            return 'order_total';
        }


        return normalized
            .replace(/\s+/g, '_')
            .replace(/[^\w-]/g, '');
    }


    // ═══════════════════════════════════════
    // RECORD RUNTIME FAILURE
    // ═══════════════════════════════════════

    recordFailure(
        stage: CsvStage,
        message: string
    ): void {

        this.addRow({

            stage,

            ticket_name:
                '',

            field:
                'run_error',

            expected:
                '',

            actual:
                '',

            status:
                'FAIL',

            notes:
                message,
        });
    }


    // ═══════════════════════════════════════
    // CSV WRITER
    // ═══════════════════════════════════════

    private writeFile(): void {

        const headers = [

            'run_timestamp',

            'attraction_url',

            'stage',

            'ticket_name',

            'field',

            'expected',

            'actual',

            'status',

            'notes',
        ];


        const csvLines = [

            // Header.
            headers
                .map(
                    header =>
                        this.escapeCsv(
                            header
                        )
                )
                .join(','),


            // Data rows.
            ...this.rows.map(
                row => [

                    row.run_timestamp,

                    row.attraction_url,

                    row.stage,

                    row.ticket_name,

                    row.field,

                    row.expected,

                    row.actual,

                    row.status,

                    row.notes,

                ]
                    .map(
                        value =>
                            this.escapeCsv(
                                value
                            )
                    )
                    .join(',')
            ),
        ];


        fs.writeFileSync(

            this.reportPath,

            csvLines.join('\r\n'),

            {
                encoding: 'utf8',
            }
        );
    }


    // ═══════════════════════════════════════
    // ESCAPE CSV VALUE
    // ═══════════════════════════════════════

    private escapeCsv(
        value: unknown
    ): string {

        const text =
            String(
                value ?? ''
            );


        /*
         * Excel-safe CSV:
         *
         * Quote values containing:
         * - comma
         * - double quote
         * - newline
         */
        if (
            /[",\r\n]/.test(text)
        ) {

            return (
                '"' +
                text.replace(
                    /"/g,
                    '""'
                ) +
                '"'
            );
        }


        return text;
    }


    // ═══════════════════════════════════════
    // CLEAN VALUE
    // ═══════════════════════════════════════

    private cleanValue(
        value: string
    ): string {

        return (
            value ?? ''
        )
            .trim();
    }
}