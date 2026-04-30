import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Reveal } from '../components/Reveal';
import ArticleCard from './ArticleCard';

const formatArticleDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    .format(d).toUpperCase();
};

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
    <ul className="space-y-2.5 mb-6 max-w-2xl list-none pl-0">{children}</ul>
  ),
  ol: ({ children }) => (
    <ol className="space-y-2.5 mb-6 max-w-2xl list-decimal pl-6 marker:text-gold text-stone-300 leading-relaxed">{children}</ol>
  ),
  li: ({ children, ordered }) => (
    ordered
      ? <li className="text-stone-300 leading-relaxed pl-1">{children}</li>
      : <li className="flex items-start gap-3 text-stone-300 leading-relaxed">
          <span className="w-1 h-1 rounded-full bg-gold mt-2.5 flex-shrink-0" />
          <span className="flex-1 min-w-0">{children}</span>
        </li>
  ),
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
    <div className="overflow-x-auto my-6 max-w-2xl">
      <table className="min-w-full text-sm text-stone-300 border-collapse">{children}</table>
    </div>
  ),
  thead: ({ children }) => <thead className="border-b border-gold-30">{children}</thead>,
  th: ({ children }) => <th className="text-left py-3 px-4 text-xs uppercase text-gold" style={{ letterSpacing: '0.15em' }}>{children}</th>,
  td: ({ children }) => <td className="py-3 px-4 border-b border-white/5">{children}</td>,
  strong: ({ children }) => <strong className="text-stone-100 font-semibold">{children}</strong>,
  em: ({ children }) => <em className="italic">{children}</em>,
};

export default function InsightArticlePage({ article, allArticles, onBack }) {
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
      <section className="relative pt-28 pb-12 sm:pt-36 sm:pb-16 overflow-hidden">
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

      <section className="relative py-12 sm:py-16 md:py-20">
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
