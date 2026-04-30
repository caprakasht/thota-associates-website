/**
 * ChatbotWidget.jsx
 * Thota and Associates — Enquiry Assistant
 *
 * Styled to match the site's navy + gold aesthetic.
 *
 * Flow:
 *  1. Pick service → context → urgency
 *  2. Enter name + phone
 *  3. Submit enquiry → captured to Netlify Forms (you receive email)
 *  4. User choose: open WhatsApp now, or finish without WhatsApp
 *
 * Replaces the old standalone WhatsApp button — funnels users through
 * a guided enquiry flow before optionally opening WhatsApp.
 */

import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, ArrowRight, Send, CheckCircle2 } from 'lucide-react';

const WHATSAPP_NUMBER = '919700138340'; // CA Bhanu Prakash Thota
const FORM_NAME = 'chatbot-enquiry';

const SERVICES = [
  {
    id: 'valuation',
    label: 'Business Valuation',
    context: [
      'Transaction (M&A, fundraise, transfer)',
      'Regulatory filing (Income Tax, FEMA, RBI)',
      'Dispute / litigation support',
      'Other / not sure',
    ],
  },
  {
    id: 'insolvency',
    label: 'Insolvency & IBC',
    context: [
      'I am a creditor',
      'I am a debtor / promoter',
      'Looking for IP services',
      'General enquiry',
    ],
  },
  {
    id: 'vcfo',
    label: 'Startup advisory / vCFO',
    context: [
      'Pre-revenue / idea stage',
      'Early revenue (under ₹5 Cr)',
      'Growth stage (₹5 Cr+)',
      'Funded / scaling',
    ],
  },
  {
    id: 'tax',
    label: 'Income Tax / GST',
    context: [
      'Individual income tax',
      'Business income tax',
      'GST compliance / litigation',
      'Tax notice received',
      'International taxation',
    ],
  },
  {
    id: 'audit',
    label: 'Audit & Assurance',
    context: ['Statutory audit', 'Tax audit', 'Internal audit', 'Other'],
  },
  {
    id: 'fema',
    label: 'FEMA / ROC compliance',
    context: [
      'FEMA filings (FC-GPR, FC-TRS, etc.)',
      'ROC / Companies Act compliance',
      'Both',
    ],
  },
  { id: 'other', label: 'Something else', context: null },
];

const URGENCY = [
  { id: 'this-week', label: 'This week' },
  { id: 'this-month', label: 'This month' },
  { id: 'exploring', label: 'Just exploring' },
];

