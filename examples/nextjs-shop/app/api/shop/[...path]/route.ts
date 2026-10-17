import { createShopRouteHandler } from '@solumflow-app/crm-client/shop-route';

import { SITE_URL } from '../../../../lib/shop-config';

/**
 * The one route the cart and checkout talk to. It holds the key and the
 * visitor's cart token (in an httpOnly cookie) on the server, so the browser
 * never has either. `/api/shop` is where `CartProvider` looks by default.
 */
export const { GET, POST, PUT, PATCH, DELETE } = createShopRouteHandler({
  baseUrl: process.env.SOLUMFLOW_URL ?? '',
  apiKey: process.env.SOLUMFLOW_API_KEY ?? '',
  cartUrl: `${SITE_URL}/cart?restore={token}`,
});
