import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly memoryStore = new Map<string, string>();

  constructor() {
    this.logger.log('Redis desativado: usando armazenamento em memória');
  }

  async setJson(
    key: string,
    value: unknown,
    ttlSeconds?: number,
  ): Promise<void> {
    const payload = JSON.stringify(value);
    this.memoryStore.set(key, payload);
    if (ttlSeconds && ttlSeconds > 0) {
      setTimeout(
        () => this.memoryStore.delete(key),
        ttlSeconds * 1000,
      ).unref?.();
    }
  }

  async getJson<T = unknown>(key: string): Promise<T | null> {
    const data = this.memoryStore.get(key);
    if (!data) return null;
    try {
      return JSON.parse(data) as T;
    } catch {
      return null;
    }
  }

  async del(key: string): Promise<void> {
    this.memoryStore.delete(key);
  }

  async onModuleDestroy() {
    this.memoryStore.clear();
  }
}
