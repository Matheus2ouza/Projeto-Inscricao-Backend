import { CashRegisterStatus } from 'generated/prisma';
import { PrismaTransactionClient } from 'src/infra/repositories/prisma/prisma.service';
import { CashRegister } from '../entities/cash-register.entity';

export abstract class CashRegisterGateway {
  // CRUD básico
  abstract create(cashRegister: CashRegister): Promise<CashRegister>;
  abstract createTx(
    cashRegister: CashRegister,
    tx: PrismaTransactionClient,
  ): Promise<CashRegister>;
  abstract update(cashRegister: CashRegister): Promise<CashRegister>;
  abstract updateTx(
    cashRegister: CashRegister,
    tx: PrismaTransactionClient,
  ): Promise<CashRegister>;

  // Buscas e listagens
  // Busca um unico caixa pelo id dele
  abstract findById(id: string): Promise<CashRegister | null>;
  // Busca todos os caixas, com um filtro opcional de região
  abstract findMany(
    page: number,
    pageSize: number,
    filters: { regionId?: string; status?: CashRegisterStatus[] },
  ): Promise<CashRegister[]>;

  abstract count(filters: {
    regionId?: string;
    status?: CashRegisterStatus[];
  }): Promise<number>;
}
