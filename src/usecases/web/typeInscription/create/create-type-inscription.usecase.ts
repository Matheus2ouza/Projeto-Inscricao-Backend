import { Injectable } from '@nestjs/common';
import { TypesInscription } from 'src/domain/entities/typesInscription.entity';
import { EventGateway } from 'src/domain/repositories/event.gateway';
import { TypeInscriptionGateway } from 'src/domain/repositories/type-inscription';
import { Usecase } from 'src/usecases/usecase';
import { EventNotFoundUsecaseException } from 'src/usecases/web/exceptions/events/event-not-found.usecase.exception';
import { DescriptionAlreadyExistsUsecaseException } from 'src/usecases/web/exceptions/typeInscription/description-already-exists.usecase.exception';

export type CreateTypeInscriptionInput = {
  description: string;
  value: number;
  eventId: string;
  specialtype: boolean;
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
    const descriptionExist =
      await this.typeInscriptionGateway.findByDescription(
        input.eventId,
        input.description,
      );

    if (descriptionExist) {
      throw new DescriptionAlreadyExistsUsecaseException(
        `Description already exists while creating user with Type Inscription: ${input.description}`,
        `Já existe um tipo de inscrição com essa descrição`,
        CreateTypeInscriptionUseCase.name,
      );
    }

    const eventExist = await this.eventGateway.findById(input.eventId);
    if (!eventExist) {
      throw new EventNotFoundUsecaseException(
        `attempt to create subscription type with for event: ${input.eventId} but it was not found`,
        `O Evento para qual esta tetando registrar um novo tipo de inscrição não foi encontrado`,
        CreateTypeInscriptionUseCase.name,
      );
    }
    const anTypeInscription = TypesInscription.create({
      description: input.description,
      value: input.value,
      eventId: input.eventId,
      specialtype: input.specialtype,
    });

    await this.typeInscriptionGateway.create(anTypeInscription);

    const output: CreateTypeInscriptionOutput = {
      id: anTypeInscription.getId(),
    };

    return output;
  }
}
