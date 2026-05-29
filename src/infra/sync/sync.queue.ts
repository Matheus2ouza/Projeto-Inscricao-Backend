import { Injectable, Logger } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { RedisService } from '../services/redis/redis.service';
import { SyncJob, SyncJobDependency, SyncJobTable } from './sync.types';

export type EnqueueSyncJobInput = {
  table: SyncJobTable;
  recordId: string;
  priority?: number;
};

export type SyncJobQueueStats = {
  pending: number;
  processing: number;
  synced: number;
  failed: number;
};

export type LockInfo = {
  workerId: string;
  hostname: string;
  lockedAt: string;
  ttlSeconds: number;
  jobId: string;
};

@Injectable()
export class SyncQueue {
  private readonly logger = new Logger(SyncQueue.name);
  private readonly workerId = `${process.pid}:${Date.now()}:${randomUUID().slice(0, 8)}`;
  private readonly hostname = process.env.HOSTNAME || 'unknown';

  private readonly pendingIndexKey = 'sync:jobs:pending';
  private readonly jobKeyPrefix = 'sync:job';
  private readonly lockKeyPrefix = 'sync:job:lock';

  constructor(private readonly redis: RedisService) {
    this.logger.log(`Worker initialized: ${this.workerId} on ${this.hostname}`);
  }

  async enqueueJob(input: EnqueueSyncJobInput): Promise<SyncJob> {
    const now = new Date().toISOString();
    const job: SyncJob = {
      id: randomUUID(),
      table: input.table,
      recordId: input.recordId,
      status: 'pending',
      attempts: 0,
      priority: input.priority ?? 0,
      createdAt: now,
      updatedAt: now,
      nextRetryAt: now,
      processingStartedAt: null,
    };

    await this.saveJob(job);
    await this.redis.zadd(this.pendingIndexKey, this.scorePending(job), job.id);

    this.logger.debug(
      `Job enqueued: ${job.id} table=${job.table} recordId=${job.recordId}`,
    );
    return job;
  }

  async getDuePendingJobs(limit: number, now = new Date()): Promise<SyncJob[]> {
    return this.getDuePendingJobsWithValidation(limit, now, false);
  }

  async acquireForProcessing(
    job: SyncJob,
    processingTimeoutSeconds: number,
  ): Promise<SyncJob | null> {
    const lockKey = this.lockKey(job.id);
    const lockValue = JSON.stringify({
      workerId: this.workerId,
      hostname: this.hostname,
      lockedAt: new Date().toISOString(),
      ttlSeconds: processingTimeoutSeconds,
      jobId: job.id,
    });

    const locked = await this.redis.setNx(
      lockKey,
      lockValue,
      processingTimeoutSeconds,
    );

    if (!locked) {
      const existingLock = await this.redis.get(lockKey);
      if (existingLock) {
        try {
          const lockInfo = JSON.parse(existingLock) as LockInfo;
          this.logger.debug(
            `Job ${job.id} already locked by worker ${lockInfo.workerId} since ${lockInfo.lockedAt}`,
          );
        } catch {
          this.logger.debug(`Job ${job.id} already locked by unknown worker`);
        }
      }
      return null;
    }

    const currentJob = await this.getJob(job.id);
    if (!currentJob || currentJob.status !== 'pending') {
      await this.redis.del(lockKey);
      this.logger.debug(`Job ${job.id} no longer pending, releasing lock`);
      return null;
    }

    const now = new Date().toISOString();
    const processingJob: SyncJob = {
      ...currentJob,
      status: 'processing',
      updatedAt: now,
      processingStartedAt: now,
    };

    await this.redis.zrem(this.pendingIndexKey, processingJob.id);
    await this.saveJob(processingJob);

    this.logger.log(`Job acquired: ${job.id} by worker ${this.workerId}`);
    return processingJob;
  }

  async markPending(job: SyncJob, reason?: string): Promise<void> {
    const now = new Date().toISOString();
    const pendingJob: SyncJob = {
      ...job,
      status: 'pending',
      updatedAt: now,
      processingStartedAt: null,
      lastError: reason ?? job.lastError,
    };

    await this.redis.zrem(this.pendingIndexKey, pendingJob.id);
    await this.redis.zadd(
      this.pendingIndexKey,
      this.scorePending(pendingJob),
      pendingJob.id,
    );
    await this.releaseLock(job.id);
    await this.saveJob(pendingJob);

    this.logger.debug(
      `Job marked as pending: ${job.id} reason=${reason ?? 'none'}`,
    );
  }

