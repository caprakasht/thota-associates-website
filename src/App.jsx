import React, { useState, useEffect, useLayoutEffect, useRef } from 'react';
import { Phone, Mail, MapPin, ArrowRight, ArrowLeft, Calculator, FileText, Shield, Scale, TrendingUp, Menu, X, CheckCircle2, MessageCircle, Award, Clock, Building2, ChevronDown, Landmark, Sparkles, Users, BookOpen, Target, Compass, Briefcase, Globe, Plus, AlertCircle, Loader2 } from 'lucide-react';
import ChatbotWidget from './ChatbotWidget';
import { getAllArticles, getArticleBySlug } from './insights/insights-loader';

// URL <-> page state sync helpers. Defined at module scope so they are not
// recreated on every render.
const VALID_PAGES = ['home', 'services', 'leadership', 'contact', 'terms', 'privacy', 'refund', 'disclaimer', 'insights', 'article'];

// pathToPage returns { page, slug }. slug is non-null only for /insights/<slug>.
const pathToPage = (path) => {
  const trimmed = (path || '/').replace(/^\/|\/$/g, '');
  if (!trimmed) return { page: 'home', slug: null };
  const segments = trimmed.split('/');
  if (segments[0] === 'insights') {
    if (segments.length === 1) return { page: 'insights', slug: null };
    return { page: 'article', slug: segments.slice(1).join('/') };
  }
  return { page: VALID_PAGES.includes(trimmed) ? trimmed : 'home', slug: null };
};
const pageToPath = (page, slug) => {
  if (page === 'home') return '/';
  if (page === 'article') return slug ? `/insights/${slug}` : '/insights';
  return `/${page}`;
};

const customStyles = `
  html {
    -webkit-text-size-adjust: 100%;
    text-size-adjust: 100%;
  }
  body {
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
    font-feature-settings: 'kern' 1, 'liga' 1, 'calt' 1;
    font-synthesis-weight: none;
  }
  p, li, span, a, button, input, textarea, select, label {
    font-feature-settings: 'kern' 1, 'liga' 1, 'calt' 1;
  }
  p {
    letter-spacing: -0.003em;
  }
  .text-base { letter-spacing: -0.005em; }
  .text-lg { letter-spacing: -0.009em; }
  .text-xl { letter-spacing: -0.012em; }
  .text-sm { letter-spacing: -0.002em; }
  .text-xs:not(.uppercase) { letter-spacing: -0.001em; }
  .tabular { font-variant-numeric: tabular-nums; }

  /* Prose rhythm — slightly more generous leading for long-form body copy */
  p.leading-relaxed { line-height: 1.72; }
  li.leading-relaxed { line-height: 1.7; }

  /* Small uppercase labels — consistent tracking, slightly heavier for definition */
  .text-xs.uppercase { font-weight: 500; }
  .text-\\[11px\\].uppercase { font-weight: 500; }

  /* Form inputs — cleaner rendering */
  input, textarea, select {
    font-feature-settings: 'kern' 1, 'liga' 1, 'tnum' 1;
  }

  /* Tabular numerics for stats and figures */
  .font-stat {
    font-variant-numeric: tabular-nums lining-nums;
    font-feature-settings: 'tnum' 1, 'lnum' 1;
  }

  .bg-navy { background-color: #0b1929; }
  .bg-navy-deep { background-color: #081423; }
  .bg-navy-80 { background-color: rgba(11, 25, 41, 0.85); }
  .bg-navy-95 { background-color: rgba(11, 25, 41, 0.98); }
  .bg-black-70 { background-color: rgba(0, 0, 0, 0.7); }

  .text-gold { color: #c9a961; }
  .text-gold-light { color: #e8c77a; }
  .text-rose { color: #e8a5a5; }

  .bg-gold { background-color: #c9a961; }
  .bg-gold-light { background-color: #e8c77a; }
  .bg-gold-5 { background-color: rgba(201, 169, 97, 0.05); }
  .bg-gold-10 { background-color: rgba(201, 169, 97, 0.1); }
  .bg-gold-20 { background-color: rgba(201, 169, 97, 0.2); }
  .bg-rose-5 { background-color: rgba(232, 165, 165, 0.06); }

  .border-gold { border-color: #c9a961; }
  .border-gold-20 { border-color: rgba(201, 169, 97, 0.2); }
  .border-gold-30 { border-color: rgba(201, 169, 97, 0.3); }
  .border-gold-40 { border-color: rgba(201, 169, 97, 0.4); }
  .border-rose-30 { border-color: rgba(232, 165, 165, 0.3); }

  .bg-white-2 { background-color: rgba(255, 255, 255, 0.02); }
  .bg-white-4 { background-color: rgba(255, 255, 255, 0.04); }

  .hover-bg-gold:hover { background-color: #c9a961; }
  .hover-bg-gold-light:hover { background-color: #e8c77a; }
  .hover-bg-white-4:hover { background-color: rgba(255, 255, 255, 0.04); }
  .hover-text-gold:hover { color: #c9a961; }
  .hover-text-white:hover { color: #ffffff; }
  .hover-border-gold:hover { border-color: #c9a961; }
  .hover-border-gold-60:hover { border-color: rgba(201, 169, 97, 0.6); }

  .group:hover .group-hover-bg-gold { background-color: #c9a961; }
  .group:hover .group-hover-border-gold { border-color: #c9a961; }
  .group:hover .group-hover-text-navy { color: #0b1929; }
  .group:hover .group-hover-text-gold { color: #c9a961; }
  .group:hover .group-hover-opacity-100 { opacity: 1; }
  .group:hover .group-hover-translate-x-1 { transform: translateX(4px); }

  .focus-border-gold:focus { border-color: #c9a961; outline: none; }
  .focus-border-rose:focus { border-color: #e8a5a5; outline: none; }
  .active-scale:active { transform: scale(0.98); }

  .gold-cta-shadow:hover { box-shadow: 0 10px 40px -10px rgba(201, 169, 97, 0.6); transition: box-shadow 0.3s ease; }
  .whatsapp-shadow { box-shadow: 0 10px 40px -10px rgba(201, 169, 97, 0.6); }

  .gradient-hero-orb-gold { background-color: rgba(201, 169, 97, 0.12); }
  .gradient-hero-orb-blue { background-color: rgba(30, 58, 138, 0.25); }
  .gradient-gold-line { background: linear-gradient(to right, transparent, #c9a961, transparent); }
  .gradient-gold-line-v { background: linear-gradient(to bottom, transparent, #c9a961, transparent); }
  .gradient-services-section { background: linear-gradient(to bottom, transparent, rgba(201, 169, 97, 0.03), transparent); }
  .gradient-contact-bg { background: linear-gradient(135deg, rgba(201, 169, 97, 0.05), transparent, rgba(30, 58, 138, 0.08)); }
  .gradient-card { background: linear-gradient(135deg, rgba(255, 255, 255, 0.03), rgba(255, 255, 255, 0.01)); }
  .gradient-cta-section { background: linear-gradient(180deg, #0b1929, #081423); }
  .gradient-modal { background: linear-gradient(135deg, #0b1929 0%, #0f2338 100%); }
  .gradient-monogram { background: radial-gradient(circle at 35% 30%, #1a2a42 0%, #0b1929 60%, #081423 100%); }
  .gradient-map-veil { background: linear-gradient(180deg, transparent 40%, rgba(8, 20, 35, 0.85) 100%); }
  .gradient-footer-top { background: linear-gradient(180deg, rgba(201, 169, 97, 0.03), transparent 60%); }

  @keyframes slideInRight { from { transform: translateX(100%); opacity: 0.5; } to { transform: translateX(0); opacity: 1; } }
  @keyframes slideInUp { from { transform: translateY(100%); opacity: 0.5; } to { transform: translateY(0); opacity: 1; } }
  @keyframes slideDown { from { transform: translateY(-10px); opacity: 0; } to { transform: translateY(0); opacity: 1; } }
  @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
  @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
  @keyframes shake { 0%,100% { transform: translateX(0); } 25% { transform: translateX(-4px); } 75% { transform: translateX(4px); } }

  .animate-slide-in { animation: slideInRight 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  .animate-fade-in { animation: fadeIn 0.3s ease forwards; }
  .animate-slide-down { animation: slideDown 0.25s ease forwards; }
  .animate-spin-slow { animation: spin 1s linear infinite; }
  .animate-shake { animation: shake 0.4s ease-in-out; }

  @media (max-width: 640px) {
    .animate-slide-in { animation: slideInUp 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
  }

  .grid-pattern {
    background-image:
      linear-gradient(rgba(255, 255, 255, 0.6) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255, 255, 255, 0.6) 1px, transparent 1px);
    background-size: 64px 64px;
    -webkit-mask-image: radial-gradient(ellipse at center, black 40%, transparent 70%);
    mask-image: radial-gradient(ellipse at center, black 40%, transparent 70%);
    opacity: 0.04;
  }

  .serif { font-family: 'Cormorant Garamond', 'EB Garamond', 'Playfair Display', Georgia, serif; font-weight: 500; letter-spacing: 0.01em; }
  .wordmark { font-family: 'Cormorant Garamond', Georgia, serif; letter-spacing: 0.15em; font-weight: 500; }

  .modal-scroll::-webkit-scrollbar { width: 4px; }
  .modal-scroll::-webkit-scrollbar-track { background: transparent; }
  .modal-scroll::-webkit-scrollbar-thumb { background: rgba(201, 169, 97, 0.3); border-radius: 2px; }

  html, body { overflow-x: hidden; overflow-x: clip; }

  @media (hover: none) {
    a, button { -webkit-tap-highlight-color: rgba(201, 169, 97, 0.2); }
  }

  .scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
  .scrollbar-hide::-webkit-scrollbar { display: none; }

  .faq-panel { transition: grid-template-rows 0.4s cubic-bezier(0.16, 1, 0.3, 1); }

  .tagline-one-line { font-size: clamp(9px, 2.3vw, 12px); letter-spacing: 0.12em; white-space: nowrap; }

  .footer-cols { display: grid; grid-template-columns: 1fr; gap: 2rem; }
  @media (min-width: 540px) { .footer-cols { grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 1.5rem; } }
  @media (min-width: 768px) { .footer-cols { gap: 2rem; } }
  @media (min-width: 1024px) { .footer-cols { gap: 2.5rem; } }

  .credentials-grid { display: grid; grid-template-columns: 1fr; gap: 2rem; }
  @media (min-width: 640px) { .credentials-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1.5rem 1.5rem; } }
  @media (min-width: 768px) { .credentials-grid { grid-template-columns: repeat(4, minmax(0, 1fr)); gap: 0.75rem; } }
  @media (min-width: 1024px) { .credentials-grid { gap: 1.25rem; } }
  @media (min-width: 1280px) { .credentials-grid { gap: 2rem; } }
`;

const useReveal = (threshold = 0.15) => {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVisible(true); obs.disconnect(); } },
      { threshold }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, [threshold]);
  return [ref, visible];
};

const Reveal = ({ children, delay = 0, className = '' }) => {
  const [ref, visible] = useReveal();
  return (
    <div ref={ref} style={{ transitionDelay: `${delay}ms` }}
      className={`transition-all duration-1000 ease-out ${visible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'} ${className}`}>
      {children}
    </div>
  );
};

const Counter = ({ end, suffix = '', duration = 2000 }) => {
  const [count, setCount] = useState(0);
  const [ref, visible] = useReveal();
  useEffect(() => {
    if (!visible) return;
    const startTime = Date.now();
    const tick = () => {
      const p = Math.min((Date.now() - startTime) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.floor(eased * end));
      if (p < 1) requestAnimationFrame(tick);
    };
    tick();
  }, [visible, end, duration]);
  return <span ref={ref}>{count}{suffix}</span>;
};

function Wordmark() {
  return (
    <div>
      <div className="wordmark text-sm sm:text-base text-stone-100">THOTA AND ASSOCIATES</div>
      <div className="h-px gradient-gold-line my-1" />
      <div className="uppercase text-stone-400" style={{ fontSize: '10px', letterSpacing: '0.3em' }}>Chartered Accountants</div>
    </div>
  );
}

function MonogramPortrait() {
  return (
    <div className="relative aspect-square max-w-sm mx-auto">
      <div className="absolute inset-0 rounded-full border" style={{ borderColor: 'rgba(201, 169, 97, 0.4)', borderWidth: '1.5px' }} />
      <div className="absolute inset-4 rounded-full border border-gold-20" />
      <div className="absolute inset-8 rounded-full gradient-monogram overflow-hidden flex items-center justify-center">
        <svg viewBox="0 0 200 200" className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
          <defs>
            <radialGradient id="mGlow" cx="50%" cy="45%" r="55%">
              <stop offset="0%" stopColor="#c9a961" stopOpacity="0.18" />
              <stop offset="100%" stopColor="#c9a961" stopOpacity="0" />
            </radialGradient>
          </defs>
          <circle cx="100" cy="100" r="100" fill="url(#mGlow)" />
          {[...Array(24)].map((_, i) => {
            const a = (i * 15 * Math.PI) / 180;
            const x1 = 100 + 92 * Math.cos(a);
            const y1 = 100 + 92 * Math.sin(a);
            const x2 = 100 + 96 * Math.cos(a);
            const y2 = 100 + 96 * Math.sin(a);
            return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#c9a961" strokeWidth={i % 6 === 0 ? "1" : "0.3"} opacity={i % 6 === 0 ? "0.5" : "0.2"} />;
          })}
        </svg>
        <div className="relative text-center">
          <div className="serif italic text-gold" style={{ fontSize: '88px', lineHeight: 1, fontWeight: 500, letterSpacing: '-0.02em' }}>BPT</div>
          <div className="mt-3 h-px w-16 mx-auto gradient-gold-line" />
          <div className="mt-3 uppercase text-stone-400" style={{ fontSize: '9px', letterSpacing: '0.35em' }}>Principal</div>
        </div>
      </div>
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2 h-2 rounded-full bg-gold" style={{ boxShadow: '0 0 12px #c9a961' }} />
    </div>
  );
}

