import Razorpay from 'razorpay';
import { requireServerEnv } from '@/lib/env/server';

let instance: Razorpay | null = null;

export function getRazorpay() {
    if (!instance) {
        instance = new Razorpay({
            key_id: requireServerEnv('RAZORPAY_KEY_ID'),
            key_secret: requireServerEnv('RAZORPAY_KEY_SECRET'),
        });
    }
    return instance;
}
