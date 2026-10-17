import type { ProductListOptions } from '@solumflow-app/crm-client';

import { FACET_FIELDS } from './shop-config';

export type SearchParams = Record<string, string | string[] | undefined>;

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] : value;
}

/** What the address says the visitor asked for, as the SDK's own query. */
export function overviewQuery(params: SearchParams): ProductListOptions {
  const filter: NonNullable<ProductListOptions['filter']> = {};

  for (const slug of FACET_FIELDS) {
    const value = first(params[`filter.${slug}`]);

    if (value) {
      filter[slug] = value;
    }
  }

  return {
    limit: 12,
    q: first(params.q),
    cursor: first(params.cursor),
    inStock: first(params.inStock) === '1' ? true : undefined,
    filter: Object.keys(filter).length > 0 ? filter : undefined,
    facets: FACET_FIELDS.length > 0 ? FACET_FIELDS : undefined,
  };
}

/** The same address with some parameters changed; a value of null takes one out. */
export function withParams(
  params: SearchParams,
  changes: Record<string, string | null>,
) {
  const next = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    const single = first(value);

    if (single !== undefined && key !== 'cursor') {
      next.set(key, single);
    }
  }

  for (const [key, value] of Object.entries(changes)) {
    if (value === null) {
      next.delete(key);
    } else {
      next.set(key, value);
    }
  }

  const query = next.toString();

  return query ? `/?${query}` : '/';
}
