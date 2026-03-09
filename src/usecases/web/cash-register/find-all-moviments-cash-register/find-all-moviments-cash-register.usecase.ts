import { Injectable } from '@nestjs/common';
import {
  CashEntryOrigin,
  CashEntryType,
  PaymentMethod,
} from 'generated/prisma';
import { Account } from 'src/domain/entities/account.entity';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { CashRegisterEntryGateway } from 'src/domain/repositories/cash-register-entry.gateway';
import { CashRegisterGateway } from 'src/domain/repositories/cash-register.gateway';
import { Usecase } from 'src/usecases/usecase';
import { CashRegisterNotFoundUsecaseException } from '../../exceptions/cash-register/cash-register-not-found.usecase.exception';

export type FindAllMovimentsCashRegisterInput = {
  id: string;
  type?: CashEntryType | CashEntryType[];
  limitTime?: string;
  orderBy?: 'desc' | 'asc';
  page: number;
  pageSize: number;
};

export type FindAllMovimentsCashRegisterOutput = {
  moviments: Moviment[];
  totalMoviments: number;
  page: number;
  pageCount: number;
};

type Moviment = {
  id: string;
  type: CashEntryType;
  origin: CashEntryOrigin;
  method: PaymentMethod;
  value: number;
  responsible?: string;
  createdAt: Date;
};

@Injectable()
export class FindAllMovimentsCashRegisterUsecase
  implements
    Usecase<
      FindAllMovimentsCashRegisterInput,
      FindAllMovimentsCashRegisterOutput
    >
{
  constructor(
    private readonly cashRegisterGateway: CashRegisterGateway,
    private readonly cashRegisterEntryGateway: CashRegisterEntryGateway,
    private readonly userGateway: AccountGateway,
  ) {}

  async execute(
    input: FindAllMovimentsCashRegisterInput,
  ): Promise<FindAllMovimentsCashRegisterOutput> {
    const safePage = Math.max(1, Math.floor(input.page || 1));
    const safePageSize = Math.max(
      1,
      Math.min(20, Math.floor(input.pageSize || 10)),
    );
    const cashRegister = await this.cashRegisterGateway.findById(input.id);

    if (!cashRegister) {
      throw new CashRegisterNotFoundUsecaseException(
        `Attempt to retrieve transactions, but an invalid ID was passed: ${input.id}`,
        `Nenhum caixa encontrado`,
        FindAllMovimentsCashRegisterUsecase.name,
      );
    }

    const filters = {
      type: input.type,
      limitTime: input.limitTime,
      orderBy: input.orderBy,
    };

    const { type: _ignoredType, ...filtersWithoutType } = filters;

    const [moviments, totalMoviments] = await Promise.all([
      this.cashRegisterEntryGateway.findManyPaginated(
        cashRegister.getId(),
        safePage,
        safePageSize,
        filters,
      ),
      this.cashRegisterEntryGateway.countAll(cashRegister.getId(), filters),
    ]);

    const movimentsArray: Moviment[] = await Promise.all(
      moviments.map(async (m) => {
        let responsible: Account | null = null;
        if (m.getOrigin() !== CashEntryOrigin.ASAAS && m.getResponsible()) {
          responsible = await this.userGateway.findById(m.getResponsible()!);
        }

        return {
          id: m.getId(),
          type: m.getType(),
          origin: m.getOrigin(),
          method: m.getMethod(),
          value: m.getValue(),
          responsible: responsible?.getUsername() || m.getResponsible(),
          createdAt: m.getCreatedAt(),
        };
      }),
    );
    const output: FindAllMovimentsCashRegisterOutput = {
      moviments: movimentsArray,
      totalMoviments,
      page: safePage,
      pageCount: Math.max(1, Math.ceil(totalMoviments / safePageSize)),
    };
    return output;
  }
}
