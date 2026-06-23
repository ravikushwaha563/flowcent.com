import { describe, expect, it } from 'vitest';
import { checkAiLimit, checkAutoFollowup, checkClientLimit, checkInvoiceLimit, getPlanLimits } from './plan-limits';

describe('plan limits', () => {
    it('enforces free-plan boundaries', () => {
        expect(checkInvoiceLimit('free', 4).allowed).toBe(true);
        expect(checkInvoiceLimit('free', 5).allowed).toBe(false);
        expect(checkClientLimit('free', 3).upgradeRequired).toBe(true);
        expect(checkAiLimit('free', 5).allowed).toBe(false);
        expect(checkAutoFollowup('free').allowed).toBe(false);
        expect(getPlanLimits('free').csvExport).toBe(false);
        expect(getPlanLimits('free').advancedAnalytics).toBe(true);
    });

    it('represents paid-plan usage as unlimited', () => {
        expect(getPlanLimits('pro').maxInvoices).toBeNull();
        expect(checkInvoiceLimit('pro', 1_000_000).allowed).toBe(true);
        expect(checkClientLimit('agency', 1_000_000).allowed).toBe(true);
        expect(checkAutoFollowup('agency').allowed).toBe(true);
        expect(getPlanLimits('pro').csvExport).toBe(true);
    });
});
