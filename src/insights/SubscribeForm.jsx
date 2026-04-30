import { useState } from 'react';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

const FORM_NAME = 'insights-subscribe';

const encode = (data) =>
  Object.keys(data)
    .map((key) => encodeURIComponent(key) + '=' + encodeURIComponent(data[key]))
    .join('&');

export default function SubscribeForm({ compact = false }) {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState('idle'); // idle | submitting | sent | error

  const submit = async (e) => {
    e.preventDefault();
    if (!email.trim() || status === 'submitting') return;
    setStatus('submitting');

    try {
      const response = await fetch('/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: encode({ 'form-name': FORM_NAME, email, 'bot-field': '' }),
      });
      if (response.ok) {
        setStatus('sent');
      } else {
        setStatus('error');
      }
    } catch (err) {
      console.warn('Subscribe submit failed:', err);
      setStatus('error');
    }
  };

  const widthClass = compact ? 'max-w-xl' : 'max-w-md';

  if (status === 'sent') {
    return (
      <div className={`${widthClass} mx-auto flex items-start gap-3 text-left`}>
        <CheckCircle2 className="w-5 h-5 text-gold flex-shrink-0 mt-0.5" />
        <div className="serif text-lg sm:text-xl text-stone-100 leading-snug">
          Thank you — you'll hear from us when we publish next.
        </div>
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className={`${widthClass} mx-auto text-center`}>
        <p className="text-sm text-stone-300 leading-relaxed">
          Something went wrong. Email us instead at{' '}
          <a href="mailto:services@thotaassociates.com" className="text-gold hover-text-gold-light underline underline-offset-2 transition-colors">
            services@thotaassociates.com
          </a>
          .
        </p>
      </div>
    );
  }

  return (
    <form
      onSubmit={submit}
      name={FORM_NAME}
      data-netlify="true"
      data-netlify-honeypot="bot-field"
      className={`${widthClass} mx-auto`}
    >
      <input type="hidden" name="form-name" value={FORM_NAME} />
      <div style={{ position: 'absolute', left: '-5000px' }} aria-hidden="true">
        <label>
          Don't fill this out if you're human:
          <input name="bot-field" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-end gap-3 sm:gap-4">
        <input
          type="email"
          name="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          aria-label="Email address"
          disabled={status === 'submitting'}
          className="flex-1 w-full bg-transparent border-b py-3 transition-colors text-stone-100 text-base border-white/10 focus-border-gold disabled:opacity-60"
          style={{ color: '#f5f5f4' }}
        />
        <button
          type="submit"
          disabled={status === 'submitting'}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gold hover-bg-gold-light disabled:opacity-70 active-scale rounded-sm font-medium text-white gold-cta-shadow text-sm whitespace-nowrap"
        >
          {status === 'submitting' ? (
            'Sending…'
          ) : (
            <>
              Subscribe
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      <p className="mt-3 text-xs text-stone-500 leading-relaxed text-center">
        We'll only email you when we publish. Unsubscribe anytime.
      </p>
    </form>
  );
}
