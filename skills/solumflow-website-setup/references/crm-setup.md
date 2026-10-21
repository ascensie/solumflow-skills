# Setting each part up in SolumFlow

Every tool is one call of SolumFlow's public API. The API decides what is allowed; a tool never works around a refusal. A refusal that names a right (`forbidden … website:manage`) means the key lacks it. Say which right is missing, and point to Settings → Integrations → API keys for a new key or install command. Do not try a different route.

An account's server may be older than this skill, so a tool below may be missing. Check the tool list (`server_info` names the version). If a tool is missing, take the "without the tool" path; never call a name that is not there.

| Part | Tools | Right | From server |
| --- | --- | --- | --- |
| Contact form | `list_forms`; `create_form`, `update_form` (publishing is `update_form` with `status: "published"`) | `website:manage`; `forms:manage` | |
| Booking | `list_booking_pages`; `upsert_services`, `set_calendar_availability`, `upsert_calendar` | `website:manage`; `calendar:manage` | 0.13 for the setup tools |
| Chat widget | `list_chat_widgets`, `upsert_chat_widget` | `website:manage` | |
| Tracking | `get_site_tracking`, `update_site_tracking` | `website:manage` | |
| Cookie banner | `get_consent_banner`, `update_consent_banner` (the tag is built from tracking's site key; see below) | `website:manage` | |
| Hosting order page | `get_hosting_order_page`, `update_hosting_order_page` | `hosting-order:manage` | |

A module that is switched off answers `feature_unavailable`. Modules are switched on per account by an administrator, not through the API. Tell the person which module it is (Forms, Calendar, Chat, Cookie banner) and carry on with the other parts.

## Contact form

1. `list_forms` gives the published forms, each with an `id`, a link and an embed snippet.
2. Choose one that is clearly a contact form: its name says contact or something like it, or it asks for a name, an e-mail address and a message. If two fit, ask which. A newsletter or quote form is not a contact form, so do not substitute one.
3. **None fits, and `create_form` exists:** make one from this template, in the site's language:
   - name "Contact" (at most 30 characters), slug `contact` (or `contact-website` if taken);
   - fields: name (required), e-mail address (required, mapped to the contact's e-mail), phone (optional), message (required, long text);
   - a short thank-you text.

   Publishing refuses a form without a field mapped to the contact's e-mail, because such a submission can never become a contact. The tool's own input schema decides the exact shape; follow it rather than this description. Publish only after the go-ahead from Step 3, since a published form takes submissions.
4. **None fits, and there is no `create_form`:** ask the person to make it in SolumFlow under Forms → New form, with the fields above, and to publish it. Carry on with the other parts meanwhile. Call `list_forms` again when they say it is done.

## Booking

1. `list_booking_pages` lists every bookable page:
   - the services overview (everything at once);
   - a category of services;
   - a single service;
   - each appointment calendar.

   Each has a `url` and an embed snippet.
2. Match the person's words. "Afspraak maken" or "boeken" for a salon or a practice is the services overview. "Plan een kennismakingsgesprek" is a calendar. If several fit, put the two or three most likely in a question.
3. **An empty list, and `upsert_services` exists:** set booking up from the business's own services -- what the site or the person says they offer, never invented ones. Put the list in the plan for the go-ahead: name, length in minutes, price, group.
   - `upsert_services` with each service by a slug (`knippen`, `kleuren-lang-haar`), `durationMinutes`, `priceCents` and `category`. A service nobody performs is given the account's owner, so it has free times at once.
   - Every account already has one services calendar (usually `diensten`, Monday to Friday 9:00-17:00). Change its hours only when the business keeps others: `set_calendar_availability` with `slug` and `rules` (`weekday` 0 is Sunday; `startsTime`/`endsTime` as `HH:MM`), and `overrides` for closed days.
   - For "plan een kennismakingsgesprek" rather than services: `upsert_calendar` with a slug, a name and `durationMinutes`; its hours are set the same way.
   - Then `list_booking_pages` again: the services overview, its categories and each service now have a link and a snippet.
   - Paying in advance needs the account's own Stripe connection and is switched on in the app. Without it the price is paid on the spot; say so.
4. **An empty list, and no `upsert_services`:** services are set up in the app under Calendar → Services, and an appointment calendar under Calendar. Say so, and skip booking for now.
5. A calendar that charges for a booking opens its payment in a new tab when it is embedded. That is how it should work, not a fault.

## Chat widget

1. `list_chat_widgets`: a widget with `status: published` and a script tag can be reused. Look at its allowed origins:
   - **empty:** it runs on any site, and no change is needed;
   - **it lists other sites:** the new site has to be added.
2. **Adding the first origin to a widget with an empty list narrows it to that one site.** If that widget may already run on another site, say so in the plan. In that case, offer a second widget for this site instead.
3. **No widget:** `upsert_chat_widget` with
   - `slug: "website-chat"` (or the site's name in kebab-case),
   - `name: "Websitechat"`,
   - `status: "published"` (after the go-ahead),
   - `addAllowedOrigins`: the production origin, such as `https://www.example.com`, and the bare-domain variant if the site answers on both.
4. Do not add `http://localhost:…` to a live widget's origins unless the person wants to test locally. Mention that they can, and that they can remove it afterwards. A widget with only localhost on its list stops answering on the live site.
5. Colours, greeting, opening hours and position are set in the app's chat builder, not through the API. Mention it in the report.

## Visitor tracking

1. `get_site_tracking` returns `null` when tracking was never set up. Otherwise it returns the tag, the public key, the allowed hosts and the consent signal.
2. `update_site_tracking` with `addAllowedHosts`:
   - the production host (`www.example.com`), and the bare domain if it is used;
   - `*.example.com` only when the person wants every subdomain counted.

   An empty list counts nothing, so this call is what makes tracking work at all.
3. **Consent signal:**
   - With the SolumFlow cookie banner, keep the default `ad_storage` (the Marketing category) unless the person wants visits counted under Analytics (`analytics_storage`).
   - With a different banner that tells the page itself, use `api_only` and follow that banner's own instructions.
   - Without any banner, explain that tracking waits for consent and therefore counts nothing until a banner asks.

## Cookie banner

The banner is a tag in the `<head>`:

```html
<script async src="<app origin>/api/consent/script?k=<site key>"></script>
```

`<site key>` is tracking's public key (from `get_site_tracking`), and `<app origin>` is the origin of tracking's own tag. The banner keeps choices only from tracking's allowed hosts. Set tracking's hosts first, even if tracking itself was not chosen.

**With `update_consent_banner`:**

1. Call `get_consent_banner` first; it answers `null` when there is none yet.
2. Then call `update_consent_banner` with:
   - `enabled: true` (after the go-ahead);
   - the Tag Manager container ID (`GTM-…`) if the site has a Tag Manager snippet now (read it from the snippet);
   - the privacy statement link (https only), if the site has a privacy page;
   - the default language of the site.

   Use the tag the tool returns.

**Without it:** ask the person to open SolumFlow under Settings → Website → Cookie banner and do four things:
- press "Set up the cookie banner";
- switch it on;
- fill in the Tag Manager ID if they have one, and the privacy statement link.

Place the tag from the line above in the meantime. It does nothing until the banner is switched on, so placing it early is harmless.

The banner takes its colours, font and logo from Settings → Account → Branding. A change in the banner's settings reaches the site within an hour.

## Hosting order page

For an account that sells hosting: one order flow on the site where a visitor picks a domain, hosting and mail and pays once. It is drawn in place, in the account's house style and the site's font, without an iframe.

**With `update_hosting_order_page`:**

1. Call `get_hosting_order_page`. It returns the packages that could stand on the page (`candidates`), the ones that do (`packages`), the sites it may stand on (`allowedOrigins`), why it would not open (`refusal`), the page's own link (`url`) and the snippet (`embed`).
2. Call `update_hosting_order_page` with:
   - `allowedOrigins`: the whole list, with the site's production origin (`https://www.example.com`) added. On a site not on the list the block shows only a sentence;
   - `packages`, if the person wants others than now: the whole list in the order the page shows it, each with `productId` and `service` (`hosting` or `email`), optionally one `featured` per card;
   - `enabled: true`, only after the go-ahead: from then on visitors pay for real.
3. A refusal to open (`conflict`) names what the account owner fixes in the app themselves: the renewal round still in shadow mode, no registrar login, a mail package without a mail login. Say it in plain words. Place the snippet anyway; it shows a sentence until the page is open.

Use the `embed` the tool returns, or `CrmHostingOrder` with the account from it on React 19.

**Without the tool:** the owner sets it up under Settings → Services → Order page, "On your own website", adds the site there and copies the two lines; you place them.

## For a reseller: the customer's own account

An agent of a reseller (a key with `clients:manage`) can give a customer its own SolumFlow account and set it up there, instead of using the reseller's or a demo account.

1. `create_client_account` with the business's name and the owner's e-mail address. The owner gets a login and a mail with the way in. The same address again makes nothing and answers the account that owner already has.
2. `set_client_modules` with what was sold, for example `crm`, `calendar`, `forms`, `chat`, `consent`.
3. **The customer's key is made by a script, never by a tool or in the conversation.** A tool's answer lands in the transcript, and so does anything typed. The script calls `createClientApiKey` of `@solumflow-app/crm-client` (or `POST /api/public/v1/client-accounts/api-keys`) with the reseller's key and hands the new key straight on, for example to `claude mcp add` for a server of its own. It prints only "ok" or the error code. A new MCP server loads in a new session.
4. In that session, with the customer's own server, set up the parts above as usual.

A payment page link with `?ref=<lead>` puts that mark on the order. `list_orders` with `sellerRef` finds it again, with `clientAccountId`: the account the order made when the product sold provisions one.
