---
name: solumflow-webshop
description: Builds a web shop on SolumFlow, in the site's own design. SolumFlow holds the catalogue, the cart, discounts, shipping, payment and orders; the AI sets the shop up through the SolumFlow MCP server and builds the pages in the customer's Next.js site with the `@solumflow-app/crm-client` SDK (overview, category, product, cart, checkout, thank-you page, SEO, revalidation). Use it whenever someone wants a webshop, a "winkel", a "shop op SolumFlow", wants to sell products on their site, put a catalogue or cart on a website, or asks to build or finish a shop that uses SolumFlow. Use it even if they only name one page, such as the cart or the product page. A contact form, booking page, chat, tracking or cookie banner alone is `solumflow-website-setup`.
---

# A web shop on SolumFlow

SolumFlow is the shop's back end: products, stock, cart, discounts, shipping, VAT, payment, orders and invoices. The customer's own Next.js site is the shop's front: every page, in the customer's design. This skill sets the back end up through the MCP server and builds the front with the SDK.

The person running this is often a shop owner, not a developer. Talk to them in their own language (usually Dutch) and in plain words.

`examples/nextjs-shop` in this repository is a small, deliberately bare working shop. Read it for structure (which file calls what). Never copy its look.

## The one idea behind every rule

The site never works out money. Every price, VAT amount, discount, shipping cost and total on screen is a number SolumFlow sent, shown as it came. If you ever feel the need to add, multiply or divide an amount, the server already has an answer for it; look for that field instead.

Read `references/rules-and-final-check.md` before you build. It has the rules with their reasons, and the check you run at the end.

## Step 0: is everything there?

1. **The MCP server.** Tools such as `check_shop_readiness`, `list_products` and `upsert_product` must exist (in Claude Code usually prefixed, such as `mcp__solumflow__check_shop_readiness`). If not, stop: the person adds the SolumFlow MCP server first (Settings → Integrations → API keys, the MCP card, paste the command in a terminal, restart). The shop needs a server key with the rights `shop:manage`, `cart:write`, `orders:write`, `orders:read` and `catalog:read`, and `catalog:write` for filling the catalogue. A tool that answers `forbidden` names the missing right: send them to make a key with it ticked.
2. **The site.** It must be Next.js, App Router, React 19 and Next 15 or later. Other techniques are not supported yet: say so and stop. If there is no site yet, create one with `create-next-app` after asking where.
3. **The key on the site.** The SDK reads `SOLUMFLOW_URL` and `SOLUMFLOW_API_KEY` on the server. The person creates a server key (`crms_...`) in the app and puts it in the site's local environment file (git-ignored) and in the hosting environment themselves. **Never ask them to paste a key into the conversation, never print one, never write one into a file you commit.** Write `.env.example` with empty values and tell them which to fill in.

Then call `check_shop_readiness`. It lists what stops the shop from selling (blocker) and what costs sales (warning), and for each finding which tool or app screen fixes it. This is your to-do list; run it again at the end.

## Step 1: read the site and ask about design

Read `package.json`, the root layout, the existing pages and the styling (Tailwind, CSS modules, a component library). Match them.

Then ask, in one round: the style they want, two or three shops they like, the brand colours and fonts, the logo, and whether the shop is the whole site or sits inside an existing one. **You do not invent a design.** If they have no preferences, propose two short directions and let them pick. The design is theirs; this skill only fixes the structure.

## Step 2: fill the catalogue

If the catalogue is empty or partial, fill it with the catalogue tools (`catalog:write`):

- `list_catalog_fields` and `list_catalogs` first: see which fields and catalogues exist.
- `upsert_field` for custom fields such as colour or size. Make a field `public` when the site may show or filter on it; only public fields can become facets.
- `upsert_category` for the tree, with slugs that read well in an address.
- `upsert_product` for one product, `upsert_products` for many. A product needs a stable `source` and `externalRef`. Prices are in cents. New products are drafts: **publish only when the person says so**.
- `upload_catalog_file` when a picture comes from a local file.

Ask before archiving or deleting anything the person did not name.

## Step 3: set the shop up

Go through the findings of `check_shop_readiness` and fix what a tool can fix:

