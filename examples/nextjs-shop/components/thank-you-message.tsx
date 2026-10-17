'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef } from 'react';

import { pushPurchaseEvent, useCart } from '@solumflow-app/crm-client/shop/react';

/**
 * What the visitor sees after paying. A payment that finished on the checkout
 * page has already told the data layer; one that went through another site
 * (iDEAL, a bank app) comes back here with Stripe's `redirect_status`, and
 * this is where its purchase is reported, once.
 */
export function ThankYouMessage() {
  const params = useSearchParams();
  const { cart } = useCart();
  const reported = useRef(false);

  const order = params.get('order');
  const returnedFromAnotherSite = params.has('redirect_status');
  const status = params.get('redirect_status');

  // An effect, because the data layer is the page's own and only exists in a browser.
  useEffect(() => {
    if (!reported.current && order && returnedFromAnotherSite && status === 'succeeded' && cart?.closed) {
      reported.current = true;
      pushPurchaseEvent(cart, order);
    }
  }, [cart, order, returnedFromAnotherSite, status]);

  if (status === 'failed') {
    return (
      <p className="error">
        The payment did not go through. <Link href="/checkout">Try again</Link>
      </p>
    );
  }

  return (
    <>
      <p>Thank you for your order{order ? ` ${order}` : ''}. A confirmation is on its way by email.</p>
      <Link href="/">Continue shopping</Link>
    </>
  );
}
