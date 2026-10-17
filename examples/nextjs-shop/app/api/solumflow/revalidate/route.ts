import { createRevalidateHandler } from '@solumflow-app/crm-client/webhooks';

/**
 * Where SolumFlow tells the site a product or category changed, so its
 * cached pages follow at once. The address registered with `upsert_api_webhook`
 * is `https://<this site>/api/solumflow/revalidate`.
 */
export const POST = createRevalidateHandler({
  secret: process.env.SOLUMFLOW_WEBHOOK_KEY ?? '',
});
