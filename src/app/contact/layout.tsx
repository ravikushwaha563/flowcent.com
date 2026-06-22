import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Contact Us — Talk to the Flowcent Team',
    description: 'Have a question, feedback, or partnership inquiry? Get in touch with the Flowcent team — we reply within 24 hours.',
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
