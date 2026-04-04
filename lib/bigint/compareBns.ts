export default function compareBns(a: string | number, b: string | number): number {
  const bigA = BigInt(a || 0);
  const bigB = BigInt(b || 0);
  if (bigA > bigB) return 1;
  if (bigA < bigB) return -1;
  return 0;
}
