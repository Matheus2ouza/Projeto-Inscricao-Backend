import { Injectable, Logger, Optional } from '@nestjs/common';
import {
  genderType,
  InscriptionStatus,
  ShirtSize,
  ShirtType,
} from 'generated/prisma';
import { AccountParticipantInEvent } from 'src/domain/entities/account-participant-in-event.entity';
import { Inscription } from 'src/domain/entities/inscription/inscription.entity';
import { Participant } from 'src/domain/entities/participant.entity';
import { AccountParticipantInEventGateway } from 'src/domain/repositories/account-participant-in-event.gateway';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { InscriptionGateway } from 'src/domain/repositories/inscription.gateway';
import { LocalityGateway } from 'src/domain/repositories/locality.gateway';
import { ParticipantGateway } from 'src/domain/repositories/participant.gateway';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription.gateway';
import { PrismaService } from 'src/infra/repositories/prisma/prisma.service';
import { SyncQueue } from 'src/infra/sync/sync.queue';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';
import { TypeInscriptionNotFoundUsecaseException } from '../../exceptions/inscription/indiv/type-inscription-not-found-usecase.exception';
import { LocalityNotFoundUsecaseException } from '../../exceptions/locality/locality-not-found.usecase.exception';
import { DuplicateParticipantCpfUsecaseException } from '../../exceptions/participants/duplicate-participant-cpf.usecase.exception';

export type CreateInscriptionAdminInput = {
  localityId: string;
  eventId: string;

  // caso guest false entao envia o accountId
  accountId?: string;
  isGuest: boolean;

  // dados de registro são enviados independente do guest
  responsible: string;
  email: string;
  phone: string;

  // caso guest true então envia o locality
  participants: ParticipantInscription[];
};

export type ParticipantInscription = {
  // para inscrições guest false envia somene o accountParticipantId
  accountParticipantId?: string;

  // para inscrições guest true envia todos os demais dados
  name?: string;
  preferredName?: string;
  shirtSize?: ShirtSize;
  shirtType?: ShirtType;
  birthDate?: string;
  cpf?: string;
  gender?: genderType;

  // independe do guest, o typeInscription é enviado
  typeInscriptionId: string;
};

export type CreateInscriptionAdminOutput = {
  id: string;
};

