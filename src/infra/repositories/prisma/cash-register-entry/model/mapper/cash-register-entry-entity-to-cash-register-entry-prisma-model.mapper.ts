import Decimal from 'decimal.js';
import { CashRegisterEntry } from 'src/domain/entities/cash-register-entry.entity';
import CashRegisterEntryPrismaModel from '../cash-register-entry.prisma.model';

export class CashRegisterEntryEntityToCashRegisterEntryPrismaModelMapper {
  public static map(entry: CashRegisterEntry): CashRegisterEntryPrismaModel {
    return {
      id: entry.getId(),
      cashRegisterId: entry.getCashRegisterId(),
      type: entry.getType(),
      origin: entry.getOrigin(),
      method: entry.getMethod(),
      value: new Decimal(entry.getValue()),
      description: entry.getDescription() ?? null,
      eventId: entry.getEventId() ?? null,
      paymentInstallmentId: entry.getPaymentInstallmentId() ?? null,
      onSiteRegistrationId: entry.getOnSiteRegistrationId() ?? null,
      eventExpenseId: entry.getEventExpenseId() ?? null,
      ticketSaleId: entry.getTicketSaleId() ?? null,
      transferId: entry.getTransferId() ?? null,
      responsible: entry.getResponsible() ?? null,
      imageUrl: entry.getImageUrl() ?? null,
      createdAt: entry.getCreatedAt(),
      updatedAt: entry.getUpdatedAt(),
    };
  }
}
