import { freeTools } from '../data/tools';
import { competitors } from '../data/competitors';

const SITE_URL = 'https://refearnapp.com';

export async function GET() {
  // 1. Define Static Pages
  const staticPages = ['', '/terms', '/privacy-policy', '/refund-policy'];

  // 2. Generate Tool Pages
  const toolPages = freeTools.map((tool) => `/tools/${tool.slug}`);

  // 3. Generate Competitor Pages
  const competitorPages = competitors.map(
    (comp) => `/alternative/${comp.slug}`,
  );

  // Combine all paths
  const allPaths = [...staticPages, ...toolPages, ...competitorPages];

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${allPaths
  .map((path) => {
    return `  <url>
    <loc>${SITE_URL}${path}</loc>
    <lastmod>${new Date().toISOString()}</lastmod>
    <changefreq>${path === '' ? 'daily' : 'monthly'}</changefreq>
    <priority>${path === '' ? '1.0' : '0.8'}</priority>
  </url>`;
  })
  .join('\n')}
</urlset>`.trim();

  return new Response(sitemap, {
    headers: {
      'Content-Type': 'application/xml',
      'Cache-Control': 'public, max-age=3600, s-maxage=3600',
    },
  });
}
