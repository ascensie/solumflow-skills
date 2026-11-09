'use client';

import Link from 'next/link';

import { useCart } from '@solumflow-app/crm-client/shop/react';

export function CartLink() {
  const { lines, adding, loaded } = useCart();
  // A product on its way counts at once: it is in the cart the moment the button was pressed.
  const count = lines.length + adding.length;

  return (
    <Link href="/cart">
      Cart{loaded && count > 0 ? ` (${count})` : ''}
    </Link>
  );
}
