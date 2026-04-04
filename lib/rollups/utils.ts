export const layerLabels = {
  l1: 'L1',
  l2: 'L2',
} as const;

export function getBatchStatusLabel(status: string): string {
  switch (status) {
    case 'committed': return 'Committed';
    case 'finalized': return 'Finalized';
    case 'sealed': return 'Sealed';
    default: return status;
  }
}

export function formatZkEvmTxStatus(status: string): { id: string; title: string } {
  const titles: Record<string, string> = {
    pending: 'Pending',
    validated: 'Validated',
    finalized: 'Finalized',
  };
  return { id: status, title: titles[status] ?? status };
}

export function formatZkSyncL2TxnBatchStatus(status: string): { id: string; title: string } {
  const titles: Record<string, string> = {
    committed: 'Committed',
    finalized: 'Finalized',
    sealed: 'Sealed',
    proved: 'Proved',
    executed: 'Executed',
  };
  return {
    id: status,
    title: titles[status] ?? status,
  };
}
