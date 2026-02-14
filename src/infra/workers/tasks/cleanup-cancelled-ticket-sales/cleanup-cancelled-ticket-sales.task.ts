import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { CleanupCancelledTicketSalesUsecase } from 'src/usecases/worker/cleanup-cancelled-ticket-sales/cleanup-cancelled-ticket-sales.usecase';

@Injectable()
export class CleanupCancelledTicketSalesTask
  implements OnModuleInit, OnModuleDestroy
{
  private readonly logger = new Logger(CleanupCancelledTicketSalesTask.name);
  private intervalId: NodeJS.Timeout | null = null;
  private timeoutId: NodeJS.Timeout | null = null;
  // Intervalo diário (24 horas)
  private readonly DAILY_INTERVAL_MS = 24 * 60 * 60 * 1000;

  public constructor(
    private readonly cleanupCancelledTicketSalesUsecase: CleanupCancelledTicketSalesUsecase,
  ) {}

  onModuleInit() {
    this.logger.log('Iniciando task de limpeza de TicketSales canceladas...');
    // Agenda a primeira execução para 03:00
    const delay = this.getDelayUntilNextRun();
    this.logger.log(
      `Task configurada para executar às 03:00. Próxima execução em ${Math.round(delay / 1000 / 60)} minutos`,
    );
    this.timeoutId = setTimeout(() => {
      // Executa na primeira janela e agenda as próximas
      this.executeCleanup();
      this.intervalId = setInterval(() => {
        this.executeCleanup();
      }, this.DAILY_INTERVAL_MS);
    }, delay);
  }

  onModuleDestroy() {
    if (this.timeoutId) {
      // Cancela o agendamento inicial
      clearTimeout(this.timeoutId);
    }
    if (this.intervalId) {
      // Cancela o agendamento recorrente
      clearInterval(this.intervalId);
      this.logger.log('Task de limpeza de TicketSales canceladas parada');
    }
  }

  private getDelayUntilNextRun(): number {
    // Calcula o tempo até a próxima execução às 03:00
    const now = new Date();
    const nextRun = new Date(now);
    nextRun.setHours(3, 0, 0, 0);
    if (nextRun <= now) {
      nextRun.setDate(nextRun.getDate() + 1);
    }
    return nextRun.getTime() - now.getTime();
  }

  private async executeCleanup() {
    try {
      // Executa o usecase e registra o resultado
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
