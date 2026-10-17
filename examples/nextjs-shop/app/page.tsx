import type { Metadata } from 'next';
import Link from 'next/link';

import { getCategories, getProducts } from '@solumflow-app/crm-client/shop';

import { ProductCard } from '../components/product-card';
import { type SearchParams, overviewQuery, withParams } from '../lib/overview-query';
import { CATEGORY_PATH, FACET_FIELDS } from '../lib/shop-config';

export const metadata: Metadata = { title: 'All products' };

/** The overview: search, stock and facets, all answered by SolumFlow. */
export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<SearchParams>;
}) {
  const params = await searchParams;
  const [list, categories] = await Promise.all([
    getProducts(overviewQuery(params)),
    getCategories({ parent: 'root' }),
  ]);

  return (
    <>
      <h1>Products</h1>

      <nav aria-label="Categories">
        {categories.data.map((category) => (
          <Link key={category.id} href={`${CATEGORY_PATH}/${encodeURIComponent(category.slug)}`}>
            {category.name}{' '}
          </Link>
        ))}
      </nav>

      <form action="/" method="get">
        <input type="search" name="q" defaultValue={typeof params.q === 'string' ? params.q : ''} placeholder="Search" />
        <label>
          <input type="checkbox" name="inStock" value="1" defaultChecked={params.inStock === '1'} /> In stock only
        </label>
        <button type="submit">Search</button>
      </form>

      {FACET_FIELDS.map((slug) => (
        <fieldset key={slug}>
          <legend>{slug}</legend>
          {(list.facets?.[slug] ?? []).map((facet) => (
            <Link key={facet.value} href={withParams(params, { [`filter.${slug}`]: facet.value })}>
              {facet.value} ({facet.count}){' '}
            </Link>
          ))}
        </fieldset>
      ))}

      {list.data.length === 0 ? <p>Nothing found.</p> : null}

      <ul className="grid">
        {list.data.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ul>

      {list.nextCursor ? (
        <Link href={withParams(params, { cursor: list.nextCursor })}>More products</Link>
      ) : null}
    </>
  );
}
