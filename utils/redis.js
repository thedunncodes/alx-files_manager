import { createClient } from 'redis';
import { promisify } from 'util';

class RedisClient {
  constructor() {
    this.connect_stat = true;
    this.client = createClient()
      .on('error', (err) => {
        console.error(err.message);
        this.connect_stat = false;
      })
      .on('connect', () => {
        this.connect_stat = true;
      });
  }

  isAlive() {
    return this.connect_stat;
  }

  async get(key) {
    const getProm = promisify(this.client.get).bind(this.client);
    try {
      const value = await getProm(key);
      return value;
    } catch (err) {
      return err;
    }
  }

  async set(key, value, ttl) {
    this.client.set(key, value, 'EX', ttl);
  }

  async del(key) {
    const delProm = promisify(this.client.del).bind(this.client);
    await delProm(key);
  }
}

const redisClient = new RedisClient();

export default redisClient;
