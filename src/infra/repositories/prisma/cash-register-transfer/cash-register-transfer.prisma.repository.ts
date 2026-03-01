import { Injectable } from '@nestjs/common';
import { CashRegisterTransfer } from 'src/domain/entities/cash-register-transfer.entity';
import { CashRegisterTransferGateway } from 'src/domain/repositories/cash-register-transfer.gateway';
import { PrismaService } from '../prisma.service';
import { CashRegisterTransferEntityToCashRegisterTransferPrismaModelMapper as EntityToPrisma } from './model/mapper/cash-register-transfer-entity-to-cash-register-transfer-prisma-model.mapper';
import { CashRegisterTransferPrismaModelToCashRegisterTransferEntityMapper as PrismaToEntity } from './model/mapper/cash-register-transfer-prisma-model-to-cash-register-transfer-entity.mapper';

@Injectable()
export class CashRegisterTransferPrismaRepository
  implements CashRegisterTransferGateway
{
  constructor(private readonly prisma: PrismaService) {}

  async create(
    transfer: CashRegisterTransfer,
  ): Promise<CashRegisterTransfer> {
    const data = EntityToPrisma.map(transfer);
    const created = await this.prisma.cashRegisterTransfer.create({ data });
    return PrismaToEntity.map(created);
  }
}
