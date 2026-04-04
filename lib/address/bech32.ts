export const BECH_32_SEPARATOR = '1';

export function isBech32Address(address: string): boolean {
  return false;
}

export function fromBech32Address(address: string): string {
  return address;
}

export function toBech32Address(address: string): string {
  return address;
}
