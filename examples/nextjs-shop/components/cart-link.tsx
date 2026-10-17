'use client';

import Link from 'next/link';

import { useCart } from '@solumflow-app/crm-client/shop/react';

export function CartLink() {
  const { lines, loaded } = useCart();

  return (
    <Link href="/cart">
      Cart{loaded && lines.length > 0 ? ` (${lines.length})` : ''}
    </Link>
  );
}
