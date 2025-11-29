import { TicketUnit } from 'src/domain/entities/ticket-unit.entity';
import TicketUnitPrismaModal from '../ticket-unit.prisma.model';

export class TicketUnitToEntityToTicketUnitPrismaModelMapper {
  public static map(ticketUnit: TicketUnit): TicketUnitPrismaModal {
    return {
      id: ticketUnit.getId(),
      ticketSaleItemId: ticketUnit.getTicketSaleItemId(),
      qrCode: ticketUnit.getQrCode(),
      usedAt: ticketUnit.getUsedAt(),
      createdAt: ticketUnit.getCreatedAt(),
    };
  }
}
