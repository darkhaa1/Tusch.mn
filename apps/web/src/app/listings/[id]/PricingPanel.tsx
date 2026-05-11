'use client';

/**
 * Pricing aside (desktop sticky) for listing detail — Atelier redesign.
 * Cream Block bordered by ink; price headline with italic ₮; mini cost breakdown;
 * primary "Санал илгээх" CTA + outline "Зурвас бичих"; trust note in mono.
 */
import * as React from 'react';

const labels = {
  startingPrice: 'Эхлэх үнэ',
  estimate: 'Тооцоо',
  area: 'Талбай',
  category: 'Ангилал',
  location: 'Байршил',
  posted: 'Зар нийтэлсэн',
  sendOffer: 'Санал илгээх',
  message: 'Зурвас бичих',
  trust: 'Захиалга баталгаажих хүртэл төлбөр хамгаалагдсан.',
  priceOnRequest: 'Зөвшилцөнө',
  unknown: 'Тодорхойгүй',
};

export interface PricingPanelProps {
  price: number;
  categoryLabel?: string | null;
  locationLabel?: string;
  postedLabel?: string;
  badge?: string | null;
  onSendOffer?: () => void;
  onMessage?: () => void;
  canSendOffer?: boolean;
  canMessage?: boolean;
  offerCtaLabel?: string;
  messageCtaLabel?: string;
}

function formatPrice(price: number): { whole: string; suffix: string } | null {
  if (typeof price !== 'number' || price <= 0) return null;
  return { whole: price.toLocaleString('mn-MN'), suffix: '₮' };
}

export function PricingPanel({
  price,
  categoryLabel,
  locationLabel,
  postedLabel,
  badge,
  onSendOffer,
  onMessage,
  canSendOffer = true,
  canMessage = true,
  offerCtaLabel,
  messageCtaLabel,
}: PricingPanelProps): React.ReactElement {
  const parsed = formatPrice(price);

  return (
    <div
      className="bg-atelier-cream"
      style={{ padding: 28, border: '1px solid var(--at-ink)' }}
    >
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <div
            className="text-atelier-muted"
            style={{ fontFamily: 'var(--at-mono)', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase' }}
          >
            {labels.startingPrice}
          </div>
          <div
            className="text-atelier-ink"
            style={{ fontFamily: 'var(--at-serif)', fontSize: 44, letterSpacing: '-0.04em', marginTop: 4, lineHeight: 1 }}
          >
            {parsed ? (
              <>
                {parsed.whole}
                <em style={{ fontStyle: 'var(--at-italic-style, italic)', fontSize: 22, marginLeft: 2 }}>
                  {parsed.suffix}
                </em>
              </>
            ) : (
              <span style={{ fontSize: 26, fontStyle: 'var(--at-italic-style, italic)' }}>{labels.priceOnRequest}</span>
            )}
          </div>
        </div>
        {badge && (
          <span
            className="bg-atelier-ocre text-atelier-ink"
            style={{
              padding: '5px 10px',
              fontFamily: 'var(--at-mono)',
              fontSize: 10,
              letterSpacing: '0.1em',
              textTransform: 'uppercase',
              whiteSpace: 'nowrap',
            }}
          >
            {badge}
          </span>
        )}
      </div>

      <div className="mt-5 pt-5" style={{ borderTop: '1px solid var(--at-line)' }}>
        <div
          className="mb-2 text-atelier-muted"
          style={{ fontFamily: 'var(--at-mono)', fontSize: 10, letterSpacing: '0.15em', textTransform: 'uppercase' }}
        >
          {labels.estimate}
        </div>
        <Row k={labels.category} v={categoryLabel || labels.unknown} />
        <Row k={labels.location} v={locationLabel || labels.unknown} />
        {postedLabel && <Row k={labels.posted} v={postedLabel} />}
      </div>

      {canSendOffer && (
        <button
          type="button"
          onClick={onSendOffer}
          className="mt-5 block w-full text-center bg-atelier-terre text-atelier-cream transition hover:opacity-90"
          style={{
            padding: '14px 18px',
            fontFamily: 'var(--at-serif)',
            fontSize: 15,
            fontWeight: 500,
          }}
        >
          {offerCtaLabel || labels.sendOffer} <span aria-hidden="true">→</span>
        </button>
      )}
      {canMessage && (
        <button
          type="button"
          onClick={onMessage}
          className="mt-2 block w-full text-center text-atelier-ink transition hover:bg-atelier-ink hover:text-atelier-cream"
          style={{
            padding: '13px 18px',
            border: '1px solid var(--at-ink)',
            fontFamily: 'var(--at-serif)',
            fontStyle: 'var(--at-italic-style, italic)',
            fontSize: 14,
          }}
        >
          {messageCtaLabel || labels.message}
        </button>
      )}

      <div
        className="mt-4 text-center text-atelier-muted"
        style={{ fontFamily: 'var(--at-mono)', fontSize: 10, letterSpacing: '0.05em' }}
      >
        {labels.trust}
      </div>
    </div>
  );
}

function Row({ k, v }: { k: string; v: React.ReactNode }): React.ReactElement {
  return (
    <div
      className="flex items-baseline justify-between gap-3 py-1"
      style={{ fontFamily: 'var(--at-serif)', fontSize: 14 }}
    >
      <span className="text-atelier-muted" style={{ fontStyle: 'var(--at-italic-style, italic)' }}>
        {k}
      </span>
      <span className="text-atelier-ink text-right">{v}</span>
    </div>
  );
}
