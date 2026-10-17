# Rules, with their reasons, and the final check

## The rules

**1. Never work out a price, VAT, discount or shipping cost yourself.**
SolumFlow prices the cart with the same function the order and the invoice use. A second calculation on the site drifts from it by a cent, then by a rule: the screen says one total, the buyer is charged another, and nobody can say which is right. Show what the server sent: `cart.totals.*`, `line.totalCents`, `method.addsCents`, `payment.amountCents`, `product.priceFromCents`. Writing a number of cents as money with `Intl.NumberFormat` is fine; arithmetic on it is not. Not even "just the line total": use `line.totalCents`.

**2. Never put a `crms_` key in client code, in `NEXT_PUBLIC_*`, in a file you commit, or in the chat.**
A `crms_` key can write: it can create carts and orders and read others. Anything in a browser bundle is public. The cart and checkout go through the site's own route (`createShopRouteHandler`), which holds the key on the server and keeps the cart token in an httpOnly cookie. The browser entry `@solumflow-app/crm-client/shop/react` contains no key and never needs one. Do not look for a way around this, and do not use a read-only `crmp_` key to "make the cart work": it cannot write, by design.

**3. Render product and category pages on the server.**
Search engines and link previews read the HTML as served. A product page that fetches in the browser has no title, no structured data and no price when a crawler arrives. Pages that use `getProduct`, `getCategory` or `getProducts` are server components; only the add-to-cart button, the cart and the checkout are client components. Never import `@solumflow-app/crm-client/shop` from a file with `'use client'`.

**4. Never say "ready" without a successful `run_test_order`.**
A shop that builds and looks right can still fail at payment: a missing shipping method for a country, a webhook between Stripe and SolumFlow that never arrives, a product without a price. Only an order that went from cart to paid proves the chain. Report the actual outcome, including a failure.

**5. Going live is the owner's act.**
Connecting Stripe and switching from test to live move real money. They happen in the app, by the owner. You say where; you do not do it, and you do not work around it.

**6. Let the server decide what can be bought.**
Show `line.warnings` (`out_of_stock`, `price_changed`, `no_longer_for_sale`, ...) and `cart.problem` as messages, and keep the checkout button disabled while `cart.problem` is set. Do not check stock or availability in the browser: stock is held at checkout, not in the cart.

**7. Never invent content that the shop states as fact.**
No made-up delivery times, return periods, reviews or "only 2 left". Show `available` only when the server gave one.

**8. Design belongs to the customer.**
Ask for style, examples and brand colours. Do not copy the look of `examples/nextjs-shop`, which is bare on purpose.

## The final check

Run these in the site's folder. Fix what they find, then run them again.

```sh
# 1. No secret reaches the browser. Both must print nothing.
grep -rnE "NEXT_PUBLIC_SOLUMFLOW_SECRET|NEXT_PUBLIC_[A-Z_]*KEY" . \
  --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git
grep -rn "crms_" . --exclude-dir=node_modules --exclude-dir=.next --exclude-dir=.git

# 2. No price arithmetic. Read every hit: formatting is fine, arithmetic is not.
grep -rnE "\* ?1\.[0-9]{2}|/ ?100\b|price ?\*|totalCents ?\+|Cents ?[-+*] ?|reduce\(.*(Cents|price)" . \
  --include='*.ts' --include='*.tsx' --exclude-dir=node_modules --exclude-dir=.next
```

On the second grep, a `/ 100` that only formats an amount for display is the one allowed hit, and it is better replaced by `Intl.NumberFormat` on the cents the server gave. A VAT rate, a discount percentage, a sum of lines or a shipping fee in your code is a violation: delete it and show the server's field instead.

The first grep also matches a file that merely documents the rule. If a hit is a comment and not a value, say so in the report.

Then:

- `grep -rl "use client" app` and check that none of those files imports `@solumflow-app/crm-client/shop` or `@solumflow-app/crm-client/shop-route` (both are server only).
- Run the project's build and its type check with the project's own package manager. Both must pass.
- Call `check_shop_readiness` and report the outcome. No blockers; every remaining warning is either fixed or named to the owner with the reason.
- Call `run_test_order` (test mode only) and report whether the order was paid.

Report honestly which of these you ran and which you could not (for instance no build possible because dependencies are not installed, or the webhook cannot be reached before deploy).
