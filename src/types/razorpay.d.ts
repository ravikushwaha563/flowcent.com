interface RazorpayCheckoutResponse {
    razorpay_order_id: string;
    razorpay_payment_id: string;
    razorpay_signature: string;
}

interface RazorpayFailureResponse {
    error?: {
        description?: string;
    };
}

interface RazorpayCheckoutOptions {
    key: string;
    amount: number;
    currency: string;
    name: string;
    description: string;
    order_id: string;
    prefill?: {
        name?: string;
        email?: string;
    };
    theme?: {
        color?: string;
        backdrop_color?: string;
    };
    modal?: {
        confirm_close?: boolean;
        ondismiss?: () => void;
    };
    handler: (response: RazorpayCheckoutResponse) => void | Promise<void>;
}

interface RazorpayCheckoutInstance {
    open(): void;
    on(event: 'payment.failed', callback: (response: RazorpayFailureResponse) => void): void;
}

interface RazorpayCheckoutConstructor {
    new (options: RazorpayCheckoutOptions): RazorpayCheckoutInstance;
}

interface Window {
    Razorpay?: RazorpayCheckoutConstructor;
}
