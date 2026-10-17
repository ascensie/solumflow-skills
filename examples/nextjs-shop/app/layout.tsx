import type { Metadata } from 'next';
import Link from 'next/link';
import type { ReactNode } from 'react';

import { CartProvider } from '@solumflow-app/crm-client/shop/react';

import { CartLink } from '../components/cart-link';
import { SITE_URL } from '../lib/shop-config';
import './globals.css';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: 'Example shop', template: '%s | Example shop' },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        {/* Holds the visitor's cart for every page below; it talks to /api/shop and nothing else. */}
        <CartProvider>
          <header>
            <Link href="/">Example shop</Link>
            <nav />
            <CartLink />
          </header>
          <main>{children}</main>
          <footer>
            <Link href="/terms">Terms and returns</Link>
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
