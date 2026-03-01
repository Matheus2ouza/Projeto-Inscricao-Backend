import { CashRegisterTransfer } from '../entities/cash-register-transfer.entity';

export abstract class CashRegisterTransferGateway {
  abstract create(
    transfer: CashRegisterTransfer,
  ): Promise<CashRegisterTransfer>;
}
