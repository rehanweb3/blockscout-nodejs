export function getContractUrl(_address: string, _chainId?: string): string {
  return `/address/${_address}`;
}

export function isContractVerified(_address: string): boolean {
  return false;
}
