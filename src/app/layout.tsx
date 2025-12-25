
import React from "react";
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "StockFlow - Modern Inventory Management & POS System",
  description: "Professional inventory management and point-of-sale system for small retail stores. Manage products, track sales, generate QR codes, and streamline your business operations.",
  keywords: ["inventory management", "POS system", "point of sale", "retail management", "stock tracking", "sales tracking", "QR code inventory", "small business"],
  authors: [{ name: "StockFlow Team" }],
  creator: "StockFlow",
  publisher: "StockFlow",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'),
  openGraph: {
    title: "StockFlow - Modern Inventory Management System",
    description: "Professional inventory and POS system for small retail stores with QR code support",
    url: '/',
    siteName: 'StockFlow',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "StockFlow - Inventory Management & POS",
    description: "Modern inventory and point-of-sale system for retail businesses",
    creator: '@stockflow',
  },
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
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  themeColor: '#6366f1',
  manifest: '/manifest.json',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body suppressHydrationWarning={true}>{children}</body>
    </html>
  );
}
