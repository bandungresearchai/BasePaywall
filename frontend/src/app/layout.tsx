import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import '@coinbase/onchainkit/styles.css';
import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'BasePaywall - On-Chain Content Paywall',
  description: 'Decentralized HTTP 402 paywall on Base L2. Pay with ETH to unlock premium content.',
  keywords: ['Base', 'Paywall', 'Web3', 'Blockchain', 'HTTP 402', 'OnchainKit'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
