import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Pricing — Free and Pro Plans',
    description: 'Simple pricing for freelancers and small agencies. Start on Free or upgrade to Pro for higher limits and automation.',
    openGraph: {
        title: 'Flowcent Pricing — Simple & Transparent',
        description: 'Start with the Free plan or unlock unlimited usage and automated follow-ups with Pro at ₹499/month.',
    },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
