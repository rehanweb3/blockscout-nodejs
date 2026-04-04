export default function hexToUtf8(hex: string): string {
  try {
    const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
    const bytes = Buffer.from(clean, 'hex');
    return bytes.toString('utf8');
  } catch {
    return hex;
  }
}
