export const TAC_OPERATION = {
  id: '0x0000000000000000000000000000000000000000000000000000000000000000',
  operations_count: 1,
  sender: { hash: '0x0000000000000000000000000000000000000000', name: null, is_contract: false, is_verified: false },
  status: 'pending',
  timestamp: new Date().toISOString(),
  type: 'ton_tac_ton',
};

export const TAC_OPERATION_DETAILS = {
  ...TAC_OPERATION,
  evm_transactions: [],
  ton_transactions: [],
};
