import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#4338ca',
};

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://www.contribute-to-small-projects.com'),
  verification: {
    google: '_9bW4Z_ka_jSvDwgw-tb9ykkSQaWHCQv_qxlk-cUNOQ',
  },
  title: {
    default: "Contribute to Small Projects",
    template: "%s | Contribute to Small Projects"
  },
  description: "Discover small open source projects (100-600 stars) perfect for your first contributions",
  keywords: ["open source", "beginner projects", "first contribution", "github", "contribute", "good first issue", "small projects", "100-600 stars"],
  authors: [{ name: "Contribute to Small Projects" }],
  creator: "Contribute to Small Projects",
  publisher: "Contribute to Small Projects",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://www.contribute-to-small-projects.com',
    siteName: 'Contribute to Small Projects',
    title: 'Contribute to Small Projects',
    description: 'Discover small open source projects (100-600 stars) perfect for your first contributions',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Contribute to Small Projects',
    description: 'Discover small open source projects (100-600 stars) perfect for your first contributions',
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
