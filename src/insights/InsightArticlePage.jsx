import { useEffect, createContext, useContext } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Reveal } from '../components/Reveal';
import ArticleCard from './ArticleCard';
import SubscribeForm from './SubscribeForm';

const formatArticleDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    .format(d).toUpperCase();
};

const ListTypeContext = createContext('ul');

const markdownComponents = {
  h1: ({ children }) => (
    <h2 className="serif text-2xl sm:text-3xl text-stone-100 leading-tight mt-12 mb-4 max-w-2xl">{children}</h2>
  ),
  h2: ({ children }) => (
    <h2 className="serif text-2xl sm:text-3xl text-stone-100 leading-tight mt-12 mb-4 max-w-2xl">{children}</h2>
  ),
  h3: ({ children }) => (
    <h3 className="serif text-xl sm:text-2xl text-stone-100 leading-snug mt-8 mb-3 max-w-2xl">{children}</h3>
  ),
  h4: ({ children }) => (
    <h4 className="text-lg uppercase tracking-wide text-gold mt-6 mb-2 max-w-2xl" style={{ letterSpacing: '0.15em' }}>{children}</h4>
  ),
  p: ({ children }) => (
    <p className="text-stone-300 leading-relaxed mb-5 max-w-2xl">{children}</p>
  ),
  a: ({ children, href }) => {
    const external = href && href.startsWith('http');
    return (
      <a
        href={href}
        className="text-gold hover-text-gold-light underline underline-offset-2 transition-colors"
        target={external ? '_blank' : undefined}
        rel={external ? 'noopener noreferrer' : undefined}
      >
        {children}
      </a>
    );
  },
  ul: ({ children }) => (
    <ListTypeContext.Provider value="ul">
      <ul className="space-y-2.5 mb-6 max-w-2xl list-none pl-0">{children}</ul>
    </ListTypeContext.Provider>
  ),
  ol: ({ children }) => (
    <ListTypeContext.Provider value="ol">
      <ol className="space-y-2.5 mb-6 max-w-2xl list-decimal pl-6 text-stone-300 leading-relaxed">{children}</ol>
    </ListTypeContext.Provider>
  ),
  li: ({ children }) => {
    const listType = useContext(ListTypeContext);
    if (listType === 'ol') {
      return <li className="text-stone-300 leading-relaxed pl-1">{children}</li>;
    }
    return (
      <li className="flex items-start gap-3 text-stone-300 leading-relaxed">
        <span className="w-1 h-1 rounded-full bg-gold mt-2.5 flex-shrink-0" />
        <span className="flex-1 min-w-0">{children}</span>
      </li>
    );
  },
  blockquote: ({ children }) => (
    <blockquote className="border-l-4 border-gold pl-6 italic text-stone-300 my-6 max-w-2xl">{children}</blockquote>
  ),
  img: ({ src, alt }) => (
    <figure className="my-8">
      <img src={src} alt={alt || ''} className="w-full max-w-3xl mx-auto rounded-xl border border-white/10" loading="lazy" />
      {alt && <figcaption className="text-xs text-stone-500 text-center mt-3 max-w-2xl mx-auto leading-relaxed">{alt}</figcaption>}
    </figure>
  ),
  code: ({ children, className }) => {
    if (className && className.startsWith('language-')) {
      return <code className={className}>{children}</code>;
    }
    if (String(children).includes('\n')) {
      return <code>{children}</code>;
    }
    return <code className="bg-white-4 px-1.5 py-0.5 rounded text-gold text-sm" style={{ fontFamily: 'ui-monospace, monospace' }}>{children}</code>;
  },
  pre: ({ children }) => (
    <pre className="bg-navy-deep border border-white/10 rounded-xl p-4 my-6 overflow-x-auto text-sm text-stone-300 max-w-2xl" style={{ fontFamily: 'ui-monospace, monospace' }}>{children}</pre>
  ),
  hr: () => <hr className="my-12 border-t border-gold-20" />,
  table: ({ children }) => (
    <div className="overflow-x-auto my-6 max-w-2xl rounded-xl border border-white/10 bg-white-2">
      <table className="article-table min-w-full text-sm text-stone-300 border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="bg-gold-5 border-b border-gold-30">{children}</thead>,
  th: ({ children }) => <th className="text-left py-3 px-4 text-xs uppercase text-gold" style={{ letterSpacing: '0.15em' }}>{children}</th>,
  td: ({ children }) => <td className="py-3 px-4 border-b border-white/5">{children}</td>,
  strong: ({ children }) => <strong className="text-stone-100 font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
};

const SITE_ORIGIN = 'https://thotaassociates.com';

function toAbsoluteUrl(url) {
  if (!url) return null;
  if (/^https?:\/\//i.test(url)) return url;
  return `${SITE_ORIGIN}${url.startsWith('/') ? '' : '/'}${url}`;
}

function useArticleHead(article) {
  useEffect(() => {
    if (!article) return;

    const articleUrl = `${SITE_ORIGIN}/insights/${article.slug}`;
    const description = article.metaDescription || article.excerpt || '';
    const heroAbs = toAbsoluteUrl(article.heroImage);
    const ogImage = heroAbs || `${SITE_ORIGIN}/og-image.jpg`;
    const pageTitle = `${article.title} — Thota and Associates`;

    const originalTitle = document.title;
    const restoreList = [];

    const setMeta = (selector, attr, value) => {
      const el = document.querySelector(selector);
      if (!el) return;
      restoreList.push({ el, attr, original: el.getAttribute(attr) });
      el.setAttribute(attr, value);
    };

    document.title = pageTitle;
    setMeta('meta[name="title"]', 'content', pageTitle);
    setMeta('meta[name="description"]', 'content', description);
    setMeta('meta[property="og:title"]', 'content', pageTitle);
    setMeta('meta[property="og:description"]', 'content', description);
    setMeta('meta[property="og:image"]', 'content', ogImage);
    setMeta('meta[property="og:url"]', 'content', articleUrl);
    setMeta('meta[property="og:type"]', 'content', 'article');
    setMeta('meta[name="twitter:title"]', 'content', pageTitle);
    setMeta('meta[name="twitter:description"]', 'content', description);
    setMeta('meta[name="twitter:image"]', 'content', ogImage);
    setMeta('meta[name="twitter:url"]', 'content', articleUrl);

    const jsonLd = {
      '@context': 'https://schema.org',
      '@type': 'Article',
      headline: article.title,
      description,
      image: [heroAbs || `${SITE_ORIGIN}/og-image.jpg`],
      datePublished: article.date,
      dateModified: article.date,
      author: {
        '@type': 'Person',
        name: article.author || 'CA Bhanu Prakash Thota',
        jobTitle: article.authorTitle || 'Founder & Principal',
        url: `${SITE_ORIGIN}/leadership`,
      },
      publisher: {
        '@type': 'Organization',
        name: 'Thota and Associates',
        url: SITE_ORIGIN,
        logo: {
          '@type': 'ImageObject',
          url: `${SITE_ORIGIN}/web-app-manifest-512x512.png`,
        },
      },
      mainEntityOfPage: {
        '@type': 'WebPage',
        '@id': articleUrl,
      },
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.id = 'article-jsonld';
    script.text = JSON.stringify(jsonLd);
    document.head.appendChild(script);

    return () => {
      document.title = originalTitle;
      for (const { el, attr, original } of restoreList) {
        if (original === null) {
          el.removeAttribute(attr);
        } else {
          el.setAttribute(attr, original);
        }
      }
      const existing = document.getElementById('article-jsonld');
      if (existing) existing.remove();
    };
  }, [article]);
}

export default function InsightArticlePage({ article, allArticles, onBack }) {
  useArticleHead(article);

  if (!article) {
    return (
      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 overflow-hidden min-h-[60vh]">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 -right-20 w-96 h-96 rounded-full gradient-hero-orb-gold" style={{ filter: 'blur(160px)' }} />
        </div>
        <div className="relative max-w-3xl mx-auto px-5 sm:px-6 text-center">
          <button onClick={onBack} className="mb-10 sm:mb-14 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-stone-400 hover-text-gold transition-colors active-scale" style={{ letterSpacing: '0.25em' }}>
            <ArrowLeft className="w-3 h-3" />
            Back to Insights
          </button>
          <div className="text-xs uppercase tracking-widest text-gold mb-5" style={{ letterSpacing: '0.3em' }}>Not found</div>
          <h1 className="serif text-3xl sm:text-4xl text-stone-100 mb-4 leading-tight">Article not found</h1>
          <p className="text-stone-400 leading-relaxed">The article you're looking for doesn't exist or may have moved.</p>
        </div>
      </section>
    );
  }

  const moreArticles = (allArticles || []).filter((a) => a.slug !== article.slug).slice(0, 3);
  const eyebrow = [article.category, formatArticleDate(article.date), `${article.readingMinutes} MIN READ`].filter(Boolean).join(' · ');

  return (
    <>
      <section className="relative pt-28 pb-4 sm:pt-36 sm:pb-6 overflow-hidden">
        {!article.heroImage && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/3 -right-20 w-96 h-96 rounded-full gradient-hero-orb-gold" style={{ filter: 'blur(160px)' }} />
            <div className="absolute bottom-0 -left-20 w-80 h-80 rounded-full gradient-hero-orb-blue" style={{ filter: 'blur(140px)' }} />
            <div className="absolute inset-0 grid-pattern" />
          </div>
        )}
        <div className="relative max-w-3xl mx-auto px-5 sm:px-6">
          <button onClick={onBack} className="mb-10 sm:mb-14 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-stone-400 hover-text-gold transition-colors active-scale" style={{ letterSpacing: '0.25em' }}>
            <ArrowLeft className="w-3 h-3" />
            Back to Insights
          </button>

          <Reveal>
            <div className="text-xs uppercase tracking-widest text-gold mb-5 sm:mb-6" style={{ letterSpacing: '0.25em' }}>
              {eyebrow}
            </div>
          </Reveal>
          <Reveal delay={150}>
            <h1 className="serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-[1.1] mb-6 sm:mb-8 text-stone-100">
              {article.title}
            </h1>
          </Reveal>
          <Reveal delay={300}>
            <div className="h-px w-16 gradient-gold-line mb-8 sm:mb-10" />
          </Reveal>
          {article.author && (
            <Reveal delay={400}>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-gold-10 border border-gold-30 flex items-center justify-center flex-shrink-0">
                  <span className="serif italic text-gold text-base" style={{ fontWeight: 500 }}>{article.author.charAt(0)}</span>
                </div>
                <div className="min-w-0">
                  <div className="text-sm text-stone-100 leading-snug">{article.author}</div>
                  {article.authorTitle && <div className="text-xs text-stone-400 leading-relaxed">{article.authorTitle}</div>}
                </div>
              </div>
            </Reveal>
          )}
        </div>
      </section>

      {article.heroImage && (
        <section className="relative">
          <div className="max-w-5xl mx-auto px-5 sm:px-6">
            <div className="relative rounded-2xl overflow-hidden border border-white/10">
              <img src={article.heroImage} alt={article.heroAlt || article.title} className="w-full h-auto block" />
              <div className="absolute inset-0 pointer-events-none" style={{ background: 'linear-gradient(180deg, rgba(11,25,41,0) 60%, rgba(11,25,41,0.6) 100%)' }} />
            </div>
          </div>
        </section>
      )}

      <section className="relative pt-2 pb-12 sm:pt-4 sm:pb-16 md:pt-6 md:pb-20">
        <div className="max-w-3xl mx-auto px-5 sm:px-6">
          <Reveal>
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents}>
              {article.body}
            </ReactMarkdown>
          </Reveal>
        </div>
      </section>

      {moreArticles.length > 0 && (
        <section className="relative py-16 sm:py-20 md:py-24 border-t border-white/5 bg-white-2">
          <div className="max-w-7xl mx-auto px-5 sm:px-6">
            <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
              <Reveal>
                <div className="text-xs uppercase tracking-widest text-gold mb-5" style={{ letterSpacing: '0.3em' }}>More insights</div>
                <h2 className="serif text-3xl sm:text-4xl text-stone-100 leading-tight">
                  Continue <span className="italic text-gold">reading</span>
                </h2>
              </Reveal>
            </div>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {moreArticles.map((a, i) => (
                <Reveal key={a.slug} delay={i * 60}>
                  <ArticleCard article={a} />
                </Reveal>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="relative py-12 sm:py-16 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-5 sm:px-6">
          <div className="text-center mb-6 sm:mb-8">
            <Reveal>
              <div className="text-xs uppercase tracking-widest text-gold mb-3 sm:mb-4" style={{ letterSpacing: '0.3em' }}>
                Stay informed
              </div>
              <p className="text-sm sm:text-base text-stone-400 leading-relaxed max-w-md mx-auto">
                Practitioner notes from our desk, delivered when we publish.
              </p>
            </Reveal>
          </div>
          <Reveal delay={120}>
            <SubscribeForm compact />
          </Reveal>
        </div>
      </section>

      <section className="py-20 sm:py-24 md:py-28 gradient-cta-section relative overflow-hidden border-t border-white/5">
        <div className="absolute top-0 left-0 right-0 h-px gradient-gold-line" />
        <div className="absolute bottom-0 left-0 right-0 h-px gradient-gold-line" />
        <div className="max-w-3xl mx-auto px-5 sm:px-6 text-center relative">
          <Reveal>
            <h2 className="serif text-3xl sm:text-4xl md:text-5xl leading-tight mb-5 sm:mb-6 text-stone-100">
              Have a question on <span className="italic text-gold">this topic</span>?
            </h2>
          </Reveal>
          <Reveal delay={150}>
            <p className="text-base sm:text-lg text-stone-400 mb-8 sm:mb-10 max-w-xl mx-auto leading-relaxed">
              We provide considered, practitioner-led advice — get in touch for a complimentary initial consultation.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <button type="button" onClick={() => window.__siteNav && window.__siteNav.goTo('contact')} className="group inline-flex items-center justify-center gap-2 px-6 sm:px-8 py-3 sm:py-4 bg-gold hover-bg-gold-light active-scale rounded-sm font-medium text-white gold-cta-shadow text-sm sm:text-base">
              Schedule a Consultation
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </Reveal>
        </div>
      </section>
    </>
  );
}
