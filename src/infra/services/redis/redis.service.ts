import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis | null = null;

  constructor() {
    const eventMode = process.env.EVENT_MODE === 'true';
    const redisLocalUrl = process.env.REDIS_LOCAL_URL;
    const redisUrl = process.env.REDIS_URL;

    const url = eventMode
      ? redisLocalUrl || 'redis://redis_event:6379'
      : redisUrl || null;

    if (!url) {
      this.logger.warn('Redis não configurado — funcionando sem cache');
      return;
    }

    const isTls = url.startsWith('rediss://');

    this.client = new Redis(url, {
      maxRetriesPerRequest: 3,
      lazyConnect: true,
      tls: isTls ? {} : undefined,
    });

    this.client.on('connect', () => this.logger.log('Redis conectado'));
    this.client.on('error', (err) =>
      this.logger.error(`Erro no Redis: ${err.message}`),
    );

    this.client.connect().catch(() => {
      this.logger.warn('Redis não disponível — funcionando sem cache');
    });
  }

  async setJson(
    key: string,
    value: unknown,
    ttlSeconds?: number,
  ): Promise<void> {
    if (!this.client) return;
    const payload = JSON.stringify(value);
    if (ttlSeconds && ttlSeconds > 0) {
      await this.client.set(key, payload, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, payload);
    }
  }

  async getJson<T = unknown>(key: string): Promise<T | null> {
    if (!this.client) return null;
    const data = await this.client.get(key);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  }

  async del(key: string): Promise<number> {
    if (!this.client) return 0;
    return await this.client.del(key);
  }

  async delMany(keys: string[]): Promise<number> {
    if (!this.client || keys.length === 0) return 0;
    const result = await this.client.del(...keys);
    return result;
  }

  async setex(key: string, seconds: number, value: string): Promise<void> {
    if (!this.client) return;
    await this.client.setex(key, seconds, value);
  }

  async get(key: string): Promise<string | null> {
    if (!this.client) return null;
    return await this.client.get(key);
  }

  async sadd(key: string, ...members: string[]): Promise<number> {
    if (!this.client) return 0;
    return await this.client.sadd(key, ...members);
  }

  async smembers(key: string): Promise<string[]> {
    if (!this.client) return [];
    return await this.client.smembers(key);
  }

  async onModuleDestroy() {
    if (!this.client) return;
    await this.client.quit();
  }
}
