import { CashRegisterTransfer } from 'src/domain/entities/cash-register-transfer.entity';
import CashRegisterTransferPrismaModel from '../cash-register-transfer.prisma.model';

export class CashRegisterTransferPrismaModelToCashRegisterTransferEntityMapper {
  public static map(
    transferPrisma: CashRegisterTransferPrismaModel,
  ): CashRegisterTransfer {
    return CashRegisterTransfer.with({
      id: transferPrisma.id,
      fromCashId: transferPrisma.fromCashId,
      toCashId: transferPrisma.toCashId,
      value: transferPrisma.value.toNumber(),
      description: transferPrisma.description ?? undefined,
      responsible: transferPrisma.responsible ?? undefined,
      imageUrl: transferPrisma.imageUrl ?? undefined,
      createdAt: transferPrisma.createdAt,
      updatedAt: transferPrisma.updatedAt,
    });
  }
}
