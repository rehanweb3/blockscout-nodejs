import config from 'configs/app';

export default function getSocketUrl(): string | undefined {
  const ws = config.apis.general.socket;
  if (!ws) return undefined;
  return ws;
}
