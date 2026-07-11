import { Injectable } from '@nestjs/common';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription.gateway';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from '../../exceptions/events/event-not-found.usecase.exception';
import { TypeInscriptionNotFoundUsecaseException } from '../../exceptions/inscription/indiv/type-inscription-not-found-usecase.exception';

export type UpdateTypeInscriptionInput = {
  id: string;
  description: string;
  value: number;
  specialType: boolean;
  rule: number | null;
};

export type UpdateTypeInscriptionOutput = {
  id: string;
};

@Injectable()
export class UpdateTypeInscriptionUsecase
  implements Usecase<UpdateTypeInscriptionInput, UpdateTypeInscriptionOutput>
{
  public constructor(
    private readonly typeInscriptionGateway: TypeInscriptionGateway,
    private readonly eventGateway: EventGateway,
  ) {}

  public async execute(
    input: UpdateTypeInscriptionInput,
  ): Promise<UpdateTypeInscriptionOutput> {
    const typeInscription = await this.typeInscriptionGateway.findById(
      input.id,
    );

    if (!typeInscription) {
      throw new TypeInscriptionNotFoundUsecaseException(
        `attempt to update type inscription ${input.id} that does not exist`,
        `Tipo de inscrição não encontrado`,
        UpdateTypeInscriptionUsecase.name,
      );
    }

    // Busca o evento para obter a data de início
    const eventId = typeInscription.getEventId();
    const event = await this.eventGateway.findById(eventId);

    if (!event) {
      throw new EventNotFoundUsecaseException(
        `attempt to update type inscription ${input.id} but event ${eventId} was not found`,
        `Evento não encontrado`,
        UpdateTypeInscriptionUsecase.name,
      );
    }

    // Converte a idade (número) para data de nascimento
    const ruleDate =
      input.rule !== null
        ? this.convertAgeToDate(input.rule, event.getStartDate())
        : null;

    const update = {
      description: input.description,
      value: input.value,
      specialType: input.specialType,
      rule: ruleDate,
    };

    typeInscription.update(update);

    await this.typeInscriptionGateway.update(typeInscription);

    const output: UpdateTypeInscriptionOutput = {
      id: typeInscription.getId(),
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

    // Ajusta para o início do dia para evitar problemas de fuso horário
    birthDate.setHours(0, 0, 0, 0);

    return birthDate;
  }
}
