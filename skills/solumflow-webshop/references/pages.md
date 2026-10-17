# The pages of the shop

The working version of every file below is in `examples/nextjs-shop` of this repository. Read the file there; the snippets here only show which SDK call a page is built on. Make the markup and styling the customer's own.

Install the SDK with the project's package manager:

```sh
pnpm add @solumflow-app/crm-client @stripe/stripe-js
```

The SDK has three entries, and the split is the safety of the shop:

| Entry | Runs on | Holds |
| --- | --- | --- |
| `@solumflow-app/crm-client/shop` | server only | `getProducts`, `getProduct`, `getCategory`, `getCategories`, `getSitemapEntries`, `productMetadata`, `ProductJsonLd` |
| `@solumflow-app/crm-client/shop-route` | server only | `createShopRouteHandler` |
| `@solumflow-app/crm-client/shop/react` | browser | `CartProvider`, `useCart`, `useCheckout`, `pushPurchaseEvent` |

Environment, all on the server: `SOLUMFLOW_URL`, `SOLUMFLOW_API_KEY`, `SOLUMFLOW_WEBHOOK_KEY`, and `SOLUMFLOW_SITE_URL` (the site's own address). The SDK throws at start-up when the key is missing or malformed; the build of a shop needs them too.

## The shop route: `app/api/shop/[...path]/route.ts`

```ts
import { createShopRouteHandler } from '@solumflow-app/crm-client/shop-route';

export const { GET, POST, PUT, PATCH, DELETE } = createShopRouteHandler({
  baseUrl: process.env.SOLUMFLOW_URL!,
  apiKey: process.env.SOLUMFLOW_API_KEY!,
  cartUrl: 'https://www.example.com/cart?restore={token}',
});
```

This is the only door the cart and checkout use. It keeps the key and the visitor's cart token on the server (the token in an httpOnly cookie) and refuses posts from other origins. `/api/shop` is where `CartProvider` looks by default; mount it elsewhere only if you also pass `endpoint` to `CartProvider`. `cartUrl` is the link in a reminder mail about an abandoned cart.

## Root layout

Wrap the pages that use the cart in `CartProvider` once, in `app/layout.tsx`. It is a client component; the layout stays a server component. A small client component with `useCart()` draws the cart link with the number of lines.

## Overview: `app/page.tsx` (server)

```tsx
const list = await getProducts({
  q, cursor, limit: 12,
  inStock: true,                      // only when asked
  filter: { color: 'red' },           // a public field's slug
  facets: ['color'],                  // counts per value, for the filter links
});
// list.data, list.nextCursor, list.facets
```

- Search and filters come from the address (`searchParams`), so a result page is a link.
- `facets` returns `{ [slug]: [{ value, count }] }`: draw them as links. Only public fields can be facets; `list_catalog_fields` shows which.
- `getCategories({ parent: 'root' })` gives the top of the category tree for a menu.
- There is no price-range input in the example: a range would mean converting the visitor's euros to cents, which is arithmetic on an amount. If the customer wants one, offer fixed ranges as links with cents written out as constants.

## Category: `app/category/[slug]/page.tsx` (server)

`getCategory(slug, { cursor })` answers `{ data, nextCursor }` or `null` (call `notFound()`). `data` has `name`, `description`, `metaTitle`, `metaDescription`, `path` (the breadcrumb, root first, this category last; a step with no `slug` is printed, not linked) and `products`. Set `generateMetadata` from `metaTitle` and `metaDescription`.

## Product: `app/product/[slug]/page.tsx` (server)

```tsx
export async function generateMetadata({ params }) {
  const product = await getProduct((await params).slug);
  return product ? productMetadata(product, { basePath: '/product' }) : {};
}

export default async function Page({ params }) {
  const product = await getProduct((await params).slug);
  if (!product) notFound();
  return (<><ProductJsonLd product={product} /> ...markup... </>);
}
```

- `basePath` must be the folder the product pages really live in, so the canonical address is right. Use the same paths in `getSitemapEntries`.
- The product has `images` (use `displayUrl`), `description`, `longDescription` (HTML the server has cleaned), `fields` (custom fields), `prices`, `variants` and `variantAxes`. Show a price as `priceFromCents` or a price's `amountCents`, written with a money formatter.
- A product with variants is bought by the variant's `id`; one without by the product's `id`. A client component with the add-to-cart button gets only ids, labels and already-formatted price strings from the server page.

## Cart: `app/cart/page.tsx` (client)

```tsx
const { cart, lines, loaded, pending, addLine, updateLine, removeLine, applyCode, removeCode } = useCart();
```

- `loaded` is false until the first answer: show "loading", not "empty".
- Every change answers `{ ok: true, value: cart }` or `{ ok: false, error }`; it never throws. A refused code has `error.code === 'discount_refused'` and `error.details.reason` (`unknown`, `expired`, `minimum_not_met`, `used_up`, `not_combinable`, `not_applicable`): turn each into a plain sentence.
- Show `cart.totals` (`subtotalCents`, `discountCents`, `shippingCents`, `taxCents`, `totalCents`), `cart.discount.applied`, each line's `totalCents` and its `warnings`, and `cart.problem` when set. Disable the checkout link while `cart.problem` is set.
- `cart.pricesIncludeTax` says whether the amounts include VAT; word the labels accordingly.

## Checkout: `app/checkout/page.tsx` (client)

```tsx
const checkout = useCheckout();

await checkout.setDestination({ countryCode: 'NL', postalCode: '1234AB' });
checkout.shippingMethods;           // [{ id, name, kind, addsCents }]
await checkout.chooseMethod(id);

const started = await checkout.start({ buyer: { email }, address });
await checkout.mountPaymentElement(containerElement);   // after start succeeded
const outcome = await checkout.confirmPayment({ returnUrl });
// outcome.status: 'succeeded' | 'processing' | 'failed'
```

- Shipping first: the methods that deliver to the destination come back with what each adds; the server drops a chosen method that no longer fits. `requiresShipping` is false when nothing in the basket is posted: ask for no shipping address then.
- `start` makes the order from the cart on the server and keeps what the payment step needs. Pressing it twice gives the same order.
- All of it is one component: `mountPaymentElement` and `confirmPayment` use the state that the same `useCheckout()` call holds. Mount the payment field in an effect that runs when `checkout.payment` appears (Stripe draws into a DOM node that only exists after render).
- Pass a `returnUrl` on the site's thank-you page carrying the order number (`/thank-you?order=<orderNumber>`): methods such as iDEAL leave the site and come back to it.
- Link to the terms and return policy near the pay button.

## Thank-you: `app/thank-you/page.tsx` (client)

Say thanks and show the order number from the address. A payment that finished without leaving the page has already told the data layer. One that came back from another site (Stripe adds `redirect_status=succeeded`) is reported here, once, with `pushPurchaseEvent(cart, orderNumber)` when `cart.closed` is true. `useSearchParams` needs a `Suspense` around it.

## Terms and returns: `app/terms/page.tsx` (server)

The shop's own text, from the owner. Link it from the footer and the checkout.

## Sitemap: `app/sitemap.ts`

```ts
export default () =>
  getSitemapEntries({ siteUrl: 'https://www.example.com', productPath: '/product', categoryPath: '/category' });
```

## Revalidation: `app/api/solumflow/revalidate/route.ts`

```ts
import { createRevalidateHandler } from '@solumflow-app/crm-client/webhooks';

export const POST = createRevalidateHandler({ secret: process.env.SOLUMFLOW_WEBHOOK_KEY! });
```

The shop's reads are filed under `solumflow:catalog`, `solumflow:product:<slug>` and `solumflow:category:<slug>`, and a delivery clears them. The address to register is `https://<site>/api/solumflow/revalidate` (see step 7 of the skill).

## Showing money

A small `formatMoney(cents, currency)` that writes the digits of the cents into a decimal string and hands it to `Intl.NumberFormat` is the whole of it (see `lib/format-money.ts` in the example). It prints a number the server gave; it never makes one. A currency symbol or a locale is the customer's choice.
