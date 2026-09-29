import type { Metadata, Viewport } from 'next';
import { Analytics } from '@vercel/analytics/next';
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
  title: 'Light Attenuation Demo | opticsdemos',
  description: 'Interactive Monte Carlo simulation of light absorption and scattering in tissue.',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  openGraph: {
    title: 'Light Attenuation Demo | opticsdemos',
    description: 'Interactive Monte Carlo simulation of light absorption and scattering in tissue.',
    url: 'https://opticsdemos.com',
    siteName: 'opticsdemos',
    images: [
      {
        url: 'https://opticsdemos.com/og.png',
        width: 1200,
        height: 630,
        alt: 'opticsdemos - Light Attenuation Demo',
      },
    ],
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Light Attenuation Demo | opticsdemos',
    description: 'Interactive Monte Carlo simulation of light absorption and scattering in tissue.',
    images: ['https://opticsdemos.com/og.png'],
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: 'cover',
};

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full overflow-hidden antialiased`}
    >
      <body className="h-full overflow-hidden bg-slate-100 overscroll-none">
        {children}
        <Analytics />
      </body>
    </html>
  );
}
