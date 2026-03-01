import { CashRegisterEvent } from 'src/domain/entities/cash-register-event.entity';
import CashRegisterEventPrismaModel from '../cash-register-event.prisma.model';

export class CashRegisterEventEntityToCashRegisterEventPrismaModelMapper {
  public static map(link: CashRegisterEvent): CashRegisterEventPrismaModel {
    return {
      id: link.getId(),
      cashRegisterId: link.getCashRegisterId(),
      eventId: link.getEventId(),
      createdAt: link.getCreatedAt(),
      updatedAt: link.getUpdatedAt(),
    };
  }
}
