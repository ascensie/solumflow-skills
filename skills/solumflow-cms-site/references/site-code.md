# The site's code, piece by piece

Next.js App Router, React 19, Next 15 or later. Install the SDK with the project's own package manager:

```sh
pnpm add @solumflow-app/crm-client
```

Adapt names and folders to the site; the calls are what matter.

## The client

```ts
// lib/solumflow.ts
import 'server-only';
import { createClient } from '@solumflow-app/crm-client';

export const crm = createClient({
  baseUrl: process.env.SOLUMFLOW_URL!,
  apiKey: process.env.SOLUMFLOW_API_KEY!,
  // Online the webhook clears the cache; locally it cannot reach you, so
  // read fresh while developing.
  revalidate: process.env.NODE_ENV === 'development' ? 0 : false,
});
```

`revalidate: false` is right only once the webhook (step 5) is registered and reachable. Until then, keep a number of seconds, such as `60`, so a change shows up within a minute.

## The pages

```tsx
// app/[[...path]]/page.tsx
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { RenderCmsBlocks } from '@solumflow-app/crm-client/cms/react';

import { crm } from '@/lib/solumflow';
import { MyHero } from '@/components/my-hero';

type Props = { params: Promise<{ path?: string[] }> };

async function pageAt(props: Props) {
  const { path = [] } = await props.params;
  return crm.getCmsPage({ path: `/${path.join('/')}` });
}

export async function generateMetadata(props: Props): Promise<Metadata> {
  const page = await pageAt(props);
  if (!page) return {};

  return {
    title: page.seo.title ?? page.title,
    description: page.seo.description ?? undefined,
    openGraph: page.seo.image ? { images: [page.seo.image.url] } : undefined,
  };
}

export default async function Page(props: Props) {
  const page = await pageAt(props);
  if (!page) notFound();

  return (
    <RenderCmsBlocks
      page={page}
      client={crm} // product, product list and booking blocks
      appOrigin={process.env.SOLUMFLOW_URL} // form and booking blocks
      productHref={(product) => `/winkel/${product.slug}`}
      components={{ hero: MyHero }}
    />
  );
}
```

- A site that already has fixed routes (a `/contact` it keeps in code) leaves those as they are: the catch-all only answers what no other route does.
- `getCmsPage` gives `null` when nothing is live at the address; `notFound()` then.
- The page that belongs to a product: `crm.getCmsPage({ record: { object: 'product', id: product.id } })`.

## Your own component for a block

```tsx
// components/my-hero.tsx
import type { CmsBlockProps } from '@solumflow-app/crm-client/cms/react';
import { Buttons, Picture, Prose } from '@solumflow-app/crm-client/cms/react';
import type { ApiCmsHeroBlock } from '@solumflow-app/crm-client';

export function MyHero({ block, context }: CmsBlockProps<ApiCmsHeroBlock>) {
  return (
    <section id={block.anker ?? undefined} className="hero">
      {/* the site's own markup, with the parts the package offers */}
    </section>
  );
}
```

Read the block's type (`ApiCmsHeroBlock`, `ApiCmsTextBlock`, …) for its fields; the names are the catalogue's (`kop`, `inhoud`, `knoppen`, …). `eigen-sectie` is the block made to be replaced: switch on `block.variant`. A section draws its parts with `context.renderBlocks`.

## The menu

```tsx
// in the header (a server component)
const menu = await crm.getCmsNavigation();

<nav>
  {menu.items.map((item) =>
    item.href ? <a key={item.label} href={item.href}>{item.label}</a> : null,
  )}
</nav>
```

At most one level of `children`. An item whose page is not live has `href: null`: leave it out.

## The sitemap

```ts
// app/sitemap.ts
import type { MetadataRoute } from 'next';
import { crm } from '@/lib/solumflow';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const { data } = await crm.getCmsPages();
  const site = process.env.SITE_URL!;

  return data.map((page) => ({
    url: `${site}${page.path === '/' ? '' : page.path}`,
    lastModified: page.updatedAt ?? undefined,
  }));
}
```

## The preview page

SolumFlow's editor shows a draft beside the editor, on the site, at this route. Three pieces.

```ts
// next.config.ts -- the headers of the preview route, and of that route alone
import { cmsPreviewHeaders } from '@solumflow-app/crm-client/cms/react';

export default {
  async headers() {
    return cmsPreviewHeaders({
      editorOrigins: process.env.SOLUMFLOW_EDITOR_ORIGINS ?? '',
    });
  },
  images: {
    // the host of SolumFlow's storage, from a picture's url
    remotePatterns: [{ protocol: 'https', hostname: '<storage host>' }],
  },
};
```

If the site already has a `headers()`, add the preview's entries to its list.

```tsx
// app/(preview)/cms-preview/page.tsx -- its own route group, outside the
// layout that loads analytics: the proof is in the address
import {
  CmsPreviewPage,
  cmsPreviewMetadata,
} from '@solumflow-app/crm-client/cms/react';

import { crm } from '@/lib/solumflow';

export const metadata = cmsPreviewMetadata;

export default function Preview(props: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  return (
    <CmsPreviewPage
      searchParams={props.searchParams}
      client={crm}
      editorOrigins={process.env.SOLUMFLOW_EDITOR_ORIGINS ?? ''}
    />
  );
}
```

- `SOLUMFLOW_EDITOR_ORIGINS` is what `getCmsSiteSettings()` returns as `editorOrigins`, comma separated: SolumFlow's address and its reseller's.
- Without a valid proof the page shows nothing. With one, the draft, drawn again each time the editor saves.
- The website's preview address in SolumFlow is `https://<the site>/cms-preview`. Locally, open the path and parameters of a preview link on `http://localhost:<port>/cms-preview`.

## The webhook

```ts
// app/api/solumflow/revalidate/route.ts
import { createRevalidateRoute } from '@solumflow-app/crm-client/webhooks';

export const POST = createRevalidateRoute({
  signingKey: process.env.SOLUMFLOW_WEBHOOK_KEY!,
});
```

A `cms_page.changed` clears the pages, the menu and the settings together (the delivery names page ids, not addresses); a `cms_site.changed` clears the menu and the settings. If the site already has this route for its shop, it is the same route: add the two events to the existing webhook instead of making a second one.