- **Shipping:** `list_shipping_methods`, then `upsert_shipping_zone` (countries) and `upsert_shipping_method` (flat rate, free from a threshold, or local pickup). Ask the person which countries they ship to and what it costs; do not guess rates.
- **Discounts:** `list_discounts`, `upsert_discount` and `archive_discount`. A code, an automatic discount, or a tier price. Only when the person wants them.
- **Payment:** `get_payment_status` says whether Stripe is connected and whether the account is in test mode. **Connecting Stripe and going live are done by the owner in the app. You cannot and must not.** Say where (the tool names the screen) and wait.
- **Revalidation webhook:** see step 7.
- **Tracking and cookie banner:** see step 6.

## Step 4: build the pages

Read `references/pages.md` for the code of every page. The pages:

| Page | Runs on | Reads or does |
| --- | --- | --- |
| Overview | server | `getProducts` with search, filters and facets |
| Category | server | `getCategory` |
| Product | server | `getProduct`, `productMetadata`, `ProductJsonLd`, add to cart |
| Cart | browser | `useCart` |
| Checkout | browser | `useCheckout`, Stripe's payment field |
| Thank-you | browser | the cart as paid, the purchase event |
| Terms and returns | server | the shop's own text |

Plus one route that the cart and checkout talk to (`createShopRouteHandler`), and `app/sitemap.ts`.

Write a page for the general terms and the return policy on the site itself, and link it from the footer and from the checkout. Take the text from the owner; if they have none, make a clearly marked draft and tell them it needs their (or their lawyer's) review. Do not invent legal claims, delivery times or return periods.

## Step 5: search-engine basics

- Every product page has `generateMetadata` with `productMetadata(product, { basePath })` and renders `<ProductJsonLd product={product} />`. The server builds title, description, picture and structured data; print them, do not rebuild them.
- Category pages set a title and description from the category's own `metaTitle` and `metaDescription` (falling back to its name).
- `app/sitemap.ts` returns `getSitemapEntries({ siteUrl, productPath, categoryPath })` with the paths the site really uses.
- The site's real address goes in `SOLUMFLOW_SITE_URL` or in the call. A `robots.ts` that points at the sitemap is welcome.

## Step 6: tracking and the cookie banner

A shop wants both: visits and purchases are what the owner will look at. Follow the `solumflow-website-setup` skill for the tracking script and the cookie banner; do not repeat its steps here. What the shop adds:

- The thank-you page calls `pushPurchaseEvent(cart, orderNumber)` for payment methods that return from another site (the SDK does it itself when a payment finishes without leaving the page).
- Without the banner, tracking waits for a consent that nothing gives. `check_shop_readiness` warns about it.

## Step 7: keep the pages fresh

The shop's reads are cached by Next.js. A webhook tells the site the moment a product or category changes.

1. Add `app/api/solumflow/revalidate/route.ts` with `createRevalidateHandler({ secret: process.env.SOLUMFLOW_WEBHOOK_KEY! })`.
2. `upsert_api_webhook` with the name "Shop revalidation", the url `https://<the site's real address>/api/solumflow/revalidate` and the events `product.changed`, `product.deleted` and `category.changed`. The answer carries a signing key **once**. It must go into `SOLUMFLOW_WEBHOOK_KEY` on the site, and it will not be shown again. The person puts it in the hosting environment; do not echo it into chat or into a committed file. If it was lost, make the address again.
3. The address must be https and public, so it works only once the site is deployed. On a local site, say so; the webhook is then pointed at the real address after deploy.

## Step 8: prove it works, in test mode

While Stripe is still in test mode:

1. `check_shop_readiness`: no blockers left. Warnings are read one by one; "payments in test mode" is expected here.
2. `run_test_order` with the owner's own e-mail address: it puts a product in a cart, picks postage, places the order, pays it with the Stripe test card and reads the order back until it is paid. It needs the rights `shop:manage`, `cart:write`, `orders:write` and `orders:read`. It refuses when the account is already live; then ask the owner to switch back to test mode, or to check with a real purchase by hand.
3. Run the final check in `references/rules-and-final-check.md`: the greps and the build.

**Never say the shop is ready until `run_test_order` has succeeded.** If it fails, read what it says, fix the cause, and run it again.

## Step 9: going live is the owner's

Tell them what is left, plainly: switch Stripe to live in the app, deploy the site, check that the webhook address points at the deployed site, place one small real order, and refund it. You do not switch anything to live.

## Closing report

Short, in the person's language:

- what is live on the site and which pages exist;
- what you set up in SolumFlow (products, shipping, discounts, webhook);
- the result of `check_shop_readiness` and of `run_test_order`;
- what only the owner can do: connect Stripe or go live, fill the keys in the hosting environment, deploy, review the terms text.
