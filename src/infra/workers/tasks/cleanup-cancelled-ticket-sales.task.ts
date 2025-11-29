import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { CleanupCancelledTicketSalesUsecase } from 'src/usecases/worker/ticket-sale/cleanup-cancelled-ticket-sales.usecase';

@Injectable()
export class CleanupCancelledTicketSalesTask
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(CleanupCancelledTicketSalesTask.name);
  private intervalId: NodeJS.Timeout | null = null;
  private readonly CLEANUP_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 horas

  public constructor(
    private readonly cleanupCancelledTicketSalesUsecase: CleanupCancelledTicketSalesUsecase,
  ) {}

  onModuleInit() {
    this.logger.log('Iniciando task de limpeza de TicketSales canceladas...');

    this.executeCleanup();

    this.intervalId = setInterval(() => {
      this.executeCleanup();
    }, this.CLEANUP_INTERVAL_MS);

    this.logger.log(
      `Task configurada para executar a cada ${this.CLEANUP_INTERVAL_MS / 1000 / 60 / 60} horas`,
    );
  }

  onModuleDestroy() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.logger.log('Task de limpeza de TicketSales canceladas parada');
    }
  }

  private async executeCleanup() {
    try {
      const result = await this.cleanupCancelledTicketSalesUsecase.execute();
      if (result.deletedSales > 0) {
        this.logger.log(
          `Removidas ${result.deletedSales} TicketSales canceladas (Pagamentos: ${result.deletedPayments}, Itens: ${result.deletedItems})`,
        );
      } else {
        this.logger.log('Nenhuma TicketSale cancelada para remover');
      }
    } catch (error) {
      this.logger.error(
        `Erro ao executar limpeza de TicketSales canceladas: ${error.message}`,
        error.stack,
      );
    }
  }
}
