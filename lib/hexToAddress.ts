export default function hexToAddress(hex: string): string {
  // Ensure the address is properly formatted with 0x prefix and 40 hex chars
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  return '0x' + clean.padStart(40, '0').slice(-40).toLowerCase();
}
