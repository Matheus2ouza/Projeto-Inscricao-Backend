import { Injectable } from '@nestjs/common';
import { RedisService } from '../services/redis/redis.service';

export type SyncQueueTable = 'inscriptions' | 'participants' | 'payments';

@Injectable()
export class SyncQueue {
  constructor(private readonly redis: RedisService) {}

  async enqueue(table: SyncQueueTable, id: string): Promise<void> {
    await this.redis.lpush(`sync:queue:${table}`, id);
  }

  async dequeue(table: SyncQueueTable): Promise<string | null> {
    return await this.redis.rpop(`sync:queue:${table}`);
  }

  async requeue(table: SyncQueueTable, id: string): Promise<void> {
    await this.redis.lpush(`sync:queue:${table}`, id);
  }

  async size(table: SyncQueueTable): Promise<number> {
    return await this.redis.llen(`sync:queue:${table}`);
  }
}
