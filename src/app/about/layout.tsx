import type { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'About Us — The Team Behind Flowcent',
    description: 'Flowcent was built by Indian freelancers who got tired of chasing payments. Meet the team, our story, our values, and where we are headed.',
    openGraph: {
        title: 'About Flowcent — Built by Freelancers, for Freelancers',
        description: 'We built Flowcent because we were tired of chasing payments ourselves. Meet the team and our mission to help 1M Indian freelancers get paid faster.',
    },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
    return <>{children}</>;
}
