const { createClient } = require("redis");
const redisConfig = require("../configs/config.redis");

class RedisPubSubService {
  constructor() {
    this.subscriber = null;
    this.publisher = null;
    this.initPromise = this.init();
  }

  async init() {
    this.publisher = createClient(redisConfig);
    await this.publisher.connect();

    this.subscriber = createClient(redisConfig);
    await this.subscriber.connect();
  }

  async publish(channel, message) {
    await this.initPromise;

    if (typeof message !== "string") {
      message = JSON.stringify(message);
    }
    return await this.publisher.publish(channel, message);
  }

  async subscribe(channel, callback) {
    await this.initPromise;

    await this.subscriber.subscribe(channel, (message) => {
      let parsedMessage = message;
      try {
        parsedMessage = JSON.parse(message);
      } catch (e) {}
      callback(channel, parsedMessage);
    });
  }

  async close() {
    if (this.subscriber) await this.subscriber.quit();
    if (this.publisher) await this.publisher.quit();
  }
}

module.exports = new RedisPubSubService();
