---
name: solumflow-website-setup
description: Connects a website to SolumFlow in one guided pass. It offers a menu (contact form, booking, chat widget, hosting order page, visitor tracking, cookie banner), sets up the chosen parts in the CRM through the SolumFlow MCP server, and places them in the site's code. Use it whenever someone wants SolumFlow, their CRM, or "het systeem" on their website, wants a contact form, booking page, chat, a hosting order page (domain, hosting and mail in one payment), tracking script or cookie banner from SolumFlow on a site, or has just installed the SolumFlow MCP server and asks what to do next. Use it even if they only name one of those parts. Products, the catalogue and shop pages are not part of this skill. A web shop is `solumflow-webshop`.
---

# SolumFlow on a website: the basic setup

This skill connects one website to one SolumFlow account. The person picks what they want on the site from a menu. You then set it up in the CRM with the SolumFlow MCP tools and place it in the site's code, the way that site is built.

The person running this is often a business owner, not a developer. Talk to them in their own language (usually Dutch) and in plain words. Explain a choice by what it does on their site, not by its technical name.

## What is in scope

| Part | In the CRM | On the site |
| --- | --- | --- |
| Contact form | find a published form, or make and publish one | the form on a contact page |
| Booking | find a booking page (services, a category, a calendar) | the booking page embedded, or a link to it |
| Chat widget | make or reuse a widget, publish it, allow the site | the chat script, once, site-wide |
| Hosting order page | choose the packages, allow the site, open it | the order flow on an order page of the site |
| Visitor tracking | set tracking up, allow the site's hosts | the tracking script, once, site-wide |
| Cookie banner | switch the banner on, set Tag Manager and privacy link | the banner tag in the head, and a "cookie settings" link |

Products, categories and a shop are not part of this setup (that is `solumflow-webshop`), and neither is a 3D configurator. If the person asks for them, finish this setup first, then point to the `solumflow-webshop` skill, which builds the shop (it hands tracking and the cookie banner back to this skill).

## Step 0: is the MCP server there?

The tools are named `list_forms`, `list_booking_pages`, `list_chat_widgets`, `upsert_chat_widget`, `get_site_tracking` and `update_site_tracking`. In Claude Code they usually appear with a prefix such as `mcp__solumflow__list_forms`. Call `get_site_tracking` once. That checks the connection and the key in one go.

- **No such tools:** stop. Explain that the SolumFlow MCP server has to be added first. In SolumFlow, go to Settings → Integrations → API keys, use the MCP card under the list, and paste the command it shows into a terminal. Then restart Claude Code.
- **`forbidden` naming `website:manage`:** the key lacks that right. The quickest fix is a new install command from that same card with "website" ticked, then a restart.
- **The hosting order page** needs `get_hosting_order_page` and a key with `hosting-order:manage`. Only accounts that sell hosting have it (the Domains module). Without the tool or the right, leave it out of the menu.

## Step 1: read the site before asking anything

Find out, without asking:

1. **How the site is built.** Look at `package.json`, the config files and the folder layout. Then read the matching section of `references/placing-on-the-site.md`. Common cases are Next.js (app or pages router), another React setup, Astro, Nuxt or Vue, plain HTML, and a WordPress theme.
2. **Where things go.** Find the file that renders `<head>` on every page (the root layout). Find whether there is a contact page, a footer, and a page that would suit booking.
3. **The site's address.** Use the production domain if the project says it: a `CNAME`, the `homepage` field, `vercel.json` or `netlify.toml` domains, a site URL in the config or `.env.example`, `metadataBase`, a sitemap. You will need it for the chat widget's allowed sites and tracking's allowed hosts. If nothing names it, ask in Step 2.
4. **What is already there.** Look for an existing SolumFlow snippet (`/embed/`, `/api/site-tracking/script`, `/api/consent/script`, `@solumflow-app/crm-client`). Look for another chat tool (Intercom, Tidio, Crisp), another cookie banner (Cookiebot, CookieYes, Complianz), and a Google Tag Manager snippet (`googletagmanager.com/gtm.js`) or a Content-Security-Policy header. These change what you will do, so note them.

Then read what the account already has, all at once: `list_forms`, `list_booking_pages`, `list_chat_widgets`, `get_site_tracking`, and `get_consent_banner` and `get_hosting_order_page` if those tools exist.

## Step 2: the menu

Show one menu, with what you found next to each choice so the person sees what is ready. With the `AskUserQuestion` tool, ask two questions in one call; it allows four options per question, so the five parts are split. Both questions are multi-select:

- "Wat wil je op je website?" with the options Contactformulier, Online boeken, Chatwidget and Hosting bestellen (the last only when the account sells hosting, see Step 0).
- "Meten en privacy" with the options Websitebezoek meten and Cookiebanner.

Put the state in each option's description. For example: "Formulier 'Contact' staat klaar in SolumFlow", "Nog geen chatwidget: ik maak er een", or "Er staat al een andere chat (Tidio) op de site: die moet eraf".

Without `AskUserQuestion` (other editors), show the same choices as a numbered list and ask which numbers.

If the production address is unknown, ask for it in the same round. It has to be the address visitors use, such as `https://www.example.com`.

