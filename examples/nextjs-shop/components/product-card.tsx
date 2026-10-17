import Link from 'next/link';

import type { ProductListItem } from '@solumflow-app/crm-client';

import { formatMoney } from '../lib/format-money';
import { PRODUCT_PATH } from '../lib/shop-config';

/** One product in a list. The price is the server's cheapest way in, shown as sent. */
export function ProductCard({ product }: { product: ProductListItem }) {
  return (
    <li>
      <Link href={`${PRODUCT_PATH}/${encodeURIComponent(product.slug)}`}>
        {product.imageUrl ? (
          <img src={product.imageUrl} alt={product.name} loading="lazy" />
        ) : null}
        <div>{product.name}</div>
      </Link>
      <div>
        {product.priceFromCents !== null
          ? `from ${formatMoney(product.priceFromCents, product.currency)}`
          : ''}
        {product.compareAtCents !== null ? (
          <s> {formatMoney(product.compareAtCents, product.currency)}</s>
        ) : null}
      </div>
      {product.inStock ? null : <div>Sold out</div>}
    </li>
  );
}
