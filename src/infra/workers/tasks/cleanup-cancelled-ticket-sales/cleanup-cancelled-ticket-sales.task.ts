import { Injectable, Logger } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import { CleanupCancelledTicketSalesUsecase } from 'src/usecases/worker/cleanup-cancelled-ticket-sales/cleanup-cancelled-ticket-sales.usecase';

@Injectable()
export class CleanupCancelledTicketSalesTask {
  private readonly logger = new Logger(CleanupCancelledTicketSalesTask.name);

  public constructor(
    private readonly cleanupCancelledTicketSalesUsecase: CleanupCancelledTicketSalesUsecase,
  ) {}

  // Executa a cada 30 segundos
  @Cron('*/30 * * * *', {
    timeZone: 'America/Sao_Paulo',
  })
  public async executeCleanup() {
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
