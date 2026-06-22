import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Features — All Flowcent Capabilities',
    description: 'Explore all 12 features: AI Excuse Memory™, 5-stage auto follow-ups from Gmail, Payment Intent Score, multi-currency invoicing, client risk scoring, and more.',
    openGraph: {
        title: 'Flowcent Features — 12 Powerful Tools for Indian Freelancers',
        description: 'Invoice tracking, AI Excuse Memory™, Gmail-powered follow-ups, Payment Intent Score, and client intelligence — all in one platform.',
    },
};

export default function FeaturesLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
