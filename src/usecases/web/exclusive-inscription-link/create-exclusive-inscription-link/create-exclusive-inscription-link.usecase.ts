import { Injectable } from '@nestjs/common';
import { ExclusiveInscriptionLinkType } from 'src/domain/entities/exclusive-inscription-link-type.entity';
import { ExclusiveInscriptionLink } from 'src/domain/entities/exclusive-inscription-link.entity';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { ExclusiveInscriptionLinkTypeGateway } from 'src/domain/repositories/exclusive-inscription-link-type.gateway';
import { ExclusiveInscriptionLinkGateway } from 'src/domain/repositories/exclusive-inscription-link.gateway';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription.gateway';
import { PrismaService } from 'src/infra/repositories/prisma/prisma.service';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';
import { TypeInscriptionNotFoundUsecaseException } from '../../exceptions/inscription/indiv/type-inscription-not-found-usecase.exception';
import { ParticipantLimitReachedUsecaseException } from '../../exceptions/type-Inscription/participant-limit-reached.usecase.exception';

export type CreateExclusiveInscriptionLinkInput = {
  eventId: string;
  typeInscriptionIds: string[];
  name: string;
  createdBy: string;
  expiresAt: Date;
};

export type CreateExclusiveInscriptionLinkOutput = {
  id: string;
};

@Injectable()
export class CreateExclusiveInscriptionLinkUsecase
  implements
    Usecase<
      CreateExclusiveInscriptionLinkInput,
      CreateExclusiveInscriptionLinkOutput
    >
{
  constructor(
    private readonly eventGateway: EventGateway,
    private readonly typeInscriptionGateway: TypeInscriptionGateway,
    private readonly exclusiveInscriptionLinkGateway: ExclusiveInscriptionLinkGateway,
    private readonly exclusiveInscriptionLinkTypeGateway: ExclusiveInscriptionLinkTypeGateway,
    private readonly prisma: PrismaService,
  ) {}

  async execute(
    input: CreateExclusiveInscriptionLinkInput,
  ): Promise<CreateExclusiveInscriptionLinkOutput> {
    const event = await this.eventGateway.findById(input.eventId);

    // verifica se o evento existe antes de tentar criar o link de inscrição
    if (!event) {
      throw new EventNotFoundUsecaseException(
        `Attempt to create a registration link but no event was found to attach it to. eventId: ${input.eventId}`,
        `Nenhum evento encontrado para criar o link de inscrição`,
        CreateExclusiveInscriptionLinkUsecase.name,
      );
    }

    // deduplica os IDs para evitar consultas desnecessárias.
    const typeInscriptionIds = Array.from(new Set(input.typeInscriptionIds));

    const typeInscriptions =
      await this.typeInscriptionGateway.findByIdsAndEventId(
        typeInscriptionIds,
        input.eventId,
      );

    // verifica se todos os IDs enviados foram encontrados
    if (typeInscriptions.length !== typeInscriptionIds.length) {
      throw new TypeInscriptionNotFoundUsecaseException(
        `Attempt to create a registration link but some type inscriptions were not found or do not belong to the event. eventId: ${input.eventId}, typeInscriptionIds: ${typeInscriptionIds}`,
        `Um ou mais tipos de inscrição não foram encontrados ou não pertencem ao evento`,
        CreateExclusiveInscriptionLinkUsecase.name,
      );
    }

    // verifica se algum tipo com strict está sem vagas
    const fullTypes = typeInscriptions.filter(
      (t) =>
        t.getParticipantLimit() !== null &&
        t.getLimitIsStrict() &&
        t.currentCount >= t.getParticipantLimit(),
    );

    if (fullTypes.length > 0) {
      throw new ParticipantLimitReachedUsecaseException(
        `Attempt to create a registration link but some selected type inscriptions have already reached their participant limit. eventId: ${input.eventId}, typeInscriptionIds: ${typeInscriptionIds}, fullTypeIds: ${fullTypes.map((t) => t.getId())}`,
        `Um ou mais tipos de inscrição selecionados atingiram o limite de participantes`,
        CreateExclusiveInscriptionLinkUsecase.name,
      );
    }

    const exclusiveInscriptionLink = ExclusiveInscriptionLink.create({
      eventId: event.getId(),
      name: input.name.trim(),
      expiresAt: input.expiresAt,
      createdBy: input.createdBy,
    });

    const exclusiveInscriptionLinkTypes = typeInscriptionIds.map(
      (typeInscriptionId) =>
        ExclusiveInscriptionLinkType.create({
          exclusiveLinkId: exclusiveInscriptionLink.getId(),
          typeInscriptionId,
        }),
    );

    await this.prisma.runInTransaction(async (tx) => {
      await this.exclusiveInscriptionLinkGateway.createTx(
        exclusiveInscriptionLink,
        tx,
      );

      for (const exclusiveInscriptionLinkType of exclusiveInscriptionLinkTypes) {
        await this.exclusiveInscriptionLinkTypeGateway.createTx(
          exclusiveInscriptionLinkType,
          tx,
        );
      }
    });

    return {
      id: exclusiveInscriptionLink.getId(),
    };
  }
}
