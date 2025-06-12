
// app/layout.tsx
import './globals.css';
import { Providers } from "./components/Providers";
import Header from "./components/Header";
import Footer from "./components/Footer";
export const metadata = {
  title: "Tusch.mn",
  description: "Ton site de services en Mongolie",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body className="max-w-[1240px] mx-auto px-4">
        <Header/>
        <Providers>{children}</Providers>
        <Footer/>
        </body>
    </html>
  );
}
