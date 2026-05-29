import { Controller, Get } from '@nestjs/common';
import { IsPublic } from '../web/authenticator/decorators/is-public.decorator';
import { SyncQueue } from './sync.queue';
import { SyncService } from './sync.service';

@Controller()
export class SyncController {
  constructor(
    private readonly syncService: SyncService,
    private readonly syncQueue: SyncQueue,
  ) {}

  @IsPublic()
  @Get('health')
  async health() {
    const { online, mode } = this.syncService.getStatus();
    const syncJobs = await this.syncQueue.getStats();

    return {
      status: online ? 'ok' : 'offline',
      online,
      mode,
      syncJobs,
      timestamp: new Date().toISOString(),
    };
  }
}
