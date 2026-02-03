import { Injectable } from '@nestjs/common';
import { TypeInscription } from 'src/domain/entities/type-Inscription.entity';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription.gateway';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from 'src/usecases/web/exceptions/events/event-not-found.usecase.exception';
import { DescriptionAlreadyExistsUsecaseException } from 'src/usecases/web/exceptions/typeInscription/description-already-exists.usecase.exception';

export type CreateTypeInscriptionInput = {
  description: string;
  value: number;
  rule: Date | null;
  eventId: string;
  specialType: boolean;
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
    const newTypeInscription = TypeInscription.create({
      description: input.description.trim().toLowerCase(),
      value: input.value,
      eventId: input.eventId,
      rule: input.rule,
      specialType: input.specialType,
    });

    await this.typeInscriptionGateway.create(newTypeInscription);

    const output: CreateTypeInscriptionOutput = {
      id: newTypeInscription.getId(),
    };

    return output;
  }
}
