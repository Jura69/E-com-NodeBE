interface RedisSocketConfig {
  host: string;
  port: number;
}

interface RedisConfig {
  username: string;
  password?: string;
  socket: RedisSocketConfig;
}

const devConfig: RedisConfig = {
  username: process.env.REDIS_USERNAME || 'default',
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST || 'localhost',
    port: Number(process.env.REDIS_PORT) || 6379,
  },
};

const proConfig: RedisConfig = {
  username: process.env.REDIS_USERNAME || 'default',
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST || 'redis-production-host',
    port: Number(process.env.REDIS_PORT) || 6379,
  },
};

const config: Record<string, RedisConfig> = {
  dev: devConfig,
  pro: proConfig,
};

const env = (process.env.NODE_ENV || 'dev') as keyof typeof config;

export default config[env];

