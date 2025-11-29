import { createClient, RedisClientType } from 'redis';
import redisConfig from '../configs/config.redis';
import { RedisErrorResponse } from '../core/error.response';

interface RedisClient {
  instance?: RedisClientType;
}

const client: RedisClient = {};

const statusConnectRedis = {
  CONNECT: 'connect',
  END: 'end',
  RECONNECT: 'reconnecting',
  ERROR: 'error',
} as const;

let connectionTimeout: NodeJS.Timeout | null = null;

const REDIS_CONNECT_TIMEOUT = 10000;
const REDIS_CONNECT_MESSAGE = {
  code: -99,
  message: {
    vn: 'Redis loi roi anh em oi',
    en: 'Service connection error',
  },
};

const handleTimeoutError = (): void => {
  connectionTimeout = setTimeout(() => {
    throw new RedisErrorResponse(
      REDIS_CONNECT_MESSAGE.message.vn,
      REDIS_CONNECT_MESSAGE.code
    );
  }, REDIS_CONNECT_TIMEOUT);
};

export const initRedis = async (): Promise<RedisClientType> => {
  const redisInstance = createClient(redisConfig) as RedisClientType;

  redisInstance.on(statusConnectRedis.CONNECT, () => {
    console.log('Redis - Connection status: connected');
    if (connectionTimeout) {
      clearTimeout(connectionTimeout);
      connectionTimeout = null;
    }
  });

  redisInstance.on(statusConnectRedis.END, () => {
    console.log('Redis - Connection status: disconnected');
    handleTimeoutError();
  });

  redisInstance.on(statusConnectRedis.RECONNECT, () => {
    console.log('Redis - Connection status: reconnecting');
    if (connectionTimeout) {
      clearTimeout(connectionTimeout);
      connectionTimeout = null;
    }
  });

  redisInstance.on(statusConnectRedis.ERROR, (err: Error) => {
    console.log(`Redis - Connection status: ${err}`);
    handleTimeoutError();
  });

  await redisInstance.connect();
  client.instance = redisInstance;

  return redisInstance;
};

export const getRedis = (): RedisClient => client;

export const closeRedis = async (): Promise<void> => {
  if (client.instance) {
    await client.instance.quit();
    console.log('Redis connection closed');
  }
};

