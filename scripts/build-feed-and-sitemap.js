import { readFileSync, readdirSync, writeFileSync, existsSync } from 'node:fs';
import { join, resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const ARTICLES_DIR = join(ROOT, 'src', 'content', 'articles');
const PUBLIC_DIR = join(ROOT, 'public');
const RSS_PATH = join(PUBLIC_DIR, 'insights-rss.xml');
const SITEMAP_PATH = join(PUBLIC_DIR, 'sitemap.xml');

const SITE_ORIGIN = 'https://thotaassociates.com';
const RSS_TITLE = 'Thota and Associates · Insights';
const RSS_DESCRIPTION = 'Practitioner notes from our desk on valuations, taxation, corporate insolvency, and the evolving regulatory landscape.';
const SITE_LANGUAGE = 'en-IN';

// dynamicLastmod = true → use today's build date (page reflects fresh deploy).
// Otherwise, lastmod is fixed (page hasn't actually changed since that date).
const STATIC_SITEMAP_URLS = [
  { loc: '/',           priority: '1.0', changefreq: 'weekly',  dynamicLastmod: true  },
  { loc: '/insights',   priority: '0.8', changefreq: 'weekly',  dynamicLastmod: true  },
  { loc: '/services',   priority: '0.9', changefreq: 'monthly', lastmod: '2026-04-22' },
  { loc: '/leadership', priority: '0.8', changefreq: 'monthly', lastmod: '2026-04-22' },
  { loc: '/contact',    priority: '0.8', changefreq: 'monthly', lastmod: '2026-04-22' },
  { loc: '/terms',      priority: '0.3', changefreq: 'yearly',  lastmod: '2026-04-22' },
  { loc: '/privacy',    priority: '0.3', changefreq: 'yearly',  lastmod: '2026-04-22' },
  { loc: '/refund',     priority: '0.3', changefreq: 'yearly',  lastmod: '2026-04-22' },
  { loc: '/disclaimer', priority: '0.3', changefreq: 'yearly',  lastmod: '2026-04-22' },
];

const escapeXml = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');

const toRfc822 = (iso) => {
  if (!iso) return new Date().toUTCString();
  const d = new Date(iso);
  return isNaN(d.getTime()) ? new Date().toUTCString() : d.toUTCString();
};

const todayIso = () => new Date().toISOString().slice(0, 10);

function loadArticles() {
  if (!existsSync(ARTICLES_DIR)) return [];
  const files = readdirSync(ARTICLES_DIR).filter((f) => f.endsWith('.md'));
  return files
    .map((file) => {
      const raw = readFileSync(join(ARTICLES_DIR, file), 'utf8');
      const { data } = matter(raw);
      const slug = data.slug || file.replace(/\.md$/, '');
      return {
        slug,
        title: data.title || '',
        date: data.date || '',
        excerpt: data.excerpt || data.metaDescription || '',
        category: data.category || '',
      };
    })
    .filter((a) => a.title && a.slug && a.date)
    .sort((a, b) => (new Date(b.date).getTime() || 0) - (new Date(a.date).getTime() || 0));
}

function rssItem(a) {
  const lines = [
    '    <item>',
    `      <title>${escapeXml(a.title)}</title>`,
    `      <link>${SITE_ORIGIN}/insights/${escapeXml(a.slug)}</link>`,
    `      <description>${escapeXml(a.excerpt)}</description>`,
    `      <pubDate>${toRfc822(a.date)}</pubDate>`,
    `      <guid isPermaLink="true">${SITE_ORIGIN}/insights/${escapeXml(a.slug)}</guid>`,
  ];
  if (a.category) {
    lines.push(`      <category>${escapeXml(a.category)}</category>`);
  }
  lines.push('    </item>');
  return lines.join('\n');
}

function generateRss(articles) {
  const channelLines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">',
    '  <channel>',
    `    <title>${escapeXml(RSS_TITLE)}</title>`,
    `    <link>${SITE_ORIGIN}/insights</link>`,
    `    <description>${escapeXml(RSS_DESCRIPTION)}</description>`,
    `    <language>${SITE_LANGUAGE}</language>`,
    `    <atom:link href="${SITE_ORIGIN}/insights-rss.xml" rel="self" type="application/rss+xml" />`,
    `    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>`,
    ...articles.map(rssItem),
    '  </channel>',
    '</rss>',
    '',
  ];
  return channelLines.join('\n');
}

function sitemapEntry(loc, lastmod, changefreq, priority) {
  return [
    '  <url>',
    `    <loc>${loc}</loc>`,
    `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    '  </url>',
  ].join('\n');
}

function generateSitemap(articles) {
  const today = todayIso();

  const staticEntries = STATIC_SITEMAP_URLS.map((u) =>
    sitemapEntry(
      `${SITE_ORIGIN}${u.loc}`,
      u.dynamicLastmod ? today : u.lastmod,
      u.changefreq,
      u.priority
    )
  );

  const articleEntries = articles.map((a) => {
    const lastmod = (a.date && !isNaN(new Date(a.date).getTime()))
      ? new Date(a.date).toISOString().slice(0, 10)
      : today;
    return sitemapEntry(
      `${SITE_ORIGIN}/insights/${escapeXml(a.slug)}`,
      lastmod,
      'monthly',
      '0.7'
    );
  });

  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
    ...staticEntries,
    ...articleEntries,
    '</urlset>',
    '',
  ];
  return lines.join('\n');
}

export default function buildFeedAndSitemap() {
  return {
    name: 'thota:build-feed-and-sitemap',
    apply: 'build',
    buildStart() {
      const articles = loadArticles();
      writeFileSync(RSS_PATH, generateRss(articles), 'utf8');
      writeFileSync(SITEMAP_PATH, generateSitemap(articles), 'utf8');
      console.log(`[build-feed-and-sitemap] wrote insights-rss.xml and sitemap.xml (${articles.length} article${articles.length === 1 ? '' : 's'})`);
    },
  };
}
