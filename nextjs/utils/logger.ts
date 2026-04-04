import type { NextApiRequest, NextApiResponse } from 'next';

interface Logger {
  error: (data: unknown) => void;
  info: (data: unknown) => void;
  warn: (data: unknown) => void;
}

export const httpLogger: ((req: NextApiRequest, res: NextApiResponse) => void) & { logger: Logger } = Object.assign(
  (_req: NextApiRequest, _res: NextApiResponse) => {},
  {
    logger: {
      error: (data: unknown) => console.error('[API]', data),
      info: (data: unknown) => console.info('[API]', data),
      warn: (data: unknown) => console.warn('[API]', data),
    },
  },
);
