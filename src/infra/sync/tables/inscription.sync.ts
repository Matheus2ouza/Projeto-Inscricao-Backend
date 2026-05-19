import { HttpService } from '@nestjs/axios';
import { Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { PrismaService } from '../../repositories/prisma/prisma.service';
import { RedisService } from '../../services/redis/redis.service';

const REDIS_KEY = 'sync:inscriptions';
const REDIS_KEY_PARTICIPANTS = 'sync:participants';

export class InscriptionSync {
  private readonly logger = new Logger(InscriptionSync.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly redis: RedisService,
    private readonly httpService: HttpService,
    private readonly cloudUrl: string,
    private readonly syncSecret: string,
  ) {}

  async sync(): Promise<void> {
    await this.syncInscriptions();
    await this.syncParticipants();
  }

  private async syncInscriptions(): Promise<void> {
    const allIds = await this.prisma.inscription.findMany({
      select: { id: true },
    });

    if (allIds.length === 0) return;

    const pendingIds = await this.getPendingIds(
      REDIS_KEY,
      allIds.map((r) => r.id),
    );

    if (pendingIds.length === 0) {
      this.logger.log('inscriptions: nada a sincronizar');
      return;
    }

    this.logger.log(`inscriptions: ${pendingIds.length} pendentes`);

    const records = await this.prisma.inscription.findMany({
      where: { id: { in: pendingIds } },
    });

    await this.sendToCloud('/sync/inscriptions', records);
    await this.markAsSynced(REDIS_KEY, pendingIds);

    this.logger.log(`inscriptions: ${pendingIds.length} sincronizadas`);
  }

  private async syncParticipants(): Promise<void> {
    const allIds = await this.prisma.participant.findMany({
      select: { id: true },
    });

    if (allIds.length === 0) return;

    const pendingIds = await this.getPendingIds(
      REDIS_KEY_PARTICIPANTS,
      allIds.map((r) => r.id),
    );

    if (pendingIds.length === 0) {
      this.logger.log('participants: nada a sincronizar');
      return;
    }

    this.logger.log(`participants: ${pendingIds.length} pendentes`);

    const records = await this.prisma.participant.findMany({
      where: { id: { in: pendingIds } },
    });

    await this.sendToCloud('/sync/participants', records);
    await this.markAsSynced(REDIS_KEY_PARTICIPANTS, pendingIds);

    this.logger.log(`participants: ${pendingIds.length} sincronizados`);
  }

  private async getPendingIds(
    redisKey: string,
    allIds: string[],
  ): Promise<string[]> {
    const syncedIds = await this.redis.smembers(redisKey);
    const syncedSet = new Set(syncedIds);
    return allIds.filter((id) => !syncedSet.has(id));
  }

  private async markAsSynced(redisKey: string, ids: string[]): Promise<void> {
    if (ids.length === 0) return;
    await this.redis.sadd(redisKey, ...ids);
  }

  private async sendToCloud(
    endpoint: string,
    records: unknown[],
  ): Promise<void> {
    await firstValueFrom(
      this.httpService.post(
        `${this.cloudUrl}${endpoint}`,
        { records },
        {
          headers: { 'x-sync-token': this.syncSecret },
          timeout: 15_000,
        },
      ),
    );
  }
}
