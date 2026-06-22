import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Privacy Policy — How Flowcent Handles Your Data',
    description: 'Understand how Flowcent collects, uses, and protects your personal information. We respect your privacy.',
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
