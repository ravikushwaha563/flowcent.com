import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Pricing — Free, Pro & Agency Plans',
    description: 'Simple, transparent pricing for Indian freelancers and agencies. Start free forever. Upgrade to Pro for ₹499/month. Annual plans save 20%.',
    openGraph: {
        title: 'Flowcent Pricing — Simple & Transparent',
        description: 'Start with the Free plan or unlock unlimited usage and automated follow-ups with Pro at ₹499/month.',
    },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
