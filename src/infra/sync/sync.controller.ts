import { Controller, Get } from '@nestjs/common';
import { IsPublic } from '../web/authenticator/decorators/is-public.decorator';
import { SyncService } from './sync.service';

@Controller()
export class SyncController {
  constructor(private readonly syncService: SyncService) {}

  @IsPublic()
  @Get('health')
  health() {
    const { online, mode } = this.syncService.getStatus();

    return {
      status: online ? 'ok' : 'offline',
      online,
      mode,
      timestamp: new Date().toISOString(),
    };
  }
}
