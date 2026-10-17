# Example shop on SolumFlow

A small Next.js (App Router, TypeScript) shop that uses the
[`@solumflow-app/crm-client`](https://www.npmjs.com/package/@solumflow-app/crm-client)
SDK. It is a **pattern, not a template**: the look is bare on purpose, so you
(or an AI) copy the structure and bring your own design.

What it shows:

| File | What it does |
| --- | --- |
| `app/page.tsx` | overview with search, stock and facets (`getProducts`) |
| `app/category/[slug]/page.tsx` | a category with its breadcrumb and products (`getCategory`) |
| `app/product/[slug]/page.tsx` | a product with metadata and structured data (`productMetadata`, `ProductJsonLd`) |
| `app/cart/page.tsx`, `components/cart-view.tsx` | the cart, discount code and totals (`useCart`) |
| `app/checkout/page.tsx`, `components/checkout-form.tsx` | shipping, order and Stripe payment (`useCheckout`) |
| `app/thank-you/page.tsx` | after paying, and the purchase event for redirecting payment methods |
| `app/terms/page.tsx` | where the shop's own terms and return policy go |
| `app/sitemap.ts` | every product and category (`getSitemapEntries`) |
| `app/api/shop/[...path]/route.ts` | the one route the cart and checkout use (`createShopRouteHandler`) |
| `app/api/solumflow/revalidate/route.ts` | keeps cached pages fresh (`createRevalidateHandler`) |

Two rules the whole example follows:

- **No amount is ever worked out here.** Prices, VAT, discounts, shipping and
  totals are what SolumFlow sent. `lib/format-money.ts` only writes them down.
- **No key reaches the browser.** The `crms_` key lives on the server; the
  browser talks to `/api/shop`, which holds the key and the cart token.

## Run it

```sh
cp .env.example <your local environment file>   # then fill in the four values
pnpm install
pnpm dev
```

`SOLUMFLOW_API_KEY` is a server key with `catalog:read`, `cart:write` and
`orders:write`, made in SolumFlow under Settings → Integrations → API keys.
`SOLUMFLOW_WEBHOOK_KEY` is shown once when the webhook address is made
(`upsert_api_webhook` in the MCP server). The build needs the environment too:
the SDK refuses to start without a well-formed key, and the sitemap reads the
catalogue.

Put the slugs of your public fields in `FACET_FIELDS` (`lib/shop-config.ts`) to
get filter links on the overview.

To have an AI build your own shop from this pattern, install the
[`solumflow-webshop`](../../skills/solumflow-webshop/SKILL.md) skill.
