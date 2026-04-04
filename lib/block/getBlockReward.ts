import BigNumber from 'bignumber.js';
import getBlockTotalReward from './getBlockTotalReward';

export default function getBlockReward(block: { rewards?: Array<{ reward: string; type: string }> }): {
  total: BigNumber;
  burntFees: BigNumber;
  txFees: BigNumber;
  staticReward: BigNumber;
} {
  const totalReward = getBlockTotalReward(block);
  return {
    totalReward,
    burntFees: new BigNumber(0),
    txFees: new BigNumber(0),
    staticReward: totalReward,
  };
}
