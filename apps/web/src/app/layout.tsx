import '../styles/globals.css';
import { Inter } from 'next/font/google';
import { Providers } from './Providers';
import { IntlProvider } from './IntlProvider';
import Header from '@web/features/home/components/Header';
import Footer from '@web/features/home/components/Footer';
import BottomNav from '@web/components/nav/BottomNav';
import VerificationBanner from '@web/components/common/VerificationBanner';

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

export const metadata = {
  title: 'Tusch.mn',
  description: 'Ton site de services en Mongolie',
  icons: { icon: '/favicon.ico' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={`${inter.variable} font-sans max-w-[1240px] mx-auto px-4`}>
        <IntlProvider>
          {/* Providers englobe tout le contenu qui peut utiliser session/react-query */}
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
