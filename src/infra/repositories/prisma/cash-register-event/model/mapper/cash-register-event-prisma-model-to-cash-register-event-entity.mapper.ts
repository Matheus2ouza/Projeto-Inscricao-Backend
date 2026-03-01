import { CashRegisterEvent } from 'src/domain/entities/cash-register-event.entity';
import CashRegisterEventPrismaModel from '../cash-register-event.prisma.model';

export class CashRegisterEventPrismaModelToCashRegisterEventEntityMapper {
  public static map(linkPrisma: CashRegisterEventPrismaModel): CashRegisterEvent {
    return CashRegisterEvent.with({
      id: linkPrisma.id,
      cashRegisterId: linkPrisma.cashRegisterId,
      eventId: linkPrisma.eventId,
      createdAt: linkPrisma.createdAt,
      updatedAt: linkPrisma.updatedAt,
    });
  }
}
