export const GET_BLOCK = {
  baseFeePerGas: null,
  difficulty: BigInt(0),
  extraData: '0x' as `0x${string}`,
  gasLimit: BigInt(30000000),
  gasUsed: BigInt(0),
  hash: '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`,
  logsBloom: '0x' as `0x${string}`,
  miner: '0x0000000000000000000000000000000000000000' as `0x${string}`,
  mixHash: '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`,
  nonce: '0x0000000000000000' as `0x${string}`,
  number: BigInt(0),
  parentHash: '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`,
  receiptsRoot: '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`,
  sha3Uncles: '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`,
  size: BigInt(0),
  stateRoot: '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`,
  timestamp: BigInt(0),
  totalDifficulty: BigInt(0),
  transactions: [] as Array<`0x${string}`>,
  transactionsRoot: '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`,
  uncles: [] as Array<`0x${string}`>,
};

export const GET_BLOCK_WITH_TRANSACTIONS = {
  ...GET_BLOCK,
  transactions: [],
};

export const GET_TRANSACTION = {
  blockHash: '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`,
  blockNumber: BigInt(0),
  from: '0x0000000000000000000000000000000000000000' as `0x${string}`,
  gas: BigInt(21000),
  hash: '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`,
  input: '0x' as `0x${string}`,
  nonce: 0,
  r: '0x0' as `0x${string}`,
  s: '0x0' as `0x${string}`,
  to: null as `0x${string}` | null,
  transactionIndex: 0,
  v: BigInt(0),
  value: BigInt(0),
  gasPrice: BigInt(0),
  chainId: BigInt(786),
  typeHex: '0x0' as `0x${string}`,
  type: 'legacy' as const,
};

export const GET_TRANSACTION_RECEIPT = {
  blockHash: '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`,
  blockNumber: BigInt(0),
  contractAddress: null as `0x${string}` | null,
  cumulativeGasUsed: BigInt(21000),
  effectiveGasPrice: BigInt(0),
  from: '0x0000000000000000000000000000000000000000' as `0x${string}`,
  gasUsed: BigInt(21000),
  logs: [],
  logsBloom: '0x' as `0x${string}`,
  status: 'success' as const,
  to: null as `0x${string}` | null,
  transactionHash: '0x0000000000000000000000000000000000000000000000000000000000000000' as `0x${string}`,
  transactionIndex: 0,
  type: 'legacy' as const,
};

export const GET_TRANSACTION_CONFIRMATIONS = BigInt(0);
