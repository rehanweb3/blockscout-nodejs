import Redis from 'ioredis';
import { logger } from '../utils/logger.js';

let client = null;
let available = false;

const memCache = new Map();

function memGet(key) {
  const entry = memCache.get(key);
  if (!entry) return null;
  if (Date.now() > entry.exp) {
    memCache.delete(key);
    return null;
  }
  return entry.val;
}

function memSet(key, value, ttlSeconds) {
  memCache.set(key, { val: value, exp: Date.now() + ttlSeconds * 1000 });
}

function memDel(key) {
  memCache.delete(key);
}

export function getRedis() {
  if (!client) {
    client = new Redis(process.env.REDIS_URL || 'redis://localhost:6379', {
      lazyConnect: true,
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      retryStrategy: () => null,
    });

    client.on('connect', () => {
      available = true;
      logger.info('Redis connected');
    });
    client.on('error', () => {
      available = false;
    });

    client.connect().catch(() => {
      logger.warn('Redis unavailable, using in-memory cache');
    });
  }
  return client;
}

export function isAvailable() {
  return available;
}

export async function cacheGet(key) {
  const mem = memGet(key);
  if (mem !== null) return mem;
  if (!available) return null;
  try {
    const val = await client.get(key);
    return val ? JSON.parse(val) : null;
  } catch {
    return null;
  }
}

export async function cacheSet(key, value, ttlSeconds = 15) {
  memSet(key, value, ttlSeconds);
  if (!available) return;
  try {
    await client.setex(key, ttlSeconds, JSON.stringify(value));
  } catch {
    // ignore
  }
}

export async function cacheDel(key) {
  memDel(key);
  if (!available) return;
  try {
    await client.del(key);
  } catch {
    // ignore
  }
}
