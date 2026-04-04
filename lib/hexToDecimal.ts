export default function hexToDecimal(hex: string): number {
  if (!hex) return 0;
  return parseInt(hex, 16);
}
