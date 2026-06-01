import { CashRegister } from 'src/domain/entities/cash-register.entity';

export type ReceiveSyncCashRegisterBody = {
  cashRegister: CashRegister;
};

export type ReceiveSyncCashRegisterResponse = {
  id: string;
  operation: 'created' | 'updated';
};
