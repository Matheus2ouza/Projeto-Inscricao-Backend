import { CashRegisterEntry } from 'src/domain/entities/cash-register-entry.entity';
import CashRegisterEntryPrismaModel from '../cash-register-entry.prisma.model';

export class CashRegisterEntryPrismaModelToCashRegisterEntryEntityMapper {
  public static map(
    entryPrisma: CashRegisterEntryPrismaModel,
  ): CashRegisterEntry {
    return CashRegisterEntry.with({
      id: entryPrisma.id,
      cashRegisterId: entryPrisma.cashRegisterId,
      type: entryPrisma.type,
      origin: entryPrisma.origin,
      method: entryPrisma.method,
      value: entryPrisma.value.toNumber(),
      description: entryPrisma.description ?? undefined,
      eventId: entryPrisma.eventId ?? undefined,
      paymentInstallmentId: entryPrisma.paymentInstallmentId ?? undefined,
      onSiteRegistrationId: entryPrisma.onSiteRegistrationId ?? undefined,
      eventExpenseId: entryPrisma.eventExpenseId ?? undefined,
      ticketSaleId: entryPrisma.ticketSaleId ?? undefined,
      transferId: entryPrisma.transferId ?? undefined,
      responsible: entryPrisma.responsible ?? undefined,
      imageUrl: entryPrisma.imageUrl ?? undefined,
      createdAt: entryPrisma.createdAt,
      updatedAt: entryPrisma.updatedAt,
    });
  }
}
