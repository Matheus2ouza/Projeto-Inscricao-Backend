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

  //  Storage / Cache
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

  //  Storage / Cache
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

  //  Storage / Cache
  async del(key: string): Promise<number> {
    if (!this.client) return 0;
    return await this.client.del(key);
  }

  //  Storage / Cache
  async delMany(keys: string[]): Promise<number> {
    if (!this.client || keys.length === 0) return 0;
    const result = await this.client.del(...keys);
    return result;
  }

  //  Cache com TTL -
  async setex(key: string, seconds: number, value: string): Promise<void> {
    if (!this.client) return;
    await this.client.setex(key, seconds, value);
  }

  //  Lock / Mutex -  (infraestrutura)
  async setNx(
    key: string,
    value: string,
    ttlSeconds?: number,
  ): Promise<boolean> {
    if (!this.client) return false;

    const result =
      ttlSeconds && ttlSeconds > 0
        ? await this.client.set(key, value, 'EX', ttlSeconds, 'NX')
        : await this.client.set(key, value, 'NX');

    return result === 'OK';
  }

  //  Cache simples -
  async get(key: string): Promise<string | null> {
    if (!this.client) return null;
    return await this.client.get(key);
  }

  //  Fila (Lista) -
  async lpush(key: string, value: string): Promise<void> {
    if (!this.client) return;
    await this.client.lpush(key, value);
  }

  //  Fila (Lista) -
  async rpop(key: string): Promise<string | null> {
    if (!this.client) return null;
    return await this.client.rpop(key);
  }

  //  Fila (Lista) -
  async llen(key: string): Promise<number> {
    if (!this.client) return 0;
    return await this.client.llen(key);
  }

  //  Fila Ordenada (ZSET) -  para fila
  async zadd(key: string, score: number, member: string): Promise<number> {
    if (!this.client) return 0;
    return await this.client.zadd(key, score, member);
  }

  //  Fila Ordenada (ZSET) -  para fila
  async zrangebyscore(
    key: string,
    min: number | string,
    max: number | string,
    limit?: { offset: number; count: number },
  ): Promise<string[]> {
    if (!this.client) return [];

    if (limit) {
      return await this.client.zrangebyscore(
        key,
        min,
        max,
        'LIMIT',
        limit.offset,
        limit.count,
      );
    }

    return await this.client.zrangebyscore(key, min, max);
  }

  //  Fila Ordenada (ZSET) -  para fila
  async zrem(key: string, ...members: string[]): Promise<number> {
    if (!this.client || members.length === 0) return 0;
    return await this.client.zrem(key, ...members);
  }

  //  Scan para recovery (opcional)
  async scanKeys(
    cursor: string,
    pattern: string,
    count: number = 100,
  ): Promise<{ cursor: string; keys: string[] }> {
    if (!this.client) return { cursor: '0', keys: [] };

    const result = await this.client.scan(
      cursor,
      'MATCH',
      pattern,
      'COUNT',
      count,
    );

    return {
      cursor: result[0],
      keys: result[1],
    };
  }

  async scanAllKeys(pattern: string, count: number = 100): Promise<string[]> {
    if (!this.client) return [];

    const keys: string[] = [];
    let cursor = '0';

    do {
      const [nextCursor, matchedKeys] = await this.client.scan(
        cursor,
        'MATCH',
        pattern,
        'COUNT',
        count,
      );
      cursor = nextCursor;
      keys.push(...matchedKeys);
    } while (cursor !== '0');

    return keys;
  }

  async zcard(key: string): Promise<number> {
    if (!this.client) return 0;
    return await this.client.zcard(key);
  }

  async onModuleDestroy() {
    if (!this.client) return;
    await this.client.quit();
  }
}
