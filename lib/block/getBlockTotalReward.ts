import BigNumber from 'bignumber.js';

export default function getBlockTotalReward(block: { rewards?: Array<{ reward: string; type: string }> }): BigNumber {
  if (!block.rewards || block.rewards.length === 0) return new BigNumber(0);
  return block.rewards.reduce((acc, r) => acc.plus(new BigNumber(r.reward)), new BigNumber(0));
}
