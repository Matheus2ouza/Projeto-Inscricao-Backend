import { HttpService } from '@nestjs/axios';
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class SyncService implements OnModuleInit {
  private readonly logger = new Logger(SyncService.name);
  private isOnline = false;

  constructor(private readonly httpService: HttpService) {}

  onModuleInit() {
    setInterval(() => this.checkInternet(), 5000);
    this.logger.log('🌐 Monitor de internet iniciado');
  }

  private async checkInternet(): Promise<boolean> {
    try {
      await firstValueFrom(
        this.httpService.get('https://1.1.1.1', { timeout: 3000 }),
      );

      if (!this.isOnline) {
        this.logger.log('🟢 Internet conectada');
      }

      this.isOnline = true;
    } catch {
      if (this.isOnline) {
        this.logger.warn('🔴 Internet perdida');
      }

      this.isOnline = false;
    }

    return this.isOnline;
  }

  getStatus() {
    return {
      online: this.isOnline,
      mode: process.env.EVENT_MODE === 'true' ? 'EVENT' : 'PROD',
    };
  }
}