  async markRetry(
    job: SyncJob,
    nextRetryAt: Date,
    error: string,
  ): Promise<void> {
    const now = new Date().toISOString();
    const retryJob: SyncJob = {
      ...job,
      status: 'pending',
      attempts: job.attempts + 1,
      updatedAt: now,
      nextRetryAt: nextRetryAt.toISOString(),
      processingStartedAt: null,
      lastError: error,
    };

    await this.redis.zrem(this.pendingIndexKey, retryJob.id);
    await this.redis.zadd(
      this.pendingIndexKey,
      this.scorePending(retryJob),
      retryJob.id,
    );
    await this.releaseLock(retryJob.id);
    await this.saveJob(retryJob);

    this.logger.warn(
      `Job retry scheduled: ${job.id} attempt=${job.attempts + 1} nextRetryAt=${nextRetryAt.toISOString()} error=${error}`,
    );
  }

  async markSynced(job: SyncJob): Promise<void> {
    const now = new Date().toISOString();
    const syncedJob: SyncJob = {
      ...job,
      status: 'synced',
      updatedAt: now,
      processingStartedAt: null,
      lastError: undefined,
    };

    await this.redis.zrem(this.pendingIndexKey, syncedJob.id);
    await this.releaseLock(syncedJob.id);
    await this.saveJob(syncedJob);

    this.logger.log(`Job synced successfully: ${job.id}`);
  }

  async markFailed(job: SyncJob, error: string): Promise<void> {
    const now = new Date().toISOString();
    const failedJob: SyncJob = {
      ...job,
      status: 'failed',
      attempts: job.attempts + 1,
      updatedAt: now,
      processingStartedAt: null,
      lastError: error,
    };

    await this.redis.zrem(this.pendingIndexKey, failedJob.id);
    await this.releaseLock(failedJob.id);
    await this.saveJob(failedJob);

    this.logger.error(`Job failed definitively: ${job.id} error=${error}`);
  }

  async recoverStaleProcessing(timeoutMs: number): Promise<number> {
    const staleBefore = new Date(Date.now() - timeoutMs);
    const jobKeyPattern = `${this.jobKeyPrefix}:*`;

    let recovered = 0;
    let cursor = '0';
    let scannedKeys = 0;
    const maxKeysToScan = 10000;

    do {
      const scanResult = await this.redis.scanKeys(cursor, jobKeyPattern, 100);
      cursor = scanResult.cursor;
      const keys = scanResult.keys;

      scannedKeys += keys.length;

      for (const key of keys) {
        if (scannedKeys > maxKeysToScan) {
          this.logger.warn(
            `Recovery scan limit reached (${maxKeysToScan} keys), stopping early. Recovered=${recovered}`,
          );
          return recovered;
        }

        const jobId = this.extractJobIdFromKey(key);
        const job = await this.getJob(jobId);

        if (!job) continue;
        if (job.status !== 'processing') continue;

        const processingStartedAt = job.processingStartedAt
          ? new Date(job.processingStartedAt)
          : null;

        if (!processingStartedAt) continue;
        if (processingStartedAt >= staleBefore) continue;

        const lockKey = this.lockKey(job.id);
        const lockValue = await this.redis.get(lockKey);
        let lockOwner = 'unknown';

        if (lockValue) {
          try {
            const lockInfo = JSON.parse(lockValue) as LockInfo;
            lockOwner = `${lockInfo.workerId} on ${lockInfo.hostname}`;
            this.logger.debug(
              `Job ${job.id} lock owned by ${lockOwner} since ${lockInfo.lockedAt}`,
            );
          } catch {
            lockOwner = 'unknown (invalid lock format)';
          }
        }

        this.logger.warn(
          `Recovering stale processing job ${job.id} table=${job.table} recordId=${job.recordId} startedAt=${job.processingStartedAt} lockOwner=${lockOwner}`,
        );

        await this.markPending(job, 'Stale processing recovery');
        recovered++;
      }

      if (cursor === '0') break;
    } while (cursor !== '0');

    if (recovered > 0) {
      this.logger.log(
        `Sync jobs recovered from stale processing state: ${recovered} (scanned ${scannedKeys} keys)`,
      );
    } else {
      this.logger.debug(
        `No stale processing jobs found (scanned ${scannedKeys} keys)`,
      );
    }

    return recovered;
  }

