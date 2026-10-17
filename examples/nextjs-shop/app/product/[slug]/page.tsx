import type { Metadata } from 'next';
import { notFound } from 'next/navigation';

import { ProductJsonLd, getProduct, productMetadata } from '@solumflow-app/crm-client/shop';

import { AddToCart } from '../../../components/add-to-cart';
import { formatMoney } from '../../../lib/format-money';
import { PRODUCT_PATH } from '../../../lib/shop-config';

type Props = { params: Promise<{ slug: string }> };

/** The head comes from the server's own `seo`: title, description, picture, canonical. */
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = await getProduct((await params).slug);

  return product ? productMetadata(product, { basePath: PRODUCT_PATH }) : {};
}

export default async function ProductPage({ params }: Props) {
  const product = await getProduct((await params).slug);

  if (!product) {
    notFound();
  }

  // What can be put in the cart: each variant, or the product itself. Prices are shown as sent.
  const options =
    product.variants.length > 0
      ? product.variants.map((variant) => ({
          id: variant.id,
          label: Object.values(variant.options).join(' / ') || variant.sku || product.name,
          price: formatMoney(variant.priceFromCents, product.currency),
          inStock: variant.inStock,
        }))
      : [
          {
            id: product.id,
            label: product.name,
            price: formatMoney(product.priceFromCents, product.currency),
            inStock: product.inStock,
          },
        ];

  const image = product.images[0];

  return (
    <article className="product">
      <ProductJsonLd product={product} />

      <h1>{product.name}</h1>
      {image ? <img src={image.displayUrl} alt={image.alt ?? product.name} /> : null}
      {product.description ? <p>{product.description}</p> : null}
      {product.longDescription ? (
        // The server cleans this HTML down to headings, paragraphs, lists, links and emphasis.
        <div dangerouslySetInnerHTML={{ __html: product.longDescription }} />
      ) : null}

      <AddToCart options={options} />
    </article>
  );
}
