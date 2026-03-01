import { CashRegister } from 'src/domain/entities/cash-register.entity';
import CashRegisterPrismaModel from '../cash-register.prisma.model';

export class CashRegisterPrismaModelToCashRegisterEntityMapper {
  public static map(cashRegisterPrisma: CashRegisterPrismaModel): CashRegister {
    return CashRegister.with({
      id: cashRegisterPrisma.id,
      name: cashRegisterPrisma.name,
      regionId: cashRegisterPrisma.regionId,
      status: cashRegisterPrisma.status,
      balance: cashRegisterPrisma.balance.toNumber(),
      openedAt: cashRegisterPrisma.openedAt,
      closedAt: cashRegisterPrisma.closedAt ?? undefined,
      createdAt: cashRegisterPrisma.createdAt,
      updatedAt: cashRegisterPrisma.updatedAt,
    });
  }
}
