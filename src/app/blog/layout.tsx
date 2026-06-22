import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Blog — Payment Tips for Indian Freelancers',
    description: 'Guides, tips, and strategies to help Indian freelancers get paid faster. Covers AI automation, invoice templates, legal options, and more.',
    openGraph: {
        title: 'Flowcent Blog — Get Paid Faster as a Freelancer',
        description: 'Everything we know about getting paid faster in India. Invoice templates, legal options, AI tools, and real-world collection tips.',
    },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
