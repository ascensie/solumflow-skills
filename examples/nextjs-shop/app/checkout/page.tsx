import type { Metadata } from 'next';

import { CheckoutForm } from '../../components/checkout-form';

export const metadata: Metadata = { title: 'Checkout', robots: { index: false } };

export default function CheckoutPage() {
  return (
    <>
      <h1>Checkout</h1>
      <CheckoutForm />
    </>
  );
}
