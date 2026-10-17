'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

import { useCart, useCheckout } from '@solumflow-app/crm-client/shop/react';

import { formatMoney } from '../lib/format-money';

/**
 * Where it goes, how it goes, who pays, then Stripe's own payment field.
 * The server prices every step: the shipping methods, the total and the
 * amount charged are read from the cart and from the payment it made.
 */
export function CheckoutForm() {
  const { cart, loaded } = useCart();
  const checkout = useCheckout();
  const container = useRef<HTMLDivElement>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    email: '',
    firstName: '',
    lastName: '',
    line1: '',
    postalCode: '',
    city: '',
    countryCode: 'NL',
  });

  const payment = checkout.payment;

  // An effect, because Stripe draws its field into a DOM node that only exists after the render.
  useEffect(() => {
    if (payment && container.current) {
      void checkout.mountPaymentElement(container.current);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [payment]);

  if (!loaded) {
    return <p>Loading...</p>;
  }

  if (!cart || cart.lines.length === 0) {
    return (
      <p>
        Your cart is empty. <Link href="/">Continue shopping</Link>
      </p>
    );
  }

  const currency = cart.currency;

  function change(field: keyof typeof form, value: string) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function chooseDestination() {
    if (form.countryCode.length === 2) {
      await checkout.setDestination({
        countryCode: form.countryCode.toUpperCase(),
        postalCode: form.postalCode || undefined,
      });
    }
  }

  async function pay(event: React.FormEvent) {
    event.preventDefault();
    setMessage(null);

    const started = await checkout.start({
      buyer: { email: form.email, firstName: form.firstName, lastName: form.lastName },
      address: {
        line1: form.line1,
        postalCode: form.postalCode,
        city: form.city,
        countryCode: form.countryCode.toUpperCase(),
      },
    });

    if (!started.ok) {
      setMessage(started.error.message);
    }
  }

  async function confirm() {
    if (!payment) {
      return;
    }

    const returnUrl = `${window.location.origin}/thank-you?order=${encodeURIComponent(payment.orderNumber)}`;
    const outcome = await checkout.confirmPayment({ returnUrl });

    if (outcome.status === 'failed') {
      setMessage(outcome.message);
    } else {
      // A payment that needs no redirect answers here; the thank-you page reads the order number.
      window.location.assign(returnUrl);
    }
  }

  return (
    <>
      <form onSubmit={pay}>
        <fieldset disabled={payment !== null}>
          <legend>You</legend>
          <label>
            Email <input type="email" required value={form.email} onChange={(e) => change('email', e.target.value)} />
          </label>
          <label>
            First name <input value={form.firstName} onChange={(e) => change('firstName', e.target.value)} />
          </label>
          <label>
            Last name <input value={form.lastName} onChange={(e) => change('lastName', e.target.value)} />
          </label>
        </fieldset>

        <fieldset disabled={payment !== null}>
          <legend>Address</legend>
          <label>
            Street and number <input value={form.line1} onChange={(e) => change('line1', e.target.value)} />
          </label>
          <label>
            Postcode <input value={form.postalCode} onChange={(e) => change('postalCode', e.target.value)} onBlur={() => void chooseDestination()} />
          </label>
          <label>
            City <input value={form.city} onChange={(e) => change('city', e.target.value)} />
          </label>
          <label>
            Country (two letters){' '}
            <input maxLength={2} value={form.countryCode} onChange={(e) => change('countryCode', e.target.value)} onBlur={() => void chooseDestination()} />
          </label>
        </fieldset>

        {checkout.requiresShipping ? (
          <fieldset disabled={payment !== null}>
            <legend>Shipping</legend>
            {checkout.shippingMethods.length === 0 ? (
              <p>Fill in the country to see how we can send it.</p>
            ) : null}
            {checkout.shippingMethods.map((method) => (
              <label key={method.id}>
                <input
                  type="radio"
                  name="shipping"
                  checked={checkout.selectedMethodId === method.id}
                  onChange={() => void checkout.chooseMethod(method.id)}
                />{' '}
                {method.name} {formatMoney(method.addsCents, currency)}
              </label>
            ))}
          </fieldset>
        ) : null}

        <p>
          Total: <strong>{formatMoney(cart.totals.totalCents, currency)}</strong>
        </p>

        {payment === null ? (
          <button
            type="submit"
            disabled={
              checkout.pending ||
              cart.problem !== null ||
              (checkout.requiresShipping && checkout.selectedMethodId === null)
            }
          >
            Continue to payment
          </button>
        ) : null}
      </form>

      {/* Stripe's Payment Element is drawn in here once the order exists. */}
      <div ref={container} />

      {payment ? (
        <>
          <p>To pay: {formatMoney(payment.amountCents, currency)}</p>
          <button type="button" onClick={() => void confirm()} disabled={checkout.pending}>
            Pay
          </button>
        </>
      ) : null}

      {message ?? checkout.error?.message ? <p className="error">{message ?? checkout.error?.message}</p> : null}

      <p>
        By paying you accept the <Link href="/terms">terms and the return policy</Link>.
      </p>
    </>
  );
}
