"use strict";

const devConfig = {
  username: process.env.REDIS_USERNAME || "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
  },
};

const proConfig = {
  username: process.env.REDIS_USERNAME || "default",
  password: process.env.REDIS_PASSWORD,
  socket: {
    host: process.env.REDIS_HOST || "redis-production-host",
    port: process.env.REDIS_PORT || 6379,
  },
};

const config = {
  dev: devConfig,
  pro: proConfig,
};

// Determine the current environment
const env = process.env.NODE_ENV || "dev";

// Export the appropriate configuration
module.exports = config[env];
