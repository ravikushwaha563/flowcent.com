import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Invoice payment',
    robots: { index: false, follow: false, nocache: true },
};

export default function PaymentLayout({ children }: Readonly<{ children: React.ReactNode }>) {
    return children;
}
