/** Matches the mockup's "$210.000" style — dot thousands separator, no decimals. */
export function formatMoney(amount: number): string {
  return `$${Math.round(amount).toLocaleString('es-CO')}`;
}