  async getActiveLocks(): Promise<LockInfo[]> {
    const lockKeyPattern = `${this.lockKeyPrefix}:*`;
    let cursor = '0';
    const locks: LockInfo[] = [];

    do {
      const scanResult = await this.redis.scanKeys(cursor, lockKeyPattern, 500);
      cursor = scanResult.cursor;

      for (const key of scanResult.keys) {
        const lockValue = await this.redis.get(key);
        if (lockValue) {
          try {
            const lockInfo = JSON.parse(lockValue) as LockInfo;
            locks.push(lockInfo);
          } catch {
            this.logger.warn(`Invalid lock format for key ${key}`);
          }
        }
      }

      if (cursor === '0') break;
    } while (cursor !== '0');

    return locks;
  }

  async isLockOwner(jobId: string): Promise<boolean> {
    const lockKey = this.lockKey(jobId);
    const lockValue = await this.redis.get(lockKey);

    if (!lockValue) return false;

    try {
      const lockInfo = JSON.parse(lockValue) as LockInfo;
      return lockInfo.workerId === this.workerId;
    } catch {
      return false;
    }
  }

  async areDependenciesSynced(
    dependencies: SyncJobDependency[],
  ): Promise<boolean> {
    for (const dependency of dependencies) {
      const synced = await this.isRecordSynced(dependency.recordId);
      if (!synced) {
        this.logger.debug(
          `Dependency not synced: recordId=${dependency.recordId}`,
        );
        return false;
      }
    }
    return true;
  }

  private async isRecordSynced(recordId: string): Promise<boolean> {
    const jobKeyPattern = `${this.jobKeyPrefix}:*`;
    let cursor = '0';

    do {
      const scanResult = await this.redis.scanKeys(cursor, jobKeyPattern, 500);
      cursor = scanResult.cursor;

      for (const key of scanResult.keys) {
        const jobId = this.extractJobIdFromKey(key);
        const job = await this.getJob(jobId);

        if (job && job.recordId === recordId && job.status === 'synced') {
          return true;
        }
      }

      if (cursor === '0') break;
    } while (cursor !== '0');

    return false;
  }

  async getStats(): Promise<SyncJobQueueStats> {
    const stats: SyncJobQueueStats = {
      pending: 0,
      processing: 0,
      synced: 0,
      failed: 0,
    };

    stats.pending = await this.redis.zcard(this.pendingIndexKey);

    const jobKeyPattern = `${this.jobKeyPrefix}:*`;
    let cursor = '0';
    let scannedKeys = 0;
    const maxKeysToScan = 10000;

    do {
      const scanResult = await this.redis.scanKeys(cursor, jobKeyPattern, 500);
      cursor = scanResult.cursor;
      const keys = scanResult.keys;

      scannedKeys += keys.length;

      for (const key of keys) {
        if (scannedKeys > maxKeysToScan) {
          this.logger.warn(
            `getStats scan limit reached (${maxKeysToScan} keys), stats may be incomplete`,
          );
          return stats;
        }

        const jobId = this.extractJobIdFromKey(key);
        const job = await this.getJob(jobId);

        if (!job) continue;

        switch (job.status) {
          case 'processing':
            stats.processing++;
            break;
          case 'synced':
            stats.synced++;
            break;
          case 'failed':
            stats.failed++;
            break;
        }
      }

      if (cursor === '0') break;
    } while (cursor !== '0');

    return stats;
  }

  async validatePendingQueueConsistency(): Promise<{
    orphanedInZset: string[];
    missingFromZset: string[];
    inconsistent: Array<{ jobId: string; expected: boolean; actual: boolean }>;
  }> {
    const result = {
      orphanedInZset: [] as string[],
      missingFromZset: [] as string[],
      inconsistent: [] as Array<{
        jobId: string;
        expected: boolean;
        actual: boolean;
      }>,
    };

    const now = new Date();

    const zsetJobIds = await this.redis.zrangebyscore(
      this.pendingIndexKey,
      '-inf',
      '+inf',
    );

    for (const jobId of zsetJobIds) {
      const job = await this.getJob(jobId);

      if (!job) {
        result.orphanedInZset.push(jobId);
        continue;
      }

      const shouldBeInQueue =
        job.status === 'pending' && new Date(job.nextRetryAt) <= now;
      const isInQueue = true;

      if (shouldBeInQueue !== isInQueue) {
        result.inconsistent.push({
          jobId,
          expected: shouldBeInQueue,
          actual: isInQueue,
        });
      }
    }

    const jobKeyPattern = `${this.jobKeyPrefix}:*`;
    let cursor = '0';
    let scannedKeys = 0;
    const maxKeysToScan = 10000;

    do {
      const scanResult = await this.redis.scanKeys(cursor, jobKeyPattern, 500);
      cursor = scanResult.cursor;

      for (const key of scanResult.keys) {
        scannedKeys++;
        if (scannedKeys > maxKeysToScan) {
          this.logger.warn(
            `validatePendingQueueConsistency scan limit reached (${maxKeysToScan} keys), results may be incomplete`,
          );
          return result;
        }

        const jobId = this.extractJobIdFromKey(key);
        const job = await this.getJob(jobId);

        if (!job) continue;

        const shouldBeInQueue =
          job.status === 'pending' && new Date(job.nextRetryAt) <= now;
        const isInQueue = zsetJobIds.includes(jobId);

        if (shouldBeInQueue && !isInQueue) {
          result.missingFromZset.push(jobId);
        }
      }

      if (cursor === '0') break;
    } while (cursor !== '0');

    return result;
  }

