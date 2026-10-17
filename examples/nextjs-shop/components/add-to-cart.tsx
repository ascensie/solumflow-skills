'use client';

import Link from 'next/link';
import { useState } from 'react';

import { useCart } from '@solumflow-app/crm-client/shop/react';

type Option = { id: string; label: string; price: string; inStock: boolean };

/** Puts a product or one of its variants in the cart. It names an id and a quantity, never an amount. */
export function AddToCart({ options }: { options: Option[] }) {
  const { addLine, pending } = useCart();
  const [state, setState] = useState<{ chosen: string; message: string | null; added: boolean }>({
    chosen: options.find((option) => option.inStock)?.id ?? options[0]?.id ?? '',
    message: null,
    added: false,
  });

  async function add() {
    const result = await addLine({ productId: state.chosen });

    setState((current) => ({
      ...current,
      added: result.ok,
      message: result.ok ? null : result.error.message,
    }));
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

      <button type="button" onClick={add} disabled={pending || !state.chosen}>
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
