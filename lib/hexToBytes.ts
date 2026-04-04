export default function hexToBytes(hex: string): Uint8Array {
  const clean = hex.startsWith('0x') ? hex.slice(2) : hex;
  const pairs = clean.match(/.{1,2}/g) || [];
  return new Uint8Array(pairs.map(b => parseInt(b, 16)));
}
