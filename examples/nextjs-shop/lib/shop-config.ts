/**
 * The few things that are this shop's own. Everything else comes from SolumFlow.
 */

/** Where this site lives, for the sitemap and the cart reminder link. */
export const SITE_URL = process.env.SOLUMFLOW_SITE_URL ?? 'http://localhost:3000';

/**
 * The slugs of the public fields to offer as filters on the overview, such as
 * `['color']`. They are the fields `list_catalog_fields` shows as public.
 * Empty: the overview has search and stock only.
 */
export const FACET_FIELDS: string[] = [];

/** Where the pages live, so the sitemap, the metadata and the links agree. */
export const PRODUCT_PATH = '/product';
export const CATEGORY_PATH = '/category';
