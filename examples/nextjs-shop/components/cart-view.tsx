'use client';

import Link from 'next/link';
import { useState } from 'react';

import { useCart } from '@solumflow-app/crm-client/shop/react';

import { formatMoney } from '../lib/format-money';

const REFUSALS: Record<string, string> = {
  unknown: 'We do not know that code.',
  expired: 'That code has expired.',
  minimum_not_met: 'The basket is not big enough for that code yet.',
  used_up: 'That code has been used up.',
  not_combinable: 'That code cannot be combined with another discount.',
  not_applicable: 'That code does not apply to what is in the basket.',
};

const WARNINGS: Record<string, string> = {
  out_of_stock: 'Sold out',
  price_changed: 'The price changed',
  no_longer_for_sale: 'No longer for sale',
  not_offered_in_currency: 'Not offered in this currency',
  configuration_changed: 'This configuration changed',
  not_orderable: 'Cannot be ordered',
};

/**
 * The basket. Every amount below is read from `cart`; nothing is added up here.
 * A product just put in is drawn from its `preview` until the server's line
 * replaces it, and the totals say they are being calculated meanwhile.
 */
export function CartView() {
  const { cart, lines, adding, calculating, loaded, pending, updateLine, removeLine, applyCode, removeCode } =
    useCart();
  const [code, setCode] = useState('');
  const [codeError, setCodeError] = useState<string | null>(null);

  if (!loaded) {
    return <p>Loading the cart...</p>;
  }

  if (lines.length === 0 && adding.length === 0) {
    return (
      <p>
        Your cart is empty. <Link href="/">Continue shopping</Link>
      </p>
    );
  }

  async function submitCode() {
    const result = await applyCode(code);

    if (result.ok) {
      setCode('');
      setCodeError(null);
    } else {
      const reason = (result.error.details as { reason?: string } | undefined)?.reason;

      setCodeError(
        result.error.code === 'discount_refused' && reason
          ? (REFUSALS[reason] ?? 'That code was not accepted.')
          : result.error.message,
      );
    }
  }

  return (
    <>
      <table>
        <thead>
          <tr>
            <th>Product</th>
            <th>Quantity</th>
            <th>Total</th>
            <th />
          </tr>
        </thead>
        <tbody>
          {lines.map((line) => (
            <tr key={line.id}>
              <td>
                {line.label}
                {line.warnings.map((warning) => (
                  <div key={warning} className="warning">
                    {WARNINGS[warning] ?? warning}
                  </div>
                ))}
              </td>
              <td>
                <input
                  type="number"
                  min={1}
                  value={line.quantity}
                  disabled={pending}
                  onChange={(event) => {
                    const quantity = Number(event.target.value);

                    if (Number.isInteger(quantity) && quantity > 0) {
                      void updateLine(line.id, quantity);
                    }
                  }}
                />
              </td>
              <td>{formatMoney(line.totalCents, line.currency)}</td>
              <td>
                <button type="button" onClick={() => void removeLine(line.id)}>
                  Remove
                </button>
              </td>
            </tr>
          ))}
          {adding.map((line) => (
            <tr key={line.ref}>
              <td>
                {line.preview?.imageUrl ? <img src={line.preview.imageUrl} alt="" width={48} /> : null}
                {line.preview?.label ?? 'Being added...'}
              </td>
              <td>{line.quantity}</td>
              <td>{line.preview?.unitPriceLabel ?? ''}</td>
              <td />
            </tr>
          ))}
          {cart
            ? cart.addedLines.map((line) => (
                <tr key={`${line.productId}-${line.label}`}>
                  <td>{line.label}</td>
                  <td>{line.quantity}</td>
                  <td>{formatMoney(line.totalCents, cart.currency)}</td>
                  <td />
                </tr>
              ))
            : null}
        </tbody>
      </table>

      <p>
        <input value={code} onChange={(event) => setCode(event.target.value)} placeholder="Discount code" />
        <button type="button" onClick={() => void submitCode()} disabled={!code || pending}>
          Apply
        </button>
        {codeError ? <span className="error"> {codeError}</span> : null}
      </p>
      {cart?.discount.code ? (
        <p>
          Code {cart.discount.code}{' '}
          <button type="button" onClick={() => void removeCode()}>
            Remove code
          </button>
        </p>
      ) : null}

      {cart && !calculating ? (
        <dl>
          <dt>Subtotal</dt>
          <dd>{formatMoney(cart.totals.subtotalCents, cart.currency)}</dd>
          {cart.discount.applied.map((discount) => (
            <div key={`${discount.name}-${discount.code}`}>
              <dt>{discount.name}</dt>
              <dd>{formatMoney(discount.amountCents, cart.currency)}</dd>
            </div>
          ))}
          <dt>Shipping</dt>
          <dd>{cart.shipping.countryCode ? formatMoney(cart.totals.shippingCents, cart.currency) : 'Chosen at checkout'}</dd>
          <dt>{cart.pricesIncludeTax ? 'Of which VAT' : 'VAT'}</dt>
          <dd>{formatMoney(cart.totals.taxCents, cart.currency)}</dd>
          <dt>Total</dt>
          <dd>
            <strong>{formatMoney(cart.totals.totalCents, cart.currency)}</strong>
          </dd>
        </dl>
      ) : (
        // Never the last totals and never a sum of our own: the server's arrive in a moment.
        <p>Totals are being calculated...</p>
      )}

      {cart?.problem ? <p className="error">{cart.problem.message}</p> : null}

      {!cart || cart.problem ? (
        <button type="button" disabled>
          Checkout
        </button>
      ) : (
        <Link href="/checkout">Checkout</Link>
      )}
    </>
  );
}
