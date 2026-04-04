export type TacOperationStatus = 'pending' | 'processing' | 'completed' | 'failed' | 'unknown';

export type TacOperationStage = {
  status: TacOperationStatus;
  label: string;
  isError: boolean;
};

export function getTacOperationStage(operation: unknown): TacOperationStage {
  const op = operation as Record<string, unknown> | null | undefined;
  const status = (op?.status as TacOperationStatus) ?? 'unknown';
  const isError = status === 'failed';
  const labels: Record<string, string> = {
    pending: 'Pending',
    processing: 'Processing',
    completed: 'Completed',
    failed: 'Failed',
    unknown: 'Unknown',
  };
  return { status, label: labels[status] ?? status, isError };
}

export function getTacOperationStatus(_operation: unknown): string {
  return 'unknown';
}
