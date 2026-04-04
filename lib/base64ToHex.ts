export default function base64ToHex(base64: string): string {
  const bytes = Buffer.from(base64, 'base64');
  return '0x' + bytes.toString('hex');
}
