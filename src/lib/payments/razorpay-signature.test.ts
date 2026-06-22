import { describe, expect, it } from 'vitest';
import crypto from 'crypto';
import { verifyRazorpaySignature, verifyRazorpayWebhookSignature } from './razorpay-signature';

describe('verifyRazorpaySignature', () => {
    const validInput = {
        orderId: 'order_123',
        paymentId: 'pay_456',
        secret: 'test_secret',
        signature: '6c343620f1910da483982cf25b9dc33d709afdd25930f08964ef60b65aefa831',
    };

    it('accepts the expected HMAC signature', () => {
        expect(verifyRazorpaySignature(validInput)).toBe(true);
    });

    it('rejects modified and malformed signatures', () => {
        expect(verifyRazorpaySignature({ ...validInput, paymentId: 'pay_999' })).toBe(false);
        expect(verifyRazorpaySignature({ ...validInput, signature: 'not-hex' })).toBe(false);
    });
});

describe('verifyRazorpayWebhookSignature', () => {
    it('verifies the raw request body', () => {
        const payload = JSON.stringify({ event: 'payment.captured' });
        const signature = crypto.createHmac('sha256', 'webhook_secret').update(payload).digest('hex');
        expect(verifyRazorpayWebhookSignature(payload, signature, 'webhook_secret')).toBe(true);
        expect(verifyRazorpayWebhookSignature(`${payload} `, signature, 'webhook_secret')).toBe(false);
    });
});
