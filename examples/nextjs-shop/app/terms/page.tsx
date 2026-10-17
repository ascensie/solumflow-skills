import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'Terms and returns' };

/**
 * The shop's own text, written by the shop's owner (or their lawyer). The
 * words below only mark where it goes; they are not legal advice and make no
 * promise about delivery or returns.
 */
export default function TermsPage() {
  return (
    <>
      <h1>Terms and returns</h1>

      <h2>General terms</h2>
      <p>[The shop owner&apos;s general terms and conditions go here.]</p>

      <h2>Returns</h2>
      <p>[The shop owner&apos;s return policy goes here: the period, the conditions and who pays for the return.]</p>

      <h2>Company details</h2>
      <p>[Company name, address, registration and VAT number, contact details.]</p>
    </>
  );
}
