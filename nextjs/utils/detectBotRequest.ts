import type { IncomingMessage } from 'http';

export interface BotInfo {
  type: 'social_preview' | 'generic';
  name?: string;
}

export default function detectBotRequest(_req: IncomingMessage): BotInfo | null {
  return null;
}
