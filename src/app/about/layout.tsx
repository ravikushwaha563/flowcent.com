import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About Us — The Team Behind Flowcent',
    description: 'Flowcent was built by Indian freelancers who got tired of chasing payments. Meet the team, our story, our values, and where we are headed.',
    openGraph: {
        title: 'About Flowcent — Built by Freelancers, for Freelancers',
        description: 'Flowcent is built to make invoice tracking and payment follow-up more systematic for Indian freelancers and small agencies.',
    },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
