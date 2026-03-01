import { Injectable } from '@nestjs/common';
import {
  CashEntryOrigin,
  CashEntryType,
  PaymentMethod,
} from 'generated/prisma';
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
  totalIncome: number;
  totalExpense: number;
  page: number;
  pageCount: number;
};

type Moviment = {
  id: string;
  type: CashEntryType;
  origin: CashEntryOrigin;
  method: PaymentMethod;
  value: number;
  description?: string;
  eventId?: string;
  paymentInstallmentId?: string;
  onSiteRegistrationId?: string;
  eventExpenseId?: string;
  ticketSaleId?: string;
  responsible?: string;
  imageUrl?: string;
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

    const [moviments, totalMoviments, totalIncome, totalExpense] =
      await Promise.all([
        this.cashRegisterEntryGateway.findManyPaginated(
          cashRegister.getId(),
          safePage,
          safePageSize,
          filters,
        ),
        this.cashRegisterEntryGateway.countAll(cashRegister.getId(), filters),
        this.cashRegisterEntryGateway.countAll(cashRegister.getId(), {
          ...filtersWithoutType,
          type: CashEntryType.INCOME,
        }),
        this.cashRegisterEntryGateway.countAll(cashRegister.getId(), {
          ...filtersWithoutType,
          type: CashEntryType.EXPENSE,
        }),
      ]);

    const movimentsData: Moviment[] = moviments.map((m) => ({
      id: m.getId(),
      type: m.getType(),
      origin: m.getOrigin(),
      method: m.getMethod(),
      value: m.getValue(),
      description: m.getDescription(),
      eventId: m.getEventId(),
      paymentInstallmentId: m.getPaymentInstallmentId(),
      onSiteRegistrationId: m.getOnSiteRegistrationId(),
      eventExpenseId: m.getEventExpenseId(),
      ticketSaleId: m.getTicketSaleId(),
      responsible: m.getResponsible(),
      imageUrl: m.getImageUrl(),
      createdAt: m.getCreatedAt(),
    }));

    const output: FindAllMovimentsCashRegisterOutput = {
      moviments: movimentsData,
      totalMoviments,
      totalIncome,
      totalExpense,
      page: safePage,
      pageCount: Math.max(1, Math.ceil(totalMoviments / safePageSize)),
    };
    return output;
  }
}
