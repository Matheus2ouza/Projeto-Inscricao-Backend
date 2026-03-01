import { CashRegisterEvent } from '../entities/cash-register-event.entity';

export abstract class CashRegisterEventGateway {
  abstract create(link: CashRegisterEvent): Promise<CashRegisterEvent>;

  abstract findByEventId(eventId: string): Promise<CashRegisterEvent[]>;
}
