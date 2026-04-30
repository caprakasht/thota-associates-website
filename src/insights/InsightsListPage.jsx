import { useState } from 'react';
import { ArrowLeft } from 'lucide-react';
import { Reveal } from '../components/Reveal';
import { ALL_CATEGORIES } from './insights-loader';
import ArticleCard from './ArticleCard';
import SubscribeForm from './SubscribeForm';

export default function InsightsListPage({ articles, onBack }) {
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = activeCategory === 'All'
    ? articles
    : articles.filter((a) => a.category === activeCategory);

  const isEmpty = articles.length === 0;
  const isFilterEmpty = !isEmpty && filtered.length === 0;

  return (
    <>
      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 -right-20 w-96 h-96 rounded-full gradient-hero-orb-gold" style={{ filter: 'blur(160px)' }} />
          <div className="absolute bottom-0 -left-20 w-80 h-80 rounded-full gradient-hero-orb-blue" style={{ filter: 'blur(140px)' }} />
          <div className="absolute inset-0 grid-pattern" />
        </div>
        <div className="relative max-w-6xl mx-auto px-5 sm:px-6">
          <button onClick={onBack} className="mb-10 sm:mb-14 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-stone-400 hover-text-gold transition-colors active-scale" style={{ letterSpacing: '0.25em' }}>
            <ArrowLeft className="w-3 h-3" />
            Back to Home
          </button>
          <div className="text-center max-w-3xl mx-auto">
            <Reveal>
              <div className="text-xs uppercase tracking-widest text-gold mb-5 sm:mb-6" style={{ letterSpacing: '0.3em' }}>
                News & Insights
              </div>
            </Reveal>
            <Reveal delay={150}>
              <h1 className="serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] mb-6 sm:mb-8 text-stone-100">
                Latest from our <span className="italic text-gold">desk</span>
              </h1>
            </Reveal>
            <Reveal delay={300}>
              <p className="text-base sm:text-lg text-stone-400 leading-relaxed max-w-2xl mx-auto">
                Commentary and practitioner notes on valuations, taxation, corporate insolvency, and the evolving regulatory landscape.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {!isEmpty && ALL_CATEGORIES.length > 0 && (
        <section className="relative border-t border-b border-white/5 bg-navy-95 sticky top-16 sm:top-20 z-30 backdrop-blur-xl" style={{ boxShadow: '0 8px 24px -12px rgba(0, 0, 0, 0.5)' }}>
          <div className="absolute top-0 left-0 right-0 h-px gradient-gold-line" />
          <div className="max-w-7xl mx-auto px-5 sm:px-6">
            <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-4 -mx-1 px-1">
              {['All', ...ALL_CATEGORIES].map((cat) => {
                const isActive = activeCategory === cat;
                return (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setActiveCategory(cat)}
                    className={`flex-shrink-0 px-4 sm:px-5 py-2 rounded-full text-xs uppercase tracking-widest transition-all active-scale whitespace-nowrap ${
                      isActive ? 'bg-gold text-white' : 'border border-white/10 text-stone-400 hover-text-gold hover-border-gold'
                    }`}
                    style={{ letterSpacing: '0.15em' }}
                  >
                    {cat}
                  </button>
                );
              })}
            </div>
          </div>
        </section>
      )}

      <section className="relative py-14 sm:py-18 md:py-24">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          {isEmpty ? (
            <Reveal>
              <div className="text-center max-w-xl mx-auto py-12 sm:py-16">
                <div className="text-xs uppercase tracking-widest text-gold mb-5" style={{ letterSpacing: '0.3em' }}>
                  Coming Soon
                </div>
                <h2 className="serif text-2xl sm:text-3xl text-stone-100 mb-4 leading-snug">Articles coming soon.</h2>
                <p className="text-base text-stone-400 leading-relaxed">We're preparing our first insights.</p>
              </div>
            </Reveal>
          ) : isFilterEmpty ? (
            <Reveal>
              <div className="text-center max-w-xl mx-auto py-12 sm:py-16">
                <p className="text-base text-stone-400 leading-relaxed">No articles in this category yet.</p>
              </div>
            </Reveal>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
              {filtered.map((article, i) => (
                <Reveal key={article.slug} delay={i * 60}>
                  <ArticleCard article={article} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      <section className="py-20 sm:py-24 md:py-28 gradient-cta-section relative overflow-hidden border-t border-white/5">
        <div className="absolute top-0 left-0 right-0 h-px gradient-gold-line" />
        <div className="absolute bottom-0 left-0 right-0 h-px gradient-gold-line" />
        <div className="relative max-w-3xl mx-auto px-5 sm:px-6 text-center">
          <Reveal>
            <div className="text-xs uppercase tracking-widest text-gold mb-5 sm:mb-6" style={{ letterSpacing: '0.3em' }}>
              Stay informed
            </div>
            <h2 className="serif text-3xl sm:text-4xl md:text-5xl leading-tight mb-5 sm:mb-6 text-stone-100">
              Subscribe to receive new <span className="italic text-gold">insights</span>
            </h2>
            <p className="text-base sm:text-lg text-stone-400 leading-relaxed mb-8 sm:mb-10 max-w-xl mx-auto">
              Practitioner notes from our desk, delivered when we publish.
            </p>
          </Reveal>
          <Reveal delay={150}>
            <SubscribeForm />
          </Reveal>
        </div>
      </section>
    </>
  );
}
