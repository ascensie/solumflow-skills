import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { getCategory } from '@solumflow-app/crm-client/shop';

import { ProductCard } from '../../../components/product-card';
import { CATEGORY_PATH } from '../../../lib/shop-config';

type Props = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ cursor?: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const page = await getCategory((await params).slug);

  if (!page) {
    return {};
  }

  const { data } = page;

  return {
    title: data.metaTitle ?? data.name,
    description: data.metaDescription ?? data.description ?? undefined,
    alternates: { canonical: `${CATEGORY_PATH}/${encodeURIComponent(data.slug)}` },
  };
}

export default async function CategoryPage({ params, searchParams }: Props) {
  const { slug } = await params;
  const { cursor } = await searchParams;
  const page = await getCategory(slug, { cursor });

  if (!page) {
    notFound();
  }

  const { data, nextCursor } = page;

  return (
    <>
      {/* A step without a slug has no page of its own yet: it is printed, not linked. */}
      <nav aria-label="Breadcrumb">
        <Link href="/">Shop</Link>
        {data.path.map((step) => (
          <span key={step.id}>
            {' / '}
            {step.slug && step.slug !== data.slug ? (
              <Link href={`${CATEGORY_PATH}/${encodeURIComponent(step.slug)}`}>{step.name}</Link>
            ) : (
              step.name
            )}
          </span>
        ))}
      </nav>

      <h1>{data.name}</h1>
      {data.description ? <p>{data.description}</p> : null}

      <ul className="grid">
        {data.products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </ul>

      {nextCursor ? (
        <Link href={`${CATEGORY_PATH}/${encodeURIComponent(slug)}?cursor=${encodeURIComponent(nextCursor)}`}>
          More products
        </Link>
      ) : null}
    </>
  );
}
