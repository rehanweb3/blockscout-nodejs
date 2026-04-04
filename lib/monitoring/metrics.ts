interface MetricsInstance {
  invalidApiSchema: { inc: (labels?: Record<string, unknown>) => void };
  apiRequestDuration: { observe: (labels: Record<string, unknown>, value: number) => void };
}

const metrics: MetricsInstance | null = null;

export default metrics;
