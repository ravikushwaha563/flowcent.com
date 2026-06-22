import type { MetadataRoute } from 'next';

export default function sitemap(): MetadataRoute.Sitemap {
    const baseUrl = 'https://flowcent.in';
    const now = new Date();

    const staticPages: MetadataRoute.Sitemap = [
        { url: baseUrl, lastModified: now, changeFrequency: 'weekly', priority: 1.0 },
        { url: `${baseUrl}/features`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
        { url: `${baseUrl}/pricing`, lastModified: now, changeFrequency: 'monthly', priority: 0.9 },
        { url: `${baseUrl}/solutions`, lastModified: now, changeFrequency: 'monthly', priority: 0.8 },
        { url: `${baseUrl}/about`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
        { url: `${baseUrl}/blog`, lastModified: now, changeFrequency: 'weekly', priority: 0.8 },
        { url: `${baseUrl}/changelog`, lastModified: now, changeFrequency: 'weekly', priority: 0.6 },
        { url: `${baseUrl}/contact`, lastModified: now, changeFrequency: 'monthly', priority: 0.7 },
        { url: `${baseUrl}/privacy`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
        { url: `${baseUrl}/terms`, lastModified: now, changeFrequency: 'yearly', priority: 0.4 },
        { url: `${baseUrl}/login`, lastModified: now, changeFrequency: 'yearly', priority: 0.5 },
        { url: `${baseUrl}/signup`, lastModified: now, changeFrequency: 'yearly', priority: 0.7 },
    ];

    const solutionSlugs = ['freelancers', 'agencies', 'designers', 'consultants', 'developers', 'content-creators'];
    const solutionPages: MetadataRoute.Sitemap = solutionSlugs.map((slug) => ({
        url: `${baseUrl}/solutions/${slug}`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.75,
    }));

    const blogSlugs = [
        'how-indian-freelancers-get-paid-faster',
        'ai-excuse-memory-explained',
        'invoice-templates-for-indian-freelancers',
        'legal-options-for-unpaid-invoices-india',
        'payment-intent-score-explained',
        'how-to-write-a-follow-up-email',
    ];
    const blogPages: MetadataRoute.Sitemap = blogSlugs.map((slug) => ({
        url: `${baseUrl}/blog/${slug}`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.65,
    }));

    return [...staticPages, ...solutionPages, ...blogPages];
}
