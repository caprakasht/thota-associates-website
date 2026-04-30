import { ArrowRight, BookOpen } from 'lucide-react';

const formatArticleDate = (iso) => {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })
    .format(d).toUpperCase();
};

export default function ArticleCard({ article }) {
  const onClick = (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button === 1) return;
    e.preventDefault();
    if (window.__siteNav) window.__siteNav.goTo('article', article.slug);
  };

  return (
    <a href={`/insights/${article.slug}`} onClick={onClick} className="group block h-full">
      <article className="h-full p-6 sm:p-8 rounded-2xl border border-white/10 gradient-card hover-bg-white-4 hover-border-gold transition-colors duration-200 flex flex-col">
        <div className="rounded-xl mb-6 sm:mb-8 overflow-hidden border border-white/5 bg-gold-5 flex items-center justify-center" style={{ aspectRatio: '16/10' }}>
          {article.heroImage ? (
            <img src={article.heroImage} alt={article.heroAlt || ''} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <BookOpen className="w-9 h-9 sm:w-10 sm:h-10 text-gold" style={{ opacity: 0.4 }} />
          )}
        </div>
        <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-stone-500 mb-3 sm:mb-4" style={{ letterSpacing: '0.2em' }}>
          <span className="text-gold">{article.category}</span>
          <span className="w-1 h-1 rounded-full bg-stone-600" />
          <span>{formatArticleDate(article.date)}</span>
        </div>
        <h3 className="serif text-lg sm:text-xl leading-snug group-hover-text-gold transition-colors mb-3 sm:mb-4 text-stone-100">{article.title}</h3>
        <p className="text-sm text-stone-400 leading-relaxed mb-5 sm:mb-6 flex-1 line-clamp-3" style={{ maxHeight: '5em' }}>
          {article.excerpt}
        </p>
        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gold mt-auto" style={{ letterSpacing: '0.2em' }}>
          Read more <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
        </div>
      </article>
    </a>
  );
}
