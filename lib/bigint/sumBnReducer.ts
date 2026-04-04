import BigNumber from 'bignumber.js';

export default function sumBnReducer(acc: BigNumber, value: string | BigNumber | undefined | null): BigNumber {
  return acc.plus(new BigNumber(value ?? 0));
}
