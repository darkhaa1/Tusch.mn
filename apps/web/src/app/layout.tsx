import '../styles/globals.css';
import type { Metadata } from 'next';
import { Noto_Sans, Noto_Serif, Noto_Sans_Mono, DM_Sans } from 'next/font/google';
import { Providers } from './Providers';
import { IntlProvider } from './IntlProvider';
import VerificationBanner from '@web/components/common/VerificationBanner';
import { OrganizationJsonLd } from '@web/components/seo/JsonLd';
import { DesktopNav, DesktopFooter, MobileTabBar } from '@web/components/ui-v2';

const notoSans = Noto_Sans({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-noto-sans',
  display: 'swap',
  preload: true,
});

const notoSerif = Noto_Serif({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-noto-serif',
  display: 'swap',
  preload: true,
});

const notoMono = Noto_Sans_Mono({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-mono',
  display: 'swap',
  preload: false,
});

const dmSans = DM_Sans({
  subsets: ['latin', 'latin-ext'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-dm-sans',
  display: 'swap',
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL('https://tusch.mn'),
  title: {
    default: 'Tusch.mn - Үйлчилгээний зах зээл',
    template: '%s | Tusch.mn',
  },
  description:
    'Монголын найдвартай үйлчилгээ үзүүлэгчдийг олоорой: сантехник, барилга, зөөвөрлөлт, цэвэрлэгээ болон бусад.',
  keywords: ['үйлчилгээ', 'сантехник', 'барилга', 'зөөвөрлөлт', 'цэвэрлэгээ', 'мужаан', 'Улаанбаатар', 'Монгол'],
  icons: { icon: '/favicon.ico' },
  openGraph: {
    type: 'website',
    locale: 'mn_MN',
    siteName: 'Tusch.mn',
  },
  twitter: {
    card: 'summary_large_image',
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const fontVars = `${notoSans.variable} ${notoSerif.variable} ${notoMono.variable} ${dmSans.variable}`;
  return (
    <html lang="mn">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body
        className={`${fontVars} bg-atelier-paper text-atelier-ink min-h-screen antialiased`}
        style={{ fontFamily: 'var(--at-sans)' }}
      >
        <OrganizationJsonLd />
        <IntlProvider>
          <Providers>
            <DesktopNav />
            <VerificationBanner />
            <main className="min-h-screen bg-atelier-paper">{children}</main>
            <DesktopFooter />
            <MobileTabBar />
          </Providers>
        </IntlProvider>
      </body>
    </html>
  );
}
