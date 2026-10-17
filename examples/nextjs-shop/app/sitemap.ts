import type { MetadataRoute } from 'next';

import { getSitemapEntries } from '@solumflow-app/crm-client/shop';

import { CATEGORY_PATH, PRODUCT_PATH, SITE_URL } from '../lib/shop-config';

/** Every published product and category, with the paths this site really uses. */
export default function sitemap(): Promise<MetadataRoute.Sitemap> {
  return getSitemapEntries({
    siteUrl: SITE_URL,
    productPath: PRODUCT_PATH,
    categoryPath: CATEGORY_PATH,
  });
}
