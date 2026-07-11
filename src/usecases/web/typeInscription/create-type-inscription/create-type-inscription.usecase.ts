import { Injectable } from '@nestjs/common';
import { TypeInscription } from 'src/domain/entities/type-Inscription.entity';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription.gateway';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from 'src/usecases/web/exceptions/events/event-not-found.usecase.exception';
import { DescriptionAlreadyExistsUsecaseException } from 'src/usecases/web/exceptions/type-Inscription/description-already-exists.usecase.exception';

export type CreateTypeInscriptionInput = {
  description: string;
  value: number;
  rule: number | null;
  eventId: string;
  specialType: boolean;
  participantLimit: number;
  limitIsStrict: boolean;
};

export type CreateTypeInscriptionOutput = {
  id: string;
};

@Injectable()
export class CreateTypeInscriptionUseCase
  implements Usecase<CreateTypeInscriptionInput, CreateTypeInscriptionOutput>
{
  public constructor(
    private readonly typeInscriptionGateway: TypeInscriptionGateway,
    private readonly eventGateway: EventGateway,
  ) {}

  public async execute(
    input: CreateTypeInscriptionInput,
  ): Promise<CreateTypeInscriptionOutput> {
    const event = await this.eventGateway.findById(input.eventId);
    if (!event) {
      throw new EventNotFoundUsecaseException(
        `attempt to create subscription type with for event: ${input.eventId} but it was not found`,
        `O Evento para qual esta tetando registrar um novo tipo de inscrição não foi encontrado`,
        CreateTypeInscriptionUseCase.name,
      );
    }

    const descriptionExist =
      await this.typeInscriptionGateway.findByDescription(
        input.eventId,
        input.description.trim().toLowerCase(),
      );

    if (descriptionExist) {
      throw new DescriptionAlreadyExistsUsecaseException(
        `Description already exists while creating user with Type Inscription: ${input.description}`,
        `Já existe um tipo de inscrição com essa descrição`,
        CreateTypeInscriptionUseCase.name,
      );
    }

    // Converte a idade (número) para data de nascimento
    const ruleDate =
      input.rule !== null
        ? this.convertAgeToDate(input.rule, event.getStartDate())
        : null;

    const newTypeInscription = TypeInscription.create({
      description: input.description.toLowerCase(),
      value: input.value,
      eventId: input.eventId,
      rule: ruleDate, // Agora passa a data calculada
      specialType: input.specialType,
      participantLimit: input.participantLimit,
      limitIsStrict: input.limitIsStrict,
    });

    await this.typeInscriptionGateway.create(newTypeInscription);

    const output: CreateTypeInscriptionOutput = {
      id: newTypeInscription.getId(),
    };

    return output;
  }

  /**
   * Converte uma idade em anos para uma data de nascimento
   * @param ageInYears Idade em anos
   * @param baseDate Data base para o cálculo (geralmente a data do evento)
   * @returns Data de nascimento calculada ou null
   */
  private convertAgeToDate(ageInYears: number, baseDate: Date): Date | null {
    if (!ageInYears || ageInYears <= 0) return null;

    const birthDate = new Date(baseDate);
    birthDate.setFullYear(birthDate.getFullYear() - ageInYears);

    // Opcional: Ajusta para o início do dia para evitar problemas de fuso horário
    birthDate.setHours(0, 0, 0, 0);

    return birthDate;
  }
}
