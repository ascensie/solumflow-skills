import type { Metadata } from 'next';
import { Suspense } from 'react';

import { ThankYouMessage } from '../../components/thank-you-message';

export const metadata: Metadata = { title: 'Thank you', robots: { index: false } };

export default function ThankYouPage() {
  return (
    <>
      <h1>Thank you</h1>
      <Suspense>
        <ThankYouMessage />
      </Suspense>
    </>
  );
}