@Injectable()
export class CreateInscriptionAdminUsecase
  implements Usecase<CreateInscriptionAdminInput, CreateInscriptionAdminOutput>
{
  private readonly logger = new Logger(CreateInscriptionAdminUsecase.name);
  constructor(
    private readonly eventGateway: EventGateway,
    private readonly localityGateway: LocalityGateway,
    private readonly inscriptionGateway: InscriptionGateway,
    private readonly accountParticipantInEventGateway: AccountParticipantInEventGateway,
    private readonly participantGateway: ParticipantGateway,
    private readonly typeInscriptionGateway: TypeInscriptionGateway,
    private readonly prisma: PrismaService,
    @Optional() private readonly syncQueue: SyncQueue,
  ) {}

  async execute(
    input: CreateInscriptionAdminInput,
  ): Promise<CreateInscriptionAdminOutput> {
    const event = await this.eventGateway.findById(input.eventId);

    if (!event) {
      this.logger.error(`Evento não encontrado com ID: ${input.eventId}`);
      throw new EventNotFoundUsecaseException(
        `Attemped to create inscription for non-existent event with ID: ${input.eventId}`,
        `Evento não encontrado`,
        CreateInscriptionAdminUsecase.name,
      );
    }

    const locality = await this.localityGateway.findById(input.localityId);

    if (!locality) {
      throw new LocalityNotFoundUsecaseException(
        `Tentativa de criar uma inscrição mas a localidade informada ${input.localityId} é invalida`,
        `Localidade não encontrada ou invalida`,
        CreateInscriptionAdminUsecase.name,
      );
    }

    const inscription = Inscription.create({
      localityId: locality.getId(),
      accountId: input.accountId,
      eventId: event.getId(),
      guestEmail: input.isGuest ? input.email : undefined,
      guestName: input.isGuest ? input.responsible : undefined,
      isGuest: input.isGuest,
      responsible: input.responsible,
      phone: input.phone,
      status: InscriptionStatus.PENDING,
      email: input.email,
    });

    const normalParticipants: AccountParticipantInEvent[] = [];
    const guestParticipants: Participant[] = [];
    let totalValue = 0;

    if (!inscription.getIsGuest()) {
      normalParticipants.push(
        ...(await Promise.all(
          input.participants.map(async (p) => {
            const typeInscription = await this.typeInscriptionGateway.findById(
              p.typeInscriptionId,
            );

            if (!typeInscription) {
              this.logger.error(
                `Tipo de inscrição não encontrado: ${p.typeInscriptionId}`,
              );
              throw new TypeInscriptionNotFoundUsecaseException(
                `Attemped to create inscription for non-existent type inscription with ID: ${p.typeInscriptionId}`,
                `Um dos participantes informados não possui um tipo de inscrição válido`,
                CreateInscriptionAdminUsecase.name,
              );
            }

            totalValue += typeInscription.getValue();

            return AccountParticipantInEvent.create({
              accountParticipantId: p.accountParticipantId!,
              inscriptionId: inscription.getId(),
              typeInscriptionId: typeInscription.getId(),
            });
          }),
        )),
      );
    }

    if (inscription.getIsGuest()) {
      guestParticipants.push(
        ...(await Promise.all(
          input.participants.map(async (p) => {
            const cpfs = input.participants
              .filter((p) => p.cpf && p.cpf.trim() != '')
              .map((p) => p.cpf!);

            const duplicateCpfs = cpfs.filter(
              (cpf, index) => cpfs.indexOf(cpf) !== index,
            );

            if (duplicateCpfs.length > 0) {
              const uniqueDuplicateCpfs = [...new Set(duplicateCpfs)];
              this.logger.error(
                `CPFs duplicados encontrados entre participantes guest: ${uniqueDuplicateCpfs.join(', ')}`,
              );
              throw new DuplicateParticipantCpfUsecaseException(
                `Duplicate CPFs found among guest participants: ${uniqueDuplicateCpfs.join(', ')}`,
                `Está sendo passado participantes com o mesmo CPF`,
                CreateInscriptionAdminUsecase.name,
              );
            }

            const typeInscription = await this.typeInscriptionGateway.findById(
              p.typeInscriptionId,
            );

            if (!typeInscription) {
              this.logger.error(
                `Tipo de inscrição não encontrado: ${p.typeInscriptionId}`,
              );
              throw new TypeInscriptionNotFoundUsecaseException(
                `Attemped to create inscription for non-existent type inscription with ID: ${p.typeInscriptionId}`,
                `Um dos participantes informados não possui um tipo de inscrição válido`,
                CreateInscriptionAdminUsecase.name,
              );
            }

            totalValue += typeInscription.getValue();

            return Participant.create({
              inscriptionId: inscription.getId(),
              typeInscriptionId: typeInscription.getId(),
              name: p.name ?? '',
              preferredName: p.preferredName ?? '',
              shirtSize: p.shirtSize,
              shirtType: p.shirtType,
              birthDate: new Date(p.birthDate ?? ''),
              cpf: p.cpf ?? '',
              gender: p.gender ?? genderType.MASCULINO,
            });
          }),
        )),
      );
    }

    // Define o valor total calculado na inscrição
    inscription.setTotalValue(totalValue);
    this.logger.log(`Valor total calculado: ${totalValue}`);

    this.logger.log('Salvando inscrição e vínculos em transação');
    await this.prisma.runInTransaction(async (tx) => {
      await this.inscriptionGateway.createTx(inscription, tx);

      if (normalParticipants.length > 0) {
        await this.accountParticipantInEventGateway.createManyTx(
          normalParticipants,
          tx,
        );
      }

      if (guestParticipants.length > 0) {
        await this.participantGateway.createManyTx(guestParticipants, tx);
      }

      await this.eventGateway.updateTx(event, tx);
    });

    this.logger.log(`Inscrição criada com sucesso! ID: ${inscription.getId()}`);

    // Somente para sincronização durante evento
    // não vai rodar sempre
    if (process.env.EVENT_MODE === 'true') {
      await this.syncQueue.enqueueJob({
        table: 'inscriptions',
        recordId: inscription.getId(),
      });

      // Enqueue dos participantes normais (accountParticipantInEvent)
      for (const participant of normalParticipants) {
        // Primeiro enqueue o accountParticipantInEvent
        await this.syncQueue.enqueueJob({
          table: 'accountParticipantInEvent',
          recordId: participant.getId(),
        });

        // Depois enqueue o accountParticipant relacionado
        await this.syncQueue.enqueueJob({
          table: 'accountParticipant',
          recordId: participant.getAccountParticipantId(),
        });
      }

      // Enqueue dos participantes guest
      for (const guest of guestParticipants) {
        await this.syncQueue.enqueueJob({
          table: 'participants',
          recordId: guest.getId(),
        });
      }
    }

    const output: CreateInscriptionAdminOutput = {
      id: inscription.getId(),
    };

    return output;
  }
}
