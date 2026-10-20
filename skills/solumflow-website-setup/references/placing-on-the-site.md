# Placing each part on the site

Read the section for the site's kind, and skip the rest.

What you place always comes from the MCP answers:

| Part | Where it comes from | What you use |
| --- | --- | --- |
| Form | `list_forms` | the form's `id`, name and embed snippet |
| Booking | `list_booking_pages` | the page's `url`, name and embed snippet |
| Chat | `list_chat_widgets` or `upsert_chat_widget` | the widget's `id` and script tag |
| Tracking | `get_site_tracking` | the public key and tag |
| Banner | `update_consent_banner`, or the line built in `crm-setup.md` | the tag |

The app's origin is the scheme and host of any of those URLs. Every snippet names it, and a reseller's customer has a different one from the platform, so read it rather than assume it.

Site-wide parts (chat, tracking, banner) go in once, in the layout that every page shares. Page parts (form, booking) go where they belong.

Contents:
- Next.js (app router)
- Next.js (pages router)
- Other React 19 sites (Vite, Remix, React Router)
- React older than 19
- Astro
- Nuxt and Vue
- Plain HTML and static generators
- WordPress
- Anything else
- The cookie settings link
- Content-Security-Policy

## Next.js (app router)

Install the client with the project's package manager (look for `pnpm-lock.yaml`, `yarn.lock`, `bun.lockb` or `package-lock.json`):

```sh
pnpm add @solumflow-app/crm-client
```

It needs React 19 and Next 15 or later. Check `package.json` first; on an older version, use the HTML route in "React older than 19".

Put the site-wide parts in `app/layout.tsx`, or the root layout under a locale folder. Wrap the body once in `CrmEmbedProvider`:

```tsx
import {
  CrmChatWidget,
  CrmEmbedProvider,
  CrmSiteTracking,
} from '@solumflow-app/crm-client/react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nl">
      <head>
        {/* With the cookie banner: the banner tag here, and no CrmSiteTracking below. */}
      </head>
      <body>
        <CrmEmbedProvider appOrigin="https://app.example.com">
          {children}
          <CrmChatWidget widgetId="…" />
          <CrmSiteTracking publicKey="…" />
        </CrmEmbedProvider>
      </body>
    </html>
  );
}
```

`CrmEmbedProvider` and `CrmForm` are client components; the layout can stay a server component. Keep the layout's existing structure and add only these lines.

