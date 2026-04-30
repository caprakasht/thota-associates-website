import fm from 'front-matter';

const articleModules = import.meta.glob('/src/content/articles/*.md', {
  query: '?raw',
  import: 'default',
  eager: true,
});

const REQUIRED_FIELDS = ['title', 'slug', 'date', 'category', 'excerpt'];

const slugFromPath = (filePath) => filePath.split('/').pop().replace(/\.md$/, '');

const wordCount = (str) => (str || '').trim().split(/\s+/).filter(Boolean).length;

const articles = Object.entries(articleModules).map(([filePath, raw]) => {
  const { attributes: data, body: content } = fm(raw);
  const slug = data.slug || slugFromPath(filePath);
  const article = {
    slug,
    title: data.title || '',
    date: data.date || '',
    category: data.category || '',
    excerpt: data.excerpt || '',
    heroImage: data.heroImage || null,
    heroAlt: data.heroAlt || '',
    author: data.author || '',
    authorTitle: data.authorTitle || '',
    metaDescription: data.metaDescription || data.excerpt || '',
    keywords: data.keywords || [],
    body: content,
    readingMinutes: Math.max(1, Math.round(wordCount(content) / 220)),
  };

  const missing = REQUIRED_FIELDS.filter((f) => !article[f]);
  if (missing.length > 0) {
    console.warn(`[insights-loader] ${filePath} missing required fields: ${missing.join(', ')}`);
  }

  return article;
});

const sorted = [...articles].sort((a, b) => {
  const da = new Date(a.date).getTime() || 0;
  const db = new Date(b.date).getTime() || 0;
  return db - da;
});

export function getAllArticles() {
  return sorted;
}

export function getArticleBySlug(slug) {
  return sorted.find((a) => a.slug === slug) || null;
}

export const ALL_CATEGORIES = [
  ...new Set(articles.map((a) => a.category).filter(Boolean)),
].sort();
