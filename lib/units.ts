import config from 'configs/app';

export const currencyUnits = {
  ether: config.chain.currency.symbol,
  gwei: 'Gwei',
  wei: config.chain.currency.weiName,
};
