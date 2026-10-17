import type { Metadata } from 'next';

import { CartView } from '../../components/cart-view';

export const metadata: Metadata = { title: 'Cart', robots: { index: false } };

export default function CartPage() {
  return (
    <>
      <h1>Cart</h1>
      <CartView />
    </>
  );
}
