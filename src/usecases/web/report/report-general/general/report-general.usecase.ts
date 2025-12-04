import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription';
import { SupabaseStorageService } from 'src/infra/services/supabase/supabase-storage.service';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from 'src/usecases/web/exceptions/events/event-not-found.usecase.exception';

export type ReportGeneralInput = {
  eventId: string;
};

export type ReportGeneralOutput = {
  id: string;
  name: string;
  startDate: Date;
  endDate: Date;
  image: string;
  totalInscriptions: number;
  countTypeInscription: number;
  countParticipants: number;
  totalValue: number;
  totalDebt: number;
  typeInscription: TypeInscription;
};

type TypeInscription = {
  id: string;
  description: string;
  amount: number;
  countParticipants: number;
  totalValue: number;
}[];

@Injectable()
export class ReportGeneralUsecase
  implements Usecase<ReportGeneralInput, ReportGeneralOutput>
{
  constructor(
    private readonly eventGateway: EventGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly participantGateway: ParticipantGateway,
    private readonly typeInscriptionGateway: TypeInscriptionGateway,
    private readonly supabaseStorageService: SupabaseStorageService,
  ) {}

  public async execute(
    input: ReportGeneralInput,
  ): Promise<ReportGeneralOutput> {
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Event not found with id ${input.eventId} in ${ReportGeneralUsecase.name}`,
        `Evento não encontrado`,
        ReportGeneralUsecase.name,
      );
    }

    const image = await this.getPublicUrlOrEmpty(event.getImageUrl());

    const [inscriptions, total, typeInscriptions, totalDebt] =
      await Promise.all([
        this.inscriptionGateway.findInscriptionsWithPaid(event.getId()),
        this.inscriptionGateway.countAllByEvent(event.getId()),
        this.typeInscriptionGateway.findByEventId(event.getId()),
        this.inscriptionGateway.contTotalDebtByEvent(event.getId()),
      ]);

    console.log('total de inscrições');
    console.log(inscriptions.length);
    const inscriptionIds = inscriptions.map((i) => i.getId());

    // Buscar todos os participantes de todas as inscrições pagas
    const participants =
      await this.participantGateway.findManyByInscriptionIds(inscriptionIds);

    console.log('total de participantes');
    console.log(participants.length);

    const participantCountMap = new Map<string, number>();

    for (const participant of participants) {
      const typeId = participant.getTypeInscriptionId();
      const previousCount = participantCountMap.get(typeId) ?? 0;
      participantCountMap.set(typeId, previousCount + 1);
    }

    // Montar o array final (valor total = quantidade * valor do tipo)
    const typeInscriptionOutput = typeInscriptions.map((type) => {
      const count = participantCountMap.get(type.getId()) ?? 0;
      const amount = type.getValue();

      return {
        id: type.getId(),
        description: type.getDescription(),
        amount,
        countParticipants: count,
        totalValue: count * amount,
      };
    });

    const output: ReportGeneralOutput = {
      id: event.getId(),
      name: event.getName(),
      startDate: event.getStartDate(),
      endDate: event.getEndDate(),
      image,
      totalInscriptions: total,
      countTypeInscription: typeInscriptions.length,
      countParticipants: event.getQuantityParticipants(),
      totalValue: event.getAmountCollected(),
      totalDebt: totalDebt,
      typeInscription: typeInscriptionOutput,
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
