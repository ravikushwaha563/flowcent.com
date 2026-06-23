import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact Us — Talk to the Flowcent Team',
    description: 'Have a product, billing, feedback, or partnership question? Contact the Flowcent team by email or WhatsApp.',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