export default function ChatbotWidget() {
  const [open, setOpen] = useState(false);
  // steps: greeting → context → urgency → details → submitted → done
  const [step, setStep] = useState('greeting');
  const [data, setData] = useState({
    service: null,
    context: null,
    urgency: null,
    name: '',
    phone: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const scrollRef = useRef(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [step]);

  const reset = () => {
    setStep('greeting');
    setData({ service: null, context: null, urgency: null, name: '', phone: '' });
  };

  const selectService = (service) => {
    setData((d) => ({ ...d, service }));
    setStep(service.context ? 'context' : 'urgency');
  };

  const selectContext = (ctx) => {
    setData((d) => ({ ...d, context: ctx }));
    setStep('urgency');
  };

  const selectUrgency = (u) => {
    setData((d) => ({ ...d, urgency: u.label }));
    setStep('details');
  };

  const encode = (obj) =>
    Object.keys(obj)
      .map((k) => encodeURIComponent(k) + '=' + encodeURIComponent(obj[k]))
      .join('&');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!data.name.trim() || !data.phone.trim()) return;
    setSubmitting(true);

    // Capture to Netlify Forms — this is what triggers the email to you
    try {
      await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode({
          'form-name': FORM_NAME,
          name: data.name,
          phone: data.phone,
          service: data.service?.label || '',
          context: data.context || '',
          urgency: data.urgency || '',
        }),
      });
    } catch (err) {
      // Submission may fail in dev (no Netlify) — proceed regardless.
      console.warn('Form capture failed (expected in local dev):', err);
    }

    setSubmitting(false);
    setStep('submitted');
  };

  const buildWhatsAppUrl = () => {
    const lines = [
      `Hi, I'm ${data.name.trim()}.`,
      `Came via thotaassociates.com.`,
      ``,
      `Service: ${data.service?.label || 'General enquiry'}`,
    ];
    if (data.context) lines.push(`Context: ${data.context}`);
    if (data.urgency) lines.push(`Timeline: ${data.urgency}`);
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(
      lines.join('\n')
    )}`;
  };

  const openWhatsApp = () => {
    window.open(buildWhatsAppUrl(), '_blank', 'noopener,noreferrer');
    setStep('done');
  };

  return (
    <>
      {/* Floating launcher — gold pulsing button matching the original WhatsApp button */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-label={open ? 'Close enquiry assistant' : 'Open enquiry assistant'}
        className="fixed bottom-5 right-5 sm:bottom-6 sm:right-6 z-40 w-12 h-12 sm:w-14 sm:h-14 rounded-full bg-gold flex items-center justify-center active-scale hover:scale-110 transition-transform whatsapp-shadow text-white"
      >
        {open ? (
          <X className="w-5 h-5 sm:w-6 sm:h-6" />
        ) : (
          <>
            <MessageCircle className="w-5 h-5 sm:w-6 sm:h-6" />
            <span
              className="absolute inset-0 rounded-full bg-gold animate-ping"
              style={{ opacity: 0.2 }}
            />
          </>
        )}
      </button>

      {/* Chat panel */}
      <div
        className={`fixed bottom-20 right-5 sm:bottom-24 sm:right-6 z-40 w-[calc(100vw-2.5rem)] max-w-sm origin-bottom-right transition-all duration-300 ${
          open
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        <div
          className="rounded-2xl border border-gold-30 overflow-hidden flex flex-col bg-navy-95 backdrop-blur-xl"
          style={{
            height: 'min(560px, calc(100vh - 8rem))',
            boxShadow:
              '0 20px 60px -15px rgba(0, 0, 0, 0.6), 0 0 0 1px rgba(201, 169, 97, 0.1)',
          }}
        >
          {/* Header */}
          <div className="px-5 py-4 border-b border-gold-20 bg-navy-deep">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-gold-10 border border-gold-30 flex items-center justify-center flex-shrink-0">
                <span
                  className="serif italic text-gold"
                  style={{ fontSize: '15px', lineHeight: 1, fontWeight: 500 }}
                >
                  T
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <div className="serif text-stone-100 text-[15px] leading-tight truncate">
                  Thota and Associates
                </div>
                <div
                  className="text-[10px] uppercase text-gold flex items-center gap-1.5 mt-0.5"
                  style={{ letterSpacing: '0.2em' }}
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-gold" />
                  Enquiry Assistant
                </div>
              </div>
            </div>
          </div>

          {/* Body */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto px-4 py-4 space-y-3 bg-navy"
          >
            <Bubble>
              Hello — thanks for visiting. I'll help connect you with the right
              practice area.
              <br />
              <br />
              <span className="text-stone-400">What brings you here today?</span>
            </Bubble>

            {step === 'greeting' && (
              <OptionList>
                {SERVICES.map((s) => (
                  <OptionButton key={s.id} onClick={() => selectService(s)}>
                    {s.label}
                  </OptionButton>
                ))}
              </OptionList>
            )}

            {data.service && <UserBubble>{data.service.label}</UserBubble>}

            {data.service?.context &&
              (step === 'context' ||
                step === 'urgency' ||
                step === 'details' ||
                step === 'submitted' ||
                step === 'done') && (
                <Bubble>Could you share a bit more about what you're looking for?</Bubble>
              )}

            {step === 'context' && data.service?.context && (
              <OptionList>
                {data.service.context.map((c) => (
                  <OptionButton key={c} onClick={() => selectContext(c)}>
                    {c}
                  </OptionButton>
                ))}
              </OptionList>
            )}

            {data.context && <UserBubble>{data.context}</UserBubble>}

            {(step === 'urgency' ||
              step === 'details' ||
              step === 'submitted' ||
              step === 'done') && (
              <Bubble>When are you looking to engage?</Bubble>
            )}

            {step === 'urgency' && (
              <OptionList>
                {URGENCY.map((u) => (
                  <OptionButton key={u.id} onClick={() => selectUrgency(u)}>
                    {u.label}
                  </OptionButton>
                ))}
              </OptionList>
            )}

            {data.urgency && <UserBubble>{data.urgency}</UserBubble>}

            {(step === 'details' ||
              step === 'submitted' ||
              step === 'done') && (
              <Bubble>
                Please share your name and phone number. We'll get back to you
                within one business day.
              </Bubble>
            )}

            {step === 'details' && (
              <form
                onSubmit={handleSubmit}
                className="rounded-xl border border-gold-20 bg-white-2 p-3 space-y-2.5"
              >
                <div>
                  <label
                    htmlFor="chatbot-name"
                    className="block text-[10px] uppercase text-gold mb-1.5"
                    style={{ letterSpacing: '0.2em' }}
                  >
                    Your name
                  </label>
                  <input
                    id="chatbot-name"
                    type="text"
                    required
                    value={data.name}
                    onChange={(e) =>
                      setData((d) => ({ ...d, name: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm bg-white-4 border border-white/15 rounded-md text-stone-100 placeholder:text-stone-500 focus-border-gold transition-colors"
                    style={{ color: '#f5f5f4' }}
                    placeholder="Full name"
                    autoComplete="name"
                    autoFocus
                  />
                </div>
                <div>
                  <label
                    htmlFor="chatbot-phone"
                    className="block text-[10px] uppercase text-gold mb-1.5"
                    style={{ letterSpacing: '0.2em' }}
                  >
                    Phone (with country code)
                  </label>
                  <input
                    id="chatbot-phone"
                    type="tel"
                    required
                    value={data.phone}
                    onChange={(e) =>
                      setData((d) => ({ ...d, phone: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm bg-white-4 border border-white/15 rounded-md text-stone-100 placeholder:text-stone-500 focus-border-gold transition-colors"
                    style={{ color: '#f5f5f4' }}
                    placeholder="+91 98765 43210"
                    autoComplete="tel"
                  />
                </div>
                <button
                  type="submit"
                  disabled={submitting}
                  className="w-full bg-gold hover-bg-gold-light disabled:opacity-70 text-white font-medium py-2.5 rounded-md flex items-center justify-center gap-2 transition-all gold-cta-shadow active-scale text-sm"
                >
                  {submitting ? (
                    'Sending…'
                  ) : (
                    <>
                      Submit Enquiry
                      <Send className="w-3.5 h-3.5" />
                    </>
                  )}
                </button>
              </form>
            )}

            {/* Submitted state — confirmation + WhatsApp option */}
            {(step === 'submitted' || step === 'done') && (
              <UserBubble>
                {data.name} · {data.phone}
              </UserBubble>
            )}

            {step === 'submitted' && (
              <>
                <Bubble>
                  <div className="flex items-start gap-2.5 mb-2">
                    <CheckCircle2 className="w-4 h-4 text-gold flex-shrink-0 mt-0.5" />
                    <span className="text-stone-100 font-medium">
                      Enquiry received, {data.name.split(' ')[0]}.
                    </span>
                  </div>
                  We'll respond by email or phone within one business day.
                  <br />
                  <br />
                  <span className="text-stone-400">
                    Would you like to send the same message on WhatsApp now for a
                    faster response?
                  </span>
                </Bubble>

                <div className="flex flex-col gap-1.5 pt-1">
                  <button
                    type="button"
                    onClick={openWhatsApp}
                    className="w-full bg-gold hover-bg-gold-light text-white font-medium py-2.5 rounded-md flex items-center justify-center gap-2 transition-all gold-cta-shadow active-scale text-sm"
                  >
                    Send on WhatsApp
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setStep('done')}
                    className="text-xs text-stone-400 hover-text-gold py-2 transition-colors"
                  >
                    No thanks, I'll wait for your reply
                  </button>
                </div>
              </>
            )}

            {step === 'done' && (
              <Bubble>
                Thank you. We'll be in touch shortly.
                <br />
                <br />
                <button
                  onClick={reset}
                  className="text-xs text-gold underline underline-offset-2 hover-text-gold transition-colors"
                >
                  Start a new enquiry
                </button>
              </Bubble>
            )}
          </div>

          {/* Disclaimer footer */}
          <div className="px-4 py-2.5 border-t border-gold-20 bg-navy-deep">
            <p className="text-[10px] leading-snug text-stone-500 text-center">
              Enquiry assistant only — not professional advice. Engagements are
              subject to a formal letter.
            </p>
          </div>
        </div>
      </div>
    </>
  );
}

// ---- Sub-components ------------------------------------------------------

function Bubble({ children }) {
  return (
    <div className="max-w-[88%] rounded-2xl rounded-tl-sm px-3.5 py-2.5 text-sm leading-relaxed border border-white/10 bg-white-2 text-stone-200">
      {children}
    </div>
  );
}

function UserBubble({ children }) {
  return (
    <div className="flex justify-end">
      <div className="max-w-[88%] rounded-2xl rounded-tr-sm px-3.5 py-2 text-sm bg-gold-10 border border-gold-30 text-stone-100">
        {children}
      </div>
    </div>
  );
}

function OptionList({ children }) {
  return <div className="flex flex-col gap-1.5 pt-1">{children}</div>;
}

function OptionButton({ onClick, children }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="text-left text-sm bg-white-2 border border-white/10 hover-border-gold hover-bg-white-4 rounded-lg px-3.5 py-2 transition-colors text-stone-200 active-scale flex items-center justify-between gap-2 group"
    >
      <span>{children}</span>
      <ArrowRight className="w-3.5 h-3.5 text-gold opacity-0 group-hover-opacity-100 group-hover-translate-x-1 transition-all flex-shrink-0" />
    </button>
  );
}
