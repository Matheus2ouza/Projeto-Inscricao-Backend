import Decimal from 'decimal.js';
import { CashRegisterTransfer } from 'src/domain/entities/cash-register-transfer.entity';
import CashRegisterTransferPrismaModel from '../cash-register-transfer.prisma.model';

export class CashRegisterTransferEntityToCashRegisterTransferPrismaModelMapper {
  public static map(
    transfer: CashRegisterTransfer,
  ): CashRegisterTransferPrismaModel {
    return {
      id: transfer.getId(),
      fromCashId: transfer.getFromCashId(),
      toCashId: transfer.getToCashId(),
      value: new Decimal(transfer.getValue()),
      description: transfer.getDescription() ?? null,
      responsible: transfer.getResponsible() ?? null,
      imageUrl: transfer.getImageUrl() ?? null,
      createdAt: transfer.getCreatedAt(),
      updatedAt: transfer.getUpdatedAt(),
    };
  }
}
