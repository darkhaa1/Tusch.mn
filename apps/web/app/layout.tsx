
// app/layout.tsx
import './globals.css';
import { Providers } from "../components/Providers";

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
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
