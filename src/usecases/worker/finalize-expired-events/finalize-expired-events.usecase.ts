import { Injectable } from '@nestjs/common';
import { statusEvent } from 'generated/prisma';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { Usecase } from 'src/usecases/usecase';

export type FinalizeExpiredEventsInput = void;

export type FinalizeExpiredEventsOutput = {
  finalizedCount: number;
  finalizedEvents: string[];
};

@Injectable()
export class FinalizeExpiredEventsUsecase
  implements Usecase<FinalizeExpiredEventsInput, FinalizeExpiredEventsOutput>
{
  constructor(private readonly eventGateway: EventGateway) {}

  async execute(): Promise<FinalizeExpiredEventsOutput> {
    const now = new Date();
    const allEvents = await this.eventGateway.findAll();

    // Filtrar eventos que:
    // 1. A data de término (endDate) já passou
    // 2. O status não é FINALIZED (para evitar atualizações desnecessárias)
    const expiredEvents = allEvents.filter(
      (event) =>
        event.getEndDate() < now && event.getStatus() !== statusEvent.FINALIZED,
    );

    const finalizedEvents: string[] = [];

    // Atualizar cada evento para FINALIZED
    for (const event of expiredEvents) {
      try {
        await this.eventGateway.updateInscription(
          event.getId(),
          statusEvent.FINALIZED,
        );
        finalizedEvents.push(event.getId());
      } catch (error) {
        // Log do erro mas continua processando os outros eventos
        console.error(
          `Erro ao finalizar evento ${event.getId()}: ${error.message}`,
        );
      }
    }

    return {
      finalizedCount: finalizedEvents.length,
      finalizedEvents,
    };
  }
}