  async reconcilePendingQueue(): Promise<{
    added: number;
    removed: number;
    fixed: number;
  }> {
    const result = { added: 0, removed: 0, fixed: 0 };

    const consistency = await this.validatePendingQueueConsistency();

    for (const jobId of consistency.orphanedInZset) {
      await this.redis.zrem(this.pendingIndexKey, jobId);
      result.removed++;
      this.logger.warn(`Removed orphaned job ${jobId} from pending queue`);
    }

    for (const jobId of consistency.missingFromZset) {
      const job = await this.getJob(jobId);
      if (job) {
        await this.redis.zadd(
          this.pendingIndexKey,
          this.scorePending(job),
          job.id,
        );
        result.added++;
        this.logger.warn(`Added missing job ${jobId} to pending queue`);
      }
    }

    for (const item of consistency.inconsistent) {
      if (!item.expected && item.actual) {
        await this.redis.zrem(this.pendingIndexKey, item.jobId);
        result.fixed++;
        this.logger.warn(
          `Removed inconsistent job ${item.jobId} from pending queue`,
        );
      }
    }

    if (result.added > 0 || result.removed > 0 || result.fixed > 0) {
      this.logger.log(
        `Queue reconciliation completed: added=${result.added} removed=${result.removed} fixed=${result.fixed}`,
      );
    }

    return result;
  }

  async healthCheck(): Promise<{
    isHealthy: boolean;
    queueConsistency: Awaited<
      ReturnType<SyncQueue['validatePendingQueueConsistency']>
    >;
    stats: SyncJobQueueStats;
    issues: string[];
    activeLocks: LockInfo[];
  }> {
    const issues: string[] = [];

    const consistency = await this.validatePendingQueueConsistency();
    const stats = await this.getStats();
    const activeLocks = await this.getActiveLocks();

    if (consistency.orphanedInZset.length > 0) {
      issues.push(
        `Found ${consistency.orphanedInZset.length} orphaned jobs in ZSET`,
      );
    }

    if (consistency.missingFromZset.length > 0) {
      issues.push(
        `Found ${consistency.missingFromZset.length} jobs missing from ZSET`,
      );
    }

    if (consistency.inconsistent.length > 0) {
      issues.push(`Found ${consistency.inconsistent.length} inconsistent jobs`);
    }

    const isHealthy = issues.length === 0;

    if (!isHealthy) {
      this.logger.warn(`Health check failed: ${issues.join(', ')}`);
    } else {
      this.logger.debug(
        `Health check passed. Active locks: ${activeLocks.length}`,
      );
    }

    return {
      isHealthy,
      queueConsistency: consistency,
      stats,
      issues,
      activeLocks,
    };
  }

  async getDuePendingJobsWithValidation(
    limit: number,
    now = new Date(),
    autoReconcile: boolean = false,
  ): Promise<SyncJob[]> {
    if (autoReconcile) {
      await this.reconcilePendingQueue();
    }

    const jobIds = await this.redis.zrangebyscore(
      this.pendingIndexKey,
      0,
      now.getTime(),
      { offset: 0, count: limit },
    );

    const jobs = await Promise.all(jobIds.map((jobId) => this.getJob(jobId)));
    const validJobs = jobs.filter((job): job is SyncJob => {
      if (!job) return false;

      const isDue = new Date(job.nextRetryAt) <= now;
      if (!isDue) {
        this.logger.debug(
          `Job ${job.id} in queue but not due yet, filtering out`,
        );
        return false;
      }

      if (job.status !== 'pending') {
        this.logger.debug(
          `Job ${job.id} in queue but status is ${job.status}, filtering out`,
        );
        return false;
      }

      return true;
    });

    if (validJobs.length < jobIds.length) {
      this.logger.warn(
        `Filtered out ${jobIds.length - validJobs.length} invalid jobs from pending queue`,
      );
    }

    return validJobs;
  }

