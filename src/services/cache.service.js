import { getRedisClient } from '../config/redis.js';

export const withCache = async (key, ttlSeconds, fetcher) => {
  const redis = getRedisClient();
  if (!redis) return fetcher();

  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);

  const fresh = await fetcher();
  await redis.set(key, JSON.stringify(fresh), 'EX', ttlSeconds);
  return fresh;
};
