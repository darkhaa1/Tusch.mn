/**
 * Atelier Home — CallToAction tri-color strip.
 * Desktop: 3 equal columns (terre / cobalt / ocre), 240px+ tall, no gap (atelier-desktop.jsx 301-327).
 * Mobile: stacks vertically. (The mobile design has no CTA strip; we render a compact stacked
 * version so the page still has a closing CTA on phones.)
 */
import Link from 'next/link';

const labels = {
  providers: {
    eyebrow: 'МАСТЕРУУДАД',
    titleA: 'Шинэ ',
    titleItalic: 'үйлчлүүлэгчдийг',
    titleC: ' ол.',
    body: '15 минутын дотор профайлаа үүсгээд орон нутгийнхаа хүсэлтүүдийг хүлээж аваарай.',
    cta: 'Мастер болох →',
    href: '/become-provider',
  },
  clients: {
    eyebrow: 'ҮЙЛЧЛҮҮЛЭГЧДЭД',
    titleA: 'Хүсэлтээ ',
    titleItalic: 'үнэгүй',
    titleC: ' нийтэл.',
    body: 'Тайлбараа бичээд 24 цагт дунджаар 4 санал хүлээж аваарай.',
    cta: 'Хүсэлт оруулах →',
    href: '/ajil-nemeh',
  },
  membership: {
    eyebrow: 'tusch · ОНЦГОЙ',
    titleA: '7 хоног ',
    titleItalic: 'үнэгүй',
    titleC: ' туршаарай.',
    body: 'tusch+ гишүүнчлэлээр бүх онцлог нээгдэнэ. Сонголт хязгааргүй.',
    cta: 'Гишүүнчлэл →',
    href: '/membership',
  },
};

type CtaPanel = (typeof labels)[keyof typeof labels];

type PanelProps = {
  panel: CtaPanel;
  bgClass: string;
  textClass: string;
  eyebrowOpacity: number;
};

function Panel({ panel, bgClass, textClass, eyebrowOpacity }: PanelProps) {
  return (
    <Link
      href={panel.href}
      className={`block ${bgClass} ${textClass} px-10 py-12 min-h-60`}
    >
      <div
        className="uppercase"
        style={{
          fontFamily: 'var(--at-mono)',
          fontSize: 10,
          letterSpacing: '0.2em',
          opacity: eyebrowOpacity,
        }}
      >
        {panel.eyebrow}
      </div>
      <h3
        className="m-0 my-4"
        style={{
          fontFamily: 'var(--at-serif)',
          fontSize: 30,
          fontWeight: 400,
          lineHeight: 1.05,
          letterSpacing: '-0.025em',
        }}
      >
        {panel.titleA}
        <em style={{ fontStyle: 'var(--at-italic-style, italic)' }}>{panel.titleItalic}</em>
        {panel.titleC}
      </h3>
      <p
        className="m-0 mt-0"
        style={{ fontSize: 13, lineHeight: 1.5, opacity: 0.85 }}
      >
        {panel.body}
      </p>
      <div
        className="mt-6"
        style={{
          fontFamily: 'var(--at-serif)',
          fontStyle: 'var(--at-italic-style, italic)',
          fontSize: 14,
        }}
      >
        {panel.cta}
      </div>
    </Link>
  );
}

export default function CallToAction() {
  return (
    <section className="grid grid-cols-1 md:grid-cols-3 gap-0">
      <Panel
        panel={labels.providers}
        bgClass="bg-atelier-terre"
        textClass="text-atelier-cream"
        eyebrowOpacity={0.7}
      />
      <Panel
        panel={labels.clients}
        bgClass="bg-atelier-cobalt"
        textClass="text-atelier-cream"
        eyebrowOpacity={0.7}
      />
      <Panel
        panel={labels.membership}
        bgClass="bg-atelier-ocre"
        textClass="text-atelier-ink"
        eyebrowOpacity={0.75}
      />
    </section>
  );
}
