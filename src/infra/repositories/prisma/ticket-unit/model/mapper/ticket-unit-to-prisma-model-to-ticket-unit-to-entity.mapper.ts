import { TicketUnit } from 'src/domain/entities/ticket-unit.entity';
import TicketUnitPrismaModal from '../ticket-unit.prisma.model';

export class TicketUnitToPrismaModelToTicketUnitEntityMapper {
  public static map(ticketUnitPrismaModal: TicketUnitPrismaModal): TicketUnit {
    return TicketUnit.with({
      id: ticketUnitPrismaModal.id,
      ticketSaleItemId: ticketUnitPrismaModal.ticketSaleItemId,
      qrCode: ticketUnitPrismaModal.qrCode,
      usedAt: ticketUnitPrismaModal.usedAt,
      createdAt: ticketUnitPrismaModal.createdAt,
    });
  }
}
