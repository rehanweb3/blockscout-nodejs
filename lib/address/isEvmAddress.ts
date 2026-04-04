export const ADDRESS_REGEXP = /^0x[0-9a-fA-F]{40}$/;

export function isEvmAddress(address: string): boolean {
  return ADDRESS_REGEXP.test(address);
}

export default isEvmAddress;
