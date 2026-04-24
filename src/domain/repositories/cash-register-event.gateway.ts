import { PrismaTransactionClient } from 'src/infra/repositories/prisma/prisma.service';
import { CashRegisterEvent } from '../entities/cash-register-event.entity';

export abstract class CashRegisterEventGateway {
  abstract create(
    cashRegisterEvent: CashRegisterEvent,
  ): Promise<CashRegisterEvent>;
  abstract createTx(
    cashRegisterEvent: CashRegisterEvent,
    tx: PrismaTransactionClient,
  ): Promise<CashRegisterEvent>;

  abstract findByEventId(eventId: string): Promise<CashRegisterEvent[]>;
}
