import Decimal from 'decimal.js';
import { CashRegister } from 'src/domain/entities/cash-register.entity';
import CashRegisterPrismaModel from '../cash-register.prisma.model';

export class CashRegisterEntityToCashRegisterPrismaModelMapper {
  public static map(cashRegister: CashRegister): CashRegisterPrismaModel {
    return {
      id: cashRegister.getId(),
      name: cashRegister.getName(),
      regionId: cashRegister.getRegionId(),
      status: cashRegister.getStatus(),
      balance: new Decimal(cashRegister.getBalance()),
      openedAt: cashRegister.getOpenedAt(),
      closedAt: cashRegister.getClosedAt() ?? null,
      createdAt: cashRegister.getCreatedAt(),
      updatedAt: cashRegister.getUpdatedAt(),
    };
  }
}
