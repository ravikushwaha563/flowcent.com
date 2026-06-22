import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Terms & Conditions — Flowcent Usage Policy',
    description: 'Read the terms governing your use of Flowcent — the AI-powered payment collection platform for Indian freelancers.',
};

export default function TermsLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
