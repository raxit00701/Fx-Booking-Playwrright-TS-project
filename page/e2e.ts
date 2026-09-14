import { Page } from '@playwright/test';

import { bypassLogin } from '../api/login';
import { captureStage1Listing, Stage1Result } from '../utils/stage1Listing';
import { selectAndVerifyTicketPage, Stage2Result } from '../utils/stage2TicketPage';
import { selectFirstAvailableDateAndTime, Stage3Result } from '../utils/stage3DateTimeCart';
import { captureCartPage, captureCheckoutPage, CartResult, CheckoutResult } from '../utils/stage4CartCheckout';
import { verifyStage5, Stage5Result } from '../utils/stage5Verification';

export class e2e {
    constructor(public readonly page: Page) {}

    async bypassLogin(): Promise<void> {
        return bypassLogin(this.page);
    }

    async captureStage1Listing(): Promise<Stage1Result> {
        return captureStage1Listing(this.page);
    }

    async selectAndVerifyTicketPage(tickets: any[]): Promise<Stage2Result> {
        return selectAndVerifyTicketPage(this.page, tickets);
    }

    async selectFirstAvailableDateAndTime(price: number): Promise<Stage3Result> {
        return selectFirstAvailableDateAndTime(this.page, price);
    }

    async captureCartPage(price: number): Promise<CartResult> {
        return captureCartPage(this.page, price);
    }

    async captureCheckoutPage(): Promise<CheckoutResult> {
        return captureCheckoutPage(this.page);
    }

    async verifyStage5(
        stage1: Stage1Result,
        stage2: Stage2Result,
        stage3: Stage3Result,
        cart: CartResult,
        checkout: CheckoutResult
    ): Promise<Stage5Result> {
        return verifyStage5(this.page, stage1, stage2, stage3, cart, checkout);
    }
}