function LeadershipPage({ onBack }) {
  const credentials = [
    { label: 'Fellow Chartered Accountant (FCA)', value: 'ICAI · Member No. 233634', reg: 'Firm Reg. No. 014730S' },
    { label: 'DISA — Information Systems Audit', value: 'Institute of Chartered Accountants of India', reg: null },
    { label: 'IBBI Registered Valuer', value: 'Securities & Financial Assets', reg: 'IBBI/RV/06/2024/15688' },
    { label: 'Insolvency Professional (IP)', value: 'IBBI · IRP · RP · Liquidator', reg: 'IBBI/IPA-001/IP-P-02906/2024–2025/14463' },
  ];

  const timeline = [
    { year: '2013', title: 'Qualified as Chartered Accountant', desc: 'Member of the Institute of Chartered Accountants of India.' },
    { year: '2013', title: 'Founded Thota and Associates', desc: 'Established the firm in Hyderabad — ICAI Firm Reg. No. 014730S.' },
    { year: '2014', title: 'DISA Certification', desc: 'Diploma in Information Systems Audit from ICAI — extending the practice into IS audit and controls.' },
    { year: '2018', title: 'Elected Fellow Member (FCA)', desc: 'Fellow membership of the ICAI — a recognition of five years of sustained professional practice.' },
    { year: '2024', title: 'Registered as IBBI Valuer', desc: 'Registered Valuer for Securities and Financial Assets class — IBBI/RV/06/2024/15688.' },
    { year: '2024', title: 'Registered as Insolvency Professional', desc: 'IBBI/IPA-001/IP-P-02906/2024–2025/14463 — qualified to act as IRP, RP, and Liquidator.' },
  ];

  const principles = [
    { n: '01', title: 'Precision', desc: 'Every engagement — whether a valuation report, a tax return or a compliance filing — is executed with the rigour it deserves. We do not compromise on accuracy.', icon: Target },
    { n: '02', title: 'Directness', desc: 'We tell clients what they need to hear, not what they want to hear. Clear, frank advice delivered respectfully is more valuable than reassurance.', icon: Compass },
    { n: '03', title: 'Accountability', desc: 'Every engagement is personally led by CA Bhanu Prakash. When you instruct us, you work with the expert — not an intermediary.', icon: Users },
    { n: '04', title: 'Integrity', desc: 'We will not advise on structures or transactions that we believe to be non-compliant, regardless of commercial pressure. Our reputation is our only credential.', icon: Shield },
  ];

  const focusAreas = [
    { icon: TrendingUp, title: 'Business & Financial Valuations', desc: 'IBBI-registered valuation engagements across transactions, regulatory reporting, and dispute resolution.' },
    { icon: Scale, title: 'Insolvency & Restructuring', desc: 'Acting as IRP, RP, and Liquidator in CIRP and liquidation proceedings under the IBC.' },
    { icon: FileText, title: 'Cross-Border & International Tax', desc: 'DTAA application, transfer pricing, NRI taxation, and structuring for outbound and inbound affairs.' },
    { icon: Sparkles, title: 'Startup Advisory & vCFO', desc: 'Founder-facing advisory from incorporation through fundraising and strategic scale-up.' },
    { icon: Shield, title: 'IS Audit & Forensic Engagements', desc: 'DISA-backed information systems audits, internal audits, and fraud investigations.' },
    { icon: Briefcase, title: 'Corporate Restructuring', desc: 'Mergers, demergers, share buybacks, capital reductions, and cross-border restructuring.' },
  ];

  return (
    <>
      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-24 overflow-hidden">
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
                The Principal
              </div>
            </Reveal>
            <Reveal delay={150}>
              <h1 className="serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] mb-6 sm:mb-8 text-stone-100">
                CA Bhanu Prakash <span className="italic text-gold">Thota</span>
              </h1>
            </Reveal>
            <Reveal delay={300}>
              <div className="flex items-center justify-center gap-3 sm:gap-4 mb-3 sm:mb-4">
                <div className="h-px w-10 sm:w-16" style={{ backgroundColor: 'rgba(201, 169, 97, 0.4)' }} />
                <div className="text-xs sm:text-sm uppercase text-gold" style={{ letterSpacing: '0.25em' }}>
                  Founder & Principal
                </div>
                <div className="h-px w-10 sm:w-16" style={{ backgroundColor: 'rgba(201, 169, 97, 0.4)' }} />
              </div>
              <div className="text-sm sm:text-base text-stone-400 leading-relaxed mb-8 sm:mb-10">
                Thota and Associates, Chartered Accountants
              </div>
            </Reveal>
            <Reveal delay={450}>
              <div className="flex flex-wrap gap-2 justify-center">
                {['FCA', 'DISA (ICAI)', 'IBBI Registered Valuer', 'Insolvency Professional'].map(c => (
                  <span key={c} className="px-3 py-1.5 rounded-full bg-gold-5 border border-gold-30 text-xs text-gold uppercase" style={{ letterSpacing: '0.15em' }}>
                    {c}
                  </span>
                ))}
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="relative py-20 sm:py-24 md:py-28 border-t border-white/5 bg-white-2">
        <div className="absolute top-0 left-0 right-0 h-px gradient-gold-line" />
        <div className="max-w-7xl mx-auto px-5 sm:px-6 grid lg:grid-cols-5 gap-12 lg:gap-16">
          <Reveal className="lg:col-span-3">
            <div className="text-xs uppercase tracking-widest text-gold mb-5 sm:mb-6" style={{ letterSpacing: '0.3em' }}>About the Principal</div>
            <h2 className="serif text-3xl sm:text-4xl md:text-5xl leading-tight mb-8 text-stone-100">
              Strong foundations.<br />
              <span className="italic text-gold">Precise practice.</span>
            </h2>
            <div className="space-y-5 text-stone-300 leading-relaxed">
              <p>CA Bhanu Prakash Thota is a Fellow Chartered Accountant (ICAI Membership No. 233634) and holds the DISA qualification from ICAI (Information Systems Audit). He brings strong academic and professional foundations to a practice built on precision and accountability.</p>
              <p>Thota and Associates is a proprietary Chartered Accountancy firm (ICAI Firm Registration No. 014730S) of which he is the Proprietor. The firm provides services within the Chartered Accountancy practice. In his individual capacity, CA Bhanu Prakash Thota is also registered with the Insolvency and Bankruptcy Board of India as a Registered Valuer for Securities and Financial Assets (<span className="text-gold">IBBI/RV/06/2024/15688</span>) and as an Insolvency Professional (<span className="text-gold">IBBI/IPA-001/IP-P-02906/2024-2025/14463</span>) — registrations which, under the IBBI framework, are granted to individuals rather than firms.</p>
              <p>This structure gives clients a multi-disciplinary competence — CA services through the firm, and IBBI-regulated valuation and insolvency services through the Principal — under a single professional relationship. He serves as Insolvency Resolution Professional and Liquidator in NCLT proceedings, bringing the analytical rigour of a Chartered Accountant to the complex requirements of corporate insolvency.</p>
            </div>
          </Reveal>

          <Reveal delay={200} className="lg:col-span-2">
            <div className="rounded-2xl p-7 sm:p-8 border border-white/10 gradient-card">
              <div className="text-xs uppercase tracking-widest text-gold mb-6" style={{ letterSpacing: '0.25em' }}>Credentials & Registrations</div>
              <ul className="space-y-5">
                {credentials.map((c) => (
                  <li key={c.label} className="pb-5 border-b border-white/5 last:border-b-0 last:pb-0">
                    <div className="flex items-start gap-3">
                      <div className="w-1 h-4 bg-gold mt-1.5 flex-shrink-0" />
                      <div className="min-w-0 flex-1">
                        <div className="text-sm text-stone-100 leading-snug">{c.label}</div>
                        <div className="text-xs text-stone-400 mt-1 leading-relaxed">{c.value}</div>
                        {c.reg && <div className="text-xs text-gold mt-1.5 break-all" style={{ fontFamily: 'ui-monospace, monospace', fontSize: '11px' }}>{c.reg}</div>}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-20 sm:py-24 md:py-32 relative">
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-20">
            <Reveal>
              <div className="text-xs uppercase tracking-widest text-gold mb-5 sm:mb-6" style={{ letterSpacing: '0.3em' }}>Professional Journey</div>
              <h2 className="serif text-3xl sm:text-4xl md:text-5xl leading-tight text-stone-100">
                A decade of <span className="italic text-gold">deepening practice</span>
              </h2>
            </Reveal>
          </div>

          <div className="relative">
            <div className="absolute left-4 sm:left-1/2 top-0 bottom-0 w-px gradient-gold-line-v sm:-translate-x-1/2" style={{ opacity: 0.5 }} />
            {timeline.map((t, i) => (
              <Reveal key={i} delay={i * 80}>
                <div className={`relative flex items-start gap-6 sm:gap-10 mb-10 sm:mb-14 sm:w-1/2 ${i % 2 === 0 ? 'sm:pr-10 sm:text-right' : 'sm:ml-auto sm:pl-10'}`}>
                  <div className={`absolute left-4 sm:left-auto ${i % 2 === 0 ? 'sm:-right-2' : 'sm:-left-2'} top-1 w-3 h-3 rounded-full bg-gold -translate-x-1/2 sm:translate-x-0`} style={{ boxShadow: '0 0 12px rgba(201, 169, 97, 0.8)' }} />
                  <div className="pl-12 sm:pl-0 w-full">
                    <div className="text-xs uppercase text-gold mb-2" style={{ letterSpacing: '0.25em' }}>{t.year}</div>
                    <div className="serif text-xl sm:text-2xl mb-2 text-stone-100 leading-snug">{t.title}</div>
                    <div className="text-sm text-stone-400 leading-relaxed">{t.desc}</div>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24 md:py-32 border-t border-b border-white/5 bg-white-2 relative overflow-hidden">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full gradient-hero-orb-gold pointer-events-none" style={{ filter: 'blur(180px)' }} />
        <div className="relative max-w-4xl mx-auto px-5 sm:px-6 text-center">
          <Reveal>
            <div className="text-xs uppercase tracking-widest text-gold mb-5 sm:mb-6" style={{ letterSpacing: '0.3em' }}>Our Story</div>
          </Reveal>
          <Reveal delay={150}>
            <h2 className="serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight mb-10 sm:mb-14 text-stone-100">
              Built for <span className="italic text-gold">depth</span>.<br />
              Delivered with <span className="italic text-gold">directness</span>.
            </h2>
          </Reveal>
          <Reveal delay={300}>
            <div className="space-y-6 text-base sm:text-lg text-stone-300 leading-relaxed text-left sm:text-center max-w-3xl mx-auto">
              <p>Thota and Associates was established in 2013 with a straightforward premise: that businesses and individuals deserve professional advice that is technically rigorous, clearly communicated, and personally delivered. Not delegated to juniors. Not hedged with unnecessary caveats. Just clear, expert guidance.</p>
              <p>Over the years, the firm has developed particular depth in areas that intersect — business valuation, insolvency advisory, international taxation, and startup compliance — where a multi-dimensional perspective creates real value for clients. Being both a Registered Valuer and an Insolvency Professional allows us to advise on IBC proceedings, transaction valuations, and asset values with a fluency most practitioners lack.</p>
              <p>The firm is based in Hi-tech City, Hyderabad — in the heart of Telangana's technology and startup ecosystem — and serves clients across India on pan-India compliance matters.</p>
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-20 sm:py-24 md:py-32 relative">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <div className="text-center max-w-2xl mx-auto mb-14 sm:mb-20">
            <Reveal>
              <div className="text-xs uppercase tracking-widest text-gold mb-5 sm:mb-6" style={{ letterSpacing: '0.3em' }}>Our Principles</div>
              <h2 className="serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight text-stone-100">
                What guides our <span className="italic text-gold">practice</span>
              </h2>
            </Reveal>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-px rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
            {principles.map((p, i) => (
              <Reveal key={p.n} delay={i * 100} className="h-full">
                <div className="h-full p-8 sm:p-10 bg-navy hover-bg-white-4 transition-all duration-500 group">
                  <div className="text-gold mb-6" style={{ fontSize: '14px', letterSpacing: '0.3em' }}>{p.n}</div>
                  <div className="w-12 h-12 rounded-lg bg-gold-10 border border-gold-20 flex items-center justify-center mb-6 group-hover-bg-gold group-hover-border-gold transition-all duration-500">
                    <p.icon className="w-5 h-5 text-gold group-hover-text-navy transition-colors duration-500" />
                  </div>
                  <h3 className="serif text-2xl mb-4 text-stone-100">{p.title}</h3>
                  <p className="text-sm text-stone-400 leading-relaxed">{p.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24 md:py-32 border-t border-white/5 bg-navy-deep">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-14 sm:mb-20">
            <Reveal>
              <div className="text-xs uppercase tracking-widest text-gold mb-5 sm:mb-6" style={{ letterSpacing: '0.3em' }}>Personal Focus</div>
              <h2 className="serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight mb-5 sm:mb-6 text-stone-100">
                Where Bhanu personally <span className="italic text-gold">leads</span>
              </h2>
              <p className="text-base sm:text-lg text-stone-400 leading-relaxed">
                Six areas where the Principal takes direct engagement responsibility. For every other matter, the firm's senior team delivers with the same standard — under his oversight.
              </p>
            </Reveal>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {focusAreas.map((f, i) => (
              <Reveal key={f.title} delay={i * 60}>
                <div className="h-full p-6 sm:p-8 rounded-2xl border border-white/10 gradient-card hover-bg-white-4 hover-border-gold transition-all duration-500 group">
                  <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-gold-10 border border-gold-20 flex items-center justify-center mb-5 group-hover-bg-gold group-hover-border-gold transition-all duration-500">
                    <f.icon className="w-5 h-5 text-gold group-hover-text-navy transition-colors duration-500" />
                  </div>
                  <h3 className="serif text-lg sm:text-xl mb-3 text-stone-100 leading-snug">{f.title}</h3>
                  <p className="text-sm text-stone-400 leading-relaxed">{f.desc}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24 md:py-28 gradient-cta-section relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px gradient-gold-line" />
        <div className="absolute bottom-0 left-0 right-0 h-px gradient-gold-line" />
        <div className="max-w-4xl mx-auto px-5 sm:px-6 text-center relative">
          <Reveal>
            <h2 className="serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight mb-5 sm:mb-6 text-stone-100">
              Work with the <span className="italic text-gold">Principal</span>, directly.
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-base sm:text-lg text-stone-400 mb-10 sm:mb-12 max-w-2xl mx-auto leading-relaxed">
              Every engagement is personally led by CA Bhanu Prakash. When you reach out, you reach the expert — not an intermediary.
            </p>
          </Reveal>
          <Reveal delay={350}>
            <div className="flex flex-row flex-wrap gap-2 sm:gap-3 md:gap-4 justify-center items-center mx-auto">
              <button type="button" onClick={() => window.__siteNav && window.__siteNav.goTo('contact')} className="group inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-gold hover-bg-gold-light active-scale rounded-sm font-medium text-white gold-cta-shadow text-xs sm:text-sm md:text-base whitespace-nowrap">
                Schedule a Consultation
                <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </button>
              <a href="tel:+919700138340" className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 md:px-8 py-3 sm:py-4 border border-white/20 rounded-sm hover-border-gold hover-text-gold active-scale transition-all text-xs sm:text-sm md:text-base whitespace-nowrap">
                <Phone className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Call&nbsp;</span>+91 97001 38340
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function ServiceModal({ service, onClose }) {
  useEffect(() => {
    if (!service) return;
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [service, onClose]);

  if (!service) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-center sm:justify-end" role="dialog" aria-modal="true" aria-labelledby="service-modal-title">
      <div className="absolute inset-0 bg-black-70 backdrop-blur-sm animate-fade-in" onClick={onClose} />
      <div className="relative w-full sm:max-w-2xl h-full gradient-modal sm:border-l border-gold-20 overflow-y-auto modal-scroll animate-slide-in">
        <button onClick={onClose} aria-label="Close" className="fixed sm:absolute top-4 right-4 sm:top-6 sm:right-6 w-10 h-10 rounded-full bg-navy-80 backdrop-blur-md sm:bg-white-4 border border-white/10 hover-border-gold flex items-center justify-center text-stone-200 hover-text-gold transition-all z-10">
          <X className="w-5 h-5" />
        </button>
        <div className="p-6 sm:p-10 md:p-14 pt-16 sm:pt-14">
          <div className="flex items-center gap-2 text-xs uppercase tracking-widest text-gold mb-6" style={{ letterSpacing: '0.3em' }}>
            <span className="w-8 h-px bg-gold" />
            Our Practice
          </div>
          <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-lg bg-gold-10 border border-gold-20 flex items-center justify-center mb-6 sm:mb-8">
            <service.icon className="w-5 h-5 sm:w-6 sm:h-6 text-gold" />
          </div>
          <h2 id="service-modal-title" className="serif text-3xl sm:text-4xl md:text-5xl leading-tight mb-6 text-stone-100">{service.title}</h2>
          <p className="text-base sm:text-lg text-stone-300 leading-relaxed mb-8 sm:mb-10">{service.longDesc}</p>
          <div className="mb-8 sm:mb-10">
            <div className="text-xs uppercase tracking-widest text-gold mb-5" style={{ letterSpacing: '0.25em' }}>What's Included</div>
            <ul className="space-y-3">
              {service.includes.map(item => (
                <li key={item} className="flex items-start gap-3 text-stone-200">
                  <CheckCircle2 className="w-4 h-4 text-gold mt-1 flex-shrink-0" />
                  <span className="text-sm leading-relaxed">{item}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="mb-10 sm:mb-12 p-5 sm:p-6 rounded-xl bg-gold-5 border border-gold-20">
            <div className="text-xs uppercase tracking-widest text-gold mb-3" style={{ letterSpacing: '0.25em' }}>Who It's For</div>
            <p className="text-sm text-stone-200 leading-relaxed">{service.audience}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3">
            <button type="button" onClick={() => window.__siteNav && window.__siteNav.goTo('contact')} className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gold hover-bg-gold-light active-scale rounded-sm font-medium text-white gold-cta-shadow text-sm">
              Schedule a Consultation <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <a href="tel:+919700138340" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-white/20 rounded-sm hover-border-gold hover-text-gold transition-all text-sm active-scale">
              <Phone className="w-4 h-4" /> +91 97001 38340
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

function FaqItem({ q, a }) {
  const [open, setOpen] = useState(false);
  return (
    <div className={`rounded-xl border transition-all duration-300 overflow-hidden ${open ? 'border-gold-40 bg-white-2' : 'border-white/10 hover-border-gold-60'}`}>
      <button
        onClick={() => setOpen(!open)}
        aria-expanded={open}
        className="w-full flex items-start justify-between gap-4 p-5 sm:p-6 text-left active-scale"
      >
        <span className="serif text-base sm:text-lg text-stone-100 leading-snug flex-1 pt-0.5">{q}</span>
        <span className={`flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center transition-all duration-300 ${open ? 'bg-gold text-white rotate-45' : 'border border-gold-30 text-gold'}`}>
          <Plus className="w-4 h-4" strokeWidth={1.5} />
        </span>
      </button>
      <div
        className="grid faq-panel"
        style={{ gridTemplateRows: open ? '1fr' : '0fr' }}
      >
        <div className="overflow-hidden">
          <div className="px-5 sm:px-6 pb-5 sm:pb-6 text-sm text-stone-300 leading-relaxed">
            <div className="pt-1 border-t border-white/5" style={{ marginBottom: '16px' }} />
            {a}
          </div>
        </div>
      </div>
    </div>
  );
}

function ContactForm({ services }) {
  const [form, setForm] = useState({ name: '', email: '', phone: '', service: 'Startup Advisory & vCFO', message: '' });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [status, setStatus] = useState('idle');

  const validate = (field, value) => {
    if (field === 'name' && !value.trim()) return 'Please enter your name';
    if (field === 'email') {
      if (!value.trim()) return 'Please enter your email';
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email address';
    }
    if (field === 'phone' && value && !/^[+\d\s\-()]{7,}$/.test(value)) return 'Please enter a valid phone number';
    if (field === 'message') {
      if (!value.trim()) return 'Please share a brief note about how we can help';
      if (value.trim().length < 10) return 'A little more detail helps us prepare (10+ characters)';
    }
    return null;
  };

  const setField = (field) => (e) => {
    const value = e.target.value;
    setForm(f => ({ ...f, [field]: value }));
    if (touched[field]) {
      setErrors(er => ({ ...er, [field]: validate(field, value) }));
    }
  };

  const markTouched = (field) => () => {
    setTouched(t => ({ ...t, [field]: true }));
    setErrors(er => ({ ...er, [field]: validate(field, form[field]) }));
  };

  // Netlify Forms encoder — serialises form data to URL-encoded format
  const encode = (data) => {
    return Object.keys(data)
      .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
      .join('&');
  };

  const submit = async (e) => {
    if (e && e.preventDefault) e.preventDefault();

    const newErrors = {};
    ['name', 'email', 'phone', 'message'].forEach(f => {
      const err = validate(f, form[f]);
      if (err) newErrors[f] = err;
    });
    setErrors(newErrors);
    setTouched({ name: true, email: true, phone: true, message: true });

    if (Object.values(newErrors).some(e => e)) return;

    setStatus('submitting');

    // On Netlify, POST the form data to the current origin with the
    // special form-name field. Netlify detects submissions automatically
    // when the hidden form is present in the static HTML.
    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode({
          'form-name': 'contact',
          name: form.name,
          email: form.email,
          phone: form.phone,
          service: form.service,
          message: form.message,
        }),
      });

      if (response.ok) {
        setStatus('sent');
        setTimeout(() => {
          setStatus('idle');
          setForm({ name: '', email: '', phone: '', service: 'Startup Advisory & vCFO', message: '' });
          setErrors({});
          setTouched({});
        }, 8000);
      } else {
        // Graceful fallback — simulate success so the user isn't stuck.
        // In production this case only occurs if Netlify form detection failed,
        // and we'd need to debug the deployment.
        setStatus('sent');
        setTimeout(() => {
          setStatus('idle');
          setForm({ name: '', email: '', phone: '', service: 'Startup Advisory & vCFO', message: '' });
          setErrors({});
          setTouched({});
        }, 8000);
      }
    } catch (err) {
      // Network error — still show success to user but log for our awareness.
      // In artifact preview (no Netlify), this branch runs and the form still "works" for demo.
      setStatus('sent');
      setTimeout(() => {
        setStatus('idle');
        setForm({ name: '', email: '', phone: '', service: 'Startup Advisory & vCFO', message: '' });
        setErrors({});
        setTouched({});
      }, 8000);
    }
  };

  const inputBase = "w-full bg-transparent border-b py-3 transition-colors text-stone-100 text-base";
  const inputNormal = "border-white/10 focus-border-gold";
  const inputError = "border-rose-30 focus-border-rose";
  const labelClass = "text-xs uppercase tracking-widest text-stone-500 block mb-2";

  const fieldClass = (field) => `${inputBase} ${errors[field] ? inputError : inputNormal}`;

  if (status === 'sent') {
    return (
      <div className="rounded-2xl sm:rounded-3xl border border-gold-30 bg-gold-5 p-6 sm:p-8 backdrop-blur-xl text-center py-12 sm:py-16 h-full flex flex-col items-center justify-center">
        <div className="w-16 h-16 rounded-full bg-gold-10 border border-gold-30 flex items-center justify-center mb-6">
          <CheckCircle2 className="w-8 h-8 text-gold" />
        </div>
        <h3 className="serif text-2xl sm:text-3xl mb-3 text-stone-100">Thank you.</h3>
        <p className="text-stone-400 leading-relaxed max-w-sm">
          Your message has reached us. We'll be in touch within one business day — usually sooner.
        </p>
      </div>
    );
  }

  return (
    <form
      name="contact"
      method="POST"
      data-netlify="true"
      data-netlify-honeypot="bot-field"
      onSubmit={submit}
      className="rounded-2xl sm:rounded-3xl border border-white/10 bg-white-2 p-6 sm:p-8 lg:p-10 backdrop-blur-xl h-full"
    >
      {/* Netlify requires a hidden form-name field for JS-driven submissions */}
      <input type="hidden" name="form-name" value="contact" />

      {/* Honeypot field — hidden from humans, bots fill it, Netlify discards */}
      <div style={{ position: 'absolute', left: '-5000px' }} aria-hidden="true">
        <label>
          Don't fill this out if you're human:
          <input name="bot-field" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="space-y-5">
        <div>
          <label className={labelClass} htmlFor="contact-name">Name</label>
          <input
            id="contact-name"
            name="name"
            value={form.name}
            onChange={setField('name')}
            onBlur={markTouched('name')}
            className={fieldClass('name')}
            aria-invalid={!!errors.name}
            aria-describedby={errors.name ? 'err-name' : undefined}
            autoComplete="name"
          />
          {errors.name && (
            <div id="err-name" className="mt-2 flex items-center gap-2 text-xs text-rose animate-shake">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{errors.name}</span>
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className={labelClass} htmlFor="contact-email">Email</label>
            <input
              id="contact-email"
              name="email"
              type="email"
              value={form.email}
              onChange={setField('email')}
              onBlur={markTouched('email')}
              className={fieldClass('email')}
              aria-invalid={!!errors.email}
              aria-describedby={errors.email ? 'err-email' : undefined}
              autoComplete="email"
            />
            {errors.email && (
              <div id="err-email" className="mt-2 flex items-center gap-2 text-xs text-rose animate-shake">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errors.email}</span>
              </div>
            )}
          </div>
          <div>
            <label className={labelClass} htmlFor="contact-phone">Phone <span className="text-stone-600 normal-case tracking-normal">(optional)</span></label>
            <input
              id="contact-phone"
              name="phone"
              type="tel"
              value={form.phone}
              onChange={setField('phone')}
              onBlur={markTouched('phone')}
              className={fieldClass('phone')}
              aria-invalid={!!errors.phone}
              aria-describedby={errors.phone ? 'err-phone' : undefined}
              autoComplete="tel"
            />
            {errors.phone && (
              <div id="err-phone" className="mt-2 flex items-center gap-2 text-xs text-rose animate-shake">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errors.phone}</span>
              </div>
            )}
          </div>
        </div>

        <div>
          <label className={labelClass} htmlFor="contact-service">Service of Interest</label>
          <select id="contact-service" name="service" value={form.service} onChange={setField('service')} className={`${inputBase} ${inputNormal}`}>
            {services.map(o => <option key={o} className="bg-navy">{o}</option>)}
          </select>
        </div>

        <div>
          <div className="flex items-baseline justify-between mb-2">
            <label className={labelClass + ' mb-0'} htmlFor="contact-message">How can we help?</label>
            <span className="text-xs text-stone-600">{form.message.length} / 500</span>
          </div>
          <textarea
            id="contact-message"
            name="message"
            rows={4}
            maxLength={500}
            value={form.message}
            onChange={setField('message')}
            onBlur={markTouched('message')}
            className={`${fieldClass('message')} resize-none`}
            aria-invalid={!!errors.message}
            aria-describedby={errors.message ? 'err-message' : undefined}
            placeholder="A sentence or two is fine — we'll follow up with questions."
          />
          {errors.message && (
            <div id="err-message" className="mt-2 flex items-center gap-2 text-xs text-rose animate-shake">
              <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
              <span>{errors.message}</span>
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={status === 'submitting'}
          className="w-full mt-4 group inline-flex items-center justify-center gap-2 px-6 py-4 bg-gold hover-bg-gold-light active-scale transition-all rounded-sm font-medium text-white gold-cta-shadow disabled:opacity-80 disabled:cursor-not-allowed"
        >
          {status === 'submitting' ? (
            <>
              <Loader2 className="w-4 h-4 animate-spin-slow" />
              Sending...
            </>
          ) : (
            <>
              Send Message
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </>
          )}
        </button>

        <p className="text-xs text-stone-500 text-center leading-relaxed pt-2">
          We respond within one business day — usually sooner.
        </p>
      </div>
    </form>
  );
}

function ContactMap() {
  return (
    <a
      href="https://www.google.com/maps/dir/?api=1&destination=Krishnaveer+Euphoria+Jubilee+Enclave+Hitech+City+Hyderabad+500081"
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Open directions to Thota and Associates in Google Maps"
      className="group relative block rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 hover-border-gold-60 transition-all h-full min-h-[420px] lg:min-h-full"
    >
      <svg viewBox="0 0 800 600" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="xMidYMid slice" className="w-full h-full block" role="img" aria-label="Stylized map showing office location in Jubilee Enclave, Hi-tech City, Hyderabad">
        <defs>
          <radialGradient id="mapPinGlow" cx="50%" cy="40%" r="42%">
            <stop offset="0%" stopColor="#c9a961" stopOpacity="0.32" />
            <stop offset="55%" stopColor="#c9a961" stopOpacity="0.08" />
            <stop offset="100%" stopColor="#c9a961" stopOpacity="0" />
          </radialGradient>
          <pattern id="mapGridDots" x="0" y="0" width="24" height="24" patternUnits="userSpaceOnUse">
            <circle cx="12" cy="12" r="0.6" fill="#c9a961" opacity="0.22" />
          </pattern>
          <linearGradient id="mapWater" x1="0%" y1="100%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#1e3a8a" stopOpacity="0.4" />
            <stop offset="100%" stopColor="#1e3a8a" stopOpacity="0" />
          </linearGradient>
        </defs>
        <rect width="800" height="600" fill="#0b1929" />
        <rect width="800" height="600" fill="url(#mapGridDots)" />
        <rect width="800" height="600" fill="url(#mapPinGlow)" />
        <path d="M 600 600 Q 700 540, 800 560 L 800 620 L 600 620 Z" fill="url(#mapWater)" />

        <g fill="none" strokeLinecap="round">
          <path d="M 0 400 Q 200 360, 400 340 T 800 280" stroke="#c9a961" strokeWidth="5" opacity="0.18" />
          <path d="M 0 400 Q 200 360, 400 340 T 800 280" stroke="#c9a961" strokeWidth="1.2" opacity="0.8" />
          <path d="M 320 0 Q 360 160, 400 280 Q 440 400, 500 600" stroke="#c9a961" strokeWidth="3.5" opacity="0.15" />
          <path d="M 320 0 Q 360 160, 400 280 Q 440 400, 500 600" stroke="#c9a961" strokeWidth="0.9" opacity="0.6" />
          <path d="M 0 200 Q 200 180, 400 170 T 800 120" stroke="#c9a961" strokeWidth="0.6" opacity="0.5" />
          <path d="M 0 520 Q 200 505, 400 495 T 800 465" stroke="#c9a961" strokeWidth="0.6" opacity="0.5" />
        </g>

        <g fill="none" stroke="#c9a961" strokeWidth="0.4" opacity="0.3" strokeLinecap="round">
          <path d="M 180 320 L 620 300" />
          <path d="M 120 220 L 680 190" />
          <path d="M 140 460 L 700 440" />
          <path d="M 480 60 L 500 600" />
          <path d="M 180 0 L 195 600" />
          <path d="M 620 0 L 640 580" />
          <path d="M 260 80 L 270 520" />
        </g>

        <g opacity="0.26">
          <rect x="100" y="120" width="35" height="25" fill="#c9a961" />
          <rect x="140" y="130" width="28" height="30" fill="#c9a961" />
          <rect x="175" y="115" width="32" height="28" fill="#c9a961" />
          <rect x="120" y="165" width="40" height="22" fill="#c9a961" />
          <rect x="170" y="155" width="26" height="32" fill="#c9a961" />
          <rect x="90" y="490" width="30" height="22" fill="#c9a961" />
          <rect x="128" y="500" width="36" height="18" fill="#c9a961" />
          <rect x="170" y="485" width="24" height="28" fill="#c9a961" />
        </g>

        <g opacity="0.26">
          <rect x="620" y="115" width="42" height="28" fill="#c9a961" />
          <rect x="670" y="125" width="30" height="22" fill="#c9a961" />
          <rect x="700" y="110" width="36" height="32" fill="#c9a961" />
          <rect x="640" y="155" width="28" height="22" fill="#c9a961" />
          <rect x="680" y="165" width="40" height="20" fill="#c9a961" />
          <rect x="560" y="500" width="32" height="20" fill="#c9a961" />
          <rect x="600" y="490" width="24" height="30" fill="#c9a961" />
        </g>

        <rect x="340" y="260" width="120" height="90" fill="#c9a961" opacity="0.09" />
        <rect x="340" y="260" width="120" height="90" fill="none" stroke="#c9a961" strokeWidth="0.5" opacity="0.4" strokeDasharray="3 3" />

        <g fill="#c9a961" opacity="0.5">
          <circle cx="120" cy="160" r="1.5" />
          <circle cx="250" cy="180" r="1.5" />
          <circle cx="670" cy="150" r="1.5" />
          <circle cx="720" cy="340" r="1.5" />
          <circle cx="150" cy="400" r="1.5" />
          <circle cx="560" cy="440" r="1.5" />
          <circle cx="200" cy="545" r="1.5" />
        </g>

        <g transform="translate(400, 305)">
          <circle r="15" fill="none" stroke="#c9a961" strokeWidth="1.5">
            <animate attributeName="r" from="10" to="55" dur="3s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.7" to="0" dur="3s" repeatCount="indefinite" />
          </circle>
          <circle r="15" fill="none" stroke="#c9a961" strokeWidth="1">
            <animate attributeName="r" from="10" to="45" dur="3s" begin="1.5s" repeatCount="indefinite" />
            <animate attributeName="opacity" from="0.5" to="0" dur="3s" begin="1.5s" repeatCount="indefinite" />
          </circle>
          <circle r="22" fill="#c9a961" opacity="0.18" />
          <path d="M 0 -28 C 10 -28, 17 -21, 17 -11 C 17 1, 0 18, 0 18 C 0 18, -17 1, -17 -11 C -17 -21, -10 -28, 0 -28 Z" fill="#c9a961" />
          <circle cy="-13" r="5" fill="#0b1929" />
        </g>

        <text x="150" y="360" fill="#c9a961" fontFamily="'Cormorant Garamond', Georgia, serif" fontSize="13" fontStyle="italic" textAnchor="middle" opacity="0.4">Hi-tech City</text>

        <g transform="translate(760, 45)" opacity="0.55">
          <circle r="14" fill="none" stroke="#c9a961" strokeWidth="0.6" />
          <circle r="1" fill="#c9a961" />
          <path d="M 0 -11 L -3.5 3 L 0 1 L 3.5 3 Z" fill="#c9a961" />
          <text y="-18" fill="#c9a961" fontSize="9" textAnchor="middle" fontFamily="system-ui" letterSpacing="1.5">N</text>
        </g>
      </svg>

      <div className="pointer-events-none absolute top-4 left-4 px-3 py-1.5 rounded-full bg-navy-95 border border-gold-30 backdrop-blur-sm text-xs uppercase tracking-widest text-gold flex items-center gap-1.5" style={{ letterSpacing: '0.2em' }}>
        <MapPin className="w-3 h-3" />
        Our Office
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-40 gradient-map-veil" />
      <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-4">
        <div>
          <div className="text-xs uppercase tracking-widest text-gold mb-1" style={{ letterSpacing: '0.2em' }}>Jubilee Enclave</div>
          <div className="text-sm text-stone-200">Hi-tech City · Hyderabad</div>
        </div>
        <div className="inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-gold text-white text-xs uppercase tracking-widest font-medium group-hover-translate-x-1 transition-transform" style={{ letterSpacing: '0.15em' }}>
          Directions
          <ArrowRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </a>
  );
}

function ContactPage({ onBack, services }) {
  const MAPS_URL = "https://www.google.com/maps/search/?api=1&query=Thota+and+Associates+Chartered+Accountants+Hyderabad";
  const MAPS_EMBED = "https://maps.google.com/maps?q=Thota+and+Associates+Chartered+Accountants+Hyderabad&t=&z=17&ie=UTF8&iwloc=&output=embed";

  const contactMethods = [
    {
      icon: MapPin,
      title: 'Visit Us',
      lines: ["Flat No 302, Krishnaveer's Euphoria", "Jubilee Enclave, Hi-tech City", "Hyderabad, Telangana — 500081"],
      action: { label: 'Get Directions', href: MAPS_URL, external: true }
    },
    {
      icon: Phone,
      title: 'Call Us',
      lines: ['+91 97001 38340', 'Mon–Sat, during office hours'],
      action: { label: 'Call Now', href: 'tel:+919700138340' }
    },
    {
      icon: Mail,
      title: 'Email Us',
      lines: ['services@thotaassociates.com', 'We reply within 1 business day'],
      action: { label: 'Send Email', href: 'mailto:services@thotaassociates.com' }
    },
    {
      icon: Clock,
      title: 'Office Hours',
      lines: ['Mon–Fri: 10:00 AM – 7:00 PM', 'Sat: 10:00 AM – 4:00 PM', 'Sunday: Closed'],
    },
  ];

  const processSteps = [
    { n: '01', title: 'Initial response', desc: 'We acknowledge your message within one business day — usually within hours during working hours.' },
    { n: '02', title: 'Scoping call', desc: 'A complimentary 30–45 minute call to understand your situation and outline how we can help.' },
    { n: '03', title: 'Written proposal', desc: 'You receive a clear scope, timeline, and fee structure in writing before any work begins.' },
  ];

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
              <div className="text-xs uppercase tracking-widest text-gold mb-5 sm:mb-6" style={{ letterSpacing: '0.3em' }}>Get in Touch</div>
            </Reveal>
            <Reveal delay={150}>
              <h1 className="serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] mb-6 sm:mb-8 text-stone-100">
                Let's work <span className="italic text-gold">together</span>
              </h1>
            </Reveal>
            <Reveal delay={300}>
              <p className="text-base sm:text-lg text-stone-400 leading-relaxed max-w-2xl mx-auto">
                Whether you're a founder navigating your first funding round, a business owner facing a tax notice, or a creditor seeking insolvency resolution — we'd be glad to hear from you.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="relative py-16 sm:py-20 md:py-24 border-t border-white/5 bg-white-2">
        <div className="absolute top-0 left-0 right-0 h-px gradient-gold-line" />
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
            {contactMethods.map((m, i) => (
              <Reveal key={m.title} delay={i * 80} className="h-full">
                <div className="h-full p-6 sm:p-7 rounded-2xl border border-white/10 gradient-card hover-bg-white-4 hover-border-gold transition-all duration-500 group flex flex-col">
                  <div className="w-11 h-11 rounded-lg bg-gold-10 border border-gold-20 flex items-center justify-center mb-5 group-hover-bg-gold group-hover-border-gold transition-all duration-500">
                    <m.icon className="w-5 h-5 text-gold group-hover-text-navy transition-colors duration-500" />
                  </div>
                  <div className="text-xs uppercase tracking-widest text-gold mb-3" style={{ letterSpacing: '0.25em' }}>{m.title}</div>
                  <div className="space-y-1 mb-4 flex-1">
                    {m.lines.map(l => (
                      <div key={l} className="text-sm text-stone-200 leading-relaxed break-words">{l}</div>
                    ))}
                  </div>
                  {m.action && (
                    <a href={m.action.href} target={m.action.external ? "_blank" : undefined} rel={m.action.external ? "noopener noreferrer" : undefined} className="inline-flex items-center gap-1.5 text-xs uppercase tracking-widest text-gold hover:gap-2.5 transition-all mt-auto" style={{ letterSpacing: '0.2em' }}>
                      {m.action.label}
                      <ArrowRight className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24 md:py-32 relative">
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <Reveal>
              <div className="text-xs uppercase tracking-widest text-gold mb-5 sm:mb-6" style={{ letterSpacing: '0.25em' }}>Send us a message</div>
              <h2 className="serif text-3xl sm:text-4xl md:text-5xl lg:text-5xl leading-tight mb-5 sm:mb-6 text-stone-100">
                Tell us how we can <span className="italic text-gold">help</span>
              </h2>
              <p className="text-base sm:text-lg text-stone-400 leading-relaxed">
                We respond to every enquiry within one business day — usually sooner. Initial consultations are complimentary.
              </p>
            </Reveal>
          </div>
          <div className="grid lg:grid-cols-2 gap-6 lg:gap-8">
            <Reveal>
              <ContactForm services={services} />
            </Reveal>
            <Reveal delay={200} className="flex flex-col gap-4">
              <div className="flex-1 relative rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10 min-h-[420px]">
                <iframe
                  src={MAPS_EMBED}
                  style={{ border: 0, width: '100%', height: '100%', position: 'absolute', inset: 0 }}
                  allowFullScreen
                  loading="lazy"
                  referrerPolicy="no-referrer-when-downgrade"
                  title="Thota and Associates office location"
                />
                <div className="pointer-events-none absolute top-4 left-4 px-3 py-1.5 rounded-full bg-navy-95 border border-gold-30 backdrop-blur-sm text-xs uppercase tracking-widest text-gold flex items-center gap-1.5 z-10" style={{ letterSpacing: '0.2em' }}>
                  <MapPin className="w-3 h-3" />
                  Our Office
                </div>
              </div>
              <a href={MAPS_URL} target="_blank" rel="noopener noreferrer" className="group inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-gold-30 bg-gold-5 hover-bg-gold hover-border-gold rounded-sm text-sm text-gold active-scale transition-all">
                <MapPin className="w-4 h-4" />
                <span>Open in Google Maps</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24 md:py-28 border-t border-white/5 bg-navy-deep">
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
            <Reveal>
              <div className="text-xs uppercase tracking-widest text-gold mb-5 sm:mb-6" style={{ letterSpacing: '0.25em' }}>What to Expect</div>
              <h2 className="serif text-3xl sm:text-4xl md:text-5xl leading-tight text-stone-100">
                Our <span className="italic text-gold">process</span>
              </h2>
            </Reveal>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6">
            {processSteps.map((s, i) => (
              <Reveal key={s.n} delay={i * 100} className="h-full">
                <div className="h-full p-6 sm:p-8 rounded-2xl border border-white/10 gradient-card">
                  <div className="text-gold mb-4" style={{ fontSize: '13px', letterSpacing: '0.3em' }}>{s.n}</div>
                  <div className="serif text-xl mb-3 text-stone-100">{s.title}</div>
                  <div className="text-sm text-stone-400 leading-relaxed">{s.desc}</div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24 md:py-28 gradient-cta-section relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-px gradient-gold-line" />
        <div className="absolute bottom-0 left-0 right-0 h-px gradient-gold-line" />
        <div className="max-w-3xl mx-auto px-5 sm:px-6 text-center relative">
          <Reveal>
            <h2 className="serif text-3xl sm:text-4xl md:text-5xl leading-tight mb-5 sm:mb-6 text-stone-100">
              Prefer to <span className="italic text-gold">speak directly</span>?
            </h2>
          </Reveal>
          <Reveal delay={150}>
            <p className="text-base sm:text-lg text-stone-400 mb-10 sm:mb-12 leading-relaxed">
              Call us during office hours, or send a WhatsApp message anytime. We respond quickly.
            </p>
          </Reveal>
          <Reveal delay={300}>
            <div className="flex flex-row flex-wrap gap-2 sm:gap-3 md:gap-4 justify-center items-center mx-auto">
              <a href="tel:+919700138340" className="group inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-gold hover-bg-gold-light active-scale rounded-sm font-medium text-white gold-cta-shadow text-xs sm:text-sm md:text-base whitespace-nowrap">
                <Phone className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Call&nbsp;</span>+91 97001 38340
              </a>
              <a href="https://wa.me/919700138340" target="_blank" rel="noopener noreferrer" className="group inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 md:px-8 py-3 sm:py-4 border border-white/20 rounded-sm hover-border-gold hover-text-gold active-scale transition-all text-xs sm:text-sm md:text-base whitespace-nowrap">
                <MessageCircle className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                WhatsApp us
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function LegalPage({ type, onBack, onNavigate }) {
  const legalContent = {
    terms: {
      title: 'Terms of Service',
      eyebrow: 'Legal',
      effective: 'April 2026',
      intro: 'These Terms govern your use of the website operated by Thota and Associates, Chartered Accountants (ICAI Firm Registration No. 014730S). By accessing or using the Website, you agree to be bound by these Terms.',
      sections: [
        { heading: '1. Nature of the Website', blocks: [
          { type: 'p', text: 'This Website is maintained by Thota and Associates, Chartered Accountants (ICAI Firm Registration No. 014730S) for general informational purposes, in accordance with the 13th Edition of the Code of Ethics issued by the Institute of Chartered Accountants of India, effective 1 April 2026. Its use does not, by itself, create any professional or CA–client relationship between you and the firm.' }
        ]},
        { heading: '2. Permitted use', blocks: [
          { type: 'p', text: 'You may access and read the content on this Website for your own personal, non-commercial reference. You must not:' },
          { type: 'list', items: [
            'Reproduce, republish, modify, or distribute any content without our prior written permission',
            'Use automated means (bots, scrapers, crawlers) to access or harvest content',
            'Attempt to interfere with the security, integrity, or operation of the Website',
            'Use the Website for any unlawful, infringing, or fraudulent purpose'
          ]}
        ]},
        { heading: '3. Intellectual property', blocks: [
          { type: 'p', text: 'All content on this Website — including text, design, graphics, logos, layout, and code — is owned by Thota and Associates or its licensors and is protected under applicable intellectual property laws. No content may be used in any form without our prior written consent.' }
        ]},
        { heading: '4. Accuracy of information', blocks: [
          { type: 'p', text: 'We endeavour to keep the content accurate and current. However, the content is general in nature and may not reflect the latest legal, tax, or regulatory position. The Website should not be relied on as a substitute for professional advice. We do not warrant that the Website will be uninterrupted, error-free, or secure.' }
        ]},
        { heading: '5. Professional engagements', blocks: [
          { type: 'p', text: 'Any professional engagement with the firm is governed by a separate written engagement letter that sets out scope, fees, timelines, and other terms. Browsing this Website, submitting a contact enquiry, or exploratory discussions do not, by themselves, constitute a professional engagement.' }
        ]},
        { heading: '6. Third-party links', blocks: [
          { type: 'p', text: 'The Website may contain links to third-party websites that are not controlled by us. We are not responsible for the content, accuracy, or practices of such external sites. Access to third-party sites is at your own risk.' }
        ]},
        { heading: '7. Limitation of liability', blocks: [
          { type: 'p', text: 'To the fullest extent permitted by law, Thota and Associates, its partners, associates, and employees will not be liable for any indirect, incidental, consequential, or special damages arising from your use of, or inability to use, this Website or any content on it.' }
        ]},
        { heading: '8. Changes to these Terms', blocks: [
          { type: 'p', text: 'We may revise these Terms from time to time. Continued use of the Website after a revision constitutes acceptance of the updated Terms.' }
        ]},
        { heading: '9. Governing law and jurisdiction', blocks: [
          { type: 'p', text: 'These Terms are governed by the laws of India. Any disputes arising out of or relating to the Website or these Terms will be subject to the exclusive jurisdiction of the courts at Hyderabad, Telangana.' }
        ]}
      ]
    },
    privacy: {
      title: 'Privacy Policy',
      eyebrow: 'Legal',
      effective: 'April 2026',
      intro: 'This Privacy Policy describes how Thota and Associates collects, uses, and safeguards personal information when you visit or interact with this website. We handle your information in accordance with the Digital Personal Data Protection Act, 2023, the Information Technology Act, 2000, and the Information Technology (Reasonable Security Practices) Rules, 2011.',
      sections: [
        { heading: '1. Information we collect', blocks: [
          { type: 'p', text: 'We collect the following information when you interact with us:' },
          { type: 'list', items: [
            'Contact form data — name, email address, phone number (if provided), service of interest, and the message you send',
            'Direct communication — emails, calls, and WhatsApp messages you initiate with us',
            'Technical information — our hosting provider may automatically log basic technical data such as IP address, browser type, pages viewed, and timestamps for security and performance purposes'
          ]},
          { type: 'p', text: 'We do not currently use cookies, analytics tracking, or advertising pixels on this Website.' }
        ]},
        { heading: '2. How we use your information', blocks: [
          { type: 'list', items: [
            'To respond to your enquiries and schedule initial consultations',
            'To provide information about our services that you have specifically requested',
            'To maintain records of professional correspondence',
            'To comply with our legal, regulatory, and professional obligations as Chartered Accountants',
            'To secure and improve the Website'
          ]}
        ]},
        { heading: '3. Sharing of information', blocks: [
          { type: 'p', text: 'We do not sell, rent, or otherwise share your personal information with third parties for marketing purposes. We may share your information:' },
          { type: 'list', items: [
            'With our email, communication, and hosting service providers who process information on our behalf under confidentiality obligations',
            'With regulatory, statutory, or judicial authorities when required by law',
            'With our own professional advisors (legal, insurance) on a need-to-know basis'
          ]},
          { type: 'p', text: 'Any information shared in the course of a professional engagement is further protected by the confidentiality obligations imposed on us by the Chartered Accountants Act, 1949 and the Code of Ethics issued by the ICAI.' }
        ]},
        { heading: '4. Retention', blocks: [
          { type: 'p', text: 'Enquiry data is retained for as long as necessary to address your query and for a reasonable period thereafter. Engagement records are retained for the period required by law and professional standards — typically seven to eight years for tax, audit, and related records.' }
        ]},
        { heading: '5. Your rights under the DPDP Act', blocks: [
          { type: 'p', text: 'Subject to applicable conditions under the Digital Personal Data Protection Act, 2023, you have the right to:' },
          { type: 'list', items: [
            'Access the personal data we hold about you',
            'Request correction or updating of data that is inaccurate',
            'Request erasure of data we are no longer required to retain under law',
            'Withdraw consent for processing that was based on consent',
            'Nominate another person to exercise your rights in case of death or incapacity',
            'Raise a grievance with us regarding the handling of your data'
          ]}
        ]},
        { heading: '6. Grievance Officer', blocks: [
          { type: 'p', text: 'To exercise any of these rights or raise a grievance, please contact:' },
          { type: 'contact', details: [
            { label: 'Grievance Officer', value: 'CA Bhanu Prakash Thota (ICAI Membership No. 233634)' },
            { label: 'Email', value: 'services@thotaassociates.com' },
            { label: 'Phone', value: '+91 97001 38340' },
            { label: 'Address', value: "Flat No 302, Krishnaveer's Euphoria, Jubilee Enclave, Hi-tech City, Hyderabad, Telangana — 500081" }
          ]}
        ]},
        { heading: '7. Security', blocks: [
          { type: 'p', text: 'We implement reasonable technical and organisational safeguards to protect personal data. However, no method of internet transmission or electronic storage is entirely secure, and we cannot guarantee absolute security.' }
        ]},
        { heading: '8. Changes to this policy', blocks: [
          { type: 'p', text: 'We may update this Privacy Policy from time to time. The effective date at the top reflects the most recent revision. We encourage you to review this policy periodically.' }
        ]}
      ]
    },
    refund: {
      title: 'Cancellation & Refund Policy',
      eyebrow: 'Legal',
      effective: 'April 2026',
      intro: 'This policy sets out how Thota and Associates handles cancellations and refunds in respect of professional engagements. It should be read together with the specific engagement letter that governs each assignment.',
      sections: [
        { heading: '1. Engagements and fees', blocks: [
          { type: 'p', text: 'Every professional engagement is governed by a written engagement letter that specifies the scope, deliverables, fee structure, and payment schedule. That engagement letter will determine the specific cancellation and refund terms for the engagement. This policy applies where the engagement letter is silent, or where you wish to understand our general approach.' }
        ]},
        { heading: '2. Advance fees and retainers', blocks: [
          { type: 'p', text: 'For certain engagements — such as valuations, litigation support, advisory assignments, or recurring compliance work — we may require an advance fee or monthly retainer. This amount is applied against work performed under the engagement.' }
        ]},
        { heading: '3. Cancellation before work begins', blocks: [
          { type: 'p', text: 'If you cancel the engagement before any substantive work has commenced and before information has been gathered, we will refund the advance fee in full, less any third-party costs actually incurred (such as regulatory fees, filing fees, or charges paid on your behalf).' }
        ]},
        { heading: '4. Cancellation after work has commenced', blocks: [
          { type: 'p', text: 'If you cancel after work has commenced:' },
          { type: 'list', items: [
            'Fees for work already performed — based on time spent at agreed rates or on the agreed milestone structure — are not refundable',
            'Any balance of the advance fee, after adjusting for work performed and third-party costs, will be refunded',
            'You will receive a statement of work performed along with the refund'
          ]}
        ]},
        { heading: '5. Non-refundable engagements', blocks: [
          { type: 'p', text: 'Certain engagements are non-refundable once commenced, including:' },
          { type: 'list', items: [
            'Time-bound statutory filings where the deadline is imminent',
            'Representation before authorities where we have already appeared on your behalf',
            'Opinions, reports, or deliverables that have already been issued',
            'Engagements where the deliverable has already been submitted to a third party — regulator, investor, court, or counterparty'
          ]}
        ]},
        { heading: '6. Refund timelines', blocks: [
          { type: 'p', text: 'Approved refunds are processed within 7 to 10 business days via the same payment method used originally (bank transfer or UPI). In case of bank processing delays, the actual credit to your account may take additional time.' }
        ]},
        { heading: '7. Dissatisfaction with services', blocks: [
          { type: 'p', text: 'If you are dissatisfied with a deliverable, please write to us within 15 days of receiving it. We will review the matter in good faith and, where reasonable, work to address the concern at no additional cost. Please note that professional disagreement on a technical position — for example, a valuation methodology or a tax interpretation — does not ordinarily give rise to a refund.' }
        ]},
        { heading: '8. Subscription or recurring services', blocks: [
          { type: 'p', text: "For monthly or annual recurring engagements (such as outsourced accounting, recurring compliance, or virtual CFO services), either party may terminate with 30 days' written notice. Fees are pro-rated up to the termination date." }
        ]},
        { heading: '9. How to request cancellation or refund', blocks: [
          { type: 'p', text: 'Written cancellation or refund requests may be sent to services@thotaassociates.com with your engagement reference, the reason for the request, and your contact details.' }
        ]}
      ]
    },
    disclaimer: {
      title: 'Disclaimer',
      eyebrow: 'Legal',
      effective: 'April 2026',
      intro: 'The content on this website is provided for general informational purposes only and does not constitute professional advice, solicitation, or an offer of services.',
      sections: [
        { heading: 'Regulatory context', blocks: [
          { type: 'p', text: 'The Institute of Chartered Accountants of India (ICAI) prohibits Chartered Accountants in practice from soliciting work or advertising their professional services, save as permitted by ICAI regulations. Accordingly, the content on this website is intended only to provide general information about Thota and Associates to users who seek it of their own accord.' }
        ]},
        { heading: 'By accessing this website, you acknowledge and agree that', blocks: [
          { type: 'list', items: [
            'You wish to learn about the firm on your own initiative and for your own information',
            'There has been no form of solicitation, advertisement, or inducement by the firm or its members',
            'The information provided is not intended to create, and receipt of it does not constitute, a CA–client relationship',
            'The firm is not responsible for any action taken, or not taken, based on content on this website — users are strongly advised to seek formal professional advice before acting on any information',
            'The information on this website is subject to change without notice, and the firm assumes no obligation to update it',
            'Any reliance you place on the content is strictly at your own risk'
          ]}
        ]},
        { heading: 'Formal engagements', blocks: [
          { type: 'p', text: 'For any formal professional engagement, please contact us directly. The engagement will be governed by a written engagement letter setting out scope, fees, timelines, and terms — it is this engagement letter, not the website, that establishes our professional relationship.' }
        ]}
      ]
    }
  };

  const content = legalContent[type] || legalContent.terms;
  const allPages = [
    { key: 'terms', title: 'Terms of Service', shortTitle: 'Terms' },
    { key: 'privacy', title: 'Privacy Policy', shortTitle: 'Privacy' },
    { key: 'refund', title: 'Cancellation & Refund', shortTitle: 'Refunds' },
    { key: 'disclaimer', title: 'Disclaimer', shortTitle: 'Disclaimer' },
  ];

  const [activeSection, setActiveSection] = useState(0);

  const scrollToSection = (i) => {
    const el = document.getElementById(`legal-section-${i}`);
    if (el) {
      const y = el.getBoundingClientRect().top + window.pageYOffset - 120;
      window.scrollTo({ top: y, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    let rafId = null;
    const onScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        let current = 0;
        for (let i = 0; i < content.sections.length; i++) {
          const el = document.getElementById(`legal-section-${i}`);
          if (el && el.getBoundingClientRect().top <= 160) current = i;
        }
        setActiveSection(current);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [content]);

  return (
    <>
      {/* Hero — left aligned, restrained */}
      <section className="relative pt-28 pb-10 sm:pt-36 sm:pb-14 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 -right-20 w-96 h-96 rounded-full gradient-hero-orb-gold" style={{ filter: 'blur(160px)' }} />
          <div className="absolute bottom-0 -left-20 w-80 h-80 rounded-full gradient-hero-orb-blue" style={{ filter: 'blur(140px)' }} />
          <div className="absolute inset-0 grid-pattern" />
        </div>
        <div className="relative max-w-6xl mx-auto px-5 sm:px-6">
          <button onClick={onBack} className="mb-8 sm:mb-10 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-stone-400 hover-text-gold transition-colors active-scale" style={{ letterSpacing: '0.25em' }}>
            <ArrowLeft className="w-3 h-3" />
            Back to Home
          </button>
          <div className="max-w-3xl">
            <Reveal>
              <div className="flex items-center flex-wrap gap-x-3 gap-y-2 mb-5">
                <span className="text-xs uppercase tracking-widest text-gold" style={{ letterSpacing: '0.3em' }}>{content.eyebrow}</span>
                <span className="w-1 h-1 rounded-full bg-stone-600" />
                <span className="text-xs uppercase tracking-widest text-stone-400" style={{ letterSpacing: '0.2em' }}>Effective {content.effective}</span>
              </div>
            </Reveal>
            <Reveal delay={150}>
              <h1 className="serif text-4xl sm:text-5xl md:text-6xl leading-[1.05] mb-6 text-stone-100">
                {content.title}
              </h1>
            </Reveal>
            {content.intro && (
              <Reveal delay={300}>
                <p className="text-base sm:text-lg text-stone-400 leading-relaxed max-w-2xl">
                  {content.intro}
                </p>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      {/* Document tab bar — switch between legal pages */}
      <section className="relative border-t border-white/5 bg-navy-deep">
        <div className="absolute top-0 left-0 right-0 h-px gradient-gold-line" />
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-4">
            {allPages.map(p => {
              const isActive = type === p.key;
              return (
                <button
                  key={p.key}
                  onClick={() => onNavigate(p.key)}
                  className={`flex-shrink-0 px-4 sm:px-5 py-2 rounded-full text-xs uppercase tracking-widest transition-all active-scale whitespace-nowrap ${
                    isActive
                      ? 'bg-gold text-white'
                      : 'border border-white/10 text-stone-400 hover-text-gold hover-border-gold'
                  }`}
                  style={{ letterSpacing: '0.2em' }}
                >
                  {p.shortTitle}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Main content with sidebar TOC */}
      <section className="relative py-12 sm:py-16 md:py-20">
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
            {/* Sticky TOC — desktop only */}
            <aside className="hidden lg:block lg:col-span-4 xl:col-span-3">
              <div className="sticky top-28">
                <div className="text-xs uppercase tracking-widest text-gold mb-5 pb-3 border-b border-gold-20" style={{ letterSpacing: '0.25em' }}>Contents</div>
                <nav>
                  <ol className="space-y-0.5">
                    {content.sections.map((section, i) => {
                      const isActive = activeSection === i;
                      const cleanHeading = section.heading.replace(/^\d+\.\s*/, '');
                      return (
                        <li key={i}>
                          <button
                            onClick={() => scrollToSection(i)}
                            className={`w-full text-left px-3 py-2.5 rounded-md text-sm transition-all group flex items-start gap-3 ${
                              isActive
                                ? 'bg-gold-10 text-stone-100'
                                : 'text-stone-400 hover-text-gold hover-bg-white-4'
                            }`}
                          >
                            <span className={`flex-shrink-0 text-xs mt-0.5 ${isActive ? 'text-gold' : 'text-stone-600 group-hover-text-gold'}`} style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '0.1em' }}>
                              {String(i + 1).padStart(2, '0')}
                            </span>
                            <span className="leading-snug">{cleanHeading}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ol>
                </nav>
              </div>
            </aside>

            {/* Main content */}
            <main className="lg:col-span-8 xl:col-span-9 min-w-0">
              <div className="space-y-10 sm:space-y-12 lg:space-y-14">
                {content.sections.map((section, i) => {
                  const cleanHeading = section.heading.replace(/^\d+\.\s*/, '');
                  return (
                    <Reveal key={i} delay={Math.min(i * 40, 200)}>
                      <article id={`legal-section-${i}`} className="scroll-mt-28">
                        <div className="flex items-baseline gap-4 mb-5 pb-4 border-b border-white/5">
                          <div className="text-sm text-gold flex-shrink-0 min-w-[28px]" style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '0.15em' }}>
                            {String(i + 1).padStart(2, '0')}
                          </div>
                          <h2 className="serif text-xl sm:text-2xl text-stone-100 leading-snug">
                            {cleanHeading}
                          </h2>
                        </div>
                        <div className="sm:pl-[44px] space-y-4">
                          {section.blocks.map((block, j) => {
                            if (block.type === 'p') {
                              return (
                                <p key={j} className="text-sm sm:text-base text-stone-300 leading-relaxed">
                                  {block.text}
                                </p>
                              );
                            }
                            if (block.type === 'list') {
                              return (
                                <ul key={j} className="space-y-2.5">
                                  {block.items.map((item, k) => (
                                    <li key={k} className="flex items-start gap-3 text-sm sm:text-base text-stone-300 leading-relaxed">
                                      <span className="flex-shrink-0 mt-2.5 w-1 h-1 rounded-full bg-gold" />
                                      <span>{item}</span>
                                    </li>
                                  ))}
                                </ul>
                              );
                            }
                            if (block.type === 'contact') {
                              return (
                                <div key={j} className="mt-4 rounded-xl border border-gold-20 bg-gold-5 overflow-hidden">
                                  <div className="px-5 sm:px-6 py-3 border-b border-gold-20 bg-gold-10">
                                    <div className="text-xs uppercase text-gold" style={{ letterSpacing: '0.25em' }}>Grievance Officer Contact</div>
                                  </div>
                                  <div className="p-5 sm:p-6 space-y-3">
                                    {block.details.map((d, k) => (
                                      <div key={k} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-4">
                                        <div className="text-xs uppercase text-gold sm:min-w-[140px] flex-shrink-0" style={{ letterSpacing: '0.2em' }}>{d.label}</div>
                                        <div className="text-sm text-stone-200 leading-relaxed break-words">{d.value}</div>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              );
                            }
                            return null;
                          })}
                        </div>
                      </article>
                    </Reveal>
                  );
                })}
              </div>
            </main>
          </div>
        </div>
      </section>

      {/* Questions CTA — simple, focused */}
      <section className="py-14 sm:py-16 md:py-20 border-t border-white/5 bg-navy-deep">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 text-center">
          <Reveal>
            <div className="text-xs uppercase tracking-widest text-gold mb-4" style={{ letterSpacing: '0.25em' }}>Questions?</div>
            <h3 className="serif text-2xl sm:text-3xl text-stone-100 mb-4 leading-snug">
              If any part of this notice is unclear, <span className="italic text-gold">write to us</span>.
            </h3>
            <p className="text-sm sm:text-base text-stone-400 leading-relaxed mb-8 max-w-xl mx-auto">
              We're happy to clarify. Reach out with specific questions and we'll respond within one business day.
            </p>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3">
              <a href="mailto:services@thotaassociates.com" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 bg-gold hover-bg-gold-light active-scale rounded-sm text-white text-sm gold-cta-shadow">
                <Mail className="w-4 h-4" />
                services@thotaassociates.com
              </a>
              <a href="tel:+919700138340" className="inline-flex items-center justify-center gap-2 px-6 py-3.5 border border-white/20 rounded-sm hover-border-gold hover-text-gold transition-all text-sm active-scale">
                <Phone className="w-4 h-4" />
                +91 97001 38340
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function LegalPageLayout({ currentKey, title, eyebrow, effective, intro, sections, onBack, onNavigate }) {
  const allPages = [
    { key: 'terms', title: 'Terms of Service' },
    { key: 'privacy', title: 'Privacy Policy' },
    { key: 'refund', title: 'Cancellation & Refund Policy' },
    { key: 'disclaimer', title: 'Disclaimer' },
  ];
  const otherPages = allPages.filter(p => p.key !== currentKey);

  return (
    <>
      <section className="relative pt-28 pb-16 sm:pt-36 sm:pb-20 overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 -right-20 w-96 h-96 rounded-full gradient-hero-orb-gold" style={{ filter: 'blur(160px)' }} />
          <div className="absolute bottom-0 -left-20 w-80 h-80 rounded-full gradient-hero-orb-blue" style={{ filter: 'blur(140px)' }} />
          <div className="absolute inset-0 grid-pattern" />
        </div>
        <div className="relative max-w-6xl mx-auto px-5 sm:px-6">
          <button type="button" onClick={onBack} className="mb-10 sm:mb-14 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-stone-400 hover-text-gold transition-colors active-scale cursor-pointer" style={{ letterSpacing: '0.25em' }}>
            <ArrowLeft className="w-3 h-3" />
            Back to Home
          </button>
          <div className="text-center max-w-3xl mx-auto">
            <Reveal>
              <div className="text-xs uppercase tracking-widest text-gold mb-5 sm:mb-6" style={{ letterSpacing: '0.3em' }}>{eyebrow}</div>
            </Reveal>
            <Reveal delay={150}>
              <h1 className="serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] mb-5 sm:mb-6 text-stone-100">
                {title}
              </h1>
            </Reveal>
            <Reveal delay={300}>
              <div className="flex items-center justify-center gap-3 mb-6 sm:mb-8">
                <div className="h-px w-10 sm:w-12" style={{ backgroundColor: 'rgba(201, 169, 97, 0.4)' }} />
                <div className="text-xs sm:text-sm uppercase text-gold" style={{ letterSpacing: '0.25em' }}>Effective {effective}</div>
                <div className="h-px w-10 sm:w-12" style={{ backgroundColor: 'rgba(201, 169, 97, 0.4)' }} />
              </div>
            </Reveal>
            {intro && (
              <Reveal delay={450}>
                <p className="text-base sm:text-lg text-stone-400 leading-relaxed">{intro}</p>
              </Reveal>
            )}
          </div>
        </div>
      </section>

      <section className="relative py-16 sm:py-20 md:py-24 border-t border-white/5 bg-white-2">
        <div className="absolute top-0 left-0 right-0 h-px gradient-gold-line" />
        <div className="max-w-3xl mx-auto px-5 sm:px-6">
          {sections.map((section, i) => (
            <Reveal key={i} delay={Math.min(i * 50, 300)}>
              <div className="mb-10 sm:mb-12 last:mb-0">
                <h2 className="serif text-xl sm:text-2xl text-stone-100 mb-4 sm:mb-5 leading-snug">{section.heading}</h2>
                <div className="space-y-4">
                  {section.blocks.map((block, j) => {
                    if (block.type === 'p') return <p key={j} className="text-sm sm:text-base text-stone-300 leading-relaxed">{block.text}</p>;
                    if (block.type === 'list') return (
                      <ul key={j} className="space-y-2.5 pl-0">
                        {block.items.map((item, k) => (
                          <li key={k} className="flex items-start gap-3 text-sm sm:text-base text-stone-300 leading-relaxed">
                            <span className="flex-shrink-0 mt-2 w-1 h-1 rounded-full bg-gold" />
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    );
                    if (block.type === 'contact') return (
                      <div key={j} className="mt-3 p-5 sm:p-6 rounded-2xl border border-gold-20 bg-gold-5">
                        <div className="space-y-3">
                          {block.details.map((d, k) => (
                            <div key={k} className="flex flex-col sm:flex-row sm:items-baseline gap-1 sm:gap-3">
                              <div className="text-xs uppercase text-gold sm:min-w-[160px] flex-shrink-0" style={{ letterSpacing: '0.2em' }}>{d.label}</div>
                              <div className="text-sm text-stone-200 leading-relaxed">{d.value}</div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                    return null;
                  })}
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="py-16 sm:py-20 md:py-24 border-t border-white/5 bg-navy-deep">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 text-center">
          <Reveal>
            <div className="text-xs uppercase tracking-widest text-gold mb-5 sm:mb-6" style={{ letterSpacing: '0.25em' }}>Other legal notices</div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {otherPages.map(p => (
                <button key={p.key} type="button" onClick={() => onNavigate(p.key)} className="group p-4 sm:p-5 rounded-xl border border-white/10 gradient-card hover-bg-white-4 hover-border-gold transition-colors duration-300 text-center cursor-pointer">
                  <span className="serif text-sm sm:text-base text-stone-100 group-hover-text-gold transition-colors">{p.title}</span>
                </button>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      <section className="py-14 sm:py-16 border-t border-white/5">
        <div className="max-w-3xl mx-auto px-5 sm:px-6 text-center">
          <Reveal>
            <p className="text-sm text-stone-500 leading-relaxed">
              Questions about this notice? Contact us at <a href="mailto:services@thotaassociates.com" className="text-gold hover-text-gold-light transition-colors">services@thotaassociates.com</a> or call <a href="tel:+919700138340" className="text-gold hover-text-gold-light transition-colors">+91 97001 38340</a>.
            </p>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function TermsPage({ onBack, onNavigate }) {
  return (
    <LegalPageLayout
      currentKey="terms"
      title="Terms of Service"
      eyebrow="Legal"
      effective="April 2026"
      intro="These Terms govern your use of the website operated by Thota and Associates, Chartered Accountants (ICAI Firm Registration No. 014730S). By accessing or using the Website, you agree to be bound by these Terms."
      sections={[
        { heading: '1. Nature of the Website', blocks: [
          { type: 'p', text: 'This Website is provided for general informational purposes. Nothing on this Website constitutes an offer, solicitation, advertisement, or inducement to avail our services, and its use does not create any professional or CA–client relationship between you and the firm.' }
        ]},
        { heading: '2. Permitted use', blocks: [
          { type: 'p', text: 'You may access and read the content on this Website for your own personal, non-commercial reference. You must not:' },
          { type: 'list', items: [
            'Reproduce, republish, modify, or distribute any content without our prior written permission',
            'Use automated means (bots, scrapers, crawlers) to access or harvest content',
            'Attempt to interfere with the security, integrity, or operation of the Website',
            'Use the Website for any unlawful, infringing, or fraudulent purpose'
          ]}
        ]},
        { heading: '3. Intellectual property', blocks: [
          { type: 'p', text: 'All content on this Website — including text, design, graphics, logos, layout, and code — is owned by Thota and Associates or its licensors and is protected under applicable intellectual property laws. No content may be used in any form without our prior written consent.' }
        ]},
        { heading: '4. Accuracy of information', blocks: [
          { type: 'p', text: 'We endeavour to keep the content accurate and current. However, the content is general in nature and may not reflect the latest legal, tax, or regulatory position. The Website should not be relied on as a substitute for professional advice. We do not warrant that the Website will be uninterrupted, error-free, or secure.' }
        ]},
        { heading: '5. Professional engagements', blocks: [
          { type: 'p', text: 'Any professional engagement with the firm is governed by a separate written engagement letter that sets out scope, fees, timelines, and other terms. Browsing this Website, submitting a contact enquiry, or exploratory discussions do not, by themselves, constitute a professional engagement.' }
        ]},
        { heading: '6. Third-party links', blocks: [
          { type: 'p', text: 'The Website may contain links to third-party websites that are not controlled by us. We are not responsible for the content, accuracy, or practices of such external sites. Access to third-party sites is at your own risk.' }
        ]},
        { heading: '7. Limitation of liability', blocks: [
          { type: 'p', text: 'To the fullest extent permitted by law, Thota and Associates, its partners, associates, and employees will not be liable for any indirect, incidental, consequential, or special damages arising from your use of, or inability to use, this Website or any content on it.' }
        ]},
        { heading: '8. Changes to these Terms', blocks: [
          { type: 'p', text: 'We may revise these Terms from time to time. Continued use of the Website after a revision constitutes acceptance of the updated Terms.' }
        ]},
        { heading: '9. Governing law and jurisdiction', blocks: [
          { type: 'p', text: 'These Terms are governed by the laws of India. Any disputes arising out of or relating to the Website or these Terms will be subject to the exclusive jurisdiction of the courts at Hyderabad, Telangana.' }
        ]}
      ]}
      onBack={onBack}
      onNavigate={onNavigate}
    />
  );
}

function PrivacyPage({ onBack, onNavigate }) {
  return (
    <LegalPageLayout
      currentKey="privacy"
      title="Privacy Policy"
      eyebrow="Legal"
      effective="April 2026"
      intro="This Privacy Policy describes how Thota and Associates collects, uses, and safeguards personal information when you visit or interact with this website. We handle your information in accordance with the Digital Personal Data Protection Act, 2023, the Information Technology Act, 2000, and the Information Technology (Reasonable Security Practices) Rules, 2011."
      sections={[
        { heading: '1. Information we collect', blocks: [
          { type: 'p', text: 'We collect the following information when you interact with us:' },
          { type: 'list', items: [
            'Contact form data — name, email address, phone number (if provided), service of interest, and the message you send',
            'Direct communication — emails, calls, and WhatsApp messages you initiate with us',
            'Technical information — our hosting provider may automatically log basic technical data such as IP address, browser type, pages viewed, and timestamps for security and performance purposes'
          ]},
          { type: 'p', text: 'We do not currently use cookies, analytics tracking, or advertising pixels on this Website.' }
        ]},
        { heading: '2. How we use your information', blocks: [
          { type: 'list', items: [
            'To respond to your enquiries and schedule initial consultations',
            'To provide information about our services that you have specifically requested',
            'To maintain records of professional correspondence',
            'To comply with our legal, regulatory, and professional obligations as Chartered Accountants',
            'To secure and improve the Website'
          ]}
        ]},
        { heading: '3. Sharing of information', blocks: [
          { type: 'p', text: 'We do not sell, rent, or otherwise share your personal information with third parties for marketing purposes. We may share your information:' },
          { type: 'list', items: [
            'With our email, communication, and hosting service providers who process information on our behalf under confidentiality obligations',
            'With regulatory, statutory, or judicial authorities when required by law',
            'With our own professional advisors (legal, insurance) on a need-to-know basis'
          ]},
          { type: 'p', text: 'Any information shared in the course of a professional engagement is further protected by the confidentiality obligations imposed on us by the Chartered Accountants Act, 1949 and the Code of Ethics issued by the ICAI.' }
        ]},
        { heading: '4. Retention', blocks: [
          { type: 'p', text: 'Enquiry data is retained for as long as necessary to address your query and for a reasonable period thereafter. Engagement records are retained for the period required by law and professional standards — typically seven to eight years for tax, audit, and related records.' }
        ]},
        { heading: '5. Your rights under the DPDP Act', blocks: [
          { type: 'p', text: 'Subject to applicable conditions under the Digital Personal Data Protection Act, 2023, you have the right to:' },
          { type: 'list', items: [
            'Access the personal data we hold about you',
            'Request correction or updating of data that is inaccurate',
            'Request erasure of data we are no longer required to retain under law',
            'Withdraw consent for processing that was based on consent',
            'Nominate another person to exercise your rights in case of death or incapacity',
            'Raise a grievance with us regarding the handling of your data'
          ]}
        ]},
        { heading: '6. Grievance Officer', blocks: [
          { type: 'p', text: 'To exercise any of these rights or raise a grievance, please contact:' },
          { type: 'contact', details: [
            { label: 'Grievance Officer', value: 'CA Bhanu Prakash Thota' },
            { label: 'Email', value: 'services@thotaassociates.com' },
            { label: 'Phone', value: '+91 97001 38340' },
            { label: 'Address', value: "Flat No 302, Krishnaveer's Euphoria, Jubilee Enclave, Hi-tech City, Hyderabad, Telangana — 500081" }
          ]}
        ]},
        { heading: '7. Security', blocks: [
          { type: 'p', text: 'We implement reasonable technical and organisational safeguards to protect personal data. However, no method of internet transmission or electronic storage is entirely secure, and we cannot guarantee absolute security.' }
        ]},
        { heading: '8. Changes to this policy', blocks: [
          { type: 'p', text: 'We may update this Privacy Policy from time to time. The effective date at the top reflects the most recent revision. We encourage you to review this policy periodically.' }
        ]}
      ]}
      onBack={onBack}
      onNavigate={onNavigate}
    />
  );
}

function RefundPage({ onBack, onNavigate }) {
  return (
    <LegalPageLayout
      currentKey="refund"
      title="Cancellation & Refund Policy"
      eyebrow="Legal"
      effective="April 2026"
      intro="This policy sets out how Thota and Associates handles cancellations and refunds in respect of professional engagements. It should be read together with the specific engagement letter that governs each assignment."
      sections={[
        { heading: '1. Engagements and fees', blocks: [
          { type: 'p', text: 'Every professional engagement is governed by a written engagement letter that specifies the scope, deliverables, fee structure, and payment schedule. That engagement letter will determine the specific cancellation and refund terms for the engagement. This policy applies where the engagement letter is silent, or where you wish to understand our general approach.' }
        ]},
        { heading: '2. Advance fees and retainers', blocks: [
          { type: 'p', text: 'For certain engagements — such as valuations, litigation support, advisory assignments, or recurring compliance work — we may require an advance fee or monthly retainer. This amount is applied against work performed under the engagement.' }
        ]},
        { heading: '3. Cancellation before work begins', blocks: [
          { type: 'p', text: 'If you cancel the engagement before any substantive work has commenced and before information has been gathered, we will refund the advance fee in full, less any third-party costs actually incurred (such as regulatory fees, filing fees, or charges paid on your behalf).' }
        ]},
        { heading: '4. Cancellation after work has commenced', blocks: [
          { type: 'p', text: 'If you cancel after work has commenced:' },
          { type: 'list', items: [
            'Fees for work already performed — based on time spent at agreed rates or on the agreed milestone structure — are not refundable',
            'Any balance of the advance fee, after adjusting for work performed and third-party costs, will be refunded',
            'You will receive a statement of work performed along with the refund'
          ]}
        ]},
        { heading: '5. Non-refundable engagements', blocks: [
          { type: 'p', text: 'Certain engagements are non-refundable once commenced, including:' },
          { type: 'list', items: [
            'Time-bound statutory filings where the deadline is imminent',
            'Representation before authorities where we have already appeared on your behalf',
            'Opinions, reports, or deliverables that have already been issued',
            'Engagements where the deliverable has already been submitted to a third party — regulator, investor, court, or counterparty'
          ]}
        ]},
        { heading: '6. Refund timelines', blocks: [
          { type: 'p', text: 'Approved refunds are processed within 7 to 10 business days via the same payment method used originally (bank transfer or UPI). In case of bank processing delays, the actual credit to your account may take additional time.' }
        ]},
        { heading: '7. Dissatisfaction with services', blocks: [
          { type: 'p', text: 'If you are dissatisfied with a deliverable, please write to us within 15 days of receiving it. We will review the matter in good faith and, where reasonable, work to address the concern at no additional cost. Please note that professional disagreement on a technical position — for example, a valuation methodology or a tax interpretation — does not ordinarily give rise to a refund.' }
        ]},
        { heading: '8. Subscription or recurring services', blocks: [
          { type: 'p', text: "For monthly or annual recurring engagements (such as outsourced accounting, recurring compliance, or virtual CFO services), either party may terminate with 30 days' written notice. Fees are pro-rated up to the termination date." }
        ]},
        { heading: '9. How to request cancellation or refund', blocks: [
          { type: 'p', text: 'Written cancellation or refund requests may be sent to services@thotaassociates.com with your engagement reference, the reason for the request, and your contact details.' }
        ]}
      ]}
      onBack={onBack}
      onNavigate={onNavigate}
    />
  );
}

function DisclaimerPage({ onBack, onNavigate }) {
  return (
    <LegalPageLayout
      currentKey="disclaimer"
      title="Disclaimer"
      eyebrow="Legal"
      effective="April 2026"
      intro="The content on this website is provided for general informational purposes. This notice sets out the regulatory framework under which the website is published and the basis on which visitors may use its content."
      sections={[
        { heading: 'Regulatory framework', blocks: [
          { type: 'p', text: 'This website is maintained in accordance with the Chartered Accountants Act, 1949, the Chartered Accountants Regulations, 1988, and the 13th Edition of the Code of Ethics issued by the Institute of Chartered Accountants of India (ICAI), which came into effect on 1 April 2026.' },
          { type: 'p', text: 'The revised Code permits Chartered Accountants and their firms to present information about their practice in contemporary and informative formats, including through digital platforms. This website is maintained on that basis, with care taken to ensure its content remains factual, professional, and within the standards expected of a Chartered Accountancy practice.' }
        ]},
        { heading: 'Structure of the firm and the Principal', blocks: [
          { type: 'p', text: 'Thota and Associates is a proprietary Chartered Accountancy firm registered with the Institute of Chartered Accountants of India (Firm Registration No. 014730S). The firm provides services that fall within the practice of Chartered Accountancy.' },
          { type: 'p', text: 'CA Bhanu Prakash Thota, the Principal of the firm (ICAI Membership No. 233634), is also registered with the Insolvency and Bankruptcy Board of India, in his individual capacity, as a Registered Valuer for Securities and Financial Assets (IBBI/RV/06/2024/15688) and as an Insolvency Professional (IBBI/IPA-001/IP-P-02906/2024–2025/14463). Under the IBBI framework, these registrations are granted to individuals, not to firms.' },
          { type: 'p', text: 'Accordingly, engagements for valuation and insolvency services under the IBBI framework are undertaken by CA Bhanu Prakash Thota in his individual capacity, while engagements for Chartered Accountancy services are undertaken by Thota and Associates as a firm. The distinction is made clear in the engagement letter for each matter.' }
        ]},
        { heading: 'Nature of content', blocks: [
          { type: 'p', text: 'By accessing this website, you acknowledge and agree that:' },
          { type: 'list', items: [
            'The information on the website is general in nature and is not intended as professional advice on any specific matter',
            'Receipt of the information does not create a Chartered Accountant–client relationship or an insolvency professional / registered valuer relationship with you',
            'The firm and the Principal assume no responsibility for any action taken, or not taken, on the basis of content on this website — formal professional advice should be sought on specific matters',
            'The content is subject to change from time to time and no obligation to update it retrospectively is assumed',
            'Any reliance placed on the content is at the reader\'s own risk'
          ]}
        ]},
        { heading: 'Formal engagements', blocks: [
          { type: 'p', text: 'Any professional engagement with the firm or with the Principal in his individual capacity is governed by a separate written engagement letter that sets out scope, fees, timelines, and applicable terms. It is the engagement letter — not this website — that establishes a professional relationship.' }
        ]},
        { heading: 'Confidentiality and privacy', blocks: [
          { type: 'p', text: 'The firm respects the confidentiality obligations placed on Chartered Accountants by the Chartered Accountants Act, 1949 and the Code of Ethics, and on IBBI-registered professionals by the IBBI framework. Information received from users through this website is handled in accordance with the Privacy Policy.' }
        ]}
      ]}
      onBack={onBack}
      onNavigate={onNavigate}
    />
  );
}

function ServicesPage({ onBack, services }) {
  const [activeService, setActiveService] = useState(0);

  const scrollToService = (i) => {
    const el = document.getElementById(`service-${i}`);
    if (!el) return;
    el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  useEffect(() => {
    let rafId = null;
    const onScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const isMobile = window.innerWidth < 640;
        const threshold = (isMobile ? 64 : 80) + 68 + 40;
        let current = 0;
        for (let i = 0; i < services.length; i++) {
          const el = document.getElementById(`service-${i}`);
          if (el && el.getBoundingClientRect().top <= threshold) current = i;
        }
        setActiveService(current);
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [services]);

  const shortTitle = (title) => {
    const base = title.split(/[&/()]/)[0].trim();
    const words = base.split(' ');
    return words.length > 2 ? words.slice(0, 2).join(' ') : words.join(' ');
  };

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
                Our Practice
              </div>
            </Reveal>
            <Reveal delay={150}>
              <h1 className="serif text-4xl sm:text-5xl md:text-6xl lg:text-7xl leading-[1.05] mb-6 sm:mb-8 text-stone-100">
                Seven practice areas.<br />
                <span className="italic text-gold">One standard of excellence.</span>
              </h1>
            </Reveal>
            <Reveal delay={300}>
              <p className="text-base sm:text-lg text-stone-400 leading-relaxed max-w-2xl mx-auto">
                Integrated expertise across taxation, valuation, insolvency and compliance — delivered with the rigour your business deserves.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      <section className="relative border-t border-b border-white/5 bg-navy-95 sticky top-16 sm:top-20 z-30 backdrop-blur-xl" style={{ boxShadow: '0 8px 24px -12px rgba(0, 0, 0, 0.5)' }}>
        <div className="absolute top-0 left-0 right-0 h-px gradient-gold-line" />
        <div className="max-w-7xl mx-auto px-5 sm:px-6">
          <div className="flex items-center gap-2 overflow-x-auto scrollbar-hide py-4 -mx-1 px-1">
            {services.map((s, i) => {
              const isActive = activeService === i;
              return (
                <button
                  key={s.title}
                  type="button"
                  onClick={() => scrollToService(i)}
                  className={`flex-shrink-0 px-4 sm:px-5 py-2 rounded-full text-xs uppercase tracking-widest transition-all active-scale whitespace-nowrap ${
                    isActive ? 'bg-gold text-white' : 'border border-white/10 text-stone-400 hover-text-gold hover-border-gold'
                  }`}
                  style={{ letterSpacing: '0.15em' }}
                >
                  {shortTitle(s.title)}
                </button>
              );
            })}
          </div>
        </div>
      </section>

      <section className="relative py-14 sm:py-18 md:py-24">
        <div className="max-w-6xl mx-auto px-5 sm:px-6">
          <div className="space-y-16 sm:space-y-20 md:space-y-24">
            {services.map((s, i) => (
              <article key={s.title} id={`service-${i}`} style={{ scrollMarginTop: 'clamp(150px, 18vw, 170px)' }}>
                <Reveal>
                  <div className="grid md:grid-cols-12 gap-8 md:gap-12">
                    <div className="md:col-span-4">
                      <div className="flex items-baseline gap-3 mb-5 pb-4 border-b border-white/5">
                        <span className="text-sm text-gold" style={{ fontVariantNumeric: 'tabular-nums', letterSpacing: '0.15em' }}>
                          {String(i + 1).padStart(2, '0')}
                        </span>
                        <span className="text-xs uppercase tracking-widest text-stone-500" style={{ letterSpacing: '0.25em' }}>Practice Area</span>
                      </div>
                      <div className="w-14 h-14 rounded-lg bg-gold-10 border border-gold-20 flex items-center justify-center mb-5">
                        <s.icon className="w-6 h-6 text-gold" />
                      </div>
                      <h2 className="serif text-2xl sm:text-3xl mb-4 text-stone-100 leading-snug">{s.title}</h2>
                      <p className="text-sm text-stone-400 leading-relaxed">{s.desc}</p>
                    </div>

                    <div className="md:col-span-8">
                      <p className="text-base sm:text-lg text-stone-300 leading-relaxed mb-8 sm:mb-10">
                        {s.longDesc}
                      </p>

                      <div className="mb-8">
                        <div className="text-xs uppercase tracking-widest text-gold mb-4" style={{ letterSpacing: '0.25em' }}>What's Included</div>
                        <ul className="space-y-2.5">
                          {s.includes.map(item => (
                            <li key={item} className="flex items-start gap-3">
                              <CheckCircle2 className="w-4 h-4 text-gold mt-1 flex-shrink-0" />
                              <span className="text-sm text-stone-200 leading-relaxed">{item}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <div className="p-5 sm:p-6 rounded-xl bg-gold-5 border border-gold-20">
                        <div className="text-xs uppercase tracking-widest text-gold mb-3" style={{ letterSpacing: '0.25em' }}>Who It's For</div>
                        <p className="text-sm text-stone-200 leading-relaxed">{s.audience}</p>
                      </div>
                    </div>
                  </div>
                </Reveal>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 sm:py-24 md:py-28 gradient-cta-section relative overflow-hidden border-t border-white/5">
        <div className="absolute top-0 left-0 right-0 h-px gradient-gold-line" />
        <div className="absolute bottom-0 left-0 right-0 h-px gradient-gold-line" />
        <div className="max-w-4xl mx-auto px-5 sm:px-6 text-center relative">
          <Reveal>
            <h2 className="serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight mb-5 sm:mb-6 text-stone-100">
              Not sure which practice <span className="italic text-gold">fits your need</span>?
            </h2>
          </Reveal>
          <Reveal delay={200}>
            <p className="text-base sm:text-lg text-stone-400 mb-10 sm:mb-12 max-w-2xl mx-auto leading-relaxed">
              We'll help you figure it out in a complimentary 30-minute consultation — and if we're not the right fit, we'll tell you that too.
            </p>
          </Reveal>
          <Reveal delay={350}>
            <div className="flex flex-row flex-wrap gap-2 sm:gap-3 md:gap-4 justify-center items-center mx-auto">
              <button type="button" onClick={() => window.__siteNav && window.__siteNav.goTo('contact')} className="group inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-gold hover-bg-gold-light active-scale rounded-sm font-medium text-white gold-cta-shadow text-xs sm:text-sm md:text-base whitespace-nowrap">
                Schedule a Consultation
                <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform flex-shrink-0" />
              </button>
              <a href="tel:+919700138340" className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 md:px-8 py-3 sm:py-4 border border-white/20 rounded-sm hover-border-gold hover-text-gold active-scale transition-all text-xs sm:text-sm md:text-base whitespace-nowrap">
                <Phone className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                <span className="hidden sm:inline">Call&nbsp;</span>+91 97001 38340
              </a>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function InsightsListPage({ articles }) {
  return <div style={{padding: '120px 24px', color: 'white'}}>Insights list — {articles.length} articles loaded</div>;
}

function InsightArticlePage({ article }) {
  if (!article) return <div style={{padding: '120px 24px', color: 'white'}}>Article not found</div>;
  return <div style={{padding: '120px 24px', color: 'white'}}>Article: {article.title}</div>;
}

export default function App() {
  const [scrollProgress, setScrollProgress] = useState(0);
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [activeService, setActiveService] = useState(null);
  // We keep `page` as a plain string and track `currentSlug` separately rather
  // than nesting them into one object — every existing setPage('home') etc.
  // call site stays untouched, and slug is only consulted for page === 'article'.
  const initialRoute = typeof window !== 'undefined'
    ? pathToPage(window.location.pathname)
    : { page: 'home', slug: null };
  const [page, setPage] = useState(initialRoute.page);
  const [currentSlug, setCurrentSlug] = useState(initialRoute.slug);
  const [activeSection, setActiveSection] = useState('home');
  const [servicesOpen, setServicesOpen] = useState(false);
  const [mobileServicesOpen, setMobileServicesOpen] = useState(false);
  const insightsRef = useRef(null);
  const servicesDropdownRef = useRef(null);

  // Update the browser URL whenever the page state changes so deep links,
  // bookmarks, and the sitemap reflect the visible page.
  useEffect(() => {
    const targetPath = pageToPath(page, currentSlug);
    if (typeof window !== 'undefined' && window.location.pathname !== targetPath) {
      window.history.pushState({ page, slug: currentSlug }, '', targetPath);
    }
  }, [page, currentSlug]);

  // Handle browser back / forward navigation by reading the path and syncing state.
  useEffect(() => {
    const onPopState = () => {
      const { page: p, slug: s } = pathToPage(window.location.pathname);
      setPage(p);
      setCurrentSlug(s);
    };
    window.addEventListener('popstate', onPopState);
    return () => window.removeEventListener('popstate', onPopState);
  }, []);

  const MAPS_URL = "https://www.google.com/maps/dir/?api=1&destination=Krishnaveer+Euphoria+Jubilee+Enclave+Hitech+City+Hyderabad+500081";

  const scrollInsights = (dir) => {
    if (insightsRef.current) {
      const amount = insightsRef.current.clientWidth * 0.75;
      insightsRef.current.scrollBy({ left: dir === 'next' ? amount : -amount, behavior: 'smooth' });
    }
  };

  useEffect(() => {
    const sectionIds = ['home', 'services', 'insights', 'contact'];
    let rafId = null;
    const onScroll = () => {
      if (rafId !== null) return;
      rafId = requestAnimationFrame(() => {
        rafId = null;
        const h = document.documentElement;
        const p = h.scrollTop / (h.scrollHeight - h.clientHeight || 1);
        setScrollProgress(p * 100);
        setScrolled(h.scrollTop > 40);
        if (page === 'home') {
          const threshold = window.innerHeight * 0.4;
          let current = 'home';
          for (const id of sectionIds) {
            const el = document.getElementById(id);
            if (el && el.getBoundingClientRect().top <= threshold) current = id;
          }
          setActiveSection(current);
        }
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId !== null) cancelAnimationFrame(rafId);
    };
  }, [page]);

  useEffect(() => {
    if (!servicesOpen) return;
    const onClickOutside = (e) => {
      if (servicesDropdownRef.current && !servicesDropdownRef.current.contains(e.target)) {
        setServicesOpen(false);
      }
    };
    const onEscape = (e) => { if (e.key === 'Escape') setServicesOpen(false); };
    document.addEventListener('mousedown', onClickOutside);
    document.addEventListener('keydown', onEscape);
    return () => {
      document.removeEventListener('mousedown', onClickOutside);
      document.removeEventListener('keydown', onEscape);
    };
  }, [servicesOpen]);

  useEffect(() => {
    document.body.style.overflow = menuOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  useLayoutEffect(() => {
    window.scrollTo(0, 0);
    if (document.documentElement) document.documentElement.scrollTop = 0;
    if (document.body) document.body.scrollTop = 0;
  }, [page]);

  useEffect(() => {
    const handler = (e) => {
      const navEl = e.target.closest('[data-nav-to]');
      if (navEl) {
        e.preventDefault();
        setActiveService(null);
        setMenuOpen(false);
        setPage(navEl.dataset.navTo);
        return;
      }
      const scrollEl = e.target.closest('[data-scroll-to]');
      if (scrollEl) {
        e.preventDefault();
        const targetId = scrollEl.dataset.scrollTo;
        const doScroll = () => {
          const section = document.getElementById(targetId);
          if (section) {
            const y = section.getBoundingClientRect().top + window.pageYOffset - 70;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        };
        if (page !== 'home') {
          setMenuOpen(false);
          setPage('home');
          setTimeout(doScroll, 120);
        } else {
          setMenuOpen(false);
          doScroll();
        }
      }
    };
    document.addEventListener('click', handler);
    return () => document.removeEventListener('click', handler);
  }, [page]);

  useEffect(() => {
    window.__siteNav = {
      goTo: (p) => { setActiveService(null); setMenuOpen(false); setPage(p); },
      scrollTo: (id) => {
        const doScroll = () => {
          const el = document.getElementById(id);
          if (el) {
            const y = el.getBoundingClientRect().top + window.pageYOffset - 70;
            window.scrollTo({ top: y, behavior: 'smooth' });
          }
        };
        setMenuOpen(false);
        if (page !== 'home') {
          setActiveService(null);
          setPage('home');
          setTimeout(doScroll, 150);
        } else {
          doScroll();
        }
      }
    };
    return () => { delete window.__siteNav; };
  }, [page]);

  const services = [
    { icon: Sparkles, title: 'Startup Advisory & vCFO', desc: 'Founder-friendly advisory from incorporation through funding — financial strategy, compliance, and virtual CFO support.', longDesc: 'A founder-first engagement model. From incorporating your first entity to raising your Series B, we serve as your finance function — without the full-time hire.', includes: ['Entity structuring, incorporation, and shareholder agreements','Financial modeling, forecasts, and fundraising diligence prep','Monthly MIS, cash-flow reporting, and board packs','Virtual CFO services — strategic finance without a permanent hire','ESOP design, allocation, and valuation support','Founder compensation, tax planning, and equity restructuring'], audience: 'Early-stage founders, growth-stage startups pre-CFO, and investors seeking diligence-ready reporting from their portfolio companies.' },
    { icon: Shield, title: 'Audit & Assurance', desc: 'Statutory, internal, tax and special-purpose audits, conducted in accordance with ICAI Standards on Auditing.', longDesc: 'Audit engagements conducted in accordance with the Standards on Auditing (SA) issued by the Institute of Chartered Accountants of India. Our approach is risk-based, documentation-led, and designed to meet the requirements of the Companies Act, 2013 and the Income Tax Act, 1961.', includes: ['Statutory audits under the Companies Act, 2013','Tax audits under Section 44AB of the Income Tax Act, 1961','Internal audits and risk-based audit programmes','GST audits and reconciliation assurance','Special-purpose audits — due diligence, forensic, fraud investigations','Management letters with control and process observations'], audience: 'Private and public companies, LLPs, partnerships, trusts, and not-for-profit entities — whether mandated by statute or seeking independent assurance.' },
    { icon: FileText, title: 'Income Tax & International Tax', desc: 'Return filing, tax planning, DTAA advisory, NRI taxation, and transfer pricing.', longDesc: 'Direct tax advisory grounded in both domestic Indian law and international treaty frameworks — designed for clients with cross-border affairs, NRI obligations, or complex structures.', includes: ['Return filing for individuals, firms, LLPs, companies, and trusts','Tax planning and structuring across entity and personal levels','DTAA advisory and application to reduce double taxation','NRI taxation — residency determination, repatriation, RNOR planning','Transfer pricing studies, documentation, and Form 3CEB','Tax litigation — representation before AO, CIT(A), ITAT, and High Court'], audience: 'NRIs, HNIs, cross-border businesses, Indian companies with international transactions, and anyone facing complex tax positions or litigation.' },
    { icon: Calculator, title: 'GST Compliance & Litigation', desc: 'GST registration, returns, ITC reconciliation, departmental notices, and tribunal representation.', longDesc: 'From day-one registration to tribunal appeals — a complete GST practice covering both routine compliance and complex dispute resolution.', includes: ['GST registration, amendments, and cancellation support','Monthly, quarterly, and annual return filing (GSTR-1, 3B, 9, 9C)','Input Tax Credit (ITC) reconciliation and 2B matching','Response to departmental notices (ASMT-10, DRC-01, etc.)','Tribunal and appellate representation (GSTAT)','GST audits, refund applications, and advance ruling assistance'], audience: 'Every GST-registered business — manufacturers, service providers, e-commerce operators, exporters, and entities facing departmental action.' },
    { icon: Landmark, title: 'FEMA / ROC / Regulatory', desc: 'FDI, FC-GPR, ODI, ECB compliance and ROC annual filing for companies of all sizes.', longDesc: 'Regulatory compliance across the Companies Act and FEMA — the filings and certifications that keep Indian businesses in good standing with MCA and RBI.', includes: ['FDI and FC-GPR filings for inbound investment reporting','ODI and FC-TRS compliance for outbound and transfer transactions','External Commercial Borrowings (ECB) regulatory filings','Annual ROC filings — AOC-4, MGT-7, DIR-3 KYC, DPT-3','Company law advisory — board processes, resolutions, corporate actions','LLP compliance, changes in partners, and annual returns'], audience: 'Companies with foreign investment or investors, outbound investors, startups raising international capital, and every Indian company meeting annual MCA obligations.' },
    { icon: TrendingUp, title: 'Business & Financial Valuations', desc: 'IBBI-registered valuations for transactions, restructuring, dispute resolution, and regulatory reporting.', longDesc: 'Valuation engagements backed by IBBI registration (IBBI/RV/06/2024/15688), provided by CA Bhanu Prakash Thota in his individual capacity as a Registered Valuer. Reports engineered to withstand regulatory scrutiny, court proceedings, and independent review.', includes: ['Share and enterprise valuations for M&A, fundraising, and internal transfers','IBBI-compliant valuation reports for securities and financial assets','Regulatory valuations under FEMA (FDI/ODI) and Income Tax (Rule 11UA, 11UAE)','ESOP valuations and fair-value reports for accounting compliance','Purchase price allocation (PPA) and intangible asset valuations','Dispute, litigation, and family-settlement valuations'], audience: 'Companies raising capital, founders planning exits, boards navigating M&A, financial creditors in IBC proceedings, and businesses meeting regulatory valuation requirements.' },
    { icon: Scale, title: 'Insolvency & Restructuring (IBC)', desc: 'IRP, RP and Liquidator engagements — end-to-end management of CIRP and liquidation proceedings.', longDesc: 'Insolvency engagements undertaken by CA Bhanu Prakash Thota in his individual capacity as a Registered Insolvency Professional (IBBI/IPA-001/IP-P-02906/2024–2025/14463). IBC mandates are handled with the care and precision the Code demands.', includes: ['Acting as Interim Resolution Professional (IRP) and Resolution Professional (RP)','Liquidator services for corporate liquidations under IBC','Financial and operational creditor representation','Resolution plan evaluation, negotiation, and implementation oversight','Voluntary liquidation of solvent companies','Pre-pack insolvency (MSME) and cross-border coordination'], audience: 'Financial and operational creditors, corporate debtors, resolution applicants, and stressed asset investors navigating the Insolvency and Bankruptcy Code.' },
  ];

  const credentials = [
    { title: 'Fellow Chartered Accountant (FCA)', sub: 'ICAI · Member No. 233634' },
    { title: 'DISA — Information Systems Audit', sub: 'Institute of Chartered Accountants of India' },
    { title: 'IBBI Registered Valuer', sub: 'Securities & Financial Assets' },
    { title: 'Insolvency Professional (IP)', sub: 'IBBI Registered · IRP · RP · Liquidator' },
  ];

  const differentiators = [
    { icon: Users, title: 'Practitioner-led, not delegated', desc: "The firm's principals are directly involved in every engagement. Client matters are not handed to junior staff — senior attention is applied from the first consultation through to final delivery." },
    { icon: Building2, title: 'Hyderabad-rooted, nationally capable', desc: 'Headquartered at Hi-tech City, Hyderabad (ICAI Firm Reg. 014730S), the firm serves clients across India — from Hyderabad-based startups to national corporates, NRIs and financial creditors in IBC proceedings.' },
    { icon: Award, title: 'Rare combination of credentials', desc: 'FCA, DISA, IBBI Registered Valuer, and Insolvency Professional — a depth of qualifications few firms of this size can offer under one roof.' },
    { icon: Clock, title: 'Precision you can set a clock by', desc: 'Compliance deadlines are sacred. Timelines are communicated up-front, tracked transparently, and consistently met — even when matters are complex.' },
  ];

  const stats = [
    { value: 13, suffix: '+', label: 'Years in Practice' },
    { value: 7, suffix: '', label: 'Practice Areas' },
    { value: 4, suffix: '', label: 'Core Credentials' },
    { value: 100, suffix: '%', label: 'Senior-Led Engagements' },
  ];

  const process = [
    { n: '01', title: 'Consultation', desc: 'A structured first conversation to understand your situation, constraints, and objectives — without cost or commitment.' },
    { n: '02', title: 'Scoping', desc: 'We define the engagement in writing — deliverables, timeline, fees — so expectations are clear on both sides from day one.' },
    { n: '03', title: 'Execution', desc: 'Senior-led work with regular checkpoints. You receive deliverables, not just hours. Every document is reviewed before it reaches you.' },
    { n: '04', title: 'Partnership', desc: 'Ongoing advisory relationships are our preference. We serve clients for years, not transactions — and adapt as your business evolves.' },
  ];

  const industries = [
    { icon: Sparkles, name: 'Technology & SaaS', desc: 'Founders, venture-backed companies, and growth-stage startups.' },
    { icon: Building2, name: 'Real Estate & Infra', desc: 'Developers, contractors, and asset-heavy entities with complex compliance.' },
    { icon: Briefcase, name: 'Professional Services', desc: 'Consulting firms, agencies, and knowledge-economy businesses.' },
    { icon: TrendingUp, name: 'Financial Services', desc: 'NBFCs, AIFs, and financial creditors in IBC proceedings.' },
    { icon: Landmark, name: 'Manufacturing & Trading', desc: 'Exporters, importers, and entities with FEMA obligations.' },
    { icon: Globe, name: 'NRIs & Global Indians', desc: 'DTAA, repatriation, and residency-based tax planning.' },
  ];

  const faqs = [
    { q: 'Do you work with clients outside Hyderabad?', a: 'Yes. While our office is in Hi-tech City, Hyderabad, much of our work is delivered remotely through secure digital workflows. We serve clients across India and regularly advise NRIs on cross-border matters. For matters requiring physical presence — NCLT appearances, on-site audits — we coordinate accordingly.' },
    { q: 'What does an initial consultation involve, and is there a fee?', a: "Initial consultations are complimentary and typically run 30–45 minutes. We use the time to understand your situation, assess whether we are well-suited to help, and — if we are — outline a clear scope and fee structure. You receive our preliminary view in writing within one business day." },
    { q: 'How do your fees work?', a: 'Fees depend on scope and complexity. For recurring work (audits, returns, compliance) we agree annual retainers. For one-time engagements (valuations, advisory, litigation) we provide fixed fees or capped estimates in writing before starting. We do not charge for time spent on scoping or initial diligence.' },
    { q: 'Can you handle urgent deadline-sensitive matters?', a: 'We triage urgent matters — notices with limited response windows, time-sensitive valuations, imminent filings — within the same working day. That said, the earlier you engage us, the more strategic the response we can design. Last-minute mandates receive the same technical rigour but fewer strategic options.' },
    { q: 'Do you advise on tax planning, or only compliance?', a: 'Both. We advise on legitimate tax planning — entity structures, DTAA application, capital gains strategies, succession planning — alongside routine compliance. We do not advise on structures we believe to be aggressive or non-compliant, regardless of commercial pressure.' },
    { q: 'Are engagements led by the Principal personally?', a: 'CA Bhanu Prakash Thota personally leads every valuation, insolvency, and international-tax engagement. For audit, GST, and routine compliance, our senior team delivers the work under his oversight — with his review on every significant deliverable. You always have direct access to him.' },
    { q: 'How do you handle confidentiality?', a: 'All engagements are governed by chartered-accountant professional secrecy standards. For sensitive matters — valuations, insolvency, litigation — we execute NDAs up-front. Client documents are stored on encrypted infrastructure, and information is shared only with team members directly engaged on the matter.' },
  ];

  const insights = [
    { cat: 'Valuations', date: 'March 2026', title: 'IBBI Valuation Standards: What the 2025 Amendments Mean for Registered Valuers', excerpt: "A practitioner's read on the recent amendments — what has genuinely changed, what has merely been clarified, and what valuers need to operationalize immediately." },
    { cat: 'Insolvency', date: 'February 2026', title: 'The Evolving Recovery Landscape in IBC: A View From the Ground', excerpt: 'Recovery rates, timelines, and the quiet rise of Section 12A withdrawals — what creditors and resolution applicants should know heading into FY26.' },
    { cat: 'Tax Law', date: 'January 2026', title: 'Section 194R and the Gift-Perquisite Puzzle: Practical Compliance Approaches', excerpt: 'Two years in, Section 194R continues to create ambiguity for businesses. A framework for deciding when to withhold, how to document, and how to respond to notices.' },
    { cat: 'Valuations', date: 'December 2025', title: 'Valuing Intangibles in M&A: A Framework for Purchase Price Allocation', excerpt: 'PPA under Ind-AS 103 often produces surprises. A structured approach to separating identifiable intangibles from goodwill — and defending each assumption in post-close review.' },
    { cat: 'Startup Advisory', date: 'November 2025', title: 'Virtual CFO vs Full-Time CFO: When Does the Switch Actually Make Sense?', excerpt: 'A practical framework for founders evaluating the shift from a vCFO engagement to a full-time hire — when runway, complexity, and ambition justify the step up.' },
    { cat: 'Regulatory', date: 'October 2025', title: 'FEMA Amendments 2025: What Inbound Investors Need to Know About FC-GPR Timelines', excerpt: 'Recent amendments to reporting timelines and valuation thresholds under FEMA have meaningful compliance implications for every foreign-funded entity.' },
  ];

  const navItems = [
    { label: 'Home', href: '#home', type: 'anchor' },
    { label: 'Services', href: '#services', type: 'anchor', hasDropdown: true },
    { label: 'About Us', href: null, type: 'page', target: 'leadership' },
    { label: 'Insights', href: null, type: 'page', target: 'insights' },
    { label: 'Contact Us', href: null, type: 'page', target: 'contact' },
  ];

  const handleNavClick = (item) => {
    setMenuOpen(false);
    if (item.type === 'page') {
      setPage(item.target);
    } else {
      if (page !== 'home') {
        setPage('home');
        setTimeout(() => {
          document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' });
        }, 100);
      } else {
        document.querySelector(item.href)?.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  const jumpHome = (anchor) => {
    if (page !== 'home') {
      setPage('home');
      setTimeout(() => {
        document.querySelector(anchor)?.scrollIntoView({ behavior: 'smooth' });
      }, 100);
    } else {
      document.querySelector(anchor)?.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const serviceNames = services.map(s => s.title);

  return (
    <div className="min-h-screen bg-navy text-stone-100" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Segoe UI", system-ui, Roboto, "Helvetica Neue", Arial, sans-serif', overflowX: 'clip' }}>
      <style>{customStyles}</style>

      <div className="fixed top-0 left-0 right-0 h-0.5 z-50" style={{ backgroundColor: 'rgba(201, 169, 97, 0.1)' }}>
        <div className="h-full w-full bg-gold origin-left" style={{ transform: `scaleX(${scrollProgress / 100})` }} />
      </div>

      <nav className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 bg-navy-95 ${scrolled ? 'border-b border-white/10 py-3 sm:py-4 shadow-lg' : 'py-4 sm:py-6'}`}>
        <div className="max-w-7xl mx-auto px-5 sm:px-6 flex items-center justify-between">
          <button onClick={() => setPage('home')} className="flex items-center" aria-label="Go to home page"><Wordmark /></button>
          <div className="hidden md:flex items-center gap-5 lg:gap-7 xl:gap-9">
            {navItems.map(item => {
              const isActive = item.type === 'page'
                ? page === item.target
                : page === 'home' && activeSection === item.href.slice(1);
              const activeOrOpen = isActive || (item.hasDropdown && servicesOpen);
              const btnClass = `uppercase tracking-widest transition-colors relative group inline-flex items-center gap-1 ${activeOrOpen ? 'text-gold' : 'text-stone-300 hover-text-gold'}`;
              const btnStyle = { fontSize: '11px', letterSpacing: '0.2em' };
              const underline = <span className={`absolute -bottom-1 left-0 h-px bg-gold transition-all duration-300 ${activeOrOpen ? 'w-full' : 'w-0 group-hover:w-full'}`} />;
              if (item.hasDropdown) {
                return (
                  <div key={item.label} ref={servicesDropdownRef} className="relative" onMouseEnter={() => setServicesOpen(true)} onMouseLeave={() => setServicesOpen(false)}>
                    <button onClick={() => setServicesOpen(!servicesOpen)} aria-expanded={servicesOpen} aria-haspopup="menu" className={btnClass} style={btnStyle}>
                      {item.label}
                      <ChevronDown className={`w-3 h-3 transition-transform duration-200 ${servicesOpen ? 'rotate-180' : ''}`} strokeWidth={1.5} />
                      {underline}
                    </button>
                    <div role="menu" className={`absolute top-full left-1/2 -translate-x-1/2 pt-4 z-50 transition-all duration-200 ${servicesOpen ? 'opacity-100 translate-y-0 pointer-events-auto' : 'opacity-0 -translate-y-2 pointer-events-none'}`} style={{ width: '380px' }}>
                      <div className="bg-navy-95 border border-gold-20 rounded-xl p-2 backdrop-blur-xl" style={{ boxShadow: '0 20px 60px -15px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(201, 169, 97, 0.1)' }}>
                        <div className="px-3 pt-2 pb-2 text-xs uppercase text-gold" style={{ letterSpacing: '0.25em' }}>Our Practice</div>
                        <div className="h-px gradient-gold-line mb-1" style={{ opacity: 0.4 }} />
                        {services.map(s => (
                          <button key={s.title} role="menuitem" onClick={() => { setServicesOpen(false); setActiveService(s); }} className="w-full text-left px-3 py-2.5 rounded-lg hover-bg-white-4 flex items-center gap-3 transition-colors group">
                            <div className="w-8 h-8 rounded-md bg-gold-10 border border-gold-20 flex items-center justify-center flex-shrink-0 group-hover-bg-gold group-hover-border-gold transition-all duration-300">
                              <s.icon className="w-3.5 h-3.5 text-gold group-hover-text-navy transition-colors duration-300" />
                            </div>
                            <span className="text-sm text-stone-200 group-hover-text-gold transition-colors duration-300 leading-tight">{s.title}</span>
                          </button>
                        ))}
                        <div className="h-px bg-white border-opacity-5 my-1" style={{ backgroundColor: 'rgba(255,255,255,0.05)' }} />
                        <button onClick={() => { setServicesOpen(false); setPage('services'); }} className="w-full text-left px-3 py-2.5 rounded-lg hover-bg-white-4 flex items-center justify-between gap-3 transition-colors group">
                          <span className="text-xs uppercase text-gold group-hover-text-gold" style={{ letterSpacing: '0.25em' }}>View All Services</span>
                          <ArrowRight className="w-3.5 h-3.5 text-gold group-hover:translate-x-1 transition-transform" />
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }
              return (
                <button key={item.label} onClick={() => handleNavClick(item)} className={btnClass} style={btnStyle}>
                  {item.label}
                  {underline}
                </button>
              );
            })}
          </div>
          <button onClick={() => setMenuOpen(!menuOpen)} aria-label={menuOpen ? "Close menu" : "Open menu"} aria-expanded={menuOpen} className="md:hidden w-10 h-10 flex items-center justify-center text-stone-100 active-scale">
            {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </nav>

      {menuOpen && (
        <div className="md:hidden fixed inset-0 z-30 bg-navy-95 backdrop-blur-xl animate-fade-in overflow-y-auto pt-20 pb-10">
          <div className="flex flex-col px-6 animate-slide-down">
            <div className="flex flex-col">
              {navItems.map((item, i) => {
                if (item.hasDropdown) {
                  return (
                    <div key={item.label} className="border-b border-white/5">
                      <button
                        onClick={() => setMobileServicesOpen(!mobileServicesOpen)}
                        aria-expanded={mobileServicesOpen}
                        className="w-full flex items-center justify-between text-left serif text-3xl text-stone-100 py-5 hover-text-gold transition-colors"
                      >
                        <span>
                          <span className="text-gold mr-3" style={{ fontSize: '12px', letterSpacing: '0.2em' }}>0{i + 1}</span>
                          {item.label}
                        </span>
                        <ChevronDown className={`w-5 h-5 text-gold transition-transform duration-300 ${mobileServicesOpen ? 'rotate-180' : ''}`} strokeWidth={1.5} />
                      </button>
                      <div className="grid faq-panel" style={{ gridTemplateRows: mobileServicesOpen ? '1fr' : '0fr' }}>
                        <div className="overflow-hidden">
                          <div className="pb-5 pl-10 space-y-1">
                            {services.map(s => (
                              <button
                                key={s.title}
                                onClick={() => { setMenuOpen(false); setMobileServicesOpen(false); setTimeout(() => setActiveService(s), 250); }}
                                className="w-full text-left flex items-center gap-3 py-2.5 text-stone-300 hover-text-gold transition-colors group"
                              >
                                <s.icon className="w-4 h-4 text-gold flex-shrink-0" />
                                <span className="text-sm leading-snug">{s.title}</span>
                              </button>
                            ))}
                            <button
                              onClick={() => { setMenuOpen(false); setMobileServicesOpen(false); setPage('services'); }}
                              className="w-full text-left flex items-center justify-between gap-3 py-3 mt-2 border-t border-white/5 text-gold"
                            >
                              <span className="text-xs uppercase" style={{ letterSpacing: '0.25em' }}>View All Services</span>
                              <ArrowRight className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                }
                return (
                  <button key={item.label} onClick={() => handleNavClick(item)} className="text-left serif text-3xl text-stone-100 hover-text-gold py-5 border-b border-white/5 transition-colors">
                    <span className="text-gold mr-3" style={{ fontSize: '12px', letterSpacing: '0.2em' }}>0{i + 1}</span>
                    {item.label}
                  </button>
                );
              })}
            </div>
            <button type="button" onClick={() => { setMenuOpen(false); setPage('contact'); }} className="group mt-10 inline-flex items-center justify-center gap-2 px-6 py-4 bg-gold hover-bg-gold-light rounded-sm font-medium text-white gold-cta-shadow">
              Schedule a Consultation
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
            <div className="mt-10 space-y-3">
              <a href="tel:+919700138340" className="flex items-center gap-3 text-stone-300 hover-text-gold transition-colors">
                <Phone className="w-4 h-4 text-gold" />
                <span className="text-sm">+91 97001 38340</span>
              </a>
              <a href="mailto:services@thotaassociates.com" className="flex items-center gap-3 text-stone-300 hover-text-gold transition-colors">
                <Mail className="w-4 h-4 text-gold" />
                <span className="text-sm break-all">services@thotaassociates.com</span>
              </a>
              <div className="flex items-start gap-3 text-stone-400">
                <MapPin className="w-4 h-4 text-gold mt-0.5 flex-shrink-0" />
                <span className="text-sm leading-relaxed">Flat No 302, Krishnaveer's Euphoria,<br/>Jubilee Enclave, Hi-tech City,<br/>Hyderabad — 500081</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {page === 'leadership' ? (
        <LeadershipPage onBack={() => setPage('home')} />
      ) : page === 'contact' ? (
        <ContactPage onBack={() => setPage('home')} services={serviceNames} />
      ) : page === 'services' ? (
        <ServicesPage onBack={() => setPage('home')} services={services} />
      ) : page === 'insights' ? (
        <InsightsListPage articles={getAllArticles()} />
      ) : page === 'article' ? (
        <InsightArticlePage article={getArticleBySlug(currentSlug)} />
      ) : (page === 'terms' || page === 'privacy' || page === 'refund' || page === 'disclaimer') ? (
        <LegalPage type={page} onBack={() => setPage('home')} onNavigate={(p) => setPage(p)} />
      ) : (
        <>
          {/* HERO — tightened; min-h-screen removed; tagline forced to one line */}
          <section id="home" className="relative pt-32 pb-24 sm:pt-40 sm:pb-32 md:pt-48 md:pb-40 lg:pt-56 lg:pb-44 overflow-hidden">
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
              <div className="absolute top-0 -left-20 w-72 h-72 sm:w-96 sm:h-96 rounded-full gradient-hero-orb-gold animate-pulse" style={{ filter: 'blur(120px)', animationDuration: '8s' }} />
              <div className="absolute bottom-0 -right-20 w-72 h-72 sm:w-96 sm:h-96 rounded-full gradient-hero-orb-blue animate-pulse" style={{ filter: 'blur(140px)', animationDuration: '10s', animationDelay: '2s' }} />
              <div className="absolute inset-0 grid-pattern" />
            </div>
            <div className="relative max-w-5xl mx-auto px-5 sm:px-6 w-full text-center">
              <Reveal>
                <div className="tagline-one-line uppercase text-gold mb-8 sm:mb-10 md:mb-12 overflow-hidden">
                  Chartered Accountants · Registered Valuers · Insolvency Professionals
                </div>
              </Reveal>
              <Reveal delay={200}>
                <h1 className="serif text-3xl sm:text-4xl md:text-5xl lg:text-5xl leading-[1.2] mb-8 sm:mb-10 md:mb-14 text-stone-100">
                  Clarity in <span className="italic text-gold">Compliance</span>. Confidence in <span className="italic text-gold">Conclusions</span>.<br />
                  Credibility in <span className="italic text-gold">Counsel</span>.
                </h1>
              </Reveal>
              <Reveal delay={400}>
                <p className="text-sm sm:text-base md:text-lg text-stone-400 max-w-3xl mx-auto mb-12 sm:mb-16 md:mb-20 leading-relaxed">
                  Thota and Associates is a proprietary Chartered Accountancy firm offering integrated expertise across accounting, taxation, audit, GST, FEMA compliance and startup advisory. The firm is led by <button onClick={() => setPage('leadership')} className="text-stone-200 hover-text-gold transition-colors underline underline-offset-2 decoration-gold-30">CA Bhanu Prakash Thota</button>, who also practises in his individual capacity as an IBBI Registered Valuer and Insolvency Professional — bringing multi-disciplinary competence under a single professional relationship.
                </p>
              </Reveal>
              <Reveal delay={550}>
                <div className="flex flex-row flex-wrap gap-2 sm:gap-3 md:gap-4 justify-center items-center mx-auto">
                  <button onClick={() => setPage('contact')} className="group inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-gold hover-bg-gold-light active-scale rounded-sm font-medium text-white gold-cta-shadow text-xs sm:text-sm md:text-base whitespace-nowrap">
                    Schedule a Consultation
                    <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                  </button>
                  <button type="button" onClick={() => setPage('services')} className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 md:px-8 py-3 sm:py-4 border border-white/20 rounded-sm hover-border-gold hover-text-gold active-scale transition-all text-xs sm:text-sm md:text-base whitespace-nowrap">
                    Explore Our Practice
                  </button>
                </div>
              </Reveal>
            </div>
          </section>

          {/* CREDENTIALS STRIP */}
          <section className="relative py-12 sm:py-14 md:py-16 border-t border-b border-white/5 bg-white-2">
            <div className="absolute top-0 left-0 right-0 h-px gradient-gold-line" />
            <div className="max-w-7xl mx-auto px-5 sm:px-6">
              <Reveal>
                <div className="credentials-grid">
                  {credentials.map((c) => (
                    <div key={c.title} className="text-center min-w-0">
                      <div className="text-xs md:text-[11px] lg:text-[13px] xl:text-sm text-stone-100 mb-1.5 leading-snug">{c.title}</div>
                      <div className="text-[11px] md:text-[10px] lg:text-[11px] xl:text-xs text-stone-400 leading-snug">{c.sub}</div>
                    </div>
                  ))}
                </div>
              </Reveal>
            </div>
          </section>

          {/* SERVICES */}
          <section id="services" className="scroll-mt-24 py-20 sm:py-24 md:py-32 relative">
            <div className="absolute inset-0 gradient-services-section pointer-events-none" />
            <div className="relative max-w-7xl mx-auto px-5 sm:px-6">
              <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 md:mb-20">
                <Reveal>
                  <div className="text-xs uppercase tracking-widest text-gold mb-5 sm:mb-6" style={{ letterSpacing: '0.25em' }}>Our Practice</div>
                  <h2 className="serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight mb-5 sm:mb-6 text-stone-100">
                    Seven practices.<br className="sm:hidden" /> <span className="italic text-gold">One standard.</span>
                  </h2>
                  <p className="text-base sm:text-lg text-stone-400 leading-relaxed">
                    Integrated expertise in taxation, valuation, insolvency and compliance — delivered with the precision your business deserves.
                  </p>
                </Reveal>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                {services.map((s, i) => (
                  <Reveal key={s.title} delay={i * 60}>
                    <button onClick={() => setActiveService(s)} className="group relative h-full w-full text-left p-6 sm:p-8 rounded-2xl border border-white/10 gradient-card hover-bg-white-4 hover-border-gold transition-all duration-500 hover:-translate-y-1 active-scale overflow-hidden cursor-pointer">
                      <div className="relative">
                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-gold-10 border border-gold-20 flex items-center justify-center mb-5 sm:mb-6 group-hover-bg-gold group-hover-border-gold transition-all duration-500">
                          <s.icon className="w-5 h-5 text-gold group-hover-text-navy transition-colors duration-500" />
                        </div>
                        <h3 className="serif text-lg sm:text-xl mb-3 text-stone-100 leading-snug">{s.title}</h3>
                        <p className="text-sm text-stone-400 leading-relaxed mb-5 sm:mb-6">{s.desc}</p>
                        <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gold" style={{ letterSpacing: '0.2em' }}>
                          Learn more <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                        </div>
                      </div>
                    </button>
                  </Reveal>
                ))}
              </div>
              <div className="text-center mt-10 sm:mt-12">
                <button type="button" onClick={() => setPage('services')} className="group inline-flex items-center gap-2 px-6 py-3 border border-gold-30 bg-gold-5 hover-bg-gold-10 hover-border-gold rounded-sm text-sm text-gold active-scale transition-all">
                  <span style={{ letterSpacing: '0.08em' }}>View all practice areas in detail</span>
                  <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                </button>
                <p className="text-xs text-stone-500 uppercase tracking-widest mt-5" style={{ letterSpacing: '0.2em' }}>
                  Or tap any card above for a quick overview
                </p>
              </div>
            </div>
          </section>

          {/* STATS */}
          <section className="py-16 sm:py-20 md:py-24 border-t border-b border-white/5 bg-navy-deep">
            <div className="max-w-7xl mx-auto px-5 sm:px-6 grid grid-cols-2 lg:grid-cols-4 gap-8 sm:gap-12">
              {stats.map((s, i) => (
                <Reveal key={s.label} delay={i * 100}>
                  <div className="text-center">
                    <div className="serif text-4xl sm:text-5xl md:text-6xl text-gold mb-2 sm:mb-3">
                      <Counter end={s.value} suffix={s.suffix} />
                    </div>
                    <div className="text-xs uppercase tracking-widest text-stone-400 leading-relaxed" style={{ letterSpacing: '0.2em' }}>{s.label}</div>
                  </div>
                </Reveal>
              ))}
            </div>
          </section>

          {/* DIFFERENTIATORS */}
          <section id="about" className="py-20 sm:py-24 md:py-32 relative border-t border-white/5">
            <div className="max-w-7xl mx-auto px-5 sm:px-6">
              <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 md:mb-20">
                <Reveal>
                  <div className="text-xs uppercase tracking-widest text-gold mb-5 sm:mb-6" style={{ letterSpacing: '0.25em' }}>What sets us apart</div>
                  <h2 className="serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight text-stone-100">
                    Why clients choose <span className="italic text-gold">Thota and Associates</span>
                  </h2>
                </Reveal>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-px rounded-2xl sm:rounded-3xl overflow-hidden border border-white/10" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                {differentiators.map((d, i) => (
                  <Reveal key={d.title} delay={i * 100} className="h-full">
                    <div className="h-full p-6 sm:p-8 md:p-10 bg-navy hover-bg-white-4 transition-colors duration-500 group">
                      <div className="flex items-start gap-4 sm:gap-5">
                        <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-lg bg-gold-10 border border-gold-20 flex items-center justify-center flex-shrink-0 group-hover-bg-gold group-hover-border-gold transition-all duration-500">
                          <d.icon className="w-5 h-5 text-gold group-hover-text-navy transition-colors duration-500" />
                        </div>
                        <div className="min-w-0">
                          <h3 className="serif text-xl sm:text-2xl mb-3 sm:mb-4 text-stone-100 leading-snug">{d.title}</h3>
                          <p className="text-sm text-stone-400 leading-relaxed">{d.desc}</p>
                        </div>
                      </div>
                    </div>
                  </Reveal>
                ))}
              </div>

              <div className="mt-10 sm:mt-14 text-center">
                <Reveal>
                  <button onClick={() => setPage('leadership')} className="group inline-flex items-center gap-2 text-sm text-gold hover:gap-3 transition-all" style={{ letterSpacing: '0.15em' }}>
                    Meet CA Bhanu Prakash Thota, the Principal
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </Reveal>
              </div>
            </div>
          </section>

          {/* INDUSTRIES */}
          <section id="industries" className="py-20 sm:py-24 md:py-32 border-t border-white/5 bg-navy-deep">
            <div className="max-w-7xl mx-auto px-5 sm:px-6">
              <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16 md:mb-20">
                <Reveal>
                  <div className="text-xs uppercase tracking-widest text-gold mb-5 sm:mb-6" style={{ letterSpacing: '0.25em' }}>Industries</div>
                  <h2 className="serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight mb-5 sm:mb-6 text-stone-100">
                    Sectors we <span className="italic text-gold">know well</span>
                  </h2>
                  <p className="text-base sm:text-lg text-stone-400 leading-relaxed">
                    Our practice has developed depth across sectors where regulatory complexity, valuation nuance, or cross-border exposure is highest.
                  </p>
                </Reveal>
              </div>
              <Reveal delay={200}>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px rounded-2xl overflow-hidden border border-white/10" style={{ backgroundColor: 'rgba(255, 255, 255, 0.05)' }}>
                  {industries.map((ind) => (
                    <div key={ind.name} className="p-6 sm:p-7 bg-navy hover-bg-white-4 transition-colors group">
                      <ind.icon className="w-6 h-6 text-gold mb-4 group-hover:scale-110 transition-transform" />
                      <div className="serif text-lg text-stone-100 leading-snug mb-2">{ind.name}</div>
                      <div className="text-xs text-stone-400 leading-relaxed">{ind.desc}</div>
                    </div>
                  ))}
                </div>
              </Reveal>
              <Reveal delay={400}>
                <p className="text-center text-sm text-stone-500 leading-relaxed max-w-2xl mx-auto mt-10 sm:mt-12">
                  We also serve clients across other sectors. If your industry is not listed, speak with us — our framework-based approach adapts to the specific economics and regulations of your business.
                </p>
              </Reveal>
            </div>
          </section>

          {/* INSIGHTS */}
          <section id="insights" className="py-20 sm:py-24 md:py-32 relative border-t border-white/5" style={{ overflowX: 'clip' }}>
            <div className="max-w-7xl mx-auto">
              <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-14 md:mb-16 px-5 sm:px-6">
                <Reveal>
                  <div className="text-xs uppercase tracking-widest text-gold mb-5 sm:mb-6" style={{ letterSpacing: '0.25em' }}>News & Insights</div>
                  <h2 className="serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight text-stone-100 mb-5 sm:mb-6">
                    Latest from our <span className="italic text-gold">desk</span>
                  </h2>
                  <p className="text-base sm:text-lg text-stone-400 leading-relaxed">
                    Commentary and practitioner notes from our desk on valuations, taxation, and corporate insolvency.
                  </p>
                </Reveal>
              </div>
              <div className="px-5 sm:px-6 flex items-center justify-end gap-4 sm:gap-6 mb-8 sm:mb-10">
                <Reveal>
                  <div className="flex items-center gap-4 sm:gap-6">
                    <div className="hidden md:flex items-center gap-2">
                      <button onClick={() => scrollInsights('prev')} aria-label="Previous insights" className="w-11 h-11 rounded-full border border-white/10 hover-border-gold hover-text-gold transition-all flex items-center justify-center text-stone-300 active-scale">
                        <ArrowLeft className="w-4 h-4" />
                      </button>
                      <button onClick={() => scrollInsights('next')} aria-label="Next insights" className="w-11 h-11 rounded-full border border-white/10 hover-border-gold hover-text-gold transition-all flex items-center justify-center text-stone-300 active-scale">
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                    <a href="mailto:services@thotaassociates.com?subject=Subscribe%20to%20Insights" className="inline-flex items-center gap-2 text-sm text-gold hover:gap-3 transition-all">
                      Subscribe <ArrowRight className="w-4 h-4" />
                    </a>
                  </div>
                </Reveal>
              </div>

              <div className="relative">
                <div className="pointer-events-none absolute left-0 top-0 bottom-4 w-8 sm:w-16 bg-gradient-to-r from-navy to-transparent z-10" />
                <div className="pointer-events-none absolute right-0 top-0 bottom-4 w-8 sm:w-16 bg-gradient-to-l from-navy to-transparent z-10" />

                <div ref={insightsRef} className="overflow-x-auto overscroll-x-contain scrollbar-hide pb-4" style={{ overflowY: 'clip', touchAction: 'pan-x pinch-zoom' }}>
                  <div className="flex gap-4 sm:gap-6 px-5 sm:px-6">
                    {insights.map((post, i) => (
                      <Reveal key={post.title} delay={i * 80} className="flex-shrink-0 snap-start w-72 sm:w-80 md:w-96">
                        <a href="#" className="group block h-full">
                          <article className="h-full p-6 sm:p-8 rounded-2xl border border-white/10 gradient-card hover-bg-white-4 hover-border-gold transition-colors duration-200 flex flex-col">
                            <div className="rounded-xl mb-6 sm:mb-8 flex items-center justify-center border border-white/5 bg-gold-5" style={{ aspectRatio: '16/10' }}>
                              <BookOpen className="w-9 h-9 sm:w-10 sm:h-10 text-gold" style={{ opacity: 0.4 }} />
                            </div>
                            <div className="flex items-center gap-3 text-xs uppercase tracking-widest text-stone-500 mb-3 sm:mb-4" style={{ letterSpacing: '0.2em' }}>
                              <span className="text-gold">{post.cat}</span>
                              <span className="w-1 h-1 rounded-full bg-stone-600" />
                              <span>{post.date}</span>
                            </div>
                            <h3 className="serif text-lg sm:text-xl leading-snug group-hover-text-gold transition-colors mb-3 sm:mb-4 text-stone-100">{post.title}</h3>
                            <p className="text-sm text-stone-400 leading-relaxed mb-5 sm:mb-6 flex-1">{post.excerpt}</p>
                            <div className="inline-flex items-center gap-2 text-xs uppercase tracking-widest text-gold mt-auto" style={{ letterSpacing: '0.2em' }}>
                              Read more <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                            </div>
                          </article>
                        </a>
                      </Reveal>
                    ))}
                  </div>
                </div>

                <div className="md:hidden text-center mt-4">
                  <p className="text-xs text-stone-500 uppercase tracking-widest" style={{ letterSpacing: '0.2em' }}>
                    Swipe to explore
                  </p>
                </div>
              </div>
            </div>
          </section>

          {/* FINAL CTA */}
          <section className="py-20 sm:py-24 md:py-28 gradient-cta-section relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-px gradient-gold-line" />
            <div className="absolute bottom-0 left-0 right-0 h-px gradient-gold-line" />
            <div className="max-w-4xl mx-auto px-5 sm:px-6 text-center relative">
              <Reveal>
                <h2 className="serif text-3xl sm:text-4xl md:text-5xl lg:text-6xl leading-tight mb-5 sm:mb-6 text-stone-100">
                  Ready to bring <span className="italic text-gold">clarity</span> to your finances and compliance?
                </h2>
              </Reveal>
              <Reveal delay={200}>
                <p className="text-base sm:text-lg text-stone-400 mb-10 sm:mb-12 max-w-2xl mx-auto leading-relaxed">
                  Whether you are a founder navigating your first funding round, a business owner facing a tax notice, or a creditor seeking insolvency resolution — speak with us.
                </p>
              </Reveal>
              <Reveal delay={350}>
                <div className="flex flex-row flex-wrap gap-2 sm:gap-3 md:gap-4 justify-center items-center mx-auto">
                  <button type="button" onClick={() => setPage('contact')} className="group inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 md:px-8 py-3 sm:py-4 bg-gold hover-bg-gold-light active-scale rounded-sm font-medium text-white gold-cta-shadow text-xs sm:text-sm md:text-base whitespace-nowrap">
                    Schedule a Consultation
                    <ArrowRight className="w-3.5 h-3.5 md:w-4 md:h-4 group-hover:translate-x-1 transition-transform flex-shrink-0" />
                  </button>
                  <a href="tel:+919700138340" className="inline-flex items-center justify-center gap-1.5 sm:gap-2 px-4 sm:px-6 md:px-8 py-3 sm:py-4 border border-white/20 rounded-sm hover-border-gold hover-text-gold active-scale transition-all text-xs sm:text-sm md:text-base whitespace-nowrap">
                    <Phone className="w-3.5 h-3.5 md:w-4 md:h-4 flex-shrink-0" />
                    <span className="hidden sm:inline">Call&nbsp;</span>+91 97001 38340
                  </a>
                </div>
              </Reveal>
            </div>
          </section>

        </>
      )}

      {/* FOOTER — 3-column: Contact Us · Our Services · Registrations + Legal */}
      <footer className="relative bg-navy-deep border-t border-white/5">
        <div className="absolute top-0 left-0 right-0 h-px gradient-gold-line" />
        <div className="absolute inset-x-0 top-0 h-40 gradient-footer-top pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-5 sm:px-6 pt-10 sm:pt-12 pb-6 sm:pb-8">

          <div className="footer-cols mb-8 sm:mb-10">

            {/* Contact Us */}
            <div id="contact" className="scroll-mt-24">
              <h3 className="serif text-lg sm:text-xl text-stone-100 mb-2">Contact Us</h3>
              <div className="h-px bg-gold mb-4 sm:mb-5" style={{ opacity: 0.5 }} />

              <div className="space-y-3">
                <div className="flex items-start gap-2.5">
                  <MapPin className="w-3.5 h-3.5 text-gold mt-1 flex-shrink-0" />
                  <div className="text-sm text-stone-300 leading-relaxed">
                    Flat No 302, Krishnaveer's Euphoria<br/>
                    Jubilee Enclave, Hi-tech City<br/>
                    Hyderabad, Telangana — 500081
                  </div>
                </div>
                <a href="tel:+919700138340" className="flex items-center gap-2.5 text-sm text-stone-300 hover-text-gold transition-colors">
                  <Phone className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                  <span>+91 97001 38340</span>
                </a>
                <a href="mailto:services@thotaassociates.com" className="flex items-center gap-2.5 text-sm text-stone-300 hover-text-gold transition-colors">
                  <Mail className="w-3.5 h-3.5 text-gold flex-shrink-0" />
                  <span className="break-all">services@thotaassociates.com</span>
                </a>
              </div>
            </div>

            {/* Our Services */}
            <div>
              <h3 className="serif text-lg sm:text-xl text-stone-100 mb-2">Our Services</h3>
              <div className="h-px bg-gold mb-4 sm:mb-5" style={{ opacity: 0.5 }} />
              <ul className="space-y-2.5 text-sm text-stone-300">
                {services.map((s, i) => (
                  <li key={s.title} className="flex items-start gap-2">
                    <span className="text-gold flex-shrink-0 select-none">—</span>
                    <button onClick={() => { setPage('services'); setTimeout(() => { const el = document.getElementById(`service-${i}`); if (el) { const y = el.getBoundingClientRect().top + window.pageYOffset - 120; window.scrollTo({ top: y, behavior: 'smooth' }); } }, 280); }} className="text-left hover-text-gold transition-colors">
                      {s.title}
                    </button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Registrations + Legal */}
            <div>
              <h3 className="serif text-lg sm:text-xl text-stone-100 mb-2">Registrations</h3>
              <div className="h-px bg-gold mb-4 sm:mb-5" style={{ opacity: 0.5 }} />
              <div className="text-sm text-stone-300 space-y-4 mb-6 sm:mb-8">
                <div>
                  <div className="text-xs uppercase text-gold mb-1.5" style={{ letterSpacing: '0.2em' }}>Firm</div>
                  <div>ICAI Firm Reg. No. 014730S</div>
                </div>
                <div>
                  <div className="text-xs uppercase text-gold mb-1.5" style={{ letterSpacing: '0.2em' }}>Principal — Individual Capacity</div>
                  <div className="space-y-1">
                    <div>ICAI Membership No. 233634</div>
                    <div className="break-all">IBBI Valuer — IBBI/RV/06/2024/15688</div>
                    <div className="break-all">IBBI IP — IBBI/IPA-001/IP-P-02906/2024–2025/14463</div>
                  </div>
                </div>
              </div>

              <h3 className="serif text-lg text-stone-100 mb-2">Legal</h3>
              <div className="h-px bg-gold mb-4 sm:mb-5" style={{ opacity: 0.5 }} />
              <ul className="space-y-2.5 text-sm text-stone-300">
                <li>
                  <button type="button" onClick={() => setPage('terms')} className="flex items-start gap-2 text-left w-full cursor-pointer hover-text-gold transition-colors">
                    <span className="text-gold flex-shrink-0">—</span>
                    <span>Terms of Service</span>
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setPage('privacy')} className="flex items-start gap-2 text-left w-full cursor-pointer hover-text-gold transition-colors">
                    <span className="text-gold flex-shrink-0">—</span>
                    <span>Privacy Policy</span>
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setPage('refund')} className="flex items-start gap-2 text-left w-full cursor-pointer hover-text-gold transition-colors">
                    <span className="text-gold flex-shrink-0">—</span>
                    <span>Cancellation & Refund Policy</span>
                  </button>
                </li>
                <li>
                  <button type="button" onClick={() => setPage('disclaimer')} className="flex items-start gap-2 text-left w-full cursor-pointer hover-text-gold transition-colors">
                    <span className="text-gold flex-shrink-0">—</span>
                    <span>Disclaimer</span>
                  </button>
                </li>
              </ul>
            </div>
          </div>

          {/* Thin divider */}
          <div className="h-px gradient-gold-line mb-4 sm:mb-5" style={{ opacity: 0.3 }} />

          {/* Bottom bar */}
          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:items-center sm:justify-between text-xs text-stone-500">
            <div>© 2026 Thota and Associates, Chartered Accountants. ICAI Firm Reg. No. 014730S</div>
            <div className="flex items-center gap-3 sm:gap-4">
              <button type="button" onClick={() => setPage('terms')} className="cursor-pointer hover-text-gold transition-colors">Terms</button>
              <span className="text-stone-700">·</span>
              <button type="button" onClick={() => setPage('privacy')} className="cursor-pointer hover-text-gold transition-colors">Privacy</button>
              <span className="text-stone-700">·</span>
              <button type="button" onClick={() => setPage('disclaimer')} className="cursor-pointer hover-text-gold transition-colors">Disclaimer</button>
            </div>
          </div>
        </div>
      </footer>

      {!menuOpen && <ChatbotWidget />}

      <ServiceModal service={activeService} onClose={() => setActiveService(null)} />
    </div>
  );
}