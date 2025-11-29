interface AppConfig {
  port: number;
}

interface DbConfig {
  host: string;
  port: number;
  name: string;
  user?: string;
  password?: string;
}

interface Config {
  app: AppConfig;
  db: DbConfig;
}

const dev: Config = {
  app: {
    port: Number(process.env.DEV_APP_PORT) || 3052,
  },
  db: {
    host: process.env.DEV_DB_HOST || 'localhost',
    port: Number(process.env.DEV_DB_PORT) || 27017,
    name: process.env.DEV_DB_NAME || 'shopDEV',
    user: process.env.DEV_DB_USER,
    password: process.env.DEV_DB_PASSWORD,
  },
};

const pro: Config = {
  app: {
    port: Number(process.env.PRO_APP_PORT) || 3000,
  },
  db: {
    host: process.env.PRO_DB_HOST || 'localhost',
    port: Number(process.env.PRO_DB_PORT) || 27017,
    name: process.env.PRO_DB_NAME || 'shopPRO',
    user: process.env.PRO_DB_USER,
    password: process.env.PRO_DB_PASSWORD,
  },
};

const config: Record<string, Config> = { dev, pro };
const env = (process.env.NODE_ENV || 'dev') as keyof typeof config;

export default config[env];

