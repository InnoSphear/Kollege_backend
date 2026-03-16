import Redis from 'ioredis';

let redisClient;

export const getRedisClient = () => {
  if (!process.env.REDIS_URL) return null;
  if (!redisClient) {
    redisClient = new Redis(process.env.REDIS_URL, {
      maxRetriesPerRequest: 1,
      enableOfflineQueue: false,
      lazyConnect: true,
    });

    redisClient.on('error', () => {});
    redisClient.connect().catch(() => {});
  }
  return redisClient;
};
