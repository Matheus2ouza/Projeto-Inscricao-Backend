import { CashRegister } from '../entities/cash-register.entity';

export abstract class CashRegisterGateway {
  // CRUD básico
  abstract create(cashRegister: CashRegister): Promise<CashRegister>;
  abstract update(cashRegister: CashRegister): Promise<CashRegister>;

  // Buscas e listagens
  // Busca um unico caixa pelo id dele
  abstract findById(id: string): Promise<CashRegister | null>;
  // Busca todos os caixas, com um filtro opcional de região
  abstract findMany(filters: { regionId?: string }): Promise<CashRegister[]>;
}
