const { createClient } = require("redis");
const redisConfig = require("../configs/config.redis");

class RedisPubSubService {
  constructor() {
    this.subscriber = null;
    this.publisher = null;
    this.initPromise = this.init(); // Store the promise for initialization
  }

  async init() {
    try {
      // Create publisher client
      this.publisher = createClient(redisConfig);
      await this.publisher.connect();

      // Create subscriber client
      this.subscriber = createClient(redisConfig);
      await this.subscriber.connect();

      // Handle errors
      this.publisher.on("error", (err) =>
        console.error("Redis Publisher Error:", err),
      );
      this.subscriber.on("error", (err) =>
        console.error("Redis Subscriber Error:", err),
      );
    } catch (error) {
      console.error("Failed to initialize Redis PubSub:", error);
      throw error;
    }
  }

  async publish(channel, message) {
    // Ensure init has completed
    await this.initPromise;

    try {
      if (typeof message !== "string") {
        message = JSON.stringify(message);
      }
      return await this.publisher.publish(channel, message);
    } catch (error) {
      console.error(`Error publishing to ${channel}:`, error);
      throw error;
    }
  }

  async subscribe(channel, callback) {
    // Ensure init has completed
    await this.initPromise;

    try {
      if (!this.subscriber) {
        throw new Error("Redis subscriber not initialized");
      }

      await this.subscriber.subscribe(channel, (message) => {
        try {
          // Try to parse message as JSON if it's a JSON string
          let parsedMessage = message;
          try {
            parsedMessage = JSON.parse(message);
          } catch (e) {
            // If parsing fails, use original message
          }
          callback(channel, parsedMessage);
        } catch (error) {
          console.error(`Error processing message from ${channel}:`, error);
        }
      });
      console.log(`Subscribed to channel: ${channel}`);
    } catch (error) {
      console.error(`Error subscribing to ${channel}:`, error);
      throw error;
    }
  }

  async close() {
    try {
      if (this.subscriber) await this.subscriber.quit();
      if (this.publisher) await this.publisher.quit();
      console.log("Redis PubSub connections closed");
    } catch (error) {
      console.error("Error closing Redis PubSub connections:", error);
    }
  }
}

module.exports = new RedisPubSubService();
