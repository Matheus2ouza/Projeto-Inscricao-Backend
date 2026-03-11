import { Module } from '@nestjs/common';
import { UsecaseModule } from 'src/usecases/usecase.module';
import { ServiceModule } from '../services/service.module';
import { CancelExpiredGuestInscriptionsTask } from './tasks/cancel-expired-guest-inscriptions/cancel-expired-guest-inscriptions.task';
import { CleanupCancelledTicketSalesTask } from './tasks/cleanup-cancelled-ticket-sales/cleanup-cancelled-ticket-sales.task';
import { CleanupGuestInscriptionTask } from './tasks/cleanup-guest-inscription/cleanup-guest-inscription.task';
import { FinalizeExpiredEventsTask } from './tasks/finalize-expired-events/finalize-expired-events.task';

@Module({
  imports: [UsecaseModule, ServiceModule],
  providers: [
    // Cancela inscrições expiradas
    CancelExpiredGuestInscriptionsTask,
    // Limpa inscrições guest canceladas
    CleanupGuestInscriptionTask,
    // Finaliza eventos que já terminaram
    FinalizeExpiredEventsTask,
    // Limpa TicketSales canceladas
    CleanupCancelledTicketSalesTask,
  ],
  exports: [
    // Cancela inscrições expiradas
    CancelExpiredGuestInscriptionsTask,
    // Limpa inscrições guest canceladas
    CleanupGuestInscriptionTask,
    // Finaliza eventos que já terminaram
    FinalizeExpiredEventsTask,
    // Limpa TicketSales canceladas
    CleanupCancelledTicketSalesTask,
  ],
})
export class WorkersModule {}