Two choices depend on each other. Say so if the person picks one without the other:

- **The cookie banner needs visitor tracking.** The banner keeps choices only from the hosts on tracking's list. So choosing the banner means setting tracking's hosts too, even if tracking itself was not ticked.
- **Tracking in the EU waits for consent.** Tracking without a banner waits for a consent signal the site has to give itself. Recommend the banner unless the site already has one that speaks Google Consent Mode.

## Step 3: plan, then confirm the changes that are visible

Before writing anything, give a short list. For each chosen part, say what you will change in SolumFlow and which files you will change on the site. Ask for one go-ahead.

Some CRM changes are visible to visitors or hard to undo. Name them explicitly in the plan:

- publishing a form or a chat widget (it goes live);
- adding the first allowed site to an existing chat widget, which takes it off every other site it runs on now;
- removing a host or a site;
- switching the cookie banner on;
- opening the hosting order page: from then on visitors order and pay for real.

## Step 4: set it up in SolumFlow

Read `references/crm-setup.md` for each part. It covers which tool, which input, and what to do when the tool you need does not exist on this account's server yet.

The short version:

- **Contact form:** use a published form whose name or fields fit "contact" (name, e-mail, message). If none fits and `create_form` exists, make one from the template in the reference and publish it after the go-ahead. If it does not exist, send the person to the form builder in the app. Wait for them, then call `list_forms` again.
- **Booking:** pick from `list_booking_pages`. The services overview suits "boek een afspraak"; a single calendar suits one kind of meeting. If the list is empty, booking has to be set up in the app first.
- **Chat widget:** reuse a published widget if there is one. Otherwise `upsert_chat_widget` with slug `website-chat`, a name, `status: published`, and the site's origins. How the chat looks is set in the app's chat builder.
- **Hosting order page:** `get_hosting_order_page`, then `update_hosting_order_page` with the packages the person wants (from `candidates`) and the site's origin in `allowedOrigins`. Open it (`enabled: true`) only after the go-ahead. A refusal names something the owner fixes in the app (a registrar login, the renewal round in shadow mode): pass it on, place the snippet anyway, it shows a sentence until the page opens.
- **Tracking:** `update_site_tracking` with the production host. Add the `www.` and bare variants if both are used, and the preview hosts the person wants counted.
- **Cookie banner:** first make sure tracking has the site's hosts. Then, if `update_consent_banner` exists, switch it on with the Tag Manager ID (if the site has one) and the privacy statement link. Without that tool, send the person to Settings → Website → Cookie banner in the app. The banner also needs the "Cookie banner" module, which an administrator switches on.

## Step 5: place it on the site

Follow `references/placing-on-the-site.md` for the site's kind. The rules that hold everywhere:

- **Use what the tools return, never a URL you build yourself.** Each answer carries the snippet, the id or the key, and the app's own address. A reseller's customer has a different address from the platform, so a guessed one breaks.
- **On React 19 or later, use the components** from `@solumflow-app/crm-client/react` (`CrmForm`, `CrmBooking`, `CrmChatWidget`, `CrmHostingOrder`, `CrmSiteTracking`, inside one `CrmEmbedProvider`). Install the package with the project's own package manager. On older React, or anything else, paste the HTML snippets.
- **Site-wide scripts go in once.** Chat, tracking and the banner go in the root layout or head, never per page.
- **The cookie banner tag replaces two things.** It replaces the separate tracking script and the site's own Tag Manager snippet. Remove both when you place it, or Tag Manager loads twice. With the banner, do not place `CrmSiteTracking` at all. Add a "Cookie-instellingen" link in the footer that calls `window.solumConsent.open()`.
- **Remove what the new part replaces,** but only after saying so in the plan: an old chat script, an old cookie banner, an old form embed.
- **Content-Security-Policy:** if the site sends one, add the app's origin to `script-src`, `frame-src`, `connect-src` and `img-src`. Without that, the browser blocks every embed silently. The hosting order page also needs `https://js.stripe.com` in `script-src` and `frame-src`, and `https://api.stripe.com` in `connect-src`.
- Keep the site's own style. Match its components, file names and formatting. Put the form and the booking page on pages that already exist when there is a sensible one. Only make a new page (`/contact`, `/afspraak`) when there is none, and say so.

## Step 6: check and report

Run what the project already uses to check itself: the type check, the linter, the build. Fix what you broke. If the project has a dev server, say which pages to open to see each part. Do not leave a server you started running.

Then report briefly, in the person's language:

- what is live now, and where on the site;
- what you changed in SolumFlow;
- what still needs a person, such as a step in the app, deploying the site, or the chat's look;
- one line on how to see it working.

Example of a good closing report:

> Klaar. Op je site staan nu:
> - het contactformulier "Contact" op /contact;
> - de chat, op elke pagina;
> - de cookiebanner, met websitebezoek meten erachter: bezoek telt pas na toestemming.
>
> In SolumFlow heb ik de chatwidget "Websitechat" gepubliceerd en www.bakkerijdewit.nl toegevoegd aan de chat en aan het meten.
>
> Nog te doen: zet de site online. Daarna zie je een testbericht uit het formulier onder Contacten. Hoe de chat eruitziet stel je in onder Chat → Bouwer.
