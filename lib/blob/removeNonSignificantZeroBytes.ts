export default function removeNonSignificantZeroBytes(data: string): string {
  const hex = data.startsWith('0x') ? data.slice(2) : data;
  const trimmed = hex.replace(/00+$/, '');
  return '0x' + trimmed;
}
