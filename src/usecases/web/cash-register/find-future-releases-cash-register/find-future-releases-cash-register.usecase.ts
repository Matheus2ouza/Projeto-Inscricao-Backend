import { Injectable } from '@nestjs/common';
import { CashRegisterGateway } from 'src/domain/repositories/cash-register.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { PaymentInstallmentGateway } from 'src/domain/repositories/payment-installment.gateway';
import { Usecase } from 'src/usecases/usecase';
import { CashRegisterNotFoundUsecaseException } from '../../exceptions/cash-register/cash-register-not-found.usecase.exception';

export type FindFutureReleasesCashRegisterInput = {
  id: string;
};

type FutureRelease = {
  releaseDate: Date;
  amount: number;
};

export type FindFutureReleasesCashRegisterOutput = {
  releaseDate: Date;
  amount: number;
}[];

@Injectable()
export class FindFutureReleasesCashRegisterUsecase
  implements
    Usecase<
      FindFutureReleasesCashRegisterInput,
      FindFutureReleasesCashRegisterOutput
    >
{
  constructor(
    private readonly cashRegisterGateway: CashRegisterGateway,
    private readonly eventGateway: EventGateway,
    private readonly paymentInstallmentGateway: PaymentInstallmentGateway,
  ) {}

  async execute(
    input: FindFutureReleasesCashRegisterInput,
  ): Promise<FindFutureReleasesCashRegisterOutput> {
    // Normaliza um Date para ignorar hora/minuto/segundo, usando apenas AAAA-MM-DD
    const normalizeToDateOnly = (date: Date) =>
      new Date(date.getFullYear(), date.getMonth(), date.getDate());

    // Gera uma chave estável (AAAA-MM-DD) para agrupar parcelas na mesma data,
    // e também retorna o Date já normalizado para ser usado no output.
    const dateKey = (date: Date) => {
      const d = normalizeToDateOnly(date);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return { key: `${year}-${month}-${day}`, dateOnly: d };
    };

    const cashRegister = await this.cashRegisterGateway.findById(input.id);

    if (!cashRegister) {
      throw new CashRegisterNotFoundUsecaseException(
        `Attempt to search cash register with id: ${input.id} but nothing returned`,
        `Nenhum caixa encontrado`,
        FindFutureReleasesCashRegisterUsecase.name,
      );
    }

    // Busca eventos associados ao caixa e, para cada evento, as parcelas futuras (received=false)
    const events = await this.eventGateway.findByCashRegisterId(input.id);

    const eventIds = events.map((e) => e.getId());
    const installmentsByEvent = await Promise.all(
      eventIds.map((eventId) =>
        this.paymentInstallmentGateway.findFutureReleasesByEventId(eventId),
      ),
    );
    const installments = installmentsByEvent.flat();

    // Agrupa por data (sem considerar hora) somando o valor líquido previsto (netValue)
    const groupedByDateKey = new Map<string, FutureRelease>();

    for (const installment of installments) {
      const { key, dateOnly } = dateKey(installment.getEstimatedAt());
      const nextAmount = installment.getNetValue();
      const current = groupedByDateKey.get(key);

      if (!current) {
        groupedByDateKey.set(key, {
          releaseDate: dateOnly,
          amount: nextAmount,
        });
        continue;
      }

      current.amount += nextAmount;
    }

    // Converte o Map para array e ordena por data crescente
    const output: FindFutureReleasesCashRegisterOutput = Array.from(
      groupedByDateKey.values(),
    ).sort((a, b) => a.releaseDate.getTime() - b.releaseDate.getTime());

    return output;
  }
}
