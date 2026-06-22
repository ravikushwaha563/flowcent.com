import type { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/dashboard/', '/api/'],
            },
        ],
        sitemap: 'https://flowcent.in/sitemap.xml',
        host: 'https://flowcent.in',
    };
}
