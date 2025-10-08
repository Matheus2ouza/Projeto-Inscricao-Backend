import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly client: Redis;

  constructor() {
    // Configuração direta sem URL
    this.client = new Redis({
      host: 'redis-15305.c114.us-east-1-4.ec2.redns.redis-cloud.com',
      port: 15305,
      username: 'default',
      password: 'LmfyRscCnUfXGS2nuZBX62fTUSFKqSKN',
      tls: {}, // TLS necessário para Redis Cloud
      maxRetriesPerRequest: 3,
    });

    this.client.on('connect', () => this.logger.log('Redis conectado'));
    this.client.on('error', (err) =>
      this.logger.error(`Erro no Redis: ${err.message}`),
    );
  }

  async setJson(
    key: string,
    value: unknown,
    ttlSeconds?: number,
  ): Promise<void> {
    const payload = JSON.stringify(value);
    if (ttlSeconds && ttlSeconds > 0) {
      await this.client.set(key, payload, 'EX', ttlSeconds);
    } else {
      await this.client.set(key, payload);
    }
  }

  async getJson<T = unknown>(key: string): Promise<T | null> {
    const data = await this.client.get(key);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  }

  async del(key: string): Promise<void> {
    await this.client.del(key);
  }

  async onModuleDestroy() {
    await this.client.quit();
  }
}
