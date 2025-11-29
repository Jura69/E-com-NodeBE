import { createClient, RedisClientType } from 'redis';
import redisConfig from '../configs/config.redis';

class RedisPubSubService {
  private subscriber: RedisClientType | null = null;
  private publisher: RedisClientType | null = null;
  private initPromise: Promise<void>;

  constructor() {
    this.initPromise = this.init();
  }

  async init(): Promise<void> {
    this.publisher = createClient(redisConfig) as RedisClientType;
    await this.publisher.connect();

    this.subscriber = createClient(redisConfig) as RedisClientType;
    await this.subscriber.connect();
  }

  async publish(channel: string, message: string | object): Promise<number> {
    await this.initPromise;

    if (!this.publisher) {
      throw new Error('Publisher not initialized');
    }

    if (typeof message !== 'string') {
      message = JSON.stringify(message);
    }
    return await this.publisher.publish(channel, message as string);
  }

  async subscribe(
    channel: string,
    callback: (channel: string, message: any) => void
  ): Promise<void> {
    await this.initPromise;

    if (!this.subscriber) {
      throw new Error('Subscriber not initialized');
    }

    await this.subscriber.subscribe(channel, (message: string) => {
      let parsedMessage: any = message;
      try {
        parsedMessage = JSON.parse(message);
      } catch (e) {
        // Keep as string if parsing fails
      }
      callback(channel, parsedMessage);
    });
  }

  async close(): Promise<void> {
    if (this.subscriber) await this.subscriber.quit();
    if (this.publisher) await this.publisher.quit();
  }
}

export default new RedisPubSubService();

