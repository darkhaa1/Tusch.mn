import './globals.css';
import { Inter } from 'next/font/google';
import { Providers } from './Providers';
import Header from './home page components/Header';
import Footer from './home page components/Footer';
import BottomNav from '../components/nav/BottomNav';

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
    <html lang="fr">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className={`${inter.variable} font-sans max-w-[1240px] mx-auto px-4`}>
        {/* Providers englobe tout le contenu qui peut utiliser session/react-query */}
        <Providers>
          <Header />
          {children}
          <Footer />
          <BottomNav />
        </Providers>
      </body>
    </html>
  );
}
