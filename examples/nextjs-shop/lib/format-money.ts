/**
 * Writes an amount the server sent, in cents, as money for the page.
 *
 * Nothing here works an amount out: the cents are cut into a decimal string
 * by their digits and handed to `Intl.NumberFormat`, which prints it in the
 * currency's own style. The number being shown is always one the server gave.
 */
export function formatMoney(cents: number | null, currency: string | null) {
  if (cents === null || currency === null) {
    return '';
  }

  const digits = String(Math.abs(Math.trunc(cents))).padStart(3, '0');
  const decimal = `${cents < 0 ? '-' : ''}${digits.slice(0, -2)}.${digits.slice(-2)}`;

  // Intl reads a decimal string exactly, so no number is ever built from the cents.
  return new Intl.NumberFormat('en', { style: 'currency', currency }).format(
    decimal as `${number}`,
  );
}
