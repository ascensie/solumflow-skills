---
name: solumflow-cms-site
description: Connects a Next.js website to SolumFlow's CMS and fills its pages. SolumFlow keeps the pages, their blocks, the menu and the pictures; the site draws them with the `@solumflow-app/crm-client` SDK in its own design (a catch-all page, metadata, sitemap, menu, the preview page the editor shows, and the webhook that refreshes the site). Then the AI writes the pages as drafts through the SolumFlow MCP server, and a person publishes them in SolumFlow. Use it whenever someone wants their website's pages "in SolumFlow", "in het CMS", wants the site to read its pages, menu or texts from SolumFlow, wants to build a site on the SolumFlow CMS, wants pages, blocks or texts filled or written on a SolumFlow website, or asks to move a site's pages to SolumFlow. Use it even if they only name one part, such as the menu or the preview. A form, booking page, chat, tracking or cookie banner alone is `solumflow-website-setup`; a shop is `solumflow-webshop`.
---

# A website on SolumFlow's CMS

SolumFlow keeps the website's content: its pages, each a list of blocks from a fixed catalogue, the menu, the site settings and the pictures. The customer's own Next.js site is the front: it reads that content with the SDK and draws it in the customer's design. People edit the pages in SolumFlow; nobody logs in to the site to change a text.

Two kinds of work, and they stay apart:

- **The code**, in the site's repository on this machine: the pages that read and draw the blocks, the menu, the preview page, the webhook. Built and run locally as any Next.js site.
- **The content**, in SolumFlow: you write it through the MCP server **as drafts**. Nothing you do publishes. A person opens the page in SolumFlow and presses Publish.

The person running this is often not a developer. Talk to them in their own language (usually Dutch) and in plain words.

## Step 0: is everything there?

1. **The MCP server.** Tools such as `cms_list_websites`, `cms_list_blocks` and `cms_save_page_draft` must exist (in Claude Code usually prefixed, such as `mcp__solumflow__cms_list_websites`). If not, stop: the person adds the SolumFlow MCP server first (Settings → Integrations → API keys, the MCP card, paste the command in a terminal, restart). For writing pages the key needs the rights `cms-drafts:read` and `cms-drafts:write`; a tool that answers `forbidden` names the missing right. The key works as the person who made it, so that person needs the right to edit the CMS in SolumFlow.
2. **A website on the CMS.** Call `cms_list_websites`. An empty answer means the CMS is not switched on for a website of this account, or the person may not edit it. Switching it on and choosing which blocks the website may use is done by whoever manages the account (the reseller or SolumFlow), not by you and not by the customer. Say so and stop.
3. **The site.** Next.js, App Router, React 19 and Next 15 or later. Other techniques are not supported yet: say so and stop. If there is no site yet, create one with `create-next-app` after asking where.
4. **The keys on the site.** The site reads published pages with a key that holds `cms:read` (a public key is enough: what comes back is what the site shows anyway). The person makes it in the app and puts it in the site's local environment file (git-ignored) and in the hosting environment themselves. **Never ask them to paste a key into the conversation, never print one, never write one into a file you commit.** Write `.env.example` with empty values for `SOLUMFLOW_URL`, `SOLUMFLOW_API_KEY`, `SOLUMFLOW_EDITOR_ORIGINS` and `SOLUMFLOW_WEBHOOK_KEY`, and tell them which to fill in.

## Step 1: read the site and the blocks

Read `package.json`, the root layout, the existing pages and the styling (Tailwind, CSS modules, a component library). Match them.

Then `cms_list_blocks` for the website: the block types it may use, each with its fields. These are the only blocks a page can hold. **You cannot add a block type from the site.** What the catalogue does not have is either:

- the block `eigen-sectie`, if the website may use it: a variant name and a few free fields, drawn by a component of the site's own (switch on `block.variant`); or
- a question for SolumFlow, which adds blocks to the catalogue for everybody.

Say which, and do not invent a block type in the code.

## Step 2: draw the pages

Read `references/site-code.md` for the code of each piece. The pieces:

| Piece | Where | Does |
| --- | --- | --- |
| The client | `lib/solumflow.ts` | `createClient` with the key, cached under tags |
| Pages | `app/[[...path]]/page.tsx` (or the site's own route) | `getCmsPage({ path })`, `notFound()`, `RenderCmsBlocks` |
| Metadata | the same page | `generateMetadata` from the page's `seo` |
| Your own blocks | `components={{ hero: MyHero }}` | the site's design for the blocks it wants to draw itself |
| Menu | the header and footer | `getCmsNavigation()` |
| Sitemap | `app/sitemap.ts` | `getCmsPages()` |
| Preview | `app/(preview)/cms-preview/page.tsx` + `next.config.ts` | `CmsPreviewPage`, `cmsPreviewHeaders` |
| Webhook | `app/api/solumflow/revalidate/route.ts` | `createRevalidateRoute` |

The rules that hold everywhere:

- **The standard component first, your own where the design asks for it.** Every block has a plain, accessible standard component with class names (`cms-block cms-block--<type>`, `cms-block__heading`, …) and no style of its own. Style those classes, or hand in a component for a block. Do not rebuild every block by default.
- **A block the site does not know is left out**, never drawn as an error. Keep it that way.
- **Rich text is HTML that SolumFlow cleaned.** Draw it with the standard `Prose` part; do not put it on the page with `dangerouslySetInnerHTML` yourself.
- **Pictures come from SolumFlow's storage.** Add its host to `images.remotePatterns` in `next.config.ts` when the site uses `next/image`.
- **The preview route sits in a route group of its own, outside the layout that loads analytics**: the proof is in the address, and a measuring script would carry it off. Its headers are for that route alone; leave the site's other security headers as they are.

## Step 3: locally

The site runs on this machine against SolumFlow (its dev environment or production, whichever the key is for). Two things work differently there:

- **The webhook cannot reach `localhost`.** In development, read without caching (`revalidate: 0`, see `references/site-code.md`), or a page changed in SolumFlow shows only after a restart.
- **The preview beside SolumFlow's editor shows the site that is online**, not this machine: a preview address is always `https`. To see a draft on the local site, take the preview link a saved draft answers with and open the same path and parameters on `http://localhost:<port>/cms-preview`.

## Step 4: write the pages as drafts

When the person wants pages filled (from their old site, a brief, or texts they give):

1. `cms_list_pages`: what is there. Never overwrite a page without saying so first.
2. Per page, `cms_read_page` when it exists: saving sends **the whole page**, so a block you leave out is gone from the draft.
3. Pictures: `cms_upload_image` for a file on this machine, with an `alt` text for every picture that is not only decoration. Its id goes in an image field.
4. `cms_save_page_draft` with the title, the address (`/over-ons`), the blocks (`{ "blockType": "<type>", ...fields }`, only the types `cms_list_blocks` named) and the search texts (`seo.title`, `seo.description`).
5. Pass the preview link from the answer on. It is valid for ten minutes.

Write in the person's voice and language. Do not invent facts, prices, opening hours, reviews or legal claims: ask, or leave a marked placeholder and say so.

**You do not publish.** No tool can, and you do not ask the person for a way around that. Tell them where to publish: the page in SolumFlow, under the website's pages.

## Step 5: the webhook

Once the site is deployed (the address must be https and public):

1. The revalidation route from step 2 is in place.
2. `upsert_api_webhook` with the name "CMS revalidation", the url `https://<the site's real address>/api/solumflow/revalidate` and the events `cms_page.changed` and `cms_site.changed`. The answer carries a signing key **once**. It goes into `SOLUMFLOW_WEBHOOK_KEY` on the site; the person puts it in the hosting environment. Do not echo it into chat or into a committed file. If it was lost, make the address again.
3. `SOLUMFLOW_EDITOR_ORIGINS` is the list `getCmsSiteSettings()` returns as `editorOrigins`. The person puts it in the hosting environment, and sets the website's preview address in SolumFlow to `https://<the site's real address>/cms-preview`.

On a site that is not deployed yet, say that these come after the deploy.

## Step 6: check and report

Run what the project already uses to check itself: the type check, the linter, the build. Fix what you broke. Open a page locally to see it drawn. Do not leave a server you started running.

Then report briefly, in the person's language:

- which pages the site draws from SolumFlow, and which blocks have the site's own design;
- which pages you wrote as drafts, each with its address, and the preview links;
- what still needs a person: publishing the drafts in SolumFlow, the keys in the hosting environment, the webhook and the preview address after deploy;
- what the catalogue did not have, if anything.

Example of a good closing report:

> Klaar. Je site leest nu zijn pagina's uit SolumFlow: de home, /over-ons en /contact, met je eigen ontwerp voor de opening en de knoppen. Het menu komt ook uit SolumFlow.
>
> Ik heb drie pagina's als concept opgeslagen: Home, Over ons en Werkwijze. Bekijken (tien minuten geldig): …
>
> Nog te doen: publiceer de drie pagina's in SolumFlow, bij de pagina's van je website. Zet na het online zetten de twee sleutels in je hosting; dan meld ik de webhook aan.
