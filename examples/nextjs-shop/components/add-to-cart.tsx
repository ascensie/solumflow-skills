'use client';

import Link from 'next/link';
import { useState } from 'react';

import { useCart } from '@solumflow-app/crm-client/shop/react';

type Option = { id: string; label: string; price: string; inStock: boolean };

/**
 * Puts a product or one of its variants in the cart. It names an id and a
 * quantity, never an amount.
 *
 * What the page already shows goes along as `preview`, so the cart draws the
 * product the moment the button is pressed. The button stays pressable while
 * the answer is on its way: a second press counts up the line that is coming.
 */
export function AddToCart({
  name,
  imageUrl,
  options,
}: {
  name: string;
  imageUrl: string | null;
  options: Option[];
}) {
  const { addLine } = useCart();
  const [state, setState] = useState<{ chosen: string; message: string | null; added: boolean }>({
    chosen: options.find((option) => option.inStock)?.id ?? options[0]?.id ?? '',
    message: null,
    added: false,
  });

  const chosen = options.find((option) => option.id === state.chosen);

  async function add() {
    if (!chosen) {
      return;
    }

    setState((current) => ({ ...current, added: true, message: null }));

    const result = await addLine(
      { productId: chosen.id },
      {
        preview: {
          label: options.length > 1 ? `${name} (${chosen.label})` : name,
          imageUrl,
          unitPriceLabel: chosen.price,
        },
      },
    );

    if (!result.ok) {
      setState((current) => ({ ...current, added: false, message: result.error.message }));
    }
  }

  return (
    <div>
      {options.length > 1 ? (
        <select
          value={state.chosen}
          onChange={(event) => setState({ chosen: event.target.value, message: null, added: false })}
        >
          {options.map((option) => (
            <option key={option.id} value={option.id} disabled={!option.inStock}>
              {option.label} {option.price}
              {option.inStock ? '' : ' (sold out)'}
            </option>
          ))}
        </select>
      ) : (
        <p>{options[0]?.price}</p>
      )}

      <button type="button" onClick={add} disabled={!chosen || !chosen.inStock}>
        Add to cart
      </button>

      {state.added ? (
        <p>
          Added. <Link href="/cart">View cart</Link>
        </p>
      ) : null}
      {state.message ? <p className="error">{state.message}</p> : null}
    </div>
  );
}
