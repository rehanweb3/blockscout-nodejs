export default function useSocketMessage(_options: {
  channel: null;
  event: string;
  handler: (...args: Array<unknown>) => void;
}) {
  // No-op: socket not connected
}
