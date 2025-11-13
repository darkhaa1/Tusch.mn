import './globals.css';
import { Providers } from './Providers';
import Header from './components/Header';
import Footer from './components/Footer';

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
      <body className="max-w-[1240px] mx-auto px-4">
        {/* Providers englobe tout le contenu qui peut utiliser session/react-query */}
        <Providers>
          <Header />
          {children}
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
