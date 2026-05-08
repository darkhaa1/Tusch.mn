import '../styles/globals.css';
import type { Metadata } from 'next';
import { Noto_Sans, Noto_Serif, Noto_Sans_Mono } from 'next/font/google';
import { Providers } from './Providers';
import { IntlProvider } from './IntlProvider';
import Header from '@web/features/home/components/Header';
import Footer from '@web/features/home/components/Footer';
import BottomNav from '@web/components/nav/BottomNav';
import VerificationBanner from '@web/components/common/VerificationBanner';
import { OrganizationJsonLd } from '@web/components/seo/JsonLd';

const notoSans = Noto_Sans({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
  preload: true,
});

const notoSerif = Noto_Serif({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-noto-serif',
  display: 'swap',
  preload: false,
});

const notoSansMono = Noto_Sans_Mono({
  subsets: ['latin', 'cyrillic'],
  weight: ['400', '500', '700'],
  variable: '--font-noto-mono',
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
  return (
    <html lang="mn">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={`${notoSans.variable} ${notoSerif.variable} ${notoSansMono.variable} font-sans max-w-310 mx-auto px-4`}>
        <OrganizationJsonLd />
        <IntlProvider>
          {/* Providers wraps all content that uses session/react-query */}
          <Providers>
            <Header />
            <VerificationBanner />
            {children}
            <Footer />
            <BottomNav />
          </Providers>
        </IntlProvider>
      </body>
    </html>
  );
}