The ids and keys are public (they are in every visitor's browser), so writing them into the code is fine. If the project already keeps settings like these in `NEXT_PUBLIC_…` variables, follow that habit and add them to `.env.example` too. **Never put the `crms_` API key in the site:** it is secret and only the MCP server holds it.

On the contact page:

```tsx
import { CrmForm } from '@solumflow-app/crm-client/react';

<CrmForm formId="…" title="Contact" />
```

If the site has a dark mode and the form is set to follow the website, pass `colorScheme` from the site's own theme state.

On the booking page:

```tsx
import { CrmBooking } from '@solumflow-app/crm-client/react';

<CrmBooking url="https://app.example.com/book/…" title="Afspraak maken" />
```

**Cookie banner:** use a plain `<script async src="…">` in the `<head>` of the root layout. React 19 hoists and de-duplicates it. Do not use `next/script` with `strategy="lazyOnload"`: the banner has to run before Tag Manager. Then remove `<CrmSiteTracking>`, and any `@next/third-parties` `GoogleTagManager` or hand-written `gtm.js` snippet. The banner loads the container itself.

The chat can stay off some paths, such as the checkout: `hideOnPaths={['/checkout']}`. `loadOnInteraction` waits for the first scroll or tap, which keeps the first paint fast. Offer it when the site cares about its speed scores.

## Next.js (pages router)

The same components:

- the provider, the chat and the tracking go in `pages/_app.tsx`, around `<Component {...pageProps} />`;
- the banner tag goes in `pages/_document.tsx` inside `<Head>`;
- the form and the booking page go in their pages.

## Other React 19 sites (Vite, Remix, React Router)

Use the same components. Put the provider, chat and tracking in the root component or root route. Put the banner tag in `index.html`'s `<head>` (Vite) or in the root route's head (Remix, React Router).

## React older than 19

Do not upgrade React for this. Use the HTML snippets:

- the site-wide script tags go in `index.html` or the document;
- a form or booking page goes in a small component that renders the snippet's iframe. Copy its attributes, and load the sizing script once in the document.

## Astro

- Site-wide tags go in the base layout's `<head>` (the banner, or the tracking tag) and before `</body>` (the chat tag).
- The form and booking snippets go in their `.astro` pages as HTML.

Astro passes `<script>` tags through processing unless they carry `is:inline`, so put `is:inline` on every SolumFlow script tag. Otherwise Astro bundles them and the `async src` is lost.

## Nuxt and Vue

- In Nuxt, add the site-wide scripts through `app.head.script` in `nuxt.config`, or `useHead` in `app.vue`, with `async: true`.
- The form and booking iframes go in their pages.
- In a plain Vue app, use `index.html`.

## Plain HTML and static generators

Put the snippets where they belong:

- the banner tag, or the tracking tag, in the `<head>` of every page. That means the shared head include or partial if there is one (Hugo `partials/head.html`, Jekyll `_includes/head.html`, Eleventy layouts), otherwise every HTML file;
- the chat tag just before `</body>`, in the same shared place;
- the form and the booking snippet in the body of their pages.

Do not duplicate a site-wide tag on a page that already gets it from a shared layout.

## WordPress

Work in the theme, preferably a child theme, so an update does not wipe it:

- In `functions.php`, enqueue the banner (or tracking) script in `wp_head` and the chat script in `wp_footer`, with `async`.
- The form and the booking page go in as a Custom HTML block on their page. Tell the person which page and block, because page content lives in the database, not in the theme files.

If the site has another cookie plugin (Complianz, Cookiebot, CookieYes), it has to be switched off when the SolumFlow banner goes on. Two banners ask twice and disagree. Do not deactivate plugins yourself; tell the person.

## Anything else

Find the template that renders `<head>` on every page and put the site-wide tags there. Put the page snippets in the page templates. If you cannot find a shared head (site builders such as Webflow, Wix and Squarespace keep it in their own settings), explain where the person pastes each snippet in that builder's settings ("custom code in head", "before body end"), and give them the snippets.

## The hosting order page

It goes on one page of its own, such as `/bestellen` or `/hosting`, never site-wide. In the page's content, where the flow should be:

- React 19 or later: `<CrmHostingOrder account="…" />` inside the `CrmEmbedProvider`, with the account from `get_hosting_order_page` (`url` ends in `/order/<account>`). `packageId="…"` opens with one hosting package chosen.
- Anything else: paste the two lines of `embed` as they are. The `div` is where the flow appears; the script may stay right after it.

The block takes the full width of its column and grows with the flow; do not put it in a narrow sidebar. The site's own styles do not reach into it and it does not change the site's.

## The cookie settings link

Visitors have to be able to change their choice. With the banner, add a link in the footer, beside the privacy link if there is one:

```html
<a href="#" onclick="window.solumConsent.open(); return false">Cookie-instellingen</a>
```

In React, use a button styled like the footer's links:

```tsx
'use client';

export function CookieSettingsLink() {
  return (
    <button type="button" onClick={() => (window as { solumConsent?: { open(): void } }).solumConsent?.open()}>
      Cookie-instellingen
    </button>
  );
}
```

Do not declare `window.solumConsent` globally. The banner's own bundle already augments `window`, and a second declaration with other modifiers does not compile. A local cast is enough.

## Content-Security-Policy

Look for a CSP in:
- `next.config` `headers()`;
- `middleware.ts` or `proxy.ts`;
- `vercel.json` / `netlify.toml` / `_headers`;
- a `<meta http-equiv="Content-Security-Policy">`;
- the server config.

If there is one, add the app's origin to:
- `script-src` (embed scripts, banner, chat, tracking, hosting order page);
- `frame-src` (form, booking);
- `connect-src` (chat, tracking, banner, hosting order page);
- `img-src` (chat avatars, banner logo).

The hosting order page takes payments through Stripe: add `https://js.stripe.com` to `script-src` and `frame-src`, and `https://api.stripe.com` to `connect-src`.

With the banner and Tag Manager, also add Google's origins, which the container loads: `https://www.googletagmanager.com` in `script-src`, plus whatever the container's own tags need. If the site has no CSP, add none.
