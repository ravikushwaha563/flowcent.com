import { z } from 'zod';

const optionalText = (max: number) => z.string().trim().max(max).optional().or(z.literal(''));

export const createClientSchema = z.object({
    name: z.string().trim().min(1).max(100),
    email: z.string().trim().email().max(254),
    phone: optionalText(32),
    company: optionalText(120),
});

export const createInvoiceSchema = z.object({
    clientId: z.string().uuid(),
    invoiceNumber: z.string().trim().min(1).max(64),
    amount: z.coerce.number().finite().positive().max(100_000_000),
    currency: z.enum(['INR', 'USD', 'EUR', 'GBP']).default('INR'),
    dueDate: z.string().date(),
    autoFollowup: z.boolean().default(false),
});

export const updateInvoiceSchema = z.object({
    status: z.enum(['pending', 'paid', 'cancelled']).optional(),
    payment_intent_score: z.number().int().min(0).max(100).optional(),
}).refine((value) => Object.keys(value).length > 0, 'No supported fields provided');

export const updateProfileSchema = z.object({
    name: z.string().trim().min(1).max(100).optional(),
    company_name: optionalText(120),
}).refine((value) => Object.keys(value).length > 0, 'No supported fields provided');

export const followUpSchema = z.object({
    invoiceId: z.string().uuid(),
    stage: z.number().int().min(1).max(5),
});

export const publicPaymentTokenSchema = z.string().uuid();

export const createPaymentSchema = z.object({
    publicToken: publicPaymentTokenSchema,
});

export const verifyRazorpayPaymentSchema = createPaymentSchema.extend({
    razorpay_order_id: z.string().min(1).max(100),
    razorpay_payment_id: z.string().min(1).max(100),
    razorpay_signature: z.string().regex(/^[a-f0-9]{64}$/i),
});

export const verifyStripePaymentSchema = createPaymentSchema.extend({
    sessionId: z.string().min(1).max(255),
});

export function validationError(error: z.ZodError) {
    return {
        error: 'Validation failed',
        issues: error.issues.map((issue) => ({
            path: issue.path.join('.'),
            message: issue.message,
        })),
    };
}
