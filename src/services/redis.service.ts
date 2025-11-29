import { reservationInventory } from '../models/repositories/inventory.repo';
import { getRedis } from '../dbs/init.redis';

export const acquireLock = async (
  productId: string,
  quantity: number,
  cartId: string
): Promise<string | null> => {
  const { instance: redisClient } = getRedis();
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }

  const key = `lock_v2025_${productId}`;
  const retryTimes = 10;
  const expireTime = 3000;

  for (let i = 0; i < retryTimes; i++) {
    const result = await redisClient.setNX(key, expireTime.toString());
    console.log(`result: : : `, result);

    if (result === true) {
      const isReversation = await reservationInventory({
        productId,
        quantity,
        cartId,
      });

      if ((isReversation as any).modifiedCount) {
        await redisClient.pExpire(key, expireTime);
        return key;
      }

      return null;
    } else {
      await new Promise((resolve) => setTimeout(resolve, 50));
    }
  }
  return null;
};

export const releaseLock = async (keyLock: string): Promise<number> => {
  const { instance: redisClient } = getRedis();
  if (!redisClient) {
    throw new Error('Redis client not initialized');
  }
  return await redisClient.del(keyLock);
};

