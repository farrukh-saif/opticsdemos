import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'Welcome to Optics - Light Absorption and Scattering Demo',
  description:
    'Interactive educational demo showing how light absorbs and scatters in tissue-like materials. Explore Beer-Lambert law and Monte Carlo photon transport.',
  keywords: ['optics', 'physics', 'education', 'absorption', 'scattering', 'tissue optics', 'Beer-Lambert'],
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-gray-900">{children}</body>
    </html>
  );
}
