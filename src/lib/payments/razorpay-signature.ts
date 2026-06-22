import crypto from 'crypto';

export function verifyRazorpaySignature({
    orderId,
    paymentId,
    signature,
    secret,
}: {
    orderId: string;
    paymentId: string;
    signature: string;
    secret: string;
}): boolean {
    const expected = crypto
        .createHmac('sha256', secret)
        .update(`${orderId}|${paymentId}`)
        .digest();
    const received = Buffer.from(signature, 'hex');

    return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}

export function verifyRazorpayWebhookSignature(payload: string, signature: string, secret: string): boolean {
    const expected = crypto.createHmac('sha256', secret).update(payload).digest();
    const received = Buffer.from(signature, 'hex');
    return expected.length === received.length && crypto.timingSafeEqual(expected, received);
}