  async cleanupOldJobs(options: {
    syncedMaxAgeDays?: number;
    failedMaxAgeDays?: number;
    maxJobsToClean?: number;
  }): Promise<{
    syncedRemoved: number;
    failedRemoved: number;
  }> {
    const result = {
      syncedRemoved: 0,
      failedRemoved: 0,
    };

    const syncedMaxAgeDays = options.syncedMaxAgeDays ?? 30;
    const failedMaxAgeDays = options.failedMaxAgeDays ?? 7;
    const maxJobsToClean = options.maxJobsToClean ?? 1000;

    const syncedCutoff = new Date();
    syncedCutoff.setDate(syncedCutoff.getDate() - syncedMaxAgeDays);

    const failedCutoff = new Date();
    failedCutoff.setDate(failedCutoff.getDate() - failedMaxAgeDays);

    const jobKeyPattern = `${this.jobKeyPrefix}:*`;
    let cursor = '0';
    let scannedKeys = 0;
    let cleaned = 0;

    do {
      const scanResult = await this.redis.scanKeys(cursor, jobKeyPattern, 500);
      cursor = scanResult.cursor;
      const keys = scanResult.keys;

      scannedKeys += keys.length;

      for (const key of keys) {
        if (cleaned >= maxJobsToClean) {
          this.logger.log(
            `Cleanup limit reached (${maxJobsToClean} jobs), stopping early`,
          );
          return result;
        }

        const jobId = this.extractJobIdFromKey(key);
        const job = await this.getJob(jobId);

        if (!job) continue;

        let shouldRemove = false;

        if (job.status === 'synced') {
          const updatedAt = new Date(job.updatedAt);
          if (updatedAt < syncedCutoff) {
            shouldRemove = true;
            result.syncedRemoved++;
          }
        } else if (job.status === 'failed') {
          const updatedAt = new Date(job.updatedAt);
          if (updatedAt < failedCutoff) {
            shouldRemove = true;
            result.failedRemoved++;
          }
        }

        if (shouldRemove) {
          await this.removeJobCompletely(jobId);
          cleaned++;
        }
      }

      if (cursor === '0') break;
    } while (cursor !== '0');

    this.logger.log(
      `Cleanup completed: syncedRemoved=${result.syncedRemoved} failedRemoved=${result.failedRemoved} (scanned ${scannedKeys} keys)`,
    );

    return result;
  }

  private async releaseLock(jobId: string): Promise<void> {
    if (await this.isLockOwner(jobId)) {
      await this.redis.del(this.lockKey(jobId));
      this.logger.debug(
        `Lock released for job ${jobId} by worker ${this.workerId}`,
      );
    } else {
      this.logger.debug(`Not lock owner for job ${jobId}, skipping release`);
    }
  }

  private async removeJobCompletely(jobId: string): Promise<void> {
    await this.redis.zrem(this.pendingIndexKey, jobId);
    await this.redis.del(this.lockKey(jobId));
    await this.redis.del(this.jobKey(jobId));
  }

  async getJobCountByStatus(): Promise<Record<SyncJob['status'], number>> {
    const counts = {
      pending: 0,
      processing: 0,
      synced: 0,
      failed: 0,
    };

    const jobKeyPattern = `${this.jobKeyPrefix}:*`;
    let cursor = '0';
    let scannedKeys = 0;
    const maxKeysToScan = 50000;

    do {
      const scanResult = await this.redis.scanKeys(cursor, jobKeyPattern, 1000);
      cursor = scanResult.cursor;

      for (const key of scanResult.keys) {
        scannedKeys++;
        if (scannedKeys > maxKeysToScan) {
          this.logger.warn(
            `getJobCountByStatus scan limit reached (${maxKeysToScan} keys)`,
          );
          return counts;
        }

        const jobId = this.extractJobIdFromKey(key);
        const job = await this.getJob(jobId);
        if (job) {
          counts[job.status]++;
        }
      }

      if (cursor === '0') break;
    } while (cursor !== '0');

    return counts;
  }

  private async getJob(jobId: string): Promise<SyncJob | null> {
    return await this.redis.getJson<SyncJob>(this.jobKey(jobId));
  }

  private async saveJob(job: SyncJob): Promise<void> {
    await this.redis.setJson(this.jobKey(job.id), job);
  }

  private scorePending(job: SyncJob): number {
    return new Date(job.nextRetryAt).getTime() - job.priority;
  }

  private jobKey(jobId: string): string {
    return `${this.jobKeyPrefix}:${jobId}`;
  }

  private lockKey(jobId: string): string {
    return `${this.lockKeyPrefix}:${jobId}`;
  }

  private extractJobIdFromKey(key: string): string {
    return key.replace(`${this.jobKeyPrefix}:`, '');
  }
}
