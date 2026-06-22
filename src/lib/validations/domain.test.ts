import { describe, expect, it } from 'vitest';
import {
    createClientSchema,
    createInvoiceSchema,
    updateProfileSchema,
    verifyRazorpayPaymentSchema,
    verifyStripePaymentSchema,
} from './domain';

const publicToken = '550e8400-e29b-41d4-a716-446655440000';

describe('domain validation', () => {
    it('normalizes valid client and invoice input', () => {
        expect(createClientSchema.parse({ name: '  Asha  ', email: 'asha@example.com' }).name).toBe('Asha');
        expect(createInvoiceSchema.parse({
            clientId: publicToken,
            invoiceNumber: 'INV-100',
            amount: '1250.50',
            currency: 'INR',
            dueDate: '2026-07-01',
        }).amount).toBe(1250.5);
    });

    it('rejects unsafe or unsupported values', () => {
        expect(createClientSchema.safeParse({ name: '', email: 'bad' }).success).toBe(false);
        expect(createInvoiceSchema.safeParse({
            clientId: publicToken,
            invoiceNumber: 'INV-100',
            amount: -1,
            currency: 'BTC',
            dueDate: 'not-a-date',
        }).success).toBe(false);
        expect(updateProfileSchema.safeParse({ gmail_access_token: 'leak' }).success).toBe(false);
    });

    it('requires a public token for payment verification', () => {
        expect(verifyStripePaymentSchema.safeParse({ sessionId: 'cs_test_123', publicToken }).success).toBe(true);
        expect(verifyStripePaymentSchema.safeParse({ sessionId: 'cs_test_123', invoiceId: publicToken }).success).toBe(false);
        expect(verifyRazorpayPaymentSchema.safeParse({
            publicToken,
            razorpay_order_id: 'order_123',
            razorpay_payment_id: 'pay_123',
            razorpay_signature: 'a'.repeat(64),
        }).success).toBe(true);
    });
});
