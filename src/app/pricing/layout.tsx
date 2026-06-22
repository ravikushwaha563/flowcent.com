import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Pricing — Free, Pro & Agency Plans',
    description: 'Simple, transparent pricing for Indian freelancers and agencies. Start free forever. Upgrade to Pro for ₹499/month. Annual plans save 20%.',
    openGraph: {
        title: 'Flowcent Pricing — Simple & Transparent',
        description: 'Free forever plan. Pro at ₹499/month. Agency at ₹1,499/month. No hidden fees, no contracts. 14-day Pro trial.',
    },
};

export default function PricingLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
