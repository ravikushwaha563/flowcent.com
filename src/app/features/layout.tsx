import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Features — All Flowcent Capabilities',
    description: 'Explore invoice tracking, AI-assisted reply analysis, Gmail follow-ups, payment intent scoring, multi-currency invoicing, and client payment history.',
    openGraph: {
        title: 'Flowcent Features — 12 Powerful Tools for Indian Freelancers',
        description: 'Invoice tracking, AI-assisted reply analysis, Gmail-powered follow-ups, Payment Intent Score, and payment history in one platform.',
    },
};

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
