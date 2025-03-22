const { createClient } = require("redis");
const redisConfig = require("../configs/config.redis");
const { RedisErrorResponse } = require("../core/error.response");

let client = {};
const statusConnectRedis = {
  CONNECT: "connect",
  END: "end",
  RECONNECT: "reconnecting",
  ERROR: "error",
};

let connectionTimeout;

const REDIS_CONNECT_TIMEOUT = 10000;
const REDIS_CONNECT_MESSAGE = {
  code: -99,
  message: {
    vn: "Redis loi roi anh em oi",
    en: "Service connection error",
  },
};

const handleTimeoutError = () => {
  connectionTimeout = setTimeout(() => {
    throw new RedisErrorResponse({
      message: REDIS_CONNECT_MESSAGE.message.vn,
      statusCode: REDIS_CONNECT_MESSAGE.code,
    });
  }, REDIS_CONNECT_TIMEOUT);
};

const initRedis = async () => {
  const redisInstance = createClient(redisConfig);

  redisInstance.on(statusConnectRedis.CONNECT, () => {
    console.log("Redis - Connection status: connected");
    clearTimeout(connectionTimeout);
  });

  redisInstance.on(statusConnectRedis.END, () => {
    console.log("Redis - Connection status: disconnected");
    handleTimeoutError();
  });

  redisInstance.on(statusConnectRedis.RECONNECT, () => {
    console.log("Redis - Connection status: reconnecting");
    clearTimeout(connectionTimeout);
  });

  redisInstance.on(statusConnectRedis.ERROR, (err) => {
    console.log(`Redis - Connection status: error ${err}`);
    handleTimeoutError();
  });

  await redisInstance.connect();
  client.instance = redisInstance;

  return redisInstance;
};

const getRedis = () => client;

const closeRedis = async () => {
  if (client.instance) {
    await client.instance.quit();
    console.log("Redis connection closed");
  }
};

module.exports = { initRedis, getRedis, closeRedis };
