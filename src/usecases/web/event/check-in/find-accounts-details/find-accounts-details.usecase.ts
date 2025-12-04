import { Injectable } from '@nestjs/common';
import { InscriptionStatus, StatusPayment } from 'generated/prisma';
import { PaymentInscription as PaymentInscriptionEntity } from 'src/domain/entities/payment-inscription';
import { AccountGateway } from 'src/domain/repositories/account.geteway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { PaymentInscriptionGateway } from 'src/domain/repositories/payment-inscription.gateway';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from 'src/usecases/web/exceptions/events/event-not-found.usecase.exception';
import { UserNotFoundUsecaseException } from 'src/usecases/web/exceptions/users/user-not-found.usecase.exception';

export type FindAccountsDetailsInput = {
  eventId: string;
  accountId: string;
};

export type FindAccountsDetailsOutput = {
  id: string;
  username: string;
  email: string;
  status: string;
  countDebt: number;
  countPay: number;
  countInscriptions: number;
  inscriptions: Inscriptions;
};

type Inscriptions = {
  id: string;
  status: InscriptionStatus;
  totalPayd: number;
  totalDebt: number;
  createdAt: Date;
  participants: Participants;
  paymentInscription: PaymentInscriptionOutput[];
}[];

type Participants = {
  name: string;
  gender: string;
  birthDate: Date;
  typeInscription: string;
}[];

type PaymentInscriptionOutput = {
  value: number;
  status: StatusPayment;
  image: string;
  createdAt: Date;
};

@Injectable()
export class FindAccountsDetailsUseCase
  implements Usecase<FindAccountsDetailsInput, FindAccountsDetailsOutput>
{
  constructor(
    private readonly eventGateway: EventGateway,
    private readonly accountGateway: AccountGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly participantGateway: ParticipantGateway,
    private readonly paymentInscriptionGateway: PaymentInscriptionGateway,
    private readonly typeInscriptionGateway: TypeInscriptionGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  public async execute(
    input: FindAccountsDetailsInput,
  ): Promise<FindAccountsDetailsOutput> {
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event not found with id ${input.eventId} in ${FindAccountsDetailsUseCase.name}`,
        `Evento não encontrado`,
        FindAccountsDetailsUseCase.name,
      );
    }

    const account = await this.accountGateway.findById(input.accountId);

    if (!account) {
      throw new UserNotFoundUsecaseException(
        `Account not found with id ${input.accountId} in ${FindAccountsDetailsUseCase.name}`,
        `Conta não encontrada`,
        FindAccountsDetailsUseCase.name,
      );
    }

    const countDebt = await this.inscriptionGateway.countTotalDebt(
      event.getId(),
      account.getId(),
    );
    const countPay =
      await this.paymentInscriptionGateway.sumPaidByAccountIdAndEventId(
        account.getId(),
        event.getId(),
      );
    const countInscriptions =
      await this.inscriptionGateway.countTotalInscriptions(
        event.getId(),
        account.getId(),
      );

    const inscriptions =
      await this.inscriptionGateway.findByEventIdAndAccountId(
        event.getId(),
        account.getId(),
      );

    const [participants, paymentInscriptionRecords] = await Promise.all([
      this.participantGateway.findManyByInscriptionIds(
        inscriptions.map((inscription) => inscription.getId()),
      ),
      this.paymentInscriptionGateway.findManyByInscriptionIds(
        inscriptions.map((inscription) => inscription.getId()),
      ),
    ]);

    const participantList = participants;
    const typeIds = [
      ...new Set(participantList.map((p) => p.getTypeInscriptionId())),
    ];
    const allTypes = typeIds.length
      ? await this.typeInscriptionGateway.findByIds(typeIds)
      : [];

    const typeMap = new Map(
      allTypes.map((t) => [t.getId(), t.getDescription()]),
    );

    const participantMap = new Map<string, Participants>();
    for (const p of participantList) {
      const list = participantMap.get(p.getInscriptionId()) || [];

      list.push({
        name: p.getName(),
        gender: p.getGender(),
        birthDate: p.getBirthDate(),
        typeInscription:
          typeMap.get(p.getTypeInscriptionId()) ?? 'Não informado',
      });

      participantMap.set(p.getInscriptionId(), list);
    }

    const paymentsByInscription = new Map<string, PaymentInscriptionEntity[]>();
    for (const payment of paymentInscriptionRecords) {
      const list = paymentsByInscription.get(payment.getInscriptionId()) || [];
      list.push(payment);
      paymentsByInscription.set(payment.getInscriptionId(), list);
    }

    const detailedInscriptions = await Promise.all(
      inscriptions.map(async (inscription) => {
        const payments = paymentsByInscription.get(inscription.getId()) ?? [];

        const totalPayd = payments.reduce(
          (sum, payment) => sum + payment.getValue().toNumber(),
          0,
        );

        const paymentInscriptionData: PaymentInscriptionOutput[] =
          await Promise.all(
            payments.map(async (payment) => ({
              value: payment.getValue().toNumber(),
              status: payment.getStatus(),
              createdAt: payment.getCreatedAt(),
              image: await this.getPublicUrlOrEmpty(payment.getImageUrl()),
            })),
          );

        return {
          id: inscription.getId(),
          status: inscription.getStatus(),
          totalPayd,
          totalDebt: inscription.getTotalValue(),
          createdAt: inscription.getCreatedAt(),
          participants: participantMap.get(inscription.getId()) ?? [],
          paymentInscription: paymentInscriptionData,
        };
      }),
    );

    const output: FindAccountsDetailsOutput = {
      id: account.getId(),
      username: account.getUsername(),
      email: account.getEmail() ?? '',
      status: countDebt > 0 ? 'PENDENTE' : 'PAGO',
      countDebt,
      countPay,
      countInscriptions,
      inscriptions: detailedInscriptions,
    };

    return output;
  }

  private async getPublicUrlOrEmpty(path?: string): Promise<string> {
    if (!path) {
      return '';
    }

    try {
      return await this.supabaseStorageService.getPublicUrl(path);
    } catch {
      return '';
    }
  }
}
