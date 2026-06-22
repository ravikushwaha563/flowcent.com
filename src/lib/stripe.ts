import Stripe from 'stripe';
import { requireServerEnv } from '@/lib/env/server';

let instance: Stripe | null = null;

export function getStripe() {
    if (!instance) instance = new Stripe(requireServerEnv('STRIPE_SECRET_KEY'));
    return instance;
}